# Nardini Select

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/brunonardini/nardini-select/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/brunonardini/nardini-select/tree/main)
[![codecov](https://codecov.io/gh/brunonardini/nardini-select/branch/main/graph/badge.svg?token=RAnmvbM53n)](https://codecov.io/gh/brunonardini/nardini-select)
[![Netlify Status](https://api.netlify.com/api/v1/badges/56d8c00c-f7c0-4a7d-a042-c0a8474d5230/deploy-status)](https://app.netlify.com/projects/nardini-select/deploys)

Site da Nardini Select, pet shop em Resende, RJ. Hoje é a home institucional da loja, em Next.js, React e TypeScript; vai evoluir para um e-commerce.

## Executar

Requer Node.js 20.9 ou superior.

Crie um arquivo `.env` na raiz do projeto. Ele fica fora do Git. A variável `WHATSAPP_NUMBER` é o telefone usado no redirecionamento para o WhatsApp: somente dígitos, com código do país, sem `+`, espaços ou pontuação. No ambiente de desenvolvimento, um número fictício basta para a rota funcionar:

```ini
WHATSAPP_NUMBER=5511999999999
```

Em produção, defina o número real da loja na mesma variável, no ambiente do servidor.

```sh
npm ci
npm run dev
```

Para produção local:

```sh
npm run build
npm run start
```

Se a porta 3000 estiver ocupada: `npm run start -- --port 3100`.

## Validações

```sh
npm run lint           # ESLint (regras do Next.js)
npm run format:check   # Prettier
npm test               # unidade e componentes (Vitest + React Testing Library)
npm run test:coverage  # o mesmo, com relatório de cobertura em coverage/
npm run test:e2e       # ponta a ponta (Playwright), faz o build e sobe o site na porta 3200
```

Antes do primeiro `test:e2e`, instale o navegador: `npx playwright install chromium`.

O CircleCI ([.circleci/config.yml](.circleci/config.yml)) instala as dependências uma vez, com cache, e a cada push roda em paralelo o lint, o Prettier, os testes de unidade e o build. Depois do build, os testes E2E rodam em dois jobs paralelos, um para desktop e outro para celular, sobre o mesmo build. A cobertura dos testes de unidade é enviada ao Codecov.

## Estrutura

- `app/page.tsx`: conteúdo e cinco seções da home.
- `app/globals.css`: identidade visual, altura mínima de 100vh e responsividade.
- `app/header.tsx`: navegação e menu mobile.
- `app/contato/whatsapp/route.ts`: redirecionamento para o WhatsApp. O número vem de `WHATSAPP_NUMBER` e fica fora do texto da página e dos componentes cliente; o destino continua visível ao abrir o serviço.
- `public/images`: somente os arquivos usados pela página. A fachada exibida tem a faixa do telefone ocultada; os originais da marca ficam fora do Git (localmente em `tmp/marca/`, ignorado).
- `scripts/check-page.cjs`: verificação no navegador; requer Playwright disponível (`PLAYWRIGHT_MODULE` pode indicar a instalação) e Edge. Executar com o servidor na porta 3100. Verifica cinco viewports e salva os prints em `.impeccable/review/`.

Não há catálogo, preços, carrinho, feed do Instagram ou publicação em hospedagem configurada. Os links de mapas, Instagram e WhatsApp estão ativos.

## Commits

Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) e são escritos em inglês, por exemplo `docs(readme): add status badges`. Os PRs são integrados com squash, então o título do PR vira o commit na `main` e segue o mesmo padrão. Detalhes no [AGENTS.md](AGENTS.md#commits-and-pull-requests).

## Desenvolvimento com IA

O projeto é preparado para agentes de IA (Claude Code, Codex, Cursor). As regras, os comandos e as skills instaladas estão no [AGENTS.md](AGENTS.md), a fonte única para agentes, lida diretamente pelas três ferramentas (no Claude Code, a partir da versão 2.1.277).

Mudanças de design ou arquitetura seguem o Elephant-Goldfish Model (EGM): um documento de design revisado antes do código. Os documentos aprovados ficam em [docs/designs/](docs/designs/README.md). O contexto de produto e de design usado pela skill Impeccable está em [PRODUCT.md](PRODUCT.md) e [DESIGN.md](DESIGN.md).
