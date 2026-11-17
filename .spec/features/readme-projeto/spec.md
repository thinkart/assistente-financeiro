# Spec: README do Projeto (Consolidação)

## Contexto
O README atual documenta apenas o front-end e não traz o contexto acadêmico do projeto. É preciso mesclar as informações institucionais (UC, tema, justificativas, equipe e status) com a documentação técnica existente, reescrevendo "Como iniciar o projeto localmente" com foco no front-end e referenciando o backend por nota.

## Convenções
- Este repositório contém apenas o front-end (React 18 + Vite + TypeScript); o backend Flask + SQLite é um projeto separado.
- Contexto acadêmico: Unidade Curricular "Projeto Integrador — Boas Práticas de Desenvolvimento de Software"; tema "Aplicação Financeira Pessoal"; status "Em desenvolvimento".
- Equipe: os 8 integrantes listados no README fornecido.
- Setup front-end: clone de `https://github.com/thinkart/assistente-financeiro.git`, Node.js 18+, `npm install`, `.env` a partir de `.env.example`, `npm run dev` em `http://localhost:5173`.
- Mock é o padrão (`VITE_USE_MOCK=true`); API real com `VITE_USE_MOCK=false` e backend em `http://127.0.0.1:5000` (docs em `/apidocs/`).
- Backend: apenas nota apontando para o README do repositório Flask, sem repetir venv/pip/migrations.
- Preservar os headings e termos exigidos pelos testes de documentação existentes.

## Critérios de Aceite (AC)

- **AC-001:** README contém contexto acadêmico (UC, tema, "Sobre o Projeto") e status "Em desenvolvimento".
- **AC-002:** README contém tecnologias e justificativas (React, Python, SQLite) e a equipe com os 8 integrantes.
- **AC-003:** "Como iniciar o projeto localmente" é focado no front-end (clone, requisitos, `npm install`, `.env`, `npm run dev`, scripts e credenciais demo) e inclui nota curta sobre o backend.
- **AC-004:** documentação técnica atual é preservada (Rotas, Autenticação, Dashboard, Transações, Categorias, Relatórios, API mockada (MSW), Tema claro/escuro, Design system, Acessibilidade, Entregáveis etc.), com duplicatas removidas e numeração corrigida.
- **AC-005:** `npm test`, `npm run lint` e `npm run build` passam, sem criar ou alterar testes.

## Fora de Escopo
- Alterar código da aplicação, contrato da API ou `docs/API_BACKEND.md`.
- Incluir passo a passo de instalação, configuração ou migrations do backend.
- Alterar deploy, Vite ou mocks.
