# AGENTS.md

Single source of rules for AI agents in this repository. Claude Code (v2.1.277 or later), Codex, and Cursor read it directly. Don't add a `CLAUDE.md` or `CLAUDE.local.md`: Claude Code stops reading this file when either exists.

## Project

Nardini Select: a dog-focused pet shop in Resende, RJ, Brazil. Today the repository holds the institutional home page; it will grow into an e-commerce site. Product context: [PRODUCT.md](PRODUCT.md). Design system: [DESIGN.md](DESIGN.md).

## Stack and commands

Next.js 16 (App Router), React 19, TypeScript, npm. Node.js 20.9 or later.

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Typecheck | `npm run typecheck` |
| Format | `npm run format:check` / `npm run format` |
| Lint | not configured yet |
| Unit tests | `npm test` (`npm run test:watch` while working) |
| E2E tests | `npm run test:e2e` |

Testing:
- Unit and component tests: Vitest + React Testing Library, next to the code as `app/**/*.test.ts(x)`. Query by role and accessible name. Async Server Components can't be unit tested; cover them with E2E.
- E2E: Playwright in `e2e/`, desktop (1440×900) and mobile (Pixel 7) projects. It builds and starts the app on port 3200 with a fake `WHATSAPP_NUMBER`. First run: `npx playwright install chromium`.
- Add or update tests with every behavior change, and run `npm test` before finishing.
- Decided but not set up yet: coverage published to Codecov.

`scripts/check-page.cjs` is an older manual browser check (see README).

## Conventions

- Run `npm run typecheck`, `npm run format:check`, and `npm test` before finishing a change.
- Prettier with single quotes; code lives in `app/`.
- User-facing copy is Portuguese (pt-BR).
- `WHATSAPP_NUMBER` comes from `.env` and is read only on the server (`app/contato/whatsapp/route.ts`). Never show the phone number in page text, images, or client components.
- `public/images` holds only files the page uses. Brand source files stay out of Git.

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
