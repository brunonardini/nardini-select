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

- [ ] `npm run lint`, `npm run format:check`, `npm run typecheck`, and `npm test` pass
- [ ] `npm run test:e2e` passes, or the change can't affect a page
- [ ] New or changed behavior is covered by a unit or E2E test

<!-- Delete the groups below that don't apply to this PR. -->

**Interface**

- [ ] Checked on desktop and mobile; screenshots below
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

**Configuration and docs**

- [ ] App variables are set in Netlify for Production and Deploy Previews, pipeline-only variables in CircleCI, and both are documented in the README (never set `SENTRY_RELEASE` in Netlify)
- [ ] The three `Sentry.init` calls are still in sync
- [ ] Upgrading `@playwright/test` also updates the Playwright image tag in `.circleci/config.yml`
- [ ] `AGENTS.md` and `README.md` reflect the change
- [ ] Docs, code comments, and this PR are in English; only website and business content is in Portuguese
- [ ] This template still matches the project rules and configuration

## Screenshots

<!-- For interface changes: before and after, desktop and mobile. -->

## Rollback

<!-- Is it safe to republish the previous deploy on Netlify if this goes wrong?
     If not (data migration, external configuration), say what else is needed.
     After a rollback, the fix ships as a new PR titled fix: ... -->

- [ ] Safe to roll back by republishing the previous deploy
