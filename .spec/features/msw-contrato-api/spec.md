# Spec: MSW + Contrato da API

## Contexto
O backend Flask ainda não está disponível, então o front precisa de uma API mockada que espelhe o contrato real para permitir o desenvolvimento das telas. Esta feature cria os tipos TypeScript do contrato, os dados fake e os handlers MSW (com latência e erros 401), além da instância Axios central e do interruptor `VITE_USE_MOCK`, para que a troca pela API real exija apenas configuração.

## Convenções do contrato (quando o prompt não descreve, este é o padrão proposto)
- **Auth:** `POST /auth/register` `{ name, email, password }` → 201 `{ id, name, email }`; `POST /auth/login` `{ email, password }` → 200 `{ access_token, token_type: 'Bearer' }`; `GET /auth/me` (Bearer) → 200 `{ id, name, email }`. Usuário seed: `demo@financas.dev` / `123456`; o token emitido no login é `mock-access-token`.
- **Category:** `{ id, name, type: 'income' | 'expense' }`.
- **Transaction:** `{ id, description, amount, type: 'income' | 'expense', date: 'YYYY-MM-DD', categoryId }`.
- **GET /transactions** aceita `startDate`, `endDate` (YYYY-MM-DD), `categoryId`, `type`, `minAmount`, `maxAmount`.
- **GET /reports/summary** → `{ income, expense, balance }` do período; **GET /reports/by-category** → `[{ categoryId, categoryName, total, percentage }]` (aceita `startDate`/`endDate`).
- Erros seguem `{ message: string }`.

## Critérios de Aceite (AC)

- **AC-001:** `axios` (dependency) e `msw` (devDependency) instalados; worker `public/mockServiceWorker.js` versionado e `msw.workerDirectory` no `package.json`; `src/services/api.ts` expõe instância Axios com `baseURL = VITE_API_URL`; o `main.tsx` inicializa o worker MSW somente quando `VITE_USE_MOCK=true`.
- **AC-002:** tipos do contrato em `src/types/` (`User`, `AuthResponse`, `Category`, `Transaction`, `TransactionType`, `TransactionFilters`, `SummaryReport`, `CategoryReport`) sem `any`, usados pelos dados e handlers.
- **AC-003:** dados fake em `src/mocks/data/` — categorias realistas (Alimentação, Transporte, Salário, etc.) e ~30 transações distribuídas nos últimos 6 meses (datas relativas à data atual), com `categoryId` sempre válido e valores coerentes com o tipo.
- **AC-004:** handlers de auth: register (201; e-mail duplicado → 400), login (credenciais válidas → 200 com `access_token`; inválidas → 401) e me (Bearer válido → 200; ausente/inválido → 401).
- **AC-005:** handlers de categorias: `GET /categories`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`; id inexistente → 404; payload inválido → 400.
- **AC-006:** handlers de transações: `GET /transactions` aplicando os filtros combinados; `POST /transactions`, `PUT /transactions/:id`, `DELETE /transactions/:id`; id inexistente → 404; payload inválido (ex.: `categoryId` desconhecido) → 400.
- **AC-007:** handlers de relatórios calculados a partir das transações: summary com `income`, `expense` e `balance` do período; by-category com total e percentual por categoria.
- **AC-008:** latência simulada centralizada em `src/mocks/delay.ts`: 300ms em dev/browser e 0 no ambiente de teste.
- **AC-009:** MSW nos testes: `src/mocks/server.ts` (`setupServer`) integrado ao `src/test/setup.ts` com `listen({ onUnhandledRequest: 'error' })`, `resetHandlers` entre testes e `close` no fim; `src/mocks/browser.ts` para o navegador.
- **AC-010:** `npm test`, `npm run lint` e `npm run build` passam; o `README.md` documenta o mock (ligar/desligar e como apontar para a API real); cada teste referencia o AC correspondente (rastreabilidade).

## Fora de Escopo
- Autenticação real no front (interceptors de token, rotas privadas, telas de login/cadastro) — etapa 5.
- Módulos de serviços por domínio (`auth.ts`, `categories.ts`, `transactions.ts`, `reports.ts`) — entram junto de cada tela (etapas 5-9).
- Persistência dos dados mockados (memória do worker apenas).
