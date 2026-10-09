# Spec: Relatórios

## Contexto
A rota `/relatorios` ainda não existe (o link da sidebar cai no catch-all). Esta feature entrega a **tela de Relatórios** da etapa 9 — cards do período, gráfico por categoria e tabela complementar, com filtros de período e tipo — usando o contrato já disponível (`/reports/summary` e `/reports/by-category`). Não há wireframe desta tela (a do wireframe é "Análise e Dicas IA", fora do prompt.txt), então a UI segue o design system.

## Convenções
- Filtros: **Período** (De/Até, opcionais) + **Tipo** (**Despesas** padrão / Receitas) + botão **Aplicar filtros**; período vazio = todo o histórico do mock.
- Dados por categoria: `GET /reports/by-category` com `startDate`, `endDate` e `type`; resposta `[{ categoryId, categoryName, total, percentage }]` (já no contrato).
- Cards do período: `GET /reports/summary?startDate&endDate` reutilizando `KpiCards` — que passa a viver em `src/components/` (componente reutilizável), com o dashboard atualizado.
- Gráfico: **barras horizontais** (Recharts) com categoria no eixo Y e total no X; cor única conforme o tipo (`--income`/`--expense`), lida das CSS variables e re-renderizando com o tema.
- Tabela complementar: Categoria, Total (BRL) e Percentual.
- Estados de loading (`role="status"`), erro (com "Tentar novamente") e vazio ("Nenhum dado no período."); sem mutações, portanto sem toasts.

## Critérios de Aceite (AC)

- **AC-001:** rota `/relatorios` na área privada (`RequireAuth` + `AppLayout`), com o link da sidebar ativo.
- **AC-002:** serviço `fetchCategoryReport(filters)` (`startDate`, `endDate`, `type`) tipado com `CategoryReport[]` e hook React Query `useCategoryReport(filters)` com query key contendo os filtros; testes.
- **AC-003:** `KpiCards` movido para `src/components/` (dashboard atualizado) e exibido no topo dos relatórios com Receitas/Despesas/Saldo do **período filtrado**; testes mantidos/ajustados.
- **AC-004:** filtros **Período (De/Até)** e **Tipo (Despesas/Receitas)** com **Aplicar filtros**, integrados ao contrato; aplicam de uma vez só (sem refetch por digitação).
- **AC-005:** gráfico de **barras horizontais** por categoria (Recharts) com os valores do período/tipo, cor vinda das CSS variables e atualizada com o tema; testes estruturais (barras por categoria).
- **AC-006:** tabela complementar com Categoria, Total (BRL) e Percentual; estado **vazio** quando não há dados no período/tipo.
- **AC-007:** estados de **loading** e **erro** (com "Tentar novamente" refazendo as queries) e layout responsivo.
- **AC-008:** testes nomeiam os ACs; `npm test`, `npm run lint` e `npm run build` passam; README atualizado (seção Relatórios).

## Fora de Escopo
- Exportação de relatórios (PDF/CSV) e comparativos entre períodos.
- Evolução mensal por categoria (apenas o total do período filtrado).
- Tela de "Análise e Dicas IA" do wireframe (não pertence ao prompt.txt).
