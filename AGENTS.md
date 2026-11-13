# AGENTS.md

Instructions for AI agents (Claude Code, Codex, Antigravity, and others) working in this repository.

## Project

Nardini Select is a pet shop in Resende, RJ, Brazil, focused on dog owners. This repository holds the brand's home page: it presents the brand, what the store sells, and where it is, with direct contact through WhatsApp. Site language: Portuguese (pt-BR). Priority: mobile visitors.

- Product, audience, and positioning: [PRODUCT.md](PRODUCT.md)
- Visual identity (colors, typography, components): [DESIGN.md](DESIGN.md)
- Approved home page content and requirements: [design/home-content-v3.md](design/home-content-v3.md)
- How to run and file structure: [README.md](README.md)

## Stack and commands

Next.js (App Router), React, and TypeScript. Requires Node.js 20.9 or later.

```sh
npm ci                 # install dependencies
npm run dev            # development server
npm run build          # production build
npm run typecheck      # type checking
npm run format:check   # check formatting (Prettier, single quotes)
npm run format         # apply formatting
```

The route `app/contato/whatsapp/route.ts` reads `WHATSAPP_NUMBER` from `.env` (not tracked by Git). Never put the phone number in page text or in client components.

## Conventions

- Run `npm run typecheck` and `npm run format:check` before finishing a change.
- `public/images` holds only files the page uses. Original brand files are kept outside Git (locally in `tmp/marca/`, which is ignored); never commit them.
- Follow the tokens and rules in [DESIGN.md](DESIGN.md) for any visual change.
- User-facing copy stays in Portuguese (pt-BR).

## Impeccable (frontend design skill)

Visual and UX work uses the [Impeccable](https://impeccable.style) skill (v4.9.0), installed per project for each harness:

| Harness | Skill | Subagents | Hooks |
| --- | --- | --- | --- |
| Claude Code | `.claude/skills/impeccable/` | `.claude/agents/impeccable-*.md` | `.claude/settings.json` |
| Codex | `.agents/skills/impeccable/` | shipped inside the skill (`agents/`) | `.codex/hooks.json` |
| Cursor | `.cursor/skills/impeccable/` | `.cursor/agents/impeccable-*.md` | `.cursor/hooks.json` |

Hooks run the Impeccable design detector after edits to UI files and a deeper pass when the agent stops. The platform engine binary (`scripts/bin/`) is gitignored. On first run, the launcher (`scripts/impeccable`) downloads it and checks it against `scripts/engine-checksums.txt`.

Usage: `/impeccable <command> [target]` in Claude Code (pick the skill in Codex/Cursor). Common commands: `critique`, `audit`, `polish`, `layout`, `typeset`, `adapt`, `harden`, `shape`, `document`, `live`. Run `/impeccable` with no arguments to see all of them.

Design context the skill reads and keeps up to date (committed):

- [PRODUCT.md](PRODUCT.md): product, audience, positioning (`/impeccable init`).
- [DESIGN.md](DESIGN.md) and `.impeccable/design.json`: tokens and components (`/impeccable document`).
- `.impeccable/config.json`: shared project config (hook settings, detector ignores). Change it through `impeccable hooks`, never by hand.
- `.impeccable/surface-home.md`: the home page brief and direction contract.
- `.impeccable/build/approved-comp.json` and `approved-comp.png`: the approved composition the build is checked against (copy of `design/previews/home-v3-desktop.png`).

Local only (gitignored): `.impeccable/config.local.json`, `.impeccable/hook.cache.json`, `.impeccable/hook.pending.json`, `.impeccable/build/state.json`, and `.impeccable/review/` (screenshots from `scripts/check-page.cjs` and reviews).

To update the skill, run this from the project root:

```sh
.claude/skills/impeccable/scripts/impeccable update --project
```

Then check that all three harness folders still have the same version. The installer writes Claude Code hooks to `.claude/settings.local.json`. Move them into `.claude/settings.json` so they stay shared.

## EGM (Elephant-Goldfish Model)

This project uses [EGM](https://egm.dev), a Spec-Driven Development method: the main agent (the Elephant) talks with the developer and drafts the design; fresh-context reviewers (Goldfish) review the document without the conversation history.

### Installation

In Claude Code, the plugin is already declared in [.claude/settings.json](.claude/settings.json) (project scope); when you open the project, accept the `egm` marketplace install. To install manually:

```sh
claude plugin marketplace add google/elephant-goldfish-model --scope project
claude plugin install egm@egm --scope project
```

In Codex CLI:

```sh
codex plugin marketplace add google/elephant-goldfish-model
codex plugin add egm@egm
```

Other environments: <https://egm.dev/install/>. Install the whole plugin, not just the skills: reviews read the plugin's `agents/` and `resources/` and need subagents with isolated context.

### Skills

In Claude Code, use the `/egm:` prefix (for example, `/egm:egm-brainstorm`). In Codex, pick the skill from the skill picker.

| Skill | Use |
| --- | --- |
| `egm-brainstorm` | Explores an idea with the developer and Goldfish reviewers; produces `concepts_brief.md`. |
| `egm-draft` | Turns the brief into a design doc, section by section. |
| `egm-review` | Multi-stage review by fresh-context reviewers. |
| `egm-resolve` | Processes reviewer findings and applies the fixes you approve. |
| `egm-review-loop` | Automated review-and-fix loop for a document. |
| `egm-drift-report` | Detects drift between `docs/designs/` and the code. Run weekly. |
| `egm-bootstrap` | Generates per-directory READMEs to give agents context. |

### Workflow

1. `egm-brainstorm` → `egm-draft` → `egm-review`.
2. Human review of the design (Pull Request).
3. Implement following the plan in the design doc. If the result is far off, update the design and try again.

The workflow is not mandatory: simple fixes can be made directly, without a design doc.

### Files

EGM artifact directory: .dev/docs

- EGM drafts, briefs, and reports go to `.dev/docs` (ignored by Git).
- Approved specifications are committed under `docs/designs/`, indexed in `docs/designs/SITEMAP.md`.
- Project rules live in this `AGENTS.md`. Claude Code reads `AGENTS.md` only when there is no root `CLAUDE.md`; if a `CLAUDE.md` is ever created, it must import this file (`@AGENTS.md`).
