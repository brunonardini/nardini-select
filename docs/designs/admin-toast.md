# Admin toast feedback

Status: Approved

## Purpose

Give admin users recognizable feedback when an operation completes, needs attention, or fails. The existing toast uses a neutral surface and dismisses every outcome after four seconds. In both invitation flows, clipboard errors need to stay available while the user copies the link manually.

## Scope

- Support exactly `success`, `warning`, and `danger`.
- Display up to three colored cards at the bottom of the viewport. Preserve the arrival order for separate notices and group repeats.
- Update the clipboard feedback after generating and renewing an invitation. Invitation actions, expiry rules, confirmation dialogs, and inline operation errors keep their existing paths. The admin provider stays in the same layout.

## Variants and layout

| Variant | Icon | Duration while active | Announcement |
| --- | --- | --- | --- |
| `success` | Check | 4 seconds | Polite |
| `warning` | Warning triangle | 8 seconds | Polite |
| `danger` | Circled exclamation | Until dismissed | Assertive |

Reuse the semantic surface, border, icon-circle, accent, foreground, and top-rule colors from the [design system](../../DESIGN.md). The Toast and Alert consume the same color values. Use Montserrat, a 13px bold title, and a 12px body. The card has an 8px radius, a 3px top rule, a 34px icon circle, and a 44px close target named “Fechar: {title}”. The icons are decorative.

At 390×844 the viewport fills the width with a 12px inset. From 650px it anchors at bottom right with a 350px width and 19px inset. From 1000px it uses a 374px width and 25px inset. Respect safe-area insets, preserve space for focus outlines, wrap long text, and cap the stack to the available height. A short viewport can scroll the stack.

Use the Base UI transition lifecycle. A card enters over 180ms from 7px below with opacity and translation. Dismiss immediately on close or expiry and promote the next item as removal settles, with no timed exit. Reduced motion keeps a short entrance fade and skips translation.

## Delivery, grouping, and focus

1. The provider accepts a required variant, a title, and a description. Callers supply fixed, safe copy. The provider state belongs to the current admin layout and clears on unmount.
2. Match pending and active notices by variant and title. A repeat increments “×N” and keeps the original description, order, and remaining duration. The count has a text equivalent for assistive technology. A repeat arriving after closing begins becomes a new notice.
3. Deliver at most three cards to the Base UI manager and render the oldest card above newer cards. Keep overflow in a local FIFO queue outside the manager so queued timers and announcements start when a slot opens. Release a slot after removal settles and keep simultaneous promotions in arrival order.
4. The local queue owns per-notice countdowns and disables Base UI’s automatic timeout. Track the remaining time for each displayed notice with a monotonic clock. Hovering the viewport with a mouse, moving keyboard focus into it, or hiding the document pauses all displayed timers. Resume only after every pause condition clears. A notice promoted during a pause keeps its full duration until timers resume. Clear timers on dismissal or provider unmount. Duplicate updates preserve the original timeout.
5. Opening leaves focus on the originating control. A focused close control can dismiss its card with activation or Escape. When dismissal removes the focused card, restore focus to the originating control if it is connected and inside the current focus boundary. Fall back to an available control inside the active invite dialog or to its “Convidar usuário” trigger after it closes. Stop Escape propagation from a focused toast before the enclosing dialog’s document listener. Escape elsewhere keeps the dialog’s normal close behavior.

## Invite dialog and portal

The admin layout owns one queue, one Base UI manager, and one viewport. Use a stable portal container normally attached to the document body. The invite dialog opts into hosting that container while open. Attach the host inside the Base UI modal focus boundary in the host ref or layout phase, before Base UI isolates outside elements. Return the same container to the body on host cleanup before the popup disappears. The host is a sibling of the scrollable invitation panel. The viewport-sized popup shell and empty host pass pointer events through to the backdrop. The panel and toast content receive pointer events. Keep the shell untransformed so fixed cards align to the browser viewport. Let the shell own the opacity transition for Base UI’s exit lifecycle. Center and scroll the inner panel and apply any translation there. Moving the container preserves order, countdown, and live-region identity. Avoid duplicate mounted viewports or a separate invitation queue.

## Invitation copy

| Result | Variant | Title | Description |
| --- | --- | --- | --- |
| Copy succeeds | `success` | Link copiado | Envie o link à pessoa convidada. |
| Copy fails or the clipboard is unavailable | `danger` | Não foi possível copiar | Selecione o link e copie manualmente. |

Both invitation flows use a shared guarded clipboard write initiated directly by the copy button, with the same handling for unavailable APIs, synchronous errors, and rejected writes. The expiry stays with the link field. Copying does not start a new validity period. Warning is available for future callers and in Storybook.

## Decisions

- Keep Base UI as the shared primitive and use CSS for opacity and translation. A separate animation dependency adds weight for the same behavior.
- Keep the FIFO queue in the provider. Base UI's built-in limit hides older notifications after they have already been added, so it cannot defer their timers or announcements on its own.
- Keep notification copy out of persistent storage, URLs, and telemetry. Clipboard access stays in the user-initiated invitation flows. Toast payloads contain neither invitation URLs nor personal data.

## Integration and verification

1. Implement the shared component and token usage first. Retain Hidden and Visible in Storybook and add the three variants, mixed stack, fourth notice, repeats, long text, timer pause, keyboard dismissal, and reduced motion.
2. Exercise FIFO order on manual close and expiry, group repeats before and after promotion, and verify that repetition keeps the initial timeout. Cover persistent danger and visibility changes. Verify that success and warning have polite announcement output, danger has assertive output, and overflow announces only on promotion. Check focus under an open dialog and record an assistive-technology smoke test if available. Test mobile, portrait tablet, and desktop.
3. Migrate the two clipboard callers, preserving the existing user gesture and safe error copy. Test clipboard success, rejection, and a missing API in both paths. Check the open invite dialog with keyboard and axe, including Escape isolation, focus return, and migration of the viewport without reannouncing the same notice.
4. Run typecheck, lint, formatting, Knip, unit tests and coverage, the relevant invitation end-to-end tests, and Storybook checks and build. Refresh Graphify and document the final behavior in the [design system](../../DESIGN.md) and [admin users documentation](admin-users.md).
