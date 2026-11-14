# Nardini Select

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/brunonardini/nardini-select/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/brunonardini/nardini-select/tree/main)
[![codecov](https://codecov.io/gh/brunonardini/nardini-select/branch/main/graph/badge.svg?token=RAnmvbM53n)](https://codecov.io/gh/brunonardini/nardini-select)
[![Netlify Status](https://api.netlify.com/api/v1/badges/56d8c00c-f7c0-4a7d-a042-c0a8474d5230/deploy-status)](https://app.netlify.com/projects/nardini-select/deploys)

Site da Nardini Select, pet shop em Resende, RJ. Hoje é a home institucional da loja, em Next.js, React e TypeScript; vai evoluir para um e-commerce.

## Executar

Requer Node.js 20.19.0 ou superior.

Crie um arquivo `.env` na raiz do projeto. Ele fica fora do Git. A variável `WHATSAPP_NUMBER` é o telefone usado no redirecionamento para o WhatsApp: somente dígitos, com código do país, sem `+`, espaços ou pontuação. No ambiente de desenvolvimento, um número fictício basta para a rota funcionar:

```ini
WHATSAPP_NUMBER=5511999999999
# Opcional: envia erros, traces e logs ao projeto nardini-select na Sentry.
NEXT_PUBLIC_SENTRY_DSN=
```

Sem `NEXT_PUBLIC_SENTRY_DSN`, a Sentry fica desligada. O DSN está em Settings > Projects > nardini-select > Client Keys (DSN), na Sentry.

O site é publicado no Netlify. As variáveis da aplicação ficam nas variáveis de ambiente do Netlify:

- `WHATSAPP_NUMBER`: o número real da loja.
- `NEXT_PUBLIC_SENTRY_DSN`: o DSN do projeto na Sentry.
- `SENTRY_AUTH_TOKEN`: token de organização da Sentry, usado no build para enviar os source maps. Nunca entra no repositório.

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

O CircleCI ([.circleci/config.yml](.circleci/config.yml)) instala as dependências uma vez, com cache, e a cada push roda em paralelo o lint, o Prettier, os testes de unidade e o build. Depois do build, os testes E2E rodam em dois jobs paralelos, um para desktop e outro para celular, sobre o mesmo build. A cobertura dos testes de unidade é enviada ao Codecov. Na `main`, depois que tudo passa, o job `release` gera a versão e publica em produção (veja abaixo).

## Estrutura

- `app/page.tsx`: conteúdo e cinco seções da home.
- `app/globals.css`: identidade visual, altura mínima de 100vh e responsividade.
- `app/header.tsx`: navegação e menu mobile.
- `app/contato/whatsapp/route.ts`: redirecionamento para o WhatsApp. O número vem de `WHATSAPP_NUMBER` e fica fora do texto da página e dos componentes cliente; o destino continua visível ao abrir o serviço.
- `public/images`: somente os arquivos usados pela página. A fachada exibida tem a faixa do telefone ocultada; os originais da marca ficam fora do Git (localmente em `tmp/marca/`, ignorado).
- `scripts/check-page.cjs`: verificação no navegador; requer Playwright disponível (`PLAYWRIGHT_MODULE` pode indicar a instalação) e Edge. Executar com o servidor na porta 3100. Verifica cinco viewports e salva os prints em `.impeccable/review/`.

Não há catálogo, preços, carrinho ou feed do Instagram. Os links de mapas, Instagram e WhatsApp estão ativos.

## Versionamento, deploy e rollback

A versão segue SemVer e é gerada pelo semantic-release a partir dos commits na `main`. Como os PRs entram com squash, o título do PR decide a versão: `fix:` gera PATCH, `feat:` gera MINOR, e `docs:`, `chore:` e similares não geram versão nem deploy. O projeto fica em 0.x até o lançamento do e-commerce. A versão real está na tag `vX.Y.Z` e na release do GitHub, cujas notas são o changelog. O `version` do `package.json` é fixo e não muda.

Quando um merge gera versão, o CircleCI cria a tag e a release no GitHub, compila e publica em produção no Netlify com a mensagem `Release vX.Y.Z`, e registra a release `nardini-select@X.Y.Z` na Sentry. O Netlify continua gerando sozinho as prévias de cada PR; o `netlify.toml` faz ele pular os builds da `main`, que passam a ser feitos só pelo CircleCI.

Rollback: no Netlify, abra a aba Deploys, entre no último deploy bom e clique em Publish deploy. Isso republica o deploy sem compilar de novo. Depois corrija o problema num PR com título `fix: ...`; o merge gera uma nova versão PATCH e volta a publicar automaticamente.

## Commits

Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) e são escritos em inglês, por exemplo `docs(readme): add status badges`. Os PRs são integrados com squash, então o título do PR vira o commit na `main` e segue o mesmo padrão; uma GitHub Action valida o título. Localmente, o commitlint confere cada commit pelo hook `commit-msg`, instalado pelo `npm install`. Detalhes no [AGENTS.md](AGENTS.md#commits-and-pull-requests).

## Desenvolvimento com IA

O projeto é preparado para agentes de IA (Claude Code, Codex, Cursor). As regras, os comandos e as skills instaladas estão no [AGENTS.md](AGENTS.md), a fonte única para agentes, lida diretamente pelas três ferramentas (no Claude Code, a partir da versão 2.1.277).

Mudanças de design ou arquitetura seguem o Elephant-Goldfish Model (EGM): um documento de design revisado antes do código. Os documentos aprovados ficam em [docs/designs/](docs/designs/README.md). O contexto de produto e de design usado pela skill Impeccable está em [PRODUCT.md](PRODUCT.md) e [DESIGN.md](DESIGN.md).
