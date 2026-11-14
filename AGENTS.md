# AGENTS.md

Single source of rules for AI agents in this repository. Claude Code (v2.1.277 or later), Codex, and Cursor read it directly. Don't add a `CLAUDE.md` or `CLAUDE.local.md`: Claude Code stops reading this file when either exists.

## Project

Nardini Select: a dog-focused pet shop in Resende, RJ, Brazil. Today the repository holds the institutional home page; it will grow into an e-commerce site. Product context: [PRODUCT.md](PRODUCT.md). Design system: [DESIGN.md](DESIGN.md).

## Stack and commands

Next.js 16 (App Router), React 19, TypeScript 6, npm. Node.js 26 (the latest LTS), pinned in `.nvmrc`. Hosted on Netlify. TypeScript stays on 6.0.x because `typescript-eslint` doesn't support TypeScript 7 yet, and ESLint stays on 9 because the React, import, and jsx-a11y plugins in `eslint-config-next` don't support ESLint 10 yet.

Run `nvm use` at the start of every terminal session, before any `node`, `npm`, or `npx` command, so the shell uses the version in `.nvmrc` (`nvm install` if it's missing). If your shell doesn't keep state between commands, chain it: `nvm use && npm test`. Changing the Node version means updating `.nvmrc`, `engines` in `package.json`, and the `cimg/node` image in `.circleci/config.yml` together; Netlify reads `.nvmrc`.

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Typecheck | `npm run typecheck` (`next typegen`, then `tsc`; `next-env.d.ts` is generated and gitignored) |
| Format | `npm run format:check` / `npm run format` |
| Lint | `npm run lint` (ESLint with `eslint-config-next`) |
| Unit tests | `npm test` (`npm run test:watch` while working, `npm run test:coverage` for coverage) |
| E2E tests | `npm run test:e2e` |

Testing:
- Unit and component tests: Vitest + React Testing Library, next to the code as `app/**/*.test.ts(x)`. Query by role and accessible name. Async Server Components can't be unit tested; cover them with E2E.
- E2E: Playwright in `e2e/`, desktop (1440×900) and mobile (Pixel 7) projects. `npm run test:e2e` builds the app, then Playwright starts that build on port 3200 with a fake `WHATSAPP_NUMBER` (`npx playwright test` alone needs an existing build). First run: `npx playwright install chromium`.
- Add or update tests with every behavior change, and run `npm test` before finishing.
- Coverage: unit tests only (V8, `coverage/lcov.info`). CI uploads it to Codecov with the `unit` flag, using the `CODECOV_TOKEN` variable set in CircleCI.

`scripts/check-page.cjs` is an older manual browser check (see README).

## Conventions

- Run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test` before finishing a change. CI (CircleCI) runs lint, Prettier, TypeScript type checking, unit tests, and E2E tests on every push, and releases from `main` (see Releases and deploys).
- Prettier with single quotes; code lives in `app/`.
- Language: website and business content is Portuguese (pt-BR): page copy, product and brand texts, and the approved content specs in `design/`. Everything else is English: documentation (including the README), AI agent instructions, code, code comments, commit messages, and PR titles and descriptions.
- `WHATSAPP_NUMBER` comes from `.env` and is read only on the server (`app/contato/whatsapp/route.ts`). Never show the phone number in page text, images, or client components.
- `public/images` holds only files the page uses. Brand source files stay out of Git.

## Monitoring (Sentry)

Errors, tracing, and logs go to the Sentry project `bruno-nardini/nardini-select` through `@sentry/nextjs`.

- SDK init: `instrumentation-client.ts` (browser), `sentry.server.config.ts` and `sentry.edge.config.ts` (loaded by `instrumentation.ts`), and `app/global-error.tsx` for render errors. Keep the three `Sentry.init` calls in sync.
- `NEXT_PUBLIC_SENTRY_DSN` enables the SDK; without it, Sentry stays off (tests and CI run without it).
- Environment comes from Netlify's `CONTEXT` (`production`, `deploy-preview`, `branch-deploy`), falling back to `NODE_ENV`.
- Release: production builds use `nardini-select@X.Y.Z` from `SENTRY_RELEASE`, set only by the CircleCI release job, for the source map upload (`withSentryConfig`) and the three `Sentry.init` calls (as `NEXT_PUBLIC_SENTRY_RELEASE`). The build also associates commits and records a production deploy. Deploy previews have no `SENTRY_RELEASE`, so their release is the commit SHA. Never set `SENTRY_RELEASE` in Netlify.
- Client source maps are uploaded and then deleted from the build, so the site never serves them.
- Trace sample rate: 100% in development, 10% otherwise.
- `SENTRY_AUTH_TOKEN` exists only in Netlify, for source map upload during the build; the CircleCI release build reads it from Netlify through the CLI. Never commit it, copy it to CircleCI, or ask for it in chat.
- Wrap new Server Actions with `Sentry.withServerActionInstrumentation()`.

## Releases and deploys

Versions follow SemVer and are cut by semantic-release (`.releaserc.json`) from the Conventional Commits on `main`. With squash merges, the PR title decides the release.

| Bump | Meaning here | Commit |
| --- | --- | --- |
| MAJOR | Breaks something for customers or for stored data | `!` after the type/scope, or a `BREAKING CHANGE:` footer |
| MINOR | New feature or visible, compatible change | `feat` |
| PATCH | Fix | `fix` or `perf` |

Other types (`docs`, `chore`, `ci`, `build`, `refactor`, `style`, `test`, `revert`) don't release: no tag and no production deploy.

The project stays on 0.x until the e-commerce launch. A breaking change (`!` or `BREAKING CHANGE:`) jumps straight to 1.0.0, so don't use it before that launch.

- The version lives only in the `vX.Y.Z` tag and its GitHub release, whose notes are the changelog. Nothing is committed back, and `package.json` keeps `0.0.0-development`.
- On each push to `main`, after every check passes, the CircleCI `release` job runs semantic-release. If it tags a new version, the job deploys to Netlify production with the CLI (`--context production`) and `SENTRY_RELEASE=nardini-select@X.Y.Z`.
- Netlify only builds PR deploy previews: `netlify.toml` has an `ignore` command that skips its builds of `main`, which the CLI doesn't run. Production deploys come only from CircleCI. The skipped build shows as a canceled `main` deploy in Netlify; that's expected, not a failure. For the same reason the README uses a release version badge instead of Netlify's deploy status badge.

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

Existing code predates some of these rules (`<img>` tags, `@fontsource` fonts, reduced motion that removes all animation, ungated hover motion). Don't copy those patterns into new code.

## Design workflow (EGM)

Design and architecture decisions go through a reviewed design doc before any code. Small changes (copy tweaks, one-off fixes) skip it.

1. `/egm:egm-brainstorm` to explore the idea, then `/egm:egm-draft` to write the doc.
2. `/egm:egm-review` with fresh-context reviewers, then `/egm:egm-resolve` for the findings.
3. Implementation starts only after the doc is approved and committed to `docs/designs/`.

EGM artifact directory: .dev/docs

Drafts, briefs, and review reports go to `.dev/docs/` (gitignored). See [docs/designs/README.md](docs/designs/README.md).

## Skills

| Area | Skill |
| --- | --- |
| Design, layout, visual polish | `impeccable` (base of the current design; reads PRODUCT.md, DESIGN.md, `.impeccable/`) |
| Animation | `emil-design-eng`, `animation-performance`; `review-animations` on request |
| React/Next.js performance | `vercel-react-best-practices` |
| Next.js APIs | bundled docs in `node_modules/next/dist/docs/` (block below) |
| Interface audit (a11y, UX) | `web-design-guidelines` |
| Design docs | EGM plugin (`egm-*`) |

Project rules win over skills. Known exception: `web-design-guidelines` fetches its rules from GitHub at run time, so findings that contradict this file don't apply.

Skills live in `.agents/skills/` (Codex, Cursor) with symlinks or copies in `.claude/skills/` and `.cursor/skills/`. `skills-lock.json` pins the Emil and Vercel skills; update them with `npx skills update -p`. Update Impeccable with `.claude/skills/impeccable/scripts/impeccable update --project`, then move any hooks it writes to `.claude/settings.local.json` into `.claude/settings.json`. EGM is a Claude Code plugin declared in `.claude/settings.json`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
