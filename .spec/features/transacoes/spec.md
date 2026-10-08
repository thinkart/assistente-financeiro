# Spec: Transações

## Contexto
A área privada já existe (login, layout e Dashboard placeholder), mas a rota `/transacoes` ainda não tem conteúdo. Esta feature entrega o CRUD de transações da etapa 6 — lista com filtros e paginação, formulário em modal para criar/editar e exclusão com confirmação — introduzindo o **React Query** para cache/estado de servidor e seguindo o wireframe (`lista-transacoes.html`/`cadastro-transacao.html`).

## Convenções
- Contrato estendido: `Transaction` ganha `paymentMethod: 'pix' | 'credito' | 'debito' | 'dinheiro' | 'boleto'` (obrigatório) e `TransactionFilters` ganha `search?: string` (filtra a descrição, case-insensitive).
- **Repetição**: campo presente no formulário apenas com a opção "Não repetir" — recorrência real fica fora de escopo.
- **Seleções**: `<select>` nativo estilizado com tokens (o prompt lista shadcn/ui para Button, Dialog, Dropdown, Input, Tabs e Table — não para Select).
- **Paginação**: client-side, 10 itens por página (Anterior/Próxima; a API real poderá paginar depois).
- Valores: exibidos com sinal (`+`/`−`) e tokens `text-income`/`text-expense`; linhas zebradas com `odd:bg-muted/40`.
- Responsivo: ≤720px a tabela vira lista de cards (rótulos por linha), como no wireframe.
- Cores/badges por categoria ficam para a etapa 7 (aqui a categoria aparece como texto simples).

## Critérios de Aceite (AC)

- **AC-001:** `@tanstack/react-query` instalado e `QueryProvider` (QueryClientProvider) integrado ao `main.tsx`; a página de transações usa `useQuery`/`useMutation`.
- **AC-002:** contrato do mock estendido — seed com `paymentMethod` válido em todas as transações; `POST/PUT /transactions` exigem `paymentMethod` (400 se inválido); `GET /transactions` aceita `search`; testes existentes atualizados e novos cobrindo os pontos.
- **AC-003:** serviços por domínio (`src/services/transactions.ts` e `src/services/categories.ts`) tipados e hooks React Query (`useTransactions`, `useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`) com invalidação de cache após mutações.
- **AC-004:** rota `/transacoes` na área privada (sob `RequireAuth` + `AppLayout`), com o link da sidebar ativo (`NavLink`).
- **AC-005:** tabela fiel ao wireframe com Data, Descrição, Categoria, Tipo, Valor (com +/−) e Ações (Editar/Excluir); zebra e versão em cards no mobile.
- **AC-006:** filtros Buscar (texto), Tipo, Categoria e Período (data inicial/final) com botão **Aplicar filtros**, integrados ao contrato (`search`, `type`, `categoryId`, `startDate`, `endDate`).
- **AC-007:** paginação client-side com **Anterior/Próxima**, 10 itens por página, controles desabilitados nos extremos.
- **AC-008:** modal de criar/editar com RHF + zod (Descrição, Valor > 0, Tipo, Categoria, Método, Data, Repetição) e ações **Salvar**, **Salvar e adicionar outra** (cria, limpa o formulário e mantém o modal) e **Cancelar**; edição pré-preenchida.
- **AC-009:** exclusão com **diálogo de confirmação**, toasts de sucesso/erro (Sonner) e estados de **loading**, **erro** e **vazio** na lista.
- **AC-010:** testes nomeando os ACs; `npm test`, `npm run lint` e `npm run build` passam; README atualizado (seção Transações).

## Fora de Escopo
- Recorrência real de transações (o select fica apenas com "Não repetir").
- Cores/badges por categoria e CRUD de categorias (etapa 7).
- Exportação, ordenação por coluna e paginação server-side.
