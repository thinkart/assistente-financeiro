# Tasks: Transações

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [x] **T-001:** Adicionar `@tanstack/react-query` e criar o `QueryProvider` integrado ao `main.tsx`, com testes — *(cobre AC-001)*
- [x] **T-002:** Estender o contrato do mock (`paymentMethod` obrigatório, `search` nos filtros), atualizando seed, handlers e testes existentes/novos — *(cobre AC-002)*
- [x] **T-003:** Criar os serviços `src/services/transactions.ts` e `src/services/categories.ts` (tipados) e testes — *(cobre AC-003)*
- [x] **T-004:** Criar os hooks React Query (`use-transactions.ts`) com invalidação de cache e testes — *(cobre AC-003)*
- [ ] **T-005:** Criar o schema zod do formulário de transação (`src/features/transactions/schemas.ts`) e testes — *(cobre AC-008)*
- [ ] **T-006:** Criar a `TransactionsTable` (tabela + cards no mobile) e testes — *(cobre AC-005)*
- [ ] **T-007:** Criar a `FiltersBar` (Buscar, Tipo, Categoria, Período, Aplicar filtros) e testes — *(cobre AC-006)*
- [ ] **T-008:** Criar o `TransactionForm` em modal (criar/editar/salvar e adicionar outra) e testes — *(cobre AC-008)*
- [ ] **T-009:** Criar o `DeleteTransactionDialog` (confirmação de exclusão) e testes — *(cobre AC-009)*
- [ ] **T-010:** Criar a `TransactionsPage` (query, filtros, paginação, modais, estados loading/erro/vazio e toasts), ligar a rota `/transacoes` e testes — *(cobre AC-004, AC-007, AC-009)*
- [ ] **T-011:** Atualizar o `README.md` (seção Transações) e validar `npm run lint`, `npm test` e `npm run build` — *(cobre AC-010)*
