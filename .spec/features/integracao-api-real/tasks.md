# Tasks: Integração com a API Real

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [ ] **T-001:** Criar `ApiEnvelope<T>` em `src/types/api.ts`, desembrulhar `register`/`me` em `src/features/auth/service.ts`, ajustar o handler MSW de auth e atualizar `api.test.ts`/`auth.test.ts` — *(cobre AC-001, AC-005)*
- [ ] **T-002:** Adaptar `src/services/categories.ts` e o handler MSW de categorias (envelope, DELETE 200, 409, 422), atualizar testes de handler/serviço e o override vazio de `CategoriesPage.test.tsx` — *(cobre AC-002, AC-005)*
- [ ] **T-003:** Adaptar `src/services/transactions.ts` com mapeadores snake_case/`amount`, ajustar o handler MSW de transações (serialização, 404, 200, 422) e atualizar testes de handler/serviço e o override vazio de `DashboardPage.test.tsx` — *(cobre AC-003, AC-005)*
- [ ] **T-004:** Reescrever `src/services/reports.ts` com agregação local (`/transactions` + `/categories`), remover `mocks/handlers/reports.ts` e seu teste do índice, atualizar overrides de `DashboardPage.test.tsx`/`ReportsPage.test.tsx` — *(cobre AC-004, AC-005)*
- [ ] **T-005:** Invalidar `['reports']` nas mutações de `use-categories.ts` e `use-transactions.ts`, com teste — *(cobre AC-007)*
- [ ] **T-006:** Alinhar mínimos dos schemas de categoria (3) e transação (3) e atualizar os testes de schema — *(cobre AC-006)*
- [ ] **T-007:** Atualizar `README.md` e `docs/API_BACKEND.md`, ajustar testes de documentação e validar `npm test`, `npm run lint` e `npm run build` — *(cobre AC-008)*
