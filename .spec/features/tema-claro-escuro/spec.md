# Spec: Tema Claro/Escuro

## Contexto
O app ainda não possui sistema de tema e o placeholder usa cores neutras do Tailwind. É preciso criar os tokens semânticos, o ThemeProvider (light/dark/system) e o ThemeToggle, com script anti-FOUC, para que todas as telas sejam construídas sobre um tema consistente e alternável.

## Critérios de Aceite (AC)

- **AC-001:** `tailwind.config.ts` usa `darkMode: 'class'` e define tokens semânticos (`background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `income`, `expense`) com `borderRadius` mapeado para `var(--radius)`, gerando classes utilitárias (ex.: `bg-background`, `text-foreground`, `text-income`).
- **AC-002:** `src/styles/globals.css` define as variáveis CSS de `:root` (light) e `.dark` com os valores do prompt do projeto, e o app atual não usa cores fixas (hex/rgb) nem classes de paleta crua (`bg-white`, `text-gray-900`) — apenas tokens semânticos.
- **AC-003:** sem flash de tema errado (FOUC): o `index.html` contém um script inline no `<head>`, antes do bundle, que lê `financas-theme` do `localStorage` e aplica a classe `dark` no `<html>` quando o tema for `dark` ou `system` com `prefers-color-scheme: dark`.
- **AC-004:** o `ThemeProvider` (Context API, em `src/app/providers/ThemeProvider.tsx`) expõe `useTheme()` com `theme` (`'light' | 'dark' | 'system'`), `resolvedTheme` (`'light' | 'dark'`) e `setTheme(t)`; `setTheme` persiste em `localStorage['financas-theme']` e aplica/remove a classe `dark` imediatamente; valor ausente ou inválido cai em `system`.
- **AC-005:** quando `theme = 'system'`, `resolvedTheme` segue `prefers-color-scheme` e reage a mudanças do SO via listener de `matchMedia`, atualizando a classe sem recarregar a página.
- **AC-006:** o `<ThemeToggle />` fica visível no header do app, com ícone de sol/lua (`lucide-react`) e dropdown com as opções Light / Dark / System refletindo a opção ativa; é acessível (`aria-label`, `aria-haspopup`, `aria-expanded`, foco visível) e fecha com `Escape` e clique fora.
- **AC-007:** o `main.tsx` envolve o App com o `ThemeProvider` e importa a fonte Inter (`@fontsource/inter`); o tema escolhido persiste entre recarregamentos e o ThemeToggle aparece na tela existente.
- **AC-008:** `npm test`, `npm run lint` e `npm run build` passam sem erros; cada teste referencia o AC correspondente (rastreabilidade).

## Fora de Escopo
- shadcn/ui e demais componentes do design system (etapa 3) — o dropdown do toggle é custom e pode ser reestilizado depois.
- Header/sidebar definitivos do layout autenticado, rotas e tela de login (etapas 5-9).
- Toasts, gráficos e badges de categoria (etapas 6-9).
