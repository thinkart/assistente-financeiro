# Spec: Dashboard — Gráfico Resumo Financeiro

## Contexto
O Dashboard exibe o gráfico de barras "Despesas por mês (R$)", que cobre só despesas. Ele será substituído pelo gráfico de linhas "Resumo Financeiro" com receitas (azul), despesas (vermelha) e saldo (verde) dos últimos 6 meses. Esta feature substitui o AC-004 da feature `dashboard` (spec antiga fica como histórico).

## Convenções
- Período: últimos **6 meses** (incluindo o atual), rótulos `MMM` pt-BR sem ponto, via date-fns.
- Agregação **client-side** a partir de `GET /transactions` (sem endpoint novo).
- Saldo do mês = receitas − despesas do mês (mesma semântica do card "Saldo"); 2 casas decimais.
- Meses sem transações entram com 0 nas três séries.
- Cores: tokens CSS `--chart-income` (azul), `--chart-expense` (vermelho), `--chart-balance` (verde), variantes light/dark, lidas via `getComputedStyle` e re-render quando `useTheme().resolvedTheme` muda (helper de gráfico não afeta o `CategoryReportChart`).
- Card "Resumo Financeiro" com legenda das séries e tooltip em BRL.

## Critérios de Aceite (AC)

- **AC-001:** tokens `--chart-income`, `--chart-expense` e `--chart-balance` definidos em `:root` e `.dark` (globals.css) com contraste AA; helper de leitura atualizado e testado.
- **AC-002:** agregador `buildMonthlySummary` retorna 6 pontos `{ month, label, income, expense, balance }`, zeros em meses vazios e `balance = income − expense` (2 casas).
- **AC-003:** componente `ResumoFinanceiroChart` (Recharts `LineChart`) com 3 linhas (receita azul, despesa vermelha, saldo verde), título "Resumo Financeiro", legenda e tooltip BRL; cores re-renderizam na troca de tema.
- **AC-004:** `DashboardPage` renderiza o novo gráfico no lugar do antigo; `MonthlyExpensesChart`, `monthly-expenses` e testes correspondentes removidos sem referências órfãs.
- **AC-005:** `README.md` (seção Dashboard) atualizado; `npm test`, `npm run lint` e `npm run build` passam.

## Fora de Escopo
- Mudanças no contrato da API (novo endpoint ou uso de `/reports/summary` por mês).
- Filtro de período no gráfico e animações customizadas.
- Manter o gráfico "Despesas por mês".
