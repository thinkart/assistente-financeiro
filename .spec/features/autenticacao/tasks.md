# Tasks: Autenticação

> Use `[x]` para marcar como concluída.

## Ordem de Execução

- [x] **T-001:** Adicionar dependências `react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers` e `sonner` (`package.json`) — *(cobre AC-001)*
- [x] **T-002:** Estender o contrato do mock (`User` com `cpf`/`phone`, register com novos campos e duplicidades) atualizando handlers, seed e testes existentes — *(cobre AC-002)*
- [x] **T-003:** Criar os schemas zod de login e cadastro (`src/features/auth/schemas.ts`) e testes — *(cobre AC-003)*
- [x] **T-004:** Criar o token storage (`financas-token`), o interceptor de request (Bearer) e o tratamento global de 401 no `src/services/api.ts`, com testes — *(cobre AC-005)*
- [ ] **T-005:** Criar `AuthProvider`/`useAuth` (boot via `GET /auth/me`, `signIn`, `signUp`, `signOut`) e testes — *(cobre AC-004)*
- [ ] **T-006:** Criar `RequireAuth` (redirect preservando a origem) e testes — *(cobre AC-008)*
- [ ] **T-007:** Configurar as rotas no `App`/`main.tsx` (`/login`, `/cadastro`, área privada e catch-all) e atualizar os testes de App — *(cobre AC-001)*
- [ ] **T-008:** Criar a `LoginPage` (form RHF+zod, ThemeToggle, erro 401, redirect) e testes — *(cobre AC-006, AC-009)*
- [ ] **T-009:** Criar a `RegisterPage` (form fiel ao wireframe, validações, Limpar) e testes — *(cobre AC-007, AC-009)*
- [ ] **T-010:** Criar `AppLayout` (header com usuário/ThemeToggle/Sair + sidebar) e `DashboardPage` placeholder, com testes — *(cobre AC-009)*
- [ ] **T-011:** Integrar o `AppToaster` (Sonner) com tema dinâmico e feedback em login/cadastro, com testes — *(cobre AC-010)*
- [ ] **T-012:** Atualizar o `README.md` (rotas, credenciais demo) e validar `npm run lint`, `npm test` e `npm run build` — *(cobre AC-010)*
