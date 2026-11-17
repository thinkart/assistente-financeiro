# Assistente Financeiro

## Sobre o Projeto

Aplicação de finanças pessoais desenvolvida no Projeto Integrador — Boas Práticas de Desenvolvimento de Software. O front-end usa React, TypeScript e Vite; o backend Flask/SQLite disponível está incompleto e ainda não oferece as rotas financeiras usadas pelo app.

**Tema:** Aplicação Financeira Pessoal. **Status:** Em desenvolvimento.

## Tecnologias

React foi escolhido para a interface, Python para a API e SQLite para o armazenamento local do backend.

## Equipe

Felipe Santos de Alencar, Alison Moretto Dias, Giovanna Bastos Rodrigues, Iago Faria dos Santos, Leandro Morais dos Santos, Marcelo Luciano Silva Araujo, Michael de Souza Teixeira e Thamires Santos Muniz.

## Como iniciar

Requisitos: Node.js 18+ e npm.

No Windows, execute `launcher.bat` na pasta de trabalho para iniciar o front em modo demonstração e abrir o navegador. Para executar manualmente:

```bash
npm install
cp .env.example .env
npm run dev
```

A aplicação fica em `http://127.0.0.1:5173`. O `.env.example` usa `VITE_USE_MOCK=true`. O usuário de demonstração é `demo@financas.dev` com senha `123456`.

Comandos: `npm test`, `npm run lint`, `npm run build`, `npm run preview` e `npm run format`.

## Pastas

- `src/app`: providers da aplicação.
- `src/components`: layout, controles compartilhados e componentes UI.
- `src/features/auth`: cadastro, login, sessão, perfil, máscaras e validações pessoais.
- `src/features/dashboard`: KPIs, gráficos e últimas transações.
- `src/features/transactions`: formulários, filtros, tabela e consultas de transações.
- `src/features/categories`: formulários, badges, cores e consultas de categorias.
- `src/features/reports`: filtros, gráficos, tabela e chaves de consulta.
- `src/pages`: composição das rotas e telas.
- `src/services`: cliente HTTP e serviços de autenticação, categorias, transações e relatórios.
- `src/mocks`: worker MSW, handlers e dados da demonstração.
- `src/types`: tipos compartilhados; `src/utils` e `src/lib`: formatadores e utilidades.
- `src/styles`: tokens de tema e estilos globais.

## Rotas

| Rota | Tela |
| --- | --- |
| `/login` | Login |
| `/cadastro` | Cadastro |
| `/` | Redireciona para `/dashboard` |
| `/dashboard` | Dashboard privado |
| `/transacoes` | Transações privadas |
| `/categorias` | Categorias privadas |
| `/relatorios` | Relatórios privados |
| `/perfil` | Perfil e exportações |
| `/perfil/editar` | Edição da conta |

## API mockada (MSW)

Para configurar o modo mock manualmente, copie `.env.example` para `.env`; `VITE_USE_MOCK=true` inicia `src/mocks/browser.ts` com os handlers em `src/mocks/handlers`. As rotas mockadas seguem o contrato HTTP usado pelo front, incluindo `/auth/login`, `/transactions`, categorias e relatórios.

A demonstração persiste usuários, tokens, categorias e transações no armazenamento local do navegador, separados por usuário. Contas novas começam sem transações; apenas a conta demo recebe dados financeiros fictícios. Categorias iniciais ficam disponíveis para novas contas. O mock não envia dados ao backend.

## Integração real

`VITE_API_URL` define a base do Axios (padrão `http://127.0.0.1:5000`). Para tentar uma API real, use `VITE_USE_MOCK=false`. O backend atualmente disponível registra somente uma rota de exemplo e não implementa autenticação, categorias, transações ou relatórios; portanto, esses fluxos precisam dos endpoints correspondentes antes de serem usados sem MSW. Os relatórios mockados agregam as transações do próprio usuário.

## Autenticação

`AuthProvider` restaura o token `financas-token` por `GET /auth/me`; `RequireAuth` protege as rotas privadas. O Axios envia `Authorization: Bearer` e encerra a sessão em respostas 401. O perfil atualiza os dados pessoais; CPF e telefone usam validação e formatação compartilhadas.

## Dashboard

O **Resumo financeiro do mês** mostra receitas, despesas e saldo, calculados no cliente a partir de `/transactions`, além do gráfico Recharts dos últimos seis meses e das **Últimas transações**. Os períodos mensais usam `date-fns`.

## Transações

Em `/transacoes`, a tabela vira cartões em telas estreitas. Os filtros de busca, tipo, categoria e período são aplicados por **Aplicar filtros**; as categorias acompanham o tipo escolhido. A paginação mostra 10 itens por página. Os modais permitem criar, editar e excluir, com as ações **Salvar** e **Salvar e adicionar outra**. O estado das consultas usa React Query.

## Categorias

Em `/categorias`, categorias podem ser criadas, editadas e excluídas. `CategoryBadge` usa as cores determinísticas de `colors.ts`; categorias em uso por transações não podem ser removidas.

## Relatórios

Em `/relatorios`, filtros por período e tipo atualizam KPIs, gráfico de barras horizontais e tabela por categoria. Quando não há dados, a tela informa **Nenhum dado no período.** No perfil, PDF e CSV são ações independentes: o PDF é gerado com jsPDF; o CSV usa UTF-8 com BOM, delimitador `;` e valores numéricos brasileiros.

## Tema claro/escuro

`ThemeToggle` alterna a cada toque entre claro e escuro; a preferência `financas-theme` é persistida. Sem escolha salva, usa o tema do sistema. Um script em `index.html` aplica o tema antes do bundle para evitar FOUC. Os estilos usam tokens semânticos como `bg-background` e `text-foreground`.

## Design system

Os componentes compartilhados ficam em `src/components/ui` (Button, Input, Card, Dialog, Dropdown Menu, Table e Tabs). A configuração compatível com shadcn@2.3.0 é mantida em `components.json`; `src/lib/utils` combina `clsx` e `tailwind-merge`. O plugin `tailwindcss-animate` fornece as animações dos componentes.

## Acessibilidade

Os formulários têm rótulos associados e mensagens de validação; testes `vitest-axe` cobrem as telas de login, dashboard, transações, categorias e relatórios. A navegação e os controles mantêm estados de foco visíveis.

## Entregáveis

- [x] Telas de login, cadastro, dashboard, transações, categorias, relatórios e perfil.
- [x] CRUD e filtros de transações e categorias.
- [x] Tema claro/escuro com preferência persistida.
- [x] Dados separados por usuário no modo MSW.
- [x] Exportação de transações em PDF e CSV.
- [x] Testes, lint e build de produção.
