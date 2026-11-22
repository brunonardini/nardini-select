# Nardini Select

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/brunonardini/nardini-select/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/brunonardini/nardini-select/tree/main)
[![codecov](https://codecov.io/gh/brunonardini/nardini-select/branch/main/graph/badge.svg?token=RAnmvbM53n)](https://codecov.io/gh/brunonardini/nardini-select)
[![Release](https://img.shields.io/github/v/release/brunonardini/nardini-select?sort=semver)](https://github.com/brunonardini/nardini-select/releases)

Website for Nardini Select.

## Run locally

Use the Node.js version pinned in [.nvmrc](.nvmrc). With [nvm](https://github.com/nvm-sh/nvm), run `nvm install` once and `nvm use` in each new shell. Docker is required for the local Postgres 18 database. Port 5432 on 127.0.0.1 must be free.

Copy [.env.example](.env.example) to `.env`. The database scripts read that file; a variable already set in the shell wins. The example values are local placeholders. Sentry is optional; set `NEXT_PUBLIC_SENTRY_DSN` to enable it.

```sh
npm ci
npm run db:up
npm run db:provision
npm run db:migrate
npm run db:seed
npm run dev
```

Open [localhost:4473](http://localhost:4473). To run a production build locally, use `npm run build` followed by `npm run start`.

`npm run db:down` stops the database and removes its container. `npm run db:clean` also removes the Postgres image. Both keep the named volume, so the data is still there on the next `npm run db:up`.

## Component catalog

The reusable components live in [components/](components) and are documented in Storybook, with their variants, states, and accessibility checks.

```sh
npm run storybook
```

Open [localhost:6006](http://localhost:6006). `npm run build-storybook` writes a static copy to `storybook-static/`.

## Checks

```sh
npm run lint
npm run typecheck
npm run format:check
npm run knip
npm test
npm run test:coverage
npm run test:e2e
npm run test:storybook
npm run db:lint
```

With the local database running, `npm run db:grants` checks that the role grants match the design. `npm run db:retain` deletes expired audit events and invitations in the database named by `AUDIT_MAINTAINER_URL`. Before the first E2E or story test run, install Chromium with `npx playwright install chromium`.

## Project documentation

- [Product overview](PRODUCT.md), [design system](DESIGN.md), and [approved design decisions](docs/designs/README.md)
- [Contribution conventions](AGENTS.md#commits-and-pull-requests) and [agent instructions](AGENTS.md)
- [Releases, deployment, and rollback](docs/deployment.md)
- [Reporting security vulnerabilities](SECURITY.md)
