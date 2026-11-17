<!--
PR TITLE: Conventional Commits, in English. PRs are squash-merged with a
blank message, so the title alone becomes the commit on main and decides
the release and its notes:

  feat: ...         -> MINOR release + production deploy
  fix: ... / perf:  -> PATCH release + production deploy
  <type>!: ...      -> MAJOR release (0.x jumps to 1.0.0; reserved for the e-commerce launch)
  docs, chore, ci, build, refactor, revert, style, test -> no release, no deploy

Format: <type>[optional scope][!]: <description>
Imperative mood, lowercase, no trailing period. The whole title fits in 72
characters. A breaking change needs the ! in the title: a BREAKING CHANGE
footer in this description isn't part of the commit.
-->

## What and why

<!-- What changed and why, for the reviewer. This description doesn't go into
     the commit or the release notes; only the title does. -->

## Release impact

<!-- Check one. It must match the type in the PR title. -->

- [ ] No release (`docs`, `chore`, `ci`, `build`, `refactor`, `revert`, `style`, `test`)
- [ ] PATCH (`fix`, `perf`): bug fix or performance improvement
- [ ] MINOR (`feat`): new feature or compatible visible change
- [ ] MAJOR (`!`): breaks something for customers or for stored data

## Design

<!-- Design and architecture changes follow the Elephant-Goldfish Model: the
     design document is reviewed, approved, and committed before any code. -->

- [ ] Not needed (small change: copy tweak or one-off fix)
- [ ] Approved design document: `docs/designs/...`

## Checks

- [ ] `npm run lint`, `npm run format:check`, `npm run knip`, `npm run typecheck`, and `npm test` pass
- [ ] `npm run test:e2e` passes, or the change can't affect a page
- [ ] `npm run test:storybook` and `npm run build-storybook` pass, or the change can't affect a component
- [ ] New or changed behavior is covered by a unit or E2E test, and unit coverage stays at 90% or more

<!-- Delete the groups below that don't apply to this PR. -->

**Interface**

- [ ] Checked on desktop and mobile; screenshots below
- [ ] New pages or interface states (dialogs, menus, routes) are covered by the axe scans in `e2e/accessibility.spec.ts`
- [ ] New or changed components in `components/` have stories for their variants and states, and complex interactive components use Base UI
- [ ] The axe scans exclude nothing besides Base UI's focus guards
- [ ] User-facing copy is in Portuguese (pt-BR)
- [ ] Motion uses CSS transitions, the Web Animations API, or the View Transitions API; Motion (`motion/react`) only for springs, gestures, or interruptible motion, loaded on demand
- [ ] Animates `transform` and `opacity` (`clip-path`, `filter`, or measured height only with a reason); no layout properties
- [ ] `prefers-reduced-motion` drops movement but keeps fades; hover motion is gated behind `@media (hover: hover) and (pointer: fine)`
- [ ] Images use `next/image` and fonts use `next/font`
- [ ] `"use client"` only where there is interactivity

**Server and data**

- [ ] All input is validated on the server
- [ ] Every new Server Action and Route Handler checks authorization
- [ ] New Server Actions are wrapped with `Sentry.withServerActionInstrumentation()`
- [ ] Card data never passes through our server
- [ ] No secrets in the repository or in client code; the WhatsApp number stays out of page text, images, and client components
- [ ] Security fixes use a neutral title and description, with no vulnerability details, alert links, or exploit steps (the PR and its release notes are public)

**Database and access**

- [ ] Migrations are forward-only and safe for the previous release (expand/contract), and `db/schema.d.ts` was regenerated
- [ ] New private entry points are listed in the guard route table
- [ ] New audit actions include their metadata schema
- [ ] Personal-data changes are reflected in `docs/privacy/backoffice-data-inventory.md`
- [ ] Production still migrates, then releases, then deploys. Republishing a deploy does not undo a committed migration

**Configuration and docs**

- [ ] On `main`, CircleCI migrates production only after lint, type checking, unit tests, and `db-check`, then releases, then deploys. PRs run the full validation suite
- [ ] App variables are set in Netlify for Production and Deploy Previews, pipeline-only variables in CircleCI, and both are documented in `docs/deployment.md` (never set `SENTRY_RELEASE` in Netlify)
- [ ] The three `Sentry.init` calls are still in sync
- [ ] Upgrading `@playwright/test` also updates the Playwright image tag in `.circleci/config.yml`
- [ ] Changing the Node.js version updates `.nvmrc`, `engines` in `package.json`, and the `cimg/node` image in `.circleci/config.yml` together
- [ ] The affected docs reflect the change, and the README stays focused on the project overview, local setup, checks, and links
- [ ] Docs, code comments, and this PR are in English; only website and business content is in Portuguese
- [ ] This template still matches the project rules and configuration

## Screenshots

<!-- For interface changes: before and after, desktop and mobile. -->

## Rollback

<!-- Is it safe to republish the previous deploy on Netlify if this goes wrong?
     If not (data migration, external configuration), say what else is needed.
     After a rollback, the fix ships as a new PR titled fix: ... -->

- [ ] Safe to roll back by republishing the previous deploy
