# Tasks: Tema Claro/Escuro

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [x] **T-001:** Adicionar dependências `lucide-react` e `@fontsource/inter` (`package.json`) — *(cobre AC-006, AC-007)*
- [ ] **T-002:** Configurar `tailwind.config.ts` com `darkMode: 'class'`, tokens semânticos, `borderRadius` e `fontFamily.sans` (Inter) — *(cobre AC-001)*
- [ ] **T-003:** Definir variáveis CSS de `:root` e `.dark` em `src/styles/globals.css` e aplicar defaults de body com tokens — *(cobre AC-002)*
- [ ] **T-004:** Inserir script anti-FOUC no `<head>` do `index.html` e criar teste de conteúdo — *(cobre AC-003)*
- [ ] **T-005:** Criar `src/app/providers/ThemeProvider.tsx` (`useTheme`), mock de `matchMedia` no setup de testes e testes de persistência/classe/system — *(cobre AC-004, AC-005)*
- [ ] **T-006:** Criar `src/components/ThemeToggle.tsx` (dropdown acessível com sol/lua) e testes — *(cobre AC-006)*
- [ ] **T-007:** Integrar ThemeProvider e fonte Inter no `src/main.tsx`, atualizar `src/App.tsx` (header + tokens) e `src/App.test.tsx` — *(cobre AC-002, AC-006, AC-007)*
- [ ] **T-008:** Documentar o sistema de tema no `README.md` e validar `npm run lint`, `npm test` e `npm run build` — *(cobre AC-008)*
