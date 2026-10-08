# Spec: Categorias

## Contexto
A rota `/categorias` do prompt ainda não existe (o link da sidebar não tem destino) e as categorias não têm identidade visual. Esta feature entrega o CRUD de categorias da etapa 7 — lista, modal de criar/editar e exclusão protegida — e cria as **cores por categoria** (`src/features/categories/colors.ts`), aplicadas em badges também na tabela de transações, tudo respeitando o sistema de tokens e o tema.

## Convenções
- Não há wireframe de Categorias; a UI segue o design system e o padrão já estabelecido na tela de Transações (tabela no desktop, cards no mobile, modal, diálogo de confirmação, toasts).
- **Cores**: 8 tokens semânticos novos (`--category-1` a `--category-8`) definidos em light/dark no `globals.css` e mapeados no Tailwind (`bg-category-N`, `text-category-N`). `colors.ts` resolve a cor de forma **determinística**: mapa explícito para as categorias do seed e fallback por hash do id — sem cores fixas (hex/rgb/paleta crua).
- **Exclusão protegida**: `DELETE /categories/:id` responde **400** quando a categoria está em uso por transações, com mensagem contendo a contagem ("Categoria em uso por N transação(ões)"); o diálogo exibe essa mensagem. Categoria inexistente continua 404.
- Categorias não têm paginação (volume baixo); filtros ficam fora de escopo.
- Badge de categoria é reutilizado na tela de Categorias e na coluna Categoria da tabela de Transações.

## Critérios de Aceite (AC)

- **AC-001:** tokens `--category-1` a `--category-8` adicionados a `:root` e `.dark` em `src/styles/globals.css` e mapeados em `tailwind.config.ts`; testes exatos do tema atualizados cobrindo os novos tokens.
- **AC-002:** `DELETE /categories/:id` do mock bloqueia com **400** + mensagem com contagem quando há transações vinculadas; testes do contrato atualizados/novos (caso 204 usando categoria sem vínculo criada no próprio teste).
- **AC-003:** tipos (`CategoryInput`) e serviços de categoria (`fetchCategories`, `createCategory`, `updateCategory`, `deleteCategory`) tipados, com hooks React Query (`useCategories`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`) invalidando `['categories']`; a `TransactionsPage` passa a usar `useCategories`.
- **AC-004:** rota `/categorias` na área privada (`RequireAuth` + `AppLayout`), com o link correspondente ativo na sidebar.
- **AC-005:** `src/features/categories/colors.ts` resolve a cor por categoria de forma determinística (mapa para o seed + fallback por hash) e o componente `CategoryBadge` renderiza o chip colorido com tokens.
- **AC-006:** lista de categorias com **Nome (badge colorido), Tipo e Ações (Editar/Excluir)**, em tabela no desktop e cards no mobile.
- **AC-007:** modal de criar/editar categoria (Nome + Tipo) com schema zod (mensagens pt-BR), edição pré-preenchida e ações **Salvar** e **Cancelar**; erros inline.
- **AC-008:** exclusão com diálogo de confirmação; falha por vínculo mostra a mensagem do backend no diálogo; toasts de sucesso/erro; estados de loading, erro (com "Tentar novamente") e vazio na lista.
- **AC-009:** a coluna Categoria da `TransactionsTable` (desktop e cards) exibe o `CategoryBadge` colorido, mantendo o fallback "Sem categoria" e sem quebrar os testes existentes.
- **AC-010:** `npm test`, `npm run lint` e `npm run build` passam; testes nomeiam os ACs; README atualizado (seção Categorias).

## Fora de Escopo
- Filtros e paginação na lista de categorias.
- Renomear/excluir categorias padrão do seed de forma automática (a exclusão segue a regra de vínculo).
- Edição das cores pelo usuário (a paleta é derivada do id).
