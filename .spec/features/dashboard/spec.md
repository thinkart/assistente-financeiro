# Spec: Dashboard

## Contexto
A rota `/` mostra apenas um placeholder. Esta feature entrega o **Dashboard** da etapa 8 — cards de Receitas, Despesas e Saldo do mês, gráfico de despesas por mês e as últimas transações — usando os dados já existentes (`/reports/summary` e `/transactions`), com **Recharts** e **date-fns**, seguindo o wireframe (`dashboard.html`).

## Convenções
- Não há endpoint novo: os KPIs usam `GET /reports/summary?startDate&endDate` (mês atual) e o gráfico agrega **client-side** as transações de `GET /transactions` (sem alterar o contrato).
- Período do mês atual: `startOfMonth`/`endOfMonth` com date-fns.
- Gráfico "**Despesas por mês (R$)**": últimos **6 meses** (incluindo o atual), barra = total de despesas do mês; meses sem despesas aparecem com 0; rótulos abreviados em pt-BR (`format(..., 'MMM', { locale: ptBR })`).
- Cores do gráfico: lidas das CSS variables via `getComputedStyle` com re-render quando `useTheme().resolvedTheme` muda (conforme diretriz do prompt para Recharts); fallback `currentColor`.
- "Últimas transações": as **5 mais recentes** (ordenação da API), com sinal (`+`/`−`) e tokens `text-income`/`text-expense`; link **Ver todas** → `/transacoes`.
- Responsivo: tabelas/listas viram cards ≤720px (mesmo padrão das outras telas).
- O card "Resumo da análise IA" do wireframe fica fora (não pertence às telas do prompt).

## Critérios de Aceite (AC)

- **AC-001:** `recharts` e `date-fns` instalados; o período do mês usa `startOfMonth`/`endOfMonth` do date-fns (com locale pt-BR nos rótulos).
- **AC-002:** serviço `fetchSummary` (`src/services/reports.ts`) tipado com `SummaryReport` e hook React Query `useSummary(period)` com query key contendo o período.
- **AC-003:** cards **Receitas**, **Despesas** e **Saldo** do mês atual, valores em BRL; saldo com cor por sinal (tokens `text-income`/`text-expense`) e período exibido.
- **AC-004:** gráfico de barras **"Despesas por mês (R$)"** (Recharts) com os 6 meses, agregados a partir de `GET /transactions`; total correto por mês (incluindo zeros) e cores re-renderizando quando o tema muda.
- **AC-005:** card **"Últimas transações"** com as 5 mais recentes (Data, Descrição, Valor) e link **Ver todas** para `/transacoes`; tabela no desktop e cards no mobile.
- **AC-006:** a `DashboardPage` substitui o placeholder na rota `/` (área privada/layout), responsiva e sem quebrar as demais rotas.
- **AC-007:** estados de **loading** (`role="status"`), **erro** (com "Tentar novamente") e **vazio** (sem transações) tratados por seção.
- **AC-008:** testes nomeiam os ACs (com stub de `ResizeObserver` para o Recharts em jsdom); `npm test`, `npm run lint` e `npm run build` passam; README atualizado (seção Dashboard).

## Fora de Escopo
- Card "Resumo da análise IA" do wireframe (tela de IA não faz parte do prompt.txt).
- Filtros de período no dashboard (os cards usam o mês atual) e animações customizadas do gráfico.
