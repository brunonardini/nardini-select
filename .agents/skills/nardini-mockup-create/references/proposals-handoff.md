# Proposal handoff contract

Write `PROPOSALS.md` in the study directory. Fill this outline with actual decisions, not placeholders. English documentation; preserve exact pt-BR UI strings. Screenshots support the instructions but do not replace them.

## Study

Record a stable study ID, product surface and purpose, requested count, gallery URL, local serving instructions, source/reference assets, and a status such as draft or reviewed. Record an explicit user selection only when supplied, with its exact proposal ID and any subsequent amendments. A selection is not automatically the repository's required implementation approval.

## Proposal <stable number>: <name>

Repeat for every proposal. Use the same stable number shown on its button and in its URL. Record a separate internal ID if needed, plus the mapping for any pre-existing URL IDs. Preserve numbers across refinements and reordering; do not renumber or reuse removed numbers:

- **Intent and description:** what differs from the other proposals and what the visitor can do.
- **Exact copy and hierarchy:** labels, headings, body copy, actions, links and error/recovery text.
- **Responsive specification:** mobile 390x844, portrait 11-inch tablet reference 834x1194, desktop 1440x900; breakpoints, layout, spacing, type, navigation and image focal points. Include short-window or content-growth rules.
- **States and controls:** state/configuration matrix, transitions, busy/disabled behavior, keyboard behavior, reduced motion, and which actions are simulated versus existing production integrations that must be preserved.
- **Assets:** file paths, dimensions, intended crop, provenance and optimization requirements. Identify which assets need to be promoted out of temporary storage during implementation.
- **Design-system delta:** tokens, typography, spacing, color, motion and persistent documentation changes. For each entry distinguish reuse, adjustment or addition; state "None" if unchanged.
- **Storybook delta:** existing component and variant names verified from Storybook; props/behavior to retain or change; new components/variants; required stories and accessibility/interaction checks. State "None" if unchanged.
- **Implementation map:** intended components and page composition, existing real integrations, risks and unresolved decisions. Do not prescribe changing backend/auth behavior merely because the prototype simulates it.
- **Verification:** viewports/states actually inspected, evidence paths and known limits.

## Implementation boundary

The black review menu, catalog, proposal toolbar, preview frames and state controls are mockup infrastructure, not product requirements. Production code must not depend on these files. The implementation skill converts the chosen decisions into self-contained durable documentation, production assets/components and tests; no committed documentation or source may reference the temporary mockup, its localhost URLs or its handoff path.
