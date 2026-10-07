# Spec: Componentes Base (Design System)

## Contexto
O app já possui tema e tokens semânticos, mas não tem componentes reutilizáveis. As telas das próximas etapas (auth, transações, categorias, dashboard e relatórios) precisam de Button, Input, Card, Dialog, Table, Dropdown Menu e Tabs acessíveis e themáveis. Esta feature configura o shadcn/ui (Tailwind v3) e incorpora esses componentes usando exclusivamente tokens semânticos.

## Critérios de Aceite (AC)

- **AC-001:** shadcn/ui configurado para Tailwind v3: `components.json` aponta `tailwind.config.ts`, `src/styles/globals.css` e o alias `@/lib/utils`; `src/lib/utils.ts` exporta `cn()` combinando `clsx` + `tailwind-merge`; plugin `tailwindcss-animate` registrado no Tailwind; dependências instaladas (`class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`).
- **AC-002:** tokens `--popover` e `--popover-foreground` adicionados a `:root` e `.dark` (espelhando os valores de card) em `globals.css` e mapeados no `tailwind.config.ts`, mantendo os demais valores do prompt intactos; os testes exatos do tema cobrem os novos tokens.
- **AC-003:** `Button` em `src/components/ui/button.tsx` com variantes `default`, `destructive`, `outline`, `secondary`, `ghost` e `link`, tamanhos `default`, `sm`, `lg` e `icon`, suporte a `asChild` (Slot) e encaminhamento de ref; classes apenas com tokens.
- **AC-004:** `Input` em `src/components/ui/input.tsx` com `forwardRef`, estados de foco (`ring-ring`, `ring-offset-background`), `disabled` e `file`, usando apenas tokens (`border-input`, `bg-background`).
- **AC-005:** `Card` em `src/components/ui/card.tsx` com `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` e `CardFooter`, usando `bg-card`, `text-card-foreground`, `border-border` e `rounded-lg`.
- **AC-006:** `Dialog` (Radix) acessível: `role="dialog"`, título e descrição via `DialogTitle`/`DialogDescription`, foco preso, fecha com Escape, clique no overlay e botão de fechar; overlay com tokens (`bg-background/80 backdrop-blur-sm`), sem cores fixas.
- **AC-007:** `Table` em `src/components/ui/table.tsx` com `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell` e `TableCaption` semânticos, com tokens (`hover:bg-muted/50`, `border-border`, `text-muted-foreground`).
- **AC-008:** `Dropdown Menu` (Radix) em `src/components/ui/dropdown-menu.tsx` com `DropdownMenu`, `Trigger`, `Content`, `Item`, `CheckboxItem`, `RadioItem`, `Label`, `Separator`, `Shortcut`, `Sub`, `SubTrigger` e `SubContent`; acessível por teclado e com tokens (`bg-popover`, `text-popover-foreground`, `focus:bg-accent`).
- **AC-009:** `Tabs` (Radix) em `src/components/ui/tabs.tsx` com `Tabs`, `TabsList`, `TabsTrigger` e `TabsContent`; papéis `tablist`/`tab`/`tabpanel`, navegação por teclado e tokens (`bg-muted`, `text-muted-foreground`, `bg-background`).
- **AC-010:** nenhum componente de `src/components/ui` usa cores fixas (hex/rgb ou paleta crua) — coberto pelo scan já existente; `npm test`, `npm run lint` e `npm run build` passam; cada teste referencia o AC correspondente (rastreabilidade).

## Fora de Escopo
- Refatorar o `ThemeToggle` para usar o Dropdown Menu do shadcn.
- Sonner/toasts e demais componentes do prompt (Badge, Select, Popover, etc.).
- Uso dos componentes nas telas de auth/transações/categorias/dashboard/relatórios (etapas 5-9).
