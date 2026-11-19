# AGENTS.md

Single source of rules for AI agents in this repository. Claude Code (v2.1.277 or later), Codex, and Cursor read it directly. Don't add a `CLAUDE.md` or `CLAUDE.local.md`: Claude Code stops reading this file when either exists.

## Project

Nardini Select: a dog-focused pet shop in Resende, RJ, Brazil. Today the repository holds the institutional home page; it will grow into an e-commerce site. Product context: [PRODUCT.md](PRODUCT.md). Design system: [DESIGN.md](DESIGN.md), which translates the brand manual (kept with the brand sources, outside Git) into web rules; follow it for colors, type, logo use, and voice.

## Stack and commands

Next.js 16 (App Router), React 19, TypeScript 6, npm. Base UI (`@base-ui/react`) for interactive components; Storybook 10 (`@storybook/nextjs-vite`) for the component catalog. Postgres 18, Kysely, and node-pg-migrate. Better Auth is the session library, configured in `lib/auth`. Node.js 26 (the latest LTS), pinned in `.nvmrc`. Hosted on Netlify. TypeScript stays on 6.0.x because `typescript-eslint` doesn't support TypeScript 7 yet, and ESLint stays on 9 because the React, import, and jsx-a11y plugins in `eslint-config-next` don't support ESLint 10 yet.

