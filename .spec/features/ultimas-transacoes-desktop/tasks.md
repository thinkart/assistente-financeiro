# Tasks: Últimas transações — lista única (replicar mobile no desktop)

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [x] **T-001:** Reescrever `src/features/dashboard/LatestTransactions.test.tsx` para a lista única (`getByRole('list', { name: 'Últimas transações' })`, 5 itens, formatação/sinal, vazio sem tabela) — *(cobre AC-001, AC-002, AC-004)*
- [x] **T-002:** Refatorar `LatestTransactions.tsx`: remover `Table`/imports e wrappers responsivos, manter apenas a lista mobile com `aria-label` sem sufixo — *(cobre AC-001, AC-002)*
- [x] **T-003:** Validar suíte completa (`npm test`, `npm run lint`, `npm run build`) + `DashboardPage.test`/`DashboardPage.a11y.test`; marcar `tasks.md` — *(cobre AC-003, AC-004)*
