# Tasks: MSW + Contrato da API

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [x] **T-001:** Adicionar `axios` e `msw` (dev) e inicializar o worker `public/mockServiceWorker.js` (`npx msw init public --save`) — *(cobre AC-001)*
- [x] **T-002:** Criar os tipos do contrato em `src/types/` — *(cobre AC-002)*
- [x] **T-003:** Criar os dados fake em `src/mocks/data/` (categorias + ~30 transações relativas à data atual) — *(cobre AC-003)*
- [x] **T-004:** Criar a infra MSW (`handlers/index.ts`, `server.ts`, `browser.ts`, `delay.ts`), integrar ao setup de testes e implementar os handlers de auth — *(cobre AC-004, AC-008, AC-009)*
- [x] **T-005:** Implementar os handlers de categorias (CRUD) e testes — *(cobre AC-005)*
- [x] **T-006:** Implementar os handlers de transações (filtros + CRUD) e testes — *(cobre AC-006)*
- [x] **T-007:** Implementar os handlers de relatórios (summary/by-category) e testes — *(cobre AC-007)*
- [x] **T-008:** Criar `src/services/api.ts` (Axios) e o bootstrap condicional do worker no `main.tsx` e testes — *(cobre AC-001)*
- [x] **T-009:** Documentar o mock no `README.md` e validar `npm run lint`, `npm test` e `npm run build` — *(cobre AC-010)*
