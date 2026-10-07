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
