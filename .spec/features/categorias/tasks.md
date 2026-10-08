# Tasks: Categorias

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [x] **T-001:** Adicionar os tokens `--category-1..8` em `globals.css`/`tailwind.config.ts` e atualizar os testes exatos do tema — *(cobre AC-001)*
- [x] **T-002:** Bloquear `DELETE /categories/:id` em uso (400 com contagem), atualizando handlers e testes do contrato — *(cobre AC-002)*
- [x] **T-003:** Adicionar `CategoryInput` aos tipos e criar/atualizar os serviços de categoria, com testes — *(cobre AC-003)*
- [x] **T-004:** Criar os hooks React Query de categorias (`use-categories.ts`) e refatorar a `TransactionsPage` para `useCategories`, com testes — *(cobre AC-003)*
- [x] **T-005:** Criar `src/features/categories/colors.ts` (mapa + fallback determinístico) e o `CategoryBadge`, com testes — *(cobre AC-005)*
- [ ] **T-006:** Aplicar o `CategoryBadge` na `TransactionsTable` (desktop e mobile), ajustando testes — *(cobre AC-009)*
- [ ] **T-007:** Criar o schema zod da categoria (`src/features/categories/schemas.ts`) e testes — *(cobre AC-007)*
- [ ] **T-008:** Criar o `CategoryForm` em modal (criar/editar) e testes — *(cobre AC-007)*
- [ ] **T-009:** Criar o `DeleteCategoryDialog` (confirmação + mensagem de bloqueio) e testes — *(cobre AC-008)*
- [ ] **T-010:** Criar a `CategoriesPage` (lista, modais, estados loading/erro/vazio e toasts), ligar a rota `/categorias` e testes — *(cobre AC-004, AC-006, AC-008)*
- [ ] **T-011:** Atualizar o `README.md` (seção Categorias) e validar `npm run lint`, `npm test` e `npm run build` — *(cobre AC-010)*
