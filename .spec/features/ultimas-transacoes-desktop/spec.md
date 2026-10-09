# Spec: Últimas transações — lista única (replicar mobile no desktop)

## Contexto
No Dashboard, o card "Últimas transações" (`src/features/dashboard/LatestTransactions.tsx`) renderiza tabela no desktop (≥720px) e lista empilhada no mobile (<720px). Esta feature remove a tabela e replica a visualização mobile (descrição + data à esquerda, valor à direita) para todos os tamanhos de tela, unificando a renderização.

## Convenções
- Alteração restrita a `LatestTransactions.tsx` e seu teste; nenhuma mudança em `useTransactions`, `fetchTransactions`, tipo `Transaction` ou contrato da API.
- Lista única `<ul>/<li>` em todos os breakpoints: remover o wrapper `hidden min-[720px]:block` (tabela), o `min-[720px]:hidden` (lista) e os imports de `Table`.
- Visual = réplica exata do mobile atual: `flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0`; descrição `truncate font-medium`; data `text-xs text-muted-foreground`; valor com sinal e tokens `text-income`/`text-expense`.
- `aria-label` passa de "Últimas transações (mobile)" para "Últimas transações" (lista universal).
- Mantidos: 5 mais recentes (`limit = 5`), estado vazio (`role="status"`) e link **Ver todas** → `/transacoes`.
- Este AC supersede o trecho "tabela no desktop e cards no mobile" do AC-005 de `.spec/features/dashboard/spec.md`; os demais ACs do dashboard permanecem válidos.

## Critérios de Aceite (AC)

- **AC-001:** O card renderiza uma única lista `<ul aria-label="Últimas transações">` em qualquer viewport, **sem `<table>` no DOM**, com as 5 mais recentes (descrição, data e valor com sinal/cor por tipo).
- **AC-002:** A lista replica o layout mobile: descrição truncada + data em `text-xs text-muted-foreground` à esquerda, valor `whitespace-nowrap` à direita, itens `py-2 text-sm` com separadores `border-b` (último sem borda).
- **AC-003:** Estado vazio (`role="status"` com "Nenhuma transação encontrada.") e link "Ver todas" → `/transacoes` preservados; `DashboardPage.test` e `DashboardPage.a11y.test` passam sem alteração.
- **AC-004:** Testes nomeiam os ACs e consultam a lista por `aria-label="Últimas transações"`; `npm test`, `npm run lint` e `npm run build` passam.

## Fora de Escopo
- Mudanças em hooks, serviços, tipos ou contrato da API.
- Polimento extra no desktop (hover, zebra, densidade) — a lista é réplica exata.
- Demais cards do dashboard e outras tabelas (ex: `TransactionsTable`, `CategoryReportTable`).
