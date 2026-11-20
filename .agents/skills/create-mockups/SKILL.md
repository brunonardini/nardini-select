---
name: create-mockups
description: Create or refine temporary, mobile-first UI proposals in tmp/mockups, with a shared review menu, responsive previews, state controls, and an implementation handoff. Use for visual exploration before production implementation.
---

# Create mockups

Build reviewable proposals using this project's identity. This skill creates temporary design studies; use `implement-mockup` to ship a selected proposal.

## Scope and required input

- All filesystem writes must stay under `tmp/mockups/`. Create it if missing and put each study in `tmp/mockups/<descriptive-slug>/`. Shared review assets, a catalog, server scripts, screenshots, generated images, logs, and handoff files also stay under `tmp/mockups/`. Do not write to `public/tmp/`.
- Read project sources and documentation for context, but never edit application code, dependencies, Storybook, DESIGN.md, Impeccable artifacts, repository rules, or skills during this workflow. Do not run tooling that writes caches or generated files elsewhere. Route output into the allowed directory; if a required tool cannot respect that boundary, explain the conflict and ask before proceeding.
- For a new study, require an explicit positive integer proposal count. If omitted, ask in the user's language: "Quantas propostas você quer gerar?" Offer **3 (recommended)**, **4**, or **5**, and accept any other positive integer, including more than five. Do not silently choose three or cap the count. Continue read-only discovery while waiting; do not generate proposals until answered. Refining an existing study preserves its count unless the user requests a change.
- A request to change the mockup framework does not authorize updating this skill. Complete the requested temporary change; if it would be useful to persist the convention, ask whether to update the skill and wait for explicit approval before editing it.

## Design inputs

1. Read AGENTS.md, PRODUCT.md, DESIGN.md, the relevant approved design docs and matching `.impeccable/` surface context. Preserve the approved identity unless the user asks to explore changes.
2. Use the project's **Impeccable** skill and applicable design playbook. Respect the write boundary above: read existing context directly if the launcher or a subcommand writes outside it. Use the project's animation and React performance skills when relevant to the actual design.
3. Consult **Storybook MCP**: `docs-list`, then `docs-show` for components used; follow its story instructions when working with stories. Inspect rendered examples for usage, props, states, tokens and motion. If unavailable, try the running Storybook or repository stories and disclose the fallback. Never invent an existing component API.
4. Reuse the design system and established component behavior in the study. New variants, new components, and token or design-system changes are allowed as **proposals**, implemented only inside the temporary study and explicitly listed in its handoff. Do not apply them to the real system yet.
5. Use pt-BR interface copy and English implementation documentation. Keep authentication, payments and other external mutations simulated; identify demonstrative actions in the review UI.

## Responsive proposal design

Design and review **mobile first**, then extend that concept to a **portrait 11-inch tablet**, then to **desktop**. Every proposal must include all three previews:

| Preview                   | CSS viewport | Orientation |
| ------------------------- | ------------ | ----------- |
| Mobile                    | 390 x 844    | Portrait    |
| Tablet, 11-inch reference | 834 x 1194   | Portrait    |
| Desktop                   | 1440 x 900   | Landscape   |

The tablet dimensions are a reproducible CSS viewport, not a claim about physical screen size. Adapt navigation, density, type, imagery and content layout deliberately for tablet and desktop; do not just stretch the mobile design. Preview scaling must not change the inner viewport. Preserve full-size and responsive testing, normal scrolling, and uncropped important image subjects. Check narrow phones (320px) and short desktop windows when relevant.

## Review shell

Keep review controls outside the proposed product interface. Reuse existing review-shell assets under `tmp/mockups/` where suitable.

- **Black top menu on every study gallery:** a compact identifier at left and a labeled native select at the far right listing available mockups. Selecting an entry opens that study's gallery. Maintain a shared catalog under `tmp/mockups/` with stable study IDs, names and relative gallery URLs; reconcile it with existing study directories without inventing dead links. Keep the current study selected, including after browser Back.
- **Compact proposal toolbar:** the study title sits to the left of the proposal buttons, on one row when space permits. Each button selects a proposal and exposes its selected state. Do not add the old brand/byline row or repeat a "Proposal 1" heading below it. Show the selected proposal's description instead.
- **Configuration controls:** provide a labeled state selector and other controls required to evaluate the study (for example theme, user role or content length). Include relevant initial, loading, error, empty and success states; don't invent irrelevant ones. Reflect selected proposal, state and configuration in the URL so previews, reload and return links preserve them. Loading remains indefinite where no measurable progress exists; reduced motion follows project rules.
- Show **mobile, tablet and desktop**, in that order, with viewport labels and working "Abrir em tamanho real" links. The gallery may wrap or stack; the preview frame retains its declared viewport.
- **Full-size view:** show the same black review menu with a "Voltar ao mockup" button linking to the owning gallery, preserving proposal, state and configuration. Keep this bar outside the product layout and account for its height. Do not render review chrome inside embedded preview frames.
- End each proposal's review with a concise visible summary of intended **design-system changes** and **Storybook changes**: existing components/variants to adjust, new components/variants/stories, and required states. Explicitly state when no changes are needed. Make summaries follow the selected proposal.

Serve the temporary directory with an existing local server or a server stored beneath `tmp/mockups/`; do not expose the whole repository. Ensure relative image/font links, catalog navigation and deep links work from every study. Prefer local project fonts and assets without altering originals. Do not install dependencies or change project configuration for an isolated mockup.

## Handoff and verification

- Write `PROPOSALS.md` beside the study using [references/proposals-handoff.md](references/proposals-handoff.md). It must describe **every** proposal precisely enough for `implement-mockup`, including responsive behavior and all proposed system/component changes. Keep it current after refinements. Never mark a proposal selected or approved without explicit user direction.
- Inspect the rendered gallery and all three viewports for every proposal, including relevant states. Check overflow, image cropping, contrast, keyboard/focus, reduced motion and content growth. Verify catalog navigation, state controls, full-size links and return behavior. Store evidence and scripts only inside `tmp/mockups/`; don't run the production test suite for an isolated study.
- Open the gallery for review. Report its URL, temporary directory, proposal count and any unverified limits. Do not implement or commit temporary mockup output.
