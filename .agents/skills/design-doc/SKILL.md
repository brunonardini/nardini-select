---
name: design-doc
description: Write, review and approve a short design doc before any code, with one fresh-context reviewer instead of a review swarm. Use for design or architecture decisions (new features, data flows, new components, API or schema changes), or to check an approved doc against the code. Small changes (copy tweaks, one-off fixes) skip it.
---

# Design doc

Produce one self-contained design doc per feature, reviewed once by a fresh reader, then approved by the user. Spend tokens on decisions, not on process: drafting happens in this conversation, review uses a single subagent, and nothing is re-reviewed without a reason.

## Files

- Draft: `.dev/docs/<feature>/design.md` (gitignored). `<feature>` is a short kebab-case slug.
- Review findings: `.dev/docs/<feature>/review.md`.
- Approved doc: `docs/designs/<feature>.md`. Commit only when the user asks.

## 1. Frame

- Read only what the decision needs: AGENTS.md is already loaded; open PRODUCT.md, DESIGN.md, related docs in `docs/designs/` and the code the feature touches. Search large files for the relevant section instead of reading them whole.
- Collect the user's fixed requirements verbatim. They are not up for debate in review.
- Ask at most three blocking questions, in one message, each with a recommended answer. Decide everything else with sensible defaults and record those defaults in the doc.

## 2. Draft

Write the draft in English (quoted interface text stays pt-BR), in the house style of the approved docs in `docs/designs/`: short sections, full sentences, no filler. Aim for about 60–150 lines. Use only the sections the feature needs, in this order:

```markdown
# <Feature name>

Status: Draft

## Purpose
The current problem (what exists today and why it falls short) and what changes.

## Goals and non-goals
Fixed requirements first. Non-goals name what is deliberately left out.

## <Behavior sections>
Layout, states, copy, interactions. Name sizes, breakpoints and tokens once.

## Data flow
Numbered path from the user action to storage and back. Inputs, validation, defaults, authorization.

## Decisions
- **Chosen option, not alternative.** One-line reason the alternative lost.

## Risks
At most three, each with its mitigation.

## Components
Reused components, new shared components (with their second consumer) and page-local code.

## Privacy
Personal data read or stored, and the inventory entry it needs.

## Integration and verification
Build order, then the tests that prove each behavior (unit, story, E2E, axe) and the validation suite.
```

State decisions, not code: no SQL, no function bodies, no per-pixel values that DESIGN.md already defines. Link every doc or module the reader needs.

## 3. Self-check

Before the review, check the draft against this list and fix what fails. Do not report the checklist to the user.

1. The problem and the change are stated; fixed requirements are met.
2. Every decision names a rejected alternative and a reason.
3. AGENTS.md rules hold: business rules in `lib/**/logic/` (pure, 100% covered), I/O in `lib/**/io/`, guard route table entries, authorization in every action and route, browser storage module, Base UI for complex controls, Storybook stories for shared components, axe scans for new states, motion rules, privacy inventory.
4. No personal data in URLs, logs, analytics or browser storage.
5. Inputs have validation and defaults. Empty, loading, error, 401/403 and removed or anonymized data are covered.
6. Every test named can run where it is placed (unit tests have no database).
7. Terms, sizes and thresholds are defined once and used consistently.
8. A reader without this conversation can follow it.

## 4. Review (one subagent)

Spawn **one** fresh-context subagent, on Sonnet (pass `model: "sonnet"`), with only:

- the draft path;
- the fixed requirements;
- a reading list of at most five files or sections that the decisions depend on;
- this prompt:

> Review the design doc at `<path>` before implementation. Read it, then only the listed files. Find what would make the implementation wrong, unsafe, inconsistent with AGENTS.md, or impossible to test: missing states, contradictions, unstated decisions, rule violations, untestable claims, unclear terms. Do not suggest removing fixed requirements. Do not praise or summarize. Return at most 10 findings, most severe first, each as: `[Blocker|Major|Nit] line N — problem — fix in one sentence`. If nothing is wrong, reply `No findings`.

Write the reply to `review.md` unchanged.

## 5. Resolve

- Apply clear fixes directly to the draft.
- For a finding that needs the user's judgment, ask one question at a time, with your recommendation first.
- Reject findings that contradict fixed requirements or project rules; note them in `review.md` with the reason.
- Re-review only when a Blocker forced a structural change, and only the changed sections, once.

Report to the user in at most ten lines: the draft path, what changed after the review, and open decisions. Do not paste the doc into the chat.

## 6. Approve

When the user approves, copy the draft to `docs/designs/<feature>.md` with `Status: Approved` and no reference to drafts, reviews or this process. Implementation starts after the approved doc is committed; commit only when the user asks.

## Drift check (on request)

Compare an approved doc with the code it describes. List each statement the code no longer matches as `doc line — code path — difference`, then ask whether to update the doc or the code.
