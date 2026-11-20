---
name: implement-mockup
description: Implement an explicitly selected temporary UI proposal in the project, starting with design-system and Storybook components, then page integration and durable documentation. Use when the user is ready to ship a chosen mockup.
---

# Implement a selected mockup

Translate the user's chosen design into the real project. The temporary study is input, never a production dependency or committed reference.

## Establish the selected proposal

- Require an explicit proposal ID/name for the intended study in the implementation prompt or an unambiguous explicit selection already made by the user in this conversation. Never infer it from the currently open tab, query string, screenshots, array order, a recommended variant, or identical proposals.
- If no explicit selection is supplied, ask which proposal was chosen, list available IDs/names **without recommending any**, and wait before proposal-dependent changes. If several studies or conflicting selections exist, resolve the study/selection first. Continue only independent read-only discovery while waiting.
- Read the study's `PROPOSALS.md`, selected proposal files and user amendments. Confirm the live rendering at mobile, portrait tablet and desktop. If the handoff is absent or incomplete, reconstruct it under the study's `tmp/mockups/<slug>/` from the actual design and ask only about unresolved decisions that affect implementation. Do not guess approval.
- Read AGENTS.md, PRODUCT.md, DESIGN.md and applicable approved design docs. Follow the repository's design approval process: when a reviewed, approved and committed design doc is required, translate the chosen design into a self-contained design doc before implementation. Selection of a visual proposal alone does not waive that gate. Small changes retain the repository's exception.

## Implement shared components first

1. Use **Impeccable** and applicable project skills to preserve the selected identity, responsive behavior, copy, states, image framing and motion. Consult bundled Next.js docs before relevant API changes. Inspect the working tree and preserve unrelated work.
2. Use **Storybook MCP** `docs-list` and `docs-show` to verify the current reusable components and their real APIs. Read `get-storybook-story-instructions` before editing stories. Reconcile the selected handoff with the current system instead of duplicating components that already exist.
3. Update the design-system rules defined by the selected proposal: DESIGN.md, relevant Impeccable tokens/sidecar/surface records, and other applicable durable rules. Describe final product behavior without mentioning the temporary study. Limit changes to the approved deltas.
4. Implement **new shared components and changes to existing components in Storybook first**, including variants, states, icons and loading behavior. Keep shared code in `components/<name>/`; cover its real behavior with appropriate component tests. Complex interactive controls use Base UI as required by AGENTS.md. Read its agent docs first.
5. Render and validate the changed components at mobile, portrait tablet (834x1194) and desktop sizes. Use Storybook MCP `test-run` and the project's axe rules; fix failures before page integration. Keep existing supported variants and integrations working unless the user approved a change. Do not disable accessibility rules to match a prototype.

If there are no shared component changes, verify/document reuse and proceed to integration; do not invent changes to fill the sequence.

## Integrate into the product

- After the shared primitives and their stories pass, implement the routes/page composition and real interactions. Use the validated components rather than copying temporary HTML/CSS wholesale.
- Follow the mobile-first sequence: mobile, then 11-inch portrait tablet reference, then desktop. Preserve intentional layout adaptations, state behavior and important image subjects across aspect ratios.
- Preserve real authentication, authorization, privacy, error handling and navigation contracts. Replace demonstrative actions with the existing production integration; a simulated mockup action does not authorize new external mutations or backend behavior.
- Promote only required assets into their appropriate production directories, with provenance and responsive optimization. Use next/image and next/font. Do not import, fetch, redirect to or otherwise depend on `tmp/mockups/` at runtime.
- Keep review infrastructure out of the shipped interface: black menus, mockup lists, proposal buttons, state selectors and preview frames belong only to the study unless explicitly requested as product features.

## Durable docs and validation

- Review and update affected project documentation, design-system records and component docs. Permanent documents must stand on their own: describe the final decision, behavior and rationale. **Never reference the mockup**, its title as a study, temporary path, `PROPOSALS.md`, screenshots hosted in temporary storage, or localhost preview URL in committed source, tests, comments, docs, commit messages or PR text. Product-level design docs may name the feature and its decisions.
- Never commit the study or its generated handoff. Do not delete it as part of implementation unless the user asks. Its later removal must not break the product or documentation.
- Run the validation required by AGENTS.md: typecheck, lint, formatting, Knip, unit tests, applicable coverage, E2E/axe for changed pages/states, and Storybook checks/build for changed components. Update Graphify after code/config changes. Use MCP tools for Storybook and Knip per project/tool instructions. Inspect the final diff for temporary dependencies/references and unrelated changes.
- Report what changed, responsive behavior, component/design-system/documentation updates, test evidence and any remaining limits. Do not claim checks that were not run. Commit only when authorized, following repository conventions.
