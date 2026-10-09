# Tasks: Dashboard

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [x] **T-001:** Adicionar `recharts` e `date-fns` (`package.json`) — *(cobre AC-001)*
- [x] **T-002:** Criar o serviço `fetchSummary` (`src/services/reports.ts`) e o hook `useSummary` com testes — *(cobre AC-002)*
- [x] **T-003:** Criar a agregação mensal de despesas (`src/features/dashboard/monthly-expenses.ts`) e testes — *(cobre AC-004)*
- [ ] **T-004:** Criar os cards de KPIs (Receitas/Despesas/Saldo) e testes — *(cobre AC-003)*
- [ ] **T-005:** Criar o gráfico `MonthlyExpensesChart` (Recharts) + stub de `ResizeObserver` no setup + testes — *(cobre AC-004)*
- [ ] **T-006:** Criar o card `LatestTransactions` (últimas 5, tabela/cards, "Ver todas") e testes — *(cobre AC-005)*
- [ ] **T-007:** Compor a `DashboardPage` (período do mês, seções, estados loading/erro/vazio), atualizar `DashboardPage.test` e validar as rotas — *(cobre AC-006, AC-007)*
- [ ] **T-008:** Atualizar o `README.md` (seção Dashboard) e validar `npm run lint`, `npm test` e `npm run build` — *(cobre AC-008)*
