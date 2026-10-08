# Assistente Financeiro

Front-end do projeto **Aplicação Financeira Pessoal**: React 18 + Vite + TypeScript, com Tailwind CSS, Vitest e ESLint/Prettier.

O backend (Flask) ainda está em desenvolvimento. O app está preparado para alternar entre API mockada e API real apenas por variável de ambiente.

## Requisitos

- Node.js 18+ e npm

## Instalação

```bash
npm install
```

## Scripts

| Comando           | Descrição                                            |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Sobe o servidor de desenvolvimento do Vite           |
| `npm run build`   | Type-check (`tsc -b`) + build de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build de produção                    |
| `npm test`        | Executa os testes com Vitest + Testing Library       |
| `npm run lint`    | Executa o ESLint                                     |
| `npm run format`  | Formata o código com Prettier                        |

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.example .env
```

| Variável        | Padrão                  | Descrição                                                                   |
| --------------- | ----------------------- | --------------------------------------------------------------------------- |
| `VITE_API_URL`  | `http://127.0.0.1:5000` | Base URL do backend Flask                                                   |
| `VITE_USE_MOCK` | `true`                  | `true` usa a API mockada; `false` aponta as requisições para `VITE_API_URL` |

O arquivo `.env` é ignorado pelo Git; use sempre o `.env.example` como referência dos valores esperados.

## API mockada (MSW)

Com `VITE_USE_MOCK=true` (padrão do `.env.example`), **todas as chamadas são interceptadas pelo MSW** — nenhuma requisição real ao Flask é feita:

```bash
cp .env.example .env
```

- O worker é registrado por `public/mockServiceWorker.js` e iniciado em `src/main.tsx` (`src/mocks/browser.ts`).
- Handlers em `src/mocks/handlers/` cobrem o contrato: auth (`POST /auth/register`, `POST /auth/login`, `GET /auth/me`), categorias (CRUD), transações (CRUD + filtros `startDate`, `endDate`, `categoryId`, `type`, `minAmount`, `maxAmount`) e relatórios (`GET /reports/summary`, `GET /reports/by-category`).
- Dados fake em `src/mocks/data/` (8 categorias e 30 transações nos últimos 6 meses); usuário de demonstração: **demo@financas.dev / 123456**.
- A latência simulada é de 300 ms em dev e 0 nos testes (`src/mocks/delay.ts`); token ausente/inválido nas rotas protegidas responde **401**.
- Para apontar para a API real, defina `VITE_USE_MOCK=false` no `.env` — o Axios (`src/services/api.ts`) passa a usar `VITE_API_URL` (ex.: `http://127.0.0.1:5000`, docs em `/apidocs/`).
- Nos testes, o MSW roda via `src/mocks/server.ts` com `onUnhandledRequest: 'error'`, garantindo que nenhuma chamada escape do contrato.

## Autenticação

Rotas e fluxo de sessão:

- `/login` e `/cadastro` são públicas; a área privada (`/`) exige sessão e redireciona para `/login` preservando a rota de origem (`RequireAuth`).
- O token fica em `localStorage` na chave `financas-token`; no boot, a sessão é restaurada via `GET /auth/me`.
- O Axios anexa `Authorization: Bearer <token>` e, em **401** de rota autenticada, limpa a sessão e volta ao login.
- Usuário de demonstração: **demo@financas.dev / 123456**.
- Toasts de feedback (Sonner) respeitam o tema claro/escuro.
- Testes do fluxo em `src/features/auth/` e `src/pages/`.

## Transações

A rota `/transacoes` (área privada) entrega o CRUD completo:

