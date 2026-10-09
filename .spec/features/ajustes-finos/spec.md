# Spec: Ajustes Finos (Polimento)

## Contexto
Com todas as telas entregues (etapas 1-9), faltam os ajustes finos da etapa 10: navegação no mobile (a sidebar some <720px sem alternativa), verificação automatizada de acessibilidade e consolidação do README. Os estados de loading/erro/vazio já existem e estão testados — aqui são auditados e corrigidos pontualmente.

## Convenções
- **Menu mobile**: botão acessível no header (visível <720px) abrindo um `DropdownMenu` (do design system) com Dashboard, Transações, Categorias e Relatórios; indica a rota ativa e fecha ao navegar. A sidebar permanece ≥720px.
- **Acessibilidade estática**: `eslint-plugin-jsx-a11y` no flat config, aplicado a `**/*.{ts,tsx}`; achados reais corrigidos (sem silenciar regras em massa).
- **Acessibilidade dinâmica**: `vitest-axe` integrado ao setup (`toHaveNoViolations`) e usada nas páginas principais com os providers/MSW dos testes existentes (a regra de contraste de cor não roda em jsdom).
- **Estados e responsividade**: manter a implementação atual (loading/erro/vazio e cards ≤720px) e auditar contra o checklist do prompt; correções pontuais entram cobertas pelos testes existentes.
- Sem mudanças de contrato/API nesta feature.

## Critérios de Aceite (AC)

- **AC-001:** `eslint-plugin-jsx-a11y` configurado no flat config (com as regras recomendadas) e `npm run lint` verde; violações encontradas no código atual corrigidas.
- **AC-002:** `vitest-axe` integrado ao setup de testes e as páginas **Login, Dashboard, Transações, Categorias e Relatórios** possuem teste de acessibilidade sem violações (`toHaveNoViolations`), nomeando o AC.
- **AC-003:** `AppLayout` com **menu mobile** no header (<720px): botão com `aria-label`/`aria-expanded` e DropdownMenu com os 4 links, destacando a rota ativa e **fechando após navegar**; sidebar preservada em telas maiores.
- **AC-004:** auditoria de **estados (loading/erro/vazio)** e **responsividade** nas páginas concluída, com correções pontuais aplicadas e verdes na suíte.
- **AC-005:** `README.md` final com visão geral, rotas/credenciais de demonstração e entregáveis do prompt; `npm test`, `npm run lint` e `npm run build` passam; testes nomeiam os ACs.

## Fora de Escopo
- Novas funcionalidades ou telas (todas as etapas do prompt já foram entregues).
- Auditoria de contraste por ferramenta (o axe em jsdom não avalia cores) — verificação manual.
- Testes E2E em navegador real.
