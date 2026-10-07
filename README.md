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