- Lista em tabela no desktop e em cards no mobile (≤720px), com linhas zebradas e valores com sinal (`text-income`/`text-expense`).
- Filtros: **Buscar** (descrição), **Tipo**, **Categoria** e **Período** (De/Até), com botão **Aplicar filtros**; paginação client-side de **10 itens** (Anterior/Próxima).
- **Nova transação** abre um modal (Descrição, Valor, Tipo, Categoria, Método de pagamento, Data e Repetição — por enquanto apenas "Não repetir") com **Salvar**, **Salvar e adicionar outra** e **Cancelar**.
- **Editar** abre o mesmo modal pré-preenchido; **Excluir** pede confirmação em diálogo.
- Estados de loading, erro (com "Tentar novamente") e vazio; feedback via toasts (Sonner).
- Dados via **React Query** (`src/features/transactions/use-transactions.ts`) consumindo os serviços de `src/services/`.

## Categorias

A rota `/categorias` (área privada) entrega o CRUD de categorias:

- Lista com **badge colorido (Nome), Tipo e Ações (Editar/Excluir)** em tabela no desktop e cards no mobile.
- Modal de criar/editar (Nome + Tipo Receita/Despesa) com validação zod e toasts de sucesso/erro.
- **Exclusão protegida**: categorias **em uso** por transações não podem ser excluídas — o mock responde 400 ("Categoria em uso por N transação(ões)") e o diálogo exibe a mensagem.
- Cores: 8 tokens semânticos (`--category-1..8` no `globals.css`/Tailwind) resolvidos de forma determinística em `src/features/categories/colors.ts` (mapa + fallback por hash) e exibidos via `CategoryBadge` — também aplicados na tabela de transações.
- Estados de loading, erro (com "Tentar novamente") e vazio.

## Tema claro/escuro

O app suporta os modos **Claro**, **Escuro** e **Sistema** (segue a preferência do sistema operacional), alternáveis pelo botão de sol/lua no header (`ThemeToggle`).

- A escolha é persistida em `localStorage` na chave `financas-theme` e um valor inválido cai no modo `Sistema`.
- O tema é aplicado pela classe `dark` no `<html>` (estratégia `class` do Tailwind).
- Um script inline no `index.html` aplica o tema antes do bundle carregar, evitando o flash de tema errado (FOUC).
- As cores são **tokens semânticos** definidos em `src/styles/globals.css` e mapeados no `tailwind.config.ts` — use apenas tokens como `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-income` e `text-expense`; nunca cores fixas (`bg-white`, `text-gray-900`, hex/rgb).
- Os testes que cobrem o tema ficam em `src/test/tema-claro-escuro.test.ts`, `src/app/providers/ThemeProvider.test.tsx` e `src/components/ThemeToggle.test.tsx`.

## Design system

Os componentes base vêm do [shadcn/ui](https://ui.shadcn.com) na versão compatível com Tailwind v3 (`shadcn@2.3.0`) e ficam em `src/components/ui/`:

| Componente                                               | Arquivo                   |
| -------------------------------------------------------- | ------------------------- |
| Button, Input, Card, Dialog, Table, Dropdown Menu e Tabs | `src/components/ui/*.tsx` |

- O `components.json` guarda a configuração do shadcn (aliases `@/components`, `@/components/ui` e `@/lib/utils`).
- O utilitário `cn()` em `src/lib/utils.ts` combina `clsx` + `tailwind-merge` e é usado por todos os componentes.
- Os componentes usam apenas **tokens semânticos** (`bg-card`, `bg-popover`, `text-muted-foreground`, `focus:bg-accent`, etc.); bordas usam o token global (`* { @apply border-border }` no `globals.css`).
- Animações (abrir/fechar de Dialog e Dropdown) vêm do plugin `tailwindcss-animate`.
- Para adicionar novos componentes: `npx shadcn@2.3.0 add <componente>` e ajuste qualquer cor fixa (ex.: `bg-black/80`) para tokens, mantendo o padrão do projeto.

## Estrutura

```
src/
├── app/          # configuração de rotas e providers
├── components/   # componentes reutilizáveis
├── features/     # auth, transactions, categories, reports
├── hooks/
├── services/     # api.ts (axios) + endpoints por domínio
├── mocks/        # handlers MSW, dados fake, browser/server
├── types/        # tipos TS derivados do contrato da API
├── styles/       # globals.css com tokens
├── utils/
├── pages/
└── main.tsx
```
