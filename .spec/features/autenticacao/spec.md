# Spec: Autenticação

## Contexto
O app ainda não tem rotas nem controle de sessão: qualquer pessoa vê o mesmo placeholder. Esta feature cria as telas de **Login** e **Cadastro** (fiéis ao wireframe), o fluxo de sessão com token JWT (persistido e restaurado via `GET /auth/me`), as rotas privadas com redirect para `/login` e um layout autenticado mínimo (header + sidebar), preparando as telas das etapas 6-9.

## Convenções
- Rotas: `/login` e `/cadastro` (públicas); `/` (privada, layout autenticado) com página inicial placeholder; catch-all redireciona para `/`.
- Token persistido em `localStorage` na chave `financas-token`; após login, redireciona para a rota de origem (`state.from`) ou `/`.
- Interceptor de resposta trata **401**: limpa o token e dispara o evento `financas:unauthorized` (o `AuthProvider` derruba a sessão; a guarda redireciona).
- Validações (zod, mensagens em pt-BR): e-mail válido; senha mínima de 6; confirmação igual à senha; nome com ao menos 3 caracteres; CPF com 11 dígitos; telefone com 10-11 dígitos.
- Contrato estendido: `User` passa a ter `cpf` e `phone`; `POST /auth/register` recebe `{ name, cpf, email, phone, password }` (e-mail ou CPF duplicado → 400). Seed demo: `demo@financas.dev` / `123456`.
- O `ThemeToggle` permanece visível em **todas** as telas (públicas e privadas).

## Critérios de Aceite (AC)

- **AC-001:** dependências instaladas (`react-router-dom`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`); o app navega entre `/login`, `/cadastro` e área privada, com catch-all redirecionando para `/`.
- **AC-002:** contrato do mock estendido (`User` com `cpf`/`phone`; register com os novos campos e duplicidade de e-mail/CPF → 400), com seed e testes atualizados sem quebrar login/me.
- **AC-003:** schemas zod de login e cadastro com as validações das convenções (incluindo confirmação de senha), testados.
- **AC-004:** `AuthProvider` (Context API) expõe `user`, `isAuthenticated`, `signIn`, `signUp` e `signOut`; restaura a sessão no boot via `GET /auth/me` (token inválido → sessão limpa); persiste o token em `financas-token`.
- **AC-005:** o Axios anexa `Authorization: Bearer <token>` quando há token e, em **401** de rota autenticada, limpa o token e dispara `financas:unauthorized` — fluxo coberto por teste.
- **AC-006:** `LoginPage` fiel ao wireframe (card centralizado com `ThemeToggle` no topo, campos E-mail e Senha, botão **Entrar** e link **Cadastre-se**); validação inline; credenciais inválidas mostram mensagem de erro; sucesso redireciona (origem ou `/`).
- **AC-007:** `RegisterPage` fiel ao wireframe (Nome completo, CPF, E-mail, Telefone, Senha, Confirmar senha; botões **Criar conta** e **Limpar**; link **Fazer login**) com validação inline; sucesso autentica e redireciona; **Limpar** reseta o formulário.
- **AC-008:** `RequireAuth` protege a área privada: sem sessão → redireciona para `/login` preservando a origem; com sessão → renderiza.
- **AC-009:** layout autenticado mínimo (`AppLayout`) com header (nome do usuário, `ThemeToggle` e **Sair**) e sidebar (Dashboard, Transações, Categorias, Relatórios) + `DashboardPage` placeholder; logout limpa a sessão e volta para `/login`.
- **AC-010:** `AppToaster` (Sonner) com tema dinâmico e feedback de sucesso/erro nos fluxos de login e cadastro; `npm test`, `npm run lint` e `npm run build` passam; testes nomeiam os ACs; README atualizado com rotas e credenciais de demonstração.

## Fora de Escopo
- Telas reais de Dashboard/Transações/Categorias/Relatórios (etapas 6-9) — a sidebar mostrará links ainda sem destino real.
- Refresh token, recuperação de senha, "lembrar-me" e persistência de usuário além do token.
- Validação de dígitos verificadores do CPF (apenas formato).
