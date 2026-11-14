# Nardini Select

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/brunonardini/nardini-select/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/brunonardini/nardini-select/tree/main)
[![codecov](https://codecov.io/gh/brunonardini/nardini-select/branch/main/graph/badge.svg?token=RAnmvbM53n)](https://codecov.io/gh/brunonardini/nardini-select)
[![Release](https://img.shields.io/github/v/release/brunonardini/nardini-select?sort=semver)](https://github.com/brunonardini/nardini-select/releases)

Website for Nardini Select, a pet shop in Resende, RJ, Brazil. Today it's the store's institutional home page, built with Next.js, React, and TypeScript; it will grow into an e-commerce site.

## Running

The project uses the Node.js version in [.nvmrc](.nvmrc), the latest LTS (26.13.1). Install it with [nvm](https://github.com/nvm-sh/nvm) and run `nvm use` at the start of every terminal session in the project, before any `npm` command:

```sh
nvm install   # once, or when .nvmrc changes
nvm use
```

Create a `.env` file at the project root. It stays out of Git. `WHATSAPP_NUMBER` is the phone number used by the WhatsApp redirect: digits only, with the country code, and no `+`, spaces, or punctuation. In development, a fake number is enough for the route to work:

```ini
WHATSAPP_NUMBER=5511999999999
# Optional: sends errors, traces, and logs to the nardini-select project in Sentry.
NEXT_PUBLIC_SENTRY_DSN=
```

Without `NEXT_PUBLIC_SENTRY_DSN`, Sentry is off. The DSN is in Sentry under Settings > Projects > nardini-select > Client Keys (DSN).

The site is hosted on Netlify. The app's variables live in Netlify's environment variables:

- `WHATSAPP_NUMBER`: the store's real number.
- `NEXT_PUBLIC_SENTRY_DSN`: the Sentry project's DSN.
- `SENTRY_AUTH_TOKEN`: a Sentry organization token, used during the build to upload source maps. It never goes into the repository.

```sh
npm ci
npm run dev
```

Local production build:

```sh
npm run build
npm run start
```

If port 3000 is taken: `npm run start -- --port 3100`.

## Checks

```sh
npm run lint           # ESLint (Next.js rules)
npm run typecheck      # generates the Next.js route types, then runs tsc
npm run format:check   # Prettier
npm run knip           # Knip: unused files, dependencies, and exports
npm test               # unit and component tests (Vitest + React Testing Library)
npm run test:coverage  # same, with a coverage report in coverage/
npm run test:e2e       # end-to-end tests (Playwright); builds and serves the site on port 3200
```

Before the first `test:e2e`, install the browser: `npx playwright install chromium`.

CircleCI ([.circleci/config.yml](.circleci/config.yml)) installs dependencies once, with a cache, and on every push runs lint, Prettier, Knip, TypeScript type checking, unit tests, and the build in parallel. After the build, the E2E tests run in two parallel jobs, one for desktop and one for mobile, against the same build. Unit test coverage goes to Codecov. On `main`, once everything passes, the `release` job cuts the version and deploys to production (see below).

## Structure

- `app/page.tsx`: content and the five sections of the home page.
- `app/globals.css`: visual identity, 100vh minimum section height, and responsive layout.
- `app/header.tsx`: navigation and mobile menu.
- `app/contato/whatsapp/route.ts`: redirect to WhatsApp. The number comes from `WHATSAPP_NUMBER` and stays out of page text and client components; the destination is still visible once WhatsApp opens.
- `public/images`: only the files the page uses. The storefront photo shown on the site has the phone strip hidden; the original brand files stay out of Git (locally in the ignored `tmp/marca/`).
- `scripts/check-page.cjs`: browser check; needs Playwright (`PLAYWRIGHT_MODULE` can point to the install) and Edge. Run it with the server on port 3100. It checks five viewports and saves screenshots to `.impeccable/review/`.

There's no catalog, pricing, cart, or Instagram feed. The maps, Instagram, and WhatsApp links are live.

## Versioning, deploys, and rollback

Versions follow SemVer and are cut by semantic-release from the commits on `main`. PRs are squash-merged, so the PR title decides the version: `fix:` releases a PATCH, `feat:` a MINOR, and `docs:`, `chore:`, and similar types release nothing and don't deploy. The project stays on 0.x until the e-commerce launch. The real version lives in the `vX.Y.Z` tag and its GitHub release, whose notes are the changelog. The `version` in `package.json` is fixed and never changes.

When a merge produces a version, CircleCI creates the tag and the GitHub release, builds and deploys to Netlify production with the message `Release vX.Y.Z`, and registers the `nardini-select@X.Y.Z` release in Sentry. Netlify keeps building a preview for each PR on its own; `netlify.toml` makes it skip builds of `main`, which only CircleCI deploys. Each merge therefore leaves a canceled `main` build in Netlify's deploy list, followed by the CircleCI deploy when there's a release; the canceled entry is expected. The Release badge shows the version in production, since a version is only cut together with its deploy; Netlify's own status badge isn't used because it tracks the canceled Git build, not the CLI deploy.

Rollback: in Netlify, open the Deploys tab, open the last good deploy, and click Publish deploy. This republishes that deploy without rebuilding. Then fix the problem in a PR titled `fix: ...`; the merge releases a new PATCH version and deploys it automatically.

## Commits

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and are written in English, for example `docs(readme): add status badges`. PRs are squash-merged, so the PR title becomes the commit on `main` and follows the same format; a GitHub Action validates it. The description follows the [.github/pull_request_template.md](.github/pull_request_template.md) template, which tracks the project rules. Locally, commitlint checks each commit through the `commit-msg` hook, installed by `npm install`. Details in [AGENTS.md](AGENTS.md#commits-and-pull-requests).

## Language

Website and business content is in Portuguese (pt-BR): page copy, product and brand texts, and the approved content specs in `design/`. Everything else is in English: documentation, AI agent instructions, code, code comments, commits, and PRs.

## AI-assisted development

The project is set up for AI agents (Claude Code, Codex, Cursor). Rules, commands, installed skills, and the Knip MCP server (declared in `.mcp.json`, `.cursor/mcp.json`, and `.codex/config.toml`) are in [AGENTS.md](AGENTS.md), the single source for agents, which all three tools read directly (Claude Code from version 2.1.277). Cursor's Source Control generate-commit button reads [`.cursorrules`](.cursorrules) at the repo root, which repeats the commit format from AGENTS.md, including the 72-character line wrap.

Agents also keep a local code graph with [Graphify](https://github.com/Graphify-Labs/graphify) in `graphify-out/` (gitignored, AST only, no visualization); see [AGENTS.md](AGENTS.md#code-graph-graphify).

Design and architecture changes follow the Elephant-Goldfish Model (EGM): a reviewed design document comes before code. Approved documents live in [docs/designs/](docs/designs/README.md). The product and design context used by the Impeccable skill is in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md).
