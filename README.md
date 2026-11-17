# Nardini Select

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/brunonardini/nardini-select/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/brunonardini/nardini-select/tree/main)
[![codecov](https://codecov.io/gh/brunonardini/nardini-select/branch/main/graph/badge.svg?token=RAnmvbM53n)](https://codecov.io/gh/brunonardini/nardini-select)
[![Release](https://img.shields.io/github/v/release/brunonardini/nardini-select?sort=semver)](https://github.com/brunonardini/nardini-select/releases)

Website for Nardini Select. [Visit the live site](https://nardiniselect.com.br).

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

Open [localhost:3000](http://localhost:3000). To run a production build locally, use `npm run build` followed by `npm run start`.

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

With the local database running, `npm run db:grants` checks that the role grants match the design. Before the first E2E or story test run, install Chromium with `npx playwright install chromium`.

Now format, typecheck, and run the database against the throwaway Postgres. Also check line lengths in eslint config. I'll run prettier on the touched trees.

Also look at grants-check formatting and sql.ts. And whether `photo_source: 'none' as const` in an array widens incorrectly.

One issue in fixed.ts: the flatMap returns objects that may not unify because some have role_id null and some have extra fields. TypeScript excess property and union of object types in an array often become a union that Kysely insert doesn't accept if the union members differ. I'll see from tsc.

Also seed index uses top-level await. tsc with module esnext allows it. The file is included. Good.

client.ts getDatabase assignment with ??= and catch that rethrows. The catch sets database = undefined then throws. There's a subtle bug: `database ??=` assigns the promise first, then catch clears it. If two callers race, the second might see undefined and start a second connection. Acceptable for M1.

Another bug: if connect succeeds, the promise resolves. If it fails, catch clears `database` but the rejected promise was already assigned. The catch returns a new rejection. Callers of the original promise get the rejection. The variable is cleared so the next call retries. Good.

Sentry import in client might pull a lot into typecheck. Fine.

eslint no-restricted-imports on client importing @/lib/db/logic - the io block doesn't forbid that. Good.

Does the general block apply to lib/db/io? ignores include lib/**/io/**. client is ignored by general. io block applies. Good.

logic files match general AND logic. Logic is later and replaces the rule. Good.

Wait: flat config merge of rules. I read that later configs override the same rule. ESLint docs: "If the same rule is configured in multiple config objects, the last one wins." Yes if the file matches both. Good.

Let me also check if next eslint config already has no-restricted-imports that we overwrite for all ts files. Our block sets the whole rule, replacing next's restrictions if any. I should check next's config... unlikely to have no-restricted-imports. If it does, we need to restate those. I'll see lint output.

Run format and typecheck and unit tests. Also seed.

Port 54329 env. The container might still be running. I'll check.

Also prettier on eslint.config.mjs - it's not in the format paths. Long lines might be ok. I'll include it if prettier is run on the file manually... format:check doesn't include root mjs. I'll still wrap the long databaseIo line so the file looks consistent. Let me read it.

And grants-check filter lines.

I'll run prettier --write on the directories and also eslint.config.mjs, playwright, vitest, knip if needed.

Then nvm use && typecheck lint test.

The shell needs nvm. The user rule says nvm use at the start. I'll source nvm.

## Project documentation

- [Product overview](PRODUCT.md), [design system](DESIGN.md), and [approved design decisions](docs/designs/README.md)
- [Contribution conventions](AGENTS.md#commits-and-pull-requests) and [agent instructions](AGENTS.md)
- [Releases, deployment, and rollback](docs/deployment.md)
- [Reporting security vulnerabilities](SECURITY.md)
