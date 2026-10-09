# Spec: Tema por Toque (Alternância Direta)

## Contexto
O `ThemeToggle` atual abre um dropdown com Claro/Escuro/Sistema para escolher o tema. O requisito mudou para um botão único: inicia seguindo o tema do sistema e, a cada toque, alterna claro↔escuro, persistindo a escolha para as próximas visitas. O dropdown sai de cena e o modo Sistema deixa de ser alcançável após o primeiro toque.

## Critérios de Aceite (AC)

- **AC-001:** sem preferência salva (`financas-theme` ausente/inválida), o app inicia no tema do sistema (`prefers-color-scheme`) com o ícone correspondente no botão (lua em escuro, sol em claro) e, enquanto não houver toque, mudanças do SO continuam sendo refletidas ao vivo.
- **AC-002:** cada toque no botão alterna imediatamente entre claro e escuro (aplica o oposto do tema resolvido), persiste `'light'`/`'dark'` em `localStorage['financas-theme']` e atualiza a classe `dark` no `<html>` sem recarregar.
- **AC-003:** após o primeiro toque o tema fica fixo (mudanças do SO não alteram o app) e, ao sair e voltar (recarregar), o último tema é aplicado sem FOUC.
- **AC-004:** o botão não abre dropdown/menu (sem `aria-haspopup`, `aria-expanded` ou `role="menu"`), mantém `aria-label="Alternar tema"`, foco visível (`focus-visible:ring-2`) e ícone `lucide-react`, permanecendo no header de todas as telas.
- **AC-005:** README atualizado descrevendo o comportamento por toque, a persistência e o sistema como estado inicial; sem referências ao antigo dropdown.
- **AC-006:** `npm test`, `npm run lint` e `npm run build` passam; os testes nomeiam os ACs cobertos.

## Fora de Escopo
- Voltar ao modo Sistema após o primeiro toque (reset ou opção na UI).
- Alterações no `ThemeProvider`, tokens, script anti-FOUC, `tailwind.config.ts` ou design system.
- Sincronização de tema entre abas ou dispositivos.
