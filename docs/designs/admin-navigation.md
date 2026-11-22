# Admin navigation and browser preferences

Status: Approved

## Purpose

Give staff a consistent way to move through the private Admin area. Administrators can reclaim space on wide screens by collapsing the navigation. The browser restores their last choice on the next load when persistent storage is available.

## Navigation

- Under 700 CSS pixels, center the Admin signature between a 44px bordered IconButton with 8px corners named “Menu” and the account control. The button opens a modal drawer from the left. The drawer’s IconButton is named “Fechar menu”. Support touch, keyboard, Escape and outside dismissal. Return focus to the trigger on dismissal. Close the drawer on link selection, pathname changes and resizing to desktop.
- From 700 CSS pixels, use a Café sidebar. The expanded width ranges from 190px to 270px and shows icons with labels. A 44px control named “Recolher menu lateral” reduces the width to 72px. Centered icons keep accessible names, tooltips and the current-page indicator. “Expandir menu lateral” restores the labels. Focus stays on the toggle, and the content takes the freed space. The toggle uses IconButton and a Base UI tooltip that opens on hover or keyboard focus and closes on Escape.
- Use the official dog-and-N symbol beside “Admin” in Karvest ExtraBold. Match the original Nardini wordmark’s proportions and vertical alignment and carry over its flat-top i dot. Ship the signature as an optimized asset with a text alternative and a link to the private landing page.
- An active administrator sees Início, Usuários, Papéis and Auditoria. Detail routes highlight the parent section. Active staff and pending viewers have Início and their own profile. Viewers with outdated terms see the acceptance screen and can sign out. The account disclosure uses the real viewer with the existing Perfil and Sair flows. Preserve the server guard, session watcher, error handling and public sign-in and invitation behavior.

## Browser storage

Provide a reusable client-side module at `lib/browser-storage/io/browser-storage.ts` with string-based `getItem`, `setItem` and `removeItem` operations. Keep raw `localStorage` access inside this module. Guard the property access and every operation because either can throw. Importing the module and obtaining the server rendering value must avoid browser access and shared server-side preference state.

Use an in-memory map scoped to the current browser document. Mirror values observed or changed so they remain available if persistent storage fails. If storage is missing or an operation throws, use the map for the rest of that document. A successful read returning null clears the mirrored key. A failed write still updates the map, and a failed removal still deletes the in-memory value. In-memory preferences survive client navigation and reset on a full reload or a new document. If storage recovers, the previous durable value can reappear. Open tabs retain their current state until reload.

Save the sidebar preference under `nardini-select:admin-nav:v1` as `expanded` or `collapsed`. Missing and unrecognized values default to expanded. Read the preference during client hydration with an expanded server snapshot, and write only when the desktop rail is toggled. Mobile drawer use, resizing and navigation preserve the preference. The key is shared within the browser origin and holds only the display setting.

Record in `AGENTS.md` that every application use of local storage goes through the module. Document its API and fallback lifetime next to the module and reflect the rule in the PR checklist.

## Integration and verification

1. Verify reusable components in Storybook. Use Base UI Dialog for the drawer and a Base UI disclosure for the account controls. Build and verify shared components before integrating the real viewer and routes.
2. Check open and closed navigation, route highlighting, restricted destinations, keyboard focus and long account names at 390 × 844, 834 × 1194 and 1440 × 900. Include the new states in accessibility scans.
3. Test storage with available, missing and throwing backends. Cover failures on the getter, read, write and removal, including failure after successful access. Verify by reloading that both saved states are restored. With storage blocked, verify that toggling still works across client navigation and a full reload starts expanded.
4. Run the repository validation suite and refresh the code graph after source changes.
