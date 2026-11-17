# Spec: Integração com a API Real

## Contexto
O front passou a consumir a API Flask real (`VITE_USE_MOCK=false`). O contrato difere do mock em pontos que quebram o app: respostas envelopadas em `{ data }`, transações em snake_case, `amount` serializado como string, exclusões com status 200 e ausência de `/reports/*`. O erro de CORS observado é consequência do 404 em `/reports/summary` (preflight sem status 2xx); as demais rotas já respondem CORS corretamente. Esta feature adapta serviços, mocks e testes ao contrato real e mantém os relatórios funcionais por agregação no cliente.

## Convenções do contrato real
- Base URL `VITE_API_URL` (`http://127.0.0.1:5000`); sem proxy ou mudança de CORS.
- Respostas de sucesso com corpo: `{ "data": ... }`, podendo incluir `message`.
- `POST /auth/login` → `{ access_token, token_type, message }` (flat).
- `POST /auth/register` → 201 `{ message, data: User }`.
- `GET /auth/me` → 200 `{ data: User }`.
- `GET /categories` → 200 `{ data: Category[] }`; POST/PUT → 201/200 `{ message, data: Category }`; DELETE → 200 `{ message }`; duplicidade ou categoria com transações → 409.
- `GET /transactions` → 200 `{ data: ApiTransaction[] }`; POST/PUT → 201/200 `{ message, data: ApiTransaction }`; DELETE → 200 `{ message }`; categoria/transação inexistente → 404.
- `ApiTransaction`: `{ id, description, amount: "150.75", type, date: "YYYY-MM-DD", payment_method, category_id }`.
- Filtros de `GET /transactions` permanecem em camelCase: `search`, `startDate`, `endDate`, `categoryId`, `type`, `minAmount`, `maxAmount`.
- Erros de regra: `{ message }`; validação Pydantic: 422 `{ detail }`; JWT: 401 `{ msg }`.
- Relatórios não existem no backend: `fetchSummary` e `fetchCategoryReport` agregam de `/transactions` (+ `/categories`).
- `amount` deve ser convertido para `number` no cliente.

## Critérios de Aceite (AC)

- **AC-001:** `POST /auth/register` e `GET /auth/me` desembrulham `{ data }`; o login continua lendo `access_token`; o usuário restaurado exibe nome/e-mail corretamente no layout; testes de auth atualizados.
- **AC-002:** `GET/POST/PUT /categories` desembrulham `{ data }`; `DELETE` aceita 200 com `{ message }`; conflito 409 (duplicidade ou transações vinculadas) exibe a mensagem no diálogo; mocks e testes de handler/serviço/página atualizados.
- **AC-003:** `GET/POST/PUT /transactions` mapeiam `category_id`↔`categoryId`, `payment_method`↔`paymentMethod` e `amount` string→number; o payload enviado usa snake_case; `DELETE` aceita 200; filtros continuam funcionando; mocks e testes atualizados.
- **AC-004:** `fetchSummary` e `fetchCategoryReport` não chamam `/reports/*`; summary calcula `income`, `expense` e `balance` do período via `/transactions`; by-category usa `/transactions` + `/categories`, agrega por categoria, calcula percentual sobre o total do tipo, ordena desc, usa `expense` por padrão e retorna 0% quando o total é zero.
- **AC-005:** MSW espelha o backend real (envelopes, snake_case, `amount` como string, status 200/404/409/422); handlers de relatórios removidos do MSW; `VITE_USE_MOCK=true` continua funcional.
- **AC-006:** schemas alinhados ao backend: nome de categoria com no mínimo 3 caracteres e descrição de transação com no mínimo 3 caracteres; testes de schema atualizados.
- **AC-007:** mutações de categorias e transações invalidam queries `['reports']`, evitando dados defasados nos relatórios.
- **AC-008:** `README.md` e `docs/API_BACKEND.md` refletem a integração (relatórios no cliente, contrato real); `npm test`, `npm run lint` e `npm run build` passam; testes nomeiam os ACs.

## Fora de Escopo
- Alterar o backend Flask ou criar endpoints `/reports/*`.
- Adicionar proxy Vite ou mudar CORS (desnecessário: rotas existentes já respondem).
- `PUT`/`DELETE /auth/me`, refresh token e recuperação de senha.
- Paginação server-side e otimização dos GETs duplicados do dashboard.
- Exigir Bearer nos mocks de categorias/transações (o app real sempre envia; não afeta a integração).