Run `nvm use` at the start of every terminal session, before any `node`, `npm`, or `npx` command, so the shell uses the version in `.nvmrc` (`nvm install` if it's missing). If your shell doesn't keep state between commands, chain it: `nvm use && npm test`. Changing the Node version means updating `.nvmrc`, `engines` in `package.json`, and the `cimg/node` image in `.circleci/config.yml` together; Netlify reads `.nvmrc`.

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Typecheck | `npm run typecheck` (`next typegen`, then `tsc`; `next-env.d.ts` is generated and gitignored) |
| Format | `npm run format:check` / `npm run format` |
| Lint | `npm run lint` (ESLint with `eslint-config-next`) |
| Unused code | `npm run knip` (Knip: unused files, dependencies, and exports) |
| Unit tests | `npm test` (`npm run test:watch` while working, `npm run test:coverage` for coverage) |
| E2E tests | `npm run test:e2e` |
| Storybook | `npm run storybook` (http://localhost:6006) / `npm run build-storybook` (static build in `storybook-static/`) |
| Story tests | `npm run test:storybook` (every story in Chromium, with its play function and axe checks) |
| Database up | `npm run db:up` (Docker Postgres 18 on 127.0.0.1:5432) |
| Database down | `npm run db:down` (stops and removes the container; keeps the data volume and the image) |
| Database clean | `npm run db:clean` (also removes the Postgres image; the data volume stays) |
| Provision | `npm run db:provision` |
| Migrate | `npm run db:migrate` |
| Seed | `npm run db:seed` |
| Reset | `npm run db:reset` |
| Schema types | `npm run db:codegen` |
| SQL lint | `npm run db:lint` |
| Grants | `npm run db:grants` |

Testing:
- Unit and component tests: Vitest + React Testing Library, next to the code as `app/**/*.test.ts(x)`, `components/**/*.test.ts(x)`, `lib/**/*.test.ts(x)`, and `db/**/*.test.ts(x)` (the `unit` project in `vitest.config.mts`, jsdom). Query by role and accessible name. Async Server Components can't be unit tested; cover them with E2E.
- Story tests: `@storybook/addon-vitest` runs each story as a test (the `storybook` project, Chromium through Playwright). First run: `npx playwright install chromium`. Stories render in the viewports set in `.storybook/preview.tsx`, which match the E2E projects.
- E2E: Playwright in `e2e/`, desktop (1440×900) and mobile (Pixel 7) projects, at most 4 workers. `npm run test:e2e` builds the app, then Playwright starts that build on port 3200 with a fake `WHATSAPP_NUMBER` (`npx playwright test` alone needs an existing build). Locally, global setup provisions, resets, migrates, and seeds `nardini_test` on the Docker database. CI provisions, migrates, and seeds a fresh database in the job. E2E never connects to Neon or to a deployed URL. First run: `npx playwright install chromium`.
- Accessibility: `e2e/accessibility.spec.ts` runs axe (`@axe-core/playwright`) against WCAG 2.2 A and AA plus axe best practices, on desktop, on mobile, and with the mobile menu open. Any violation fails the test. Fix the page instead of disabling rules; when a new state or page appears (a dialog, a new route), scan it too.
- Stories run the same axe rules (`@storybook/addon-a11y`, `parameters.a11y` in `.storybook/preview.tsx`, with `test: 'error'`), including `region`, which Storybook turns off by default; each story renders inside `<main>`. Keep the tags in sync with `e2e/accessibility.spec.ts`.
- The only exclusion in both scans is Base UI's focus guards (`[data-base-ui-focus-guard]`): visually hidden `aria-hidden` spans with `tabindex="0"` that keep the Tab order around open popups and pass focus on at once. axe reports them as `aria-hidden-focus`. Don't exclude anything else.
- Add or update tests with every behavior change, and run `npm test` before finishing.
- Coverage: unit tests only (V8, `coverage/lcov.info`; stories and tests are left out). `npm run test:coverage` fails below 90% of statements, branches, functions, or lines (`thresholds` in `vitest.config.mts`). `lib/**/logic/**` stays at 100%. I/O adapters, pages, layouts, actions, and route handlers are excluded and covered by E2E. Keep new code covered instead of lowering the thresholds. CI uploads it to Codecov with the `unit` flag, using the `CODECOV_TOKEN` variable set in CircleCI.

`scripts/check-page.cjs` is an older manual browser check. It needs Edge, Playwright, and a server on port 3100. Set `PLAYWRIGHT_MODULE` if Playwright is installed outside the project. The script checks five viewports and saves screenshots to `.impeccable/review/`.

Knip:
- `knip.json` keeps the defaults and the auto-detected plugins (Storybook included: stories are entry files). It only declares `scripts/*.cjs` as entry files (manual scripts run with `node`), adds `.mdx` to the project files for Storybook docs, and leaves the installed skills (`.agents/`, `.claude/`, `.cursor/`) out of the project. `storybook-static/` is gitignored, which Knip, Prettier, and ESLint (`globalIgnores`) skip too.
- The Knip MCP server (`@knip/mcp`, a dev dependency) is declared in `.mcp.json` (Claude Code), `.cursor/mcp.json`, and `.codex/config.toml`, next to the Storybook one. To configure Knip or resolve its findings, use its `knip-run` tool and read the doc topics it returns with `knip-docs`, instead of guessing.
- Fix findings by removing dead code or listing the dependency; prefer targeted `entry`, `project`, or `ignoreDependencies` changes over the broad `ignore` option.
- Keep `knip` on the same version as the one `@knip/mcp` depends on, so the MCP server and CI report the same results.

## Conventions

- Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run knip`, and `npm test` before finishing a change. CI (CircleCI) runs lint, Prettier, Knip, TypeScript type checking, unit tests, and E2E tests on every push, and releases from `main` (see Releases and deploys).
- Prettier with single quotes; code lives in `app/` (routes and page composition), `components/` (reusable components), `lib/` (domain logic and adapters), and `db/` (migrations, provision, and seeds).
- Language: website and business content is Portuguese (pt-BR): page copy, product and brand texts, and the approved content specs in `design/`. Everything else is English: documentation (including the README), AI agent instructions, code, code comments, commit messages, and PR titles and descriptions.
- `WHATSAPP_NUMBER` comes from `.env` and is read only on the server (`app/contato/whatsapp/route.ts`). Never show the phone number in page text, images, or client components.
- `public/images` holds only files the page uses. Brand source files stay out of Git.

## Components and Storybook

- Reusable components live in `components/<name>/`: `<name>.tsx`, `<name>.test.tsx`, and `<name>.stories.tsx` side by side (for example `components/button/`). Code used by a single page stays in that page under `app/`.
- Every new component gets stories, covering its variants and states (focus, disabled, open and closed, mobile and desktop). Story names and descriptions are in English; interface text stays in pt-BR.
- Complex interactive components (modal, menu, combobox, select, tabs, toast, and the like) use Base UI and are never written from scratch. Read the Base UI docs for agents before using one: the index at https://base-ui.com/llms.txt and each page as Markdown (`https://base-ui.com/react/components/<name>.md`). Don't swap a native element for Base UI when it adds no behavior: links stay `<a>` (the `Button` component renders `<a>` when given `href`).
- Base UI setup: the app renders inside `<div class="root">` (`isolation: isolate`) so portals stack above it, and `body` is `position: relative` for iOS 26+ Safari (`app/layout.tsx`, `app/globals.css`). Storybook mirrors the `.root` wrapper.
- Storybook loads `app/globals.css` and the brand font from `app/fonts.ts`, the same as `app/layout.tsx`, so stories look like the site.
- Storybook MCP: `@storybook/addon-mcp` serves `http://localhost:6006/mcp` while `npm run storybook` runs. It's registered as `storybook` in `.mcp.json`, `.cursor/mcp.json`, and `.codex/config.toml`. Before creating a component, start Storybook and use `docs-list` and `docs-show` to check the existing ones; use `get-storybook-story-instructions` before writing stories and `test-run` to run them. Don't install the Storybook Claude Code plugin or skills.

## README

Keep the README focused on what the project does, where to find the live site, how to run it locally, and how to validate changes. Include local prerequisites and example environment values. Link to the relevant documentation for contribution conventions, design decisions, and vulnerability reporting.

Keep CI job details in the workflow configuration, production variables and rollback steps in [the deployment guide](docs/deployment.md), and agent tooling and repository rules in this file. Update the README when the project overview, local setup, validation commands, or documentation links change.

## Monitoring (Sentry)

Errors, tracing, and logs go to the Sentry project `bruno-nardini/nardini-select` through `@sentry/nextjs`.

- SDK init: `instrumentation-client.ts` (browser), `sentry.server.config.ts` and `sentry.edge.config.ts` (loaded by `instrumentation.ts`), and `app/global-error.tsx` for render errors. Keep the three `Sentry.init` calls in sync.
- `NEXT_PUBLIC_SENTRY_DSN` enables the SDK; without it, Sentry stays off (tests and CI run without it).
- Environment comes from Netlify's `CONTEXT` (`production`, `deploy-preview`, `branch-deploy`), falling back to `NODE_ENV`.
- Release: production builds use `nardini-select@X.Y.Z` from `SENTRY_RELEASE`, set only by the CircleCI production deploy job, for the source map upload (`withSentryConfig`) and the three `Sentry.init` calls (as `NEXT_PUBLIC_SENTRY_RELEASE`). The build also associates commits and records a production deploy. Deploy previews have no `SENTRY_RELEASE`, so their release is the commit SHA. Never set `SENTRY_RELEASE` in Netlify.
- Client source maps are uploaded and then deleted from the build, so the site never serves them.
- Trace sample rate: 100% in development, 10% otherwise.
- `SENTRY_AUTH_TOKEN` exists only in Netlify, for source map upload during the build; the CircleCI production deploy reads it from Netlify through the CLI. Never commit it, copy it to CircleCI, or ask for it in chat.
- Wrap new Server Actions with `Sentry.withServerActionInstrumentation()`.

## Releases and deploys

See the [deployment guide](docs/deployment.md) for environment variables and rollback steps.

Versions follow SemVer and are cut by semantic-release (`.releaserc.json`) from the Conventional Commits on `main`. With squash merges, the PR title decides the release.

| Bump | Meaning here | Commit |
| --- | --- | --- |
| MAJOR | Breaks something for customers or for stored data | `!` after the type/scope, or a `BREAKING CHANGE:` footer |
| MINOR | New feature or visible, compatible change | `feat` |
| PATCH | Fix | `fix` or `perf` |

Other types (`docs`, `chore`, `ci`, `build`, `refactor`, `style`, `test`, `revert`) don't release: no tag and no production deploy.

The project stays on 0.x until the e-commerce launch. A breaking change (`!` or `BREAKING CHANGE:`) jumps straight to 1.0.0, so don't use it before that launch.

- The version lives only in the `vX.Y.Z` tag and its GitHub release, whose notes are the changelog. Nothing is committed back, and `package.json` keeps `0.0.0-development`.
- On each push to `main`, after lint, type checking, unit tests, and `db-check` pass, CircleCI migrates production, then runs semantic-release, then deploys. PRs run the full validation suite. If semantic-release tags a new version, the deploy job builds with `SENTRY_RELEASE=nardini-select@X.Y.Z` and deploys to Netlify production with the CLI (`--context production`). A commit that does not release still migrates, and the deploy job stops.
- Netlify does not build from Git. In Project configuration, Developer settings, Build settings, Build status is Stopped builds, so a push does not start a build. `netlify.toml` sets `ignore` to `exit 0` as the backup: the CLI does not run it, and it runs only if builds are active again (a toggle, or relinking the repository), canceling that Git build. CircleCI deploys production, and, after a manual approval on a branch of this repository, deploys that branch to the fixed `staging` alias. `netlify deploy` builds on the CircleCI machine and uploads the result. Do not pass `--remote`: that asks Netlify to build, and a stopped site refuses it. The README uses a release version badge instead of Netlify's deploy status badge, because a push that does not release does not deploy.

## Commits and pull requests

Commit messages follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) and are written in English.

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- Types: `feat` (new feature) and `fix` (bug fix), plus `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, and `test`.
- Scope is optional and names the area changed, e.g. `feat(home): ...`, `ci(circleci): ...`.
- Description: imperative mood, lowercase, no trailing period. The whole header (type, scope, and description) fits in 72 characters.
- Body: what changed and why, wrapped at 72 characters (commitlint rejects lines over 100).
- Breaking changes: `!` before the colon, a `BREAKING CHANGE: <description>` footer, or both.
- PRs are squash-merged with a blank message, so the PR title alone becomes the commit on `main` and drives the release and its notes. PR titles follow the same format, in English. A breaking change needs the `!` in the title; a `BREAKING CHANGE:` footer in the PR description is lost.
- Every PR uses `.github/pull_request_template.md`: fill each section, check what applies, and delete the groups that don't. `gh pr create --body` skips the template, so build the body from it (for example with `--body-file`).
- When a change touches project rules or configuration (this file, the README, CI, release, lint, test, or commit settings, environment variables, or the rules the checklist covers), update the PR template in the same PR so its checklist stays accurate.
- `.github/workflows/pr-title.yml` validates PR titles (types, lowercase description, no trailing period).
- commitlint (`commitlint.config.mjs`, `@commitlint/config-conventional`) checks every local commit through the husky `commit-msg` hook, installed by `npm install`. Don't bypass it with `--no-verify`.
- Cursor's Source Control generate-commit button reads `.cursorrules` at the repo root. That file repeats the format in this section, including the 72-character wrap. Keep the two in sync.

Example:

```
fix(contact): keep the WhatsApp number out of client components

The number now comes only from the server route, so it never ships
in the page bundle.
```

## Product rules

Animation:
- CSS transitions, the Web Animations API, and the View Transitions API by default.
- Motion (`motion/react`) only for springs, gestures, and interruptible motion that CSS can't handle. Load it on demand, never in the shared bundle.
- Animate `transform` and `opacity`. `clip-path`, `filter`, and measured height (accordions) need a reason; keep animated `blur()` under 20px. Never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
- Add `will-change` only after you see a 1px shift or measure dropped frames.
- `prefers-reduced-motion`: drop movement, keep opacity and color fades. Gate hover animations behind `@media (hover: hover) and (pointer: fine)`.

Performance:
- Server Components by default; add `"use client"` only where there is interactivity.
- Images through `next/image`; fonts through `next/font`.

Security:
- Validate all input on the server.
- Check authorization in every Server Action and Route Handler.
- No secrets in client code or in the repository.
- Card data never passes through our server.

Database:
- Primary keys are UUIDs. Table names are plural snake_case. Timestamp columns end in `_at` and leave Postgres as UTC ISO 8601 strings.
- Migrations are forward-only SQL, run inside a transaction, and must work with the previous release (expand/contract).
- The database enforces structure and grants, not business rules.
- Ask before using a feature that only Neon provides.

Code:
- Business rules live in `lib/**/logic/` as pure functions with 100% unit coverage. Inputs are passed in: no I/O, clock, or randomness.
- Code that touches Postgres, Better Auth, Google, Sentry, cookies, or the clock lives in `lib/**/io/`.

Access:
- Every private entry point is listed in the guard route table. The guard reads the role on each request.
- Do not cache role or permission data in the session or the cookie.

Privacy:
- A change that stores or reads personal data updates `docs/privacy/backoffice-data-inventory.md` with its purpose, legal basis, and retention.

Security scanning (CodeQL) and disclosure — the repository is public, so vulnerabilities stay private until fixed:
- `.github/workflows/codeql.yml` scans JavaScript/TypeScript and the GitHub workflows (`security-extended` queries) on pushes to `main`, weekly, and on demand. Alerts appear only in the Security tab, which only the owner can see.
- Never add a `pull_request` trigger to it (PR alerts become annotations anyone can read), debug logging, or SARIF/database artifact uploads, and keep GitHub's CodeQL default setup disabled.
- Don't describe a vulnerability in public places: issues, PR titles and descriptions, commit messages, code comments, or release notes. PR titles become public release notes, so a security fix gets a neutral title (for example `fix(contact): validate the redirect target`), with no alert links or exploit details.
- Read alerts with `gh api repos/brunonardini/nardini-select/code-scanning/alerts` and report them only in this private session, never in a file that gets committed.
- Outside reports come through private vulnerability reporting (see `SECURITY.md`).

Fonts load through `next/font`. Montserrat sets the text as `--font-brand` (`brandFont`, from Google). Karvest ExtraBold sets h1, h2, and h3 as `--font-display` (`displayFont`, self-hosted from `app/fonts/`). `app/fonts/` keeps every Karvest weight as `.woff2` so the licensed files stay in the repository, but `app/fonts.ts` loads only the weights in use. Add other weights to `app/fonts.ts` only when a design needs them (see DESIGN.md).

## Design workflow (EGM)

Design and architecture decisions go through a reviewed design doc before any code. Small changes (copy tweaks, one-off fixes) skip it.

1. `/egm:egm-brainstorm` to explore the idea, then `/egm:egm-draft` to write the doc.
2. `/egm:egm-review` with fresh-context reviewers, then `/egm:egm-resolve` for the findings.
3. Implementation starts only after the doc is approved and committed to `docs/designs/`.

EGM artifact directory: .dev/docs

Drafts, briefs, and review reports go to `.dev/docs/` (gitignored). See [docs/designs/README.md](docs/designs/README.md).

## Code graph (Graphify)

[Graphify](https://github.com/Graphify-Labs/graphify) keeps a knowledge graph of the code for AI agents in `graphify-out/`. It's built only from code and config, by AST (no LLM, no API cost), and never with the HTML visualization.

- `graphify-out/` is gitignored: each machine builds its own graph. `.graphifyignore` leaves out the installed skills, design sources, images, and `docs/`; everything in `.gitignore` is skipped too.
- Build or refresh it with `GRAPHIFY_VIZ_NODE_LIMIT=0 graphify update .`. The variable turns off `graph.html`. If `graphify` is missing, install the CLI with `uv tool install graphifyy` (or `pipx install graphifyy`).
- At the start of a session, if `graphify-out/graph.json` is missing or `git rev-parse HEAD` differs from the commit in `graphify-out/GRAPH_REPORT.md` (Graph Freshness), rebuild it before using it.
- For codebase questions, first run `graphify query "<question>"`; use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for one concept. Read `graphify-out/GRAPH_REPORT.md` only for a broad architecture overview. Confirm details in the source files before editing.
- After changing code or config, run `GRAPHIFY_VIZ_NODE_LIMIT=0 graphify update .` so the graph stays current. Use `--force` after deleting or moving code, since `update` refuses to write a graph with fewer nodes.
- Don't run the full `/graphify` pipeline (semantic extraction with subagents, HTML, Obsidian, or wiki exports), and don't install Graphify's Git hooks or its `claude install` (it writes a `CLAUDE.md`, which hides this file from Claude Code).

## Skills

| Area | Skill |
| --- | --- |
| Design, layout, visual polish | `impeccable` (base of the current design; reads PRODUCT.md, DESIGN.md, `.impeccable/`) |
| Animation | `emil-design-eng`, `animation-performance`; `review-animations` on request |
| React/Next.js performance | `vercel-react-best-practices` |
| Next.js APIs | bundled docs in `node_modules/next/dist/docs/` (block below) |
| Interface audit (a11y, UX) | `web-design-guidelines` |
| Unused files, dependencies, exports | Knip MCP server (`knip-run`, `knip-docs`) |
| Code structure and relationships | Graphify CLI (`graphify query`, `path`, `explain`; see Code graph) |
| Existing components, their props and stories | Storybook MCP server (`docs-list`, `docs-show`, `test-run`; see Components and Storybook) |
| Interactive components | Base UI docs for agents (https://base-ui.com/llms.txt) |
| Design docs | EGM plugin (`egm-*`) |

Project rules win over skills. Known exception: `web-design-guidelines` fetches its rules from GitHub at run time, so findings that contradict this file don't apply.

Skills live in `.agents/skills/` (Codex, Cursor) with symlinks or copies in `.claude/skills/` and `.cursor/skills/`. `skills-lock.json` pins the Emil and Vercel skills; update them with `npx skills update -p`. Update Impeccable with `.claude/skills/impeccable/scripts/impeccable update --project`, then move any hooks it writes to `.claude/settings.local.json` into `.claude/settings.json`. EGM is a Claude Code plugin declared in `.claude/settings.json`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
