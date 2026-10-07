# Spec: Setup Base

## Contexto
O front-end do Assistente Financeiro ainda não existe. É preciso criar o esqueleto React 18 + Vite + TypeScript com Tailwind, aliases, lint, formatação e Vitest, para que as próximas features (tema, design system, MSW e telas) sejam construídas sobre uma base padronizada e testável.

## Critérios de Aceite (AC)

- **AC-001:** `npm install && npm run dev` sobe o Vite servindo o app React 18 + TypeScript sem erros.
- **AC-002:** o alias `@/` resolve para `src/` tanto no Vite quanto no TypeScript, comprovado por import usando `@/` em um teste.
- **AC-003:** Tailwind CSS v3 ativo via `tailwind.config.ts` + `postcss.config.js`, com `content` cobrindo `index.html` e `src/**/*.{ts,tsx}`, e utilitários aplicados no placeholder.
- **AC-004:** `npm run lint` (ESLint + TypeScript + react-hooks) e `npm run format` (Prettier) executam sem erros e sem conflito entre si.
- **AC-005:** `npm test` executa Vitest (jsdom + Testing Library) com um teste de fumaça do App, nomeando o AC (rastreabilidade).
- **AC-006:** `npm run build` conclui sem erros de TypeScript e gera `dist/`.
- **AC-007:** estrutura de pastas `src/` do prompt.txt criada (app, components, features, hooks, services, mocks, types, styles, utils, pages, main.tsx).
- **AC-008:** `.env.example` com `VITE_API_URL=http://127.0.0.1:5000` e `VITE_USE_MOCK=true`; `.env` ignorado pelo git.

## Fora de Escopo
- Tokens semânticos de tema, ThemeProvider, script anti-FOUC e ThemeToggle (etapa 2).
- shadcn/ui e design system (etapa 3).
- MSW, handlers, dados fake e tipos do contrato da API (etapa 4).
- Rotas, autenticação, telas do wireframe e integração (etapas 5-10).
