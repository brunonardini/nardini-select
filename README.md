# Nardini Select

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/brunonardini/nardini-select/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/brunonardini/nardini-select/tree/main)
[![codecov](https://codecov.io/gh/brunonardini/nardini-select/branch/main/graph/badge.svg?token=RAnmvbM53n)](https://codecov.io/gh/brunonardini/nardini-select)
[![Release](https://img.shields.io/github/v/release/brunonardini/nardini-select?sort=semver)](https://github.com/brunonardini/nardini-select/releases)

Website for Nardini Select. [Visit the live site](https://nardiniselect.com.br).

## Run locally

Use the Node.js version pinned in [.nvmrc](.nvmrc). With [nvm](https://github.com/nvm-sh/nvm), run `nvm install` once and `nvm use` in each new shell.

Create a `.env` file in the repository root. For local development, use a fake WhatsApp number with the country code and digits only.

```dotenv
WHATSAPP_NUMBER=5511999999999
```

Sentry is optional locally. Set `NEXT_PUBLIC_SENTRY_DSN` to enable it.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). To run a production build locally, use `npm run build` followed by `npm run start`.

## Checks

```sh
npm run lint
npm run typecheck
npm run format:check
npm run knip
npm test
npm run test:coverage
npm run test:e2e
```

Before the first E2E run, install Chromium with `npx playwright install chromium`.

## Project documentation

- [Product overview](PRODUCT.md), [design system](DESIGN.md), and [approved design decisions](docs/designs/README.md)
- [Contribution conventions](AGENTS.md#commits-and-pull-requests) and [agent instructions](AGENTS.md)
- [Releases, deployment, and rollback](docs/deployment.md)
- [Reporting security vulnerabilities](SECURITY.md)
