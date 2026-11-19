# Admin sign-in visual update

Status: approved for implementation by the owner in the design review chat on 2026-11-19. This document records the reviewed prototype and the owner's instruction to implement it on the current branch. It extends the sign-in surface of backoffice-access.md; authentication and authorization architecture stay unchanged.

## Approved experience

The mobile layout is based on the reviewed Novo dia proposal: the original horizontal logo and a separate Admin word in Karvest, with Ad in Cafe and min in Terracota, separated by an Argila rule. A silver-gray Weimaraner in a sunrise mountain landscape fills the background. A dark Cafe transition protects mobile copy and controls; desktop uses a light transition and a left-hand content column. Keep the original logo file unchanged.

Copy is Portuguese: title "Por trás de cada escolha." and subtitle "Seu espaço para cuidar da operação e levar nossa curadoria a mais cães." The single action is "Entrar com Google". A lock accompanies "Acesso restrito para funcionários". The back-to-site link appears only on desktop. There is no footer, "Nardini Select · Admin" label or closing brand motto.

The user explicitly approved two scoped brand exceptions: Karvest for the Admin word and semantic red for authentication errors. The selected error treatment has a pink surface, red top rule, red title and a lock icon. Keep server-owned safe error messages and recovery guidance; never render raw provider errors.

## State and implementation decisions

- Keep the page as a Server Component and reuse the existing Button. Page-only icons and styling remain under app/admin/entrar; no new shared component is required.
- Retain the existing Google social sign-in, callback and error callback URLs. Show disabled/busy feedback immediately. Three 14 x 16px paw icons pulse in a staggered infinite loop while redirecting. The loop does not indicate progress. Restore an actionable error state if the request fails, without a fake timeout or percentage.
- Keep keyboard focus visible: Cafe on light surfaces and Off-white around the mobile action. Reduced motion replaces scaling with opacity fades.
- Scope full-viewport styling to the sign-in page so other admin routes retain their current shell and guards. No new private entry point, role cache or personal-data store is introduced.
- Optimize the approved image with Sharp. Compare responsive WebP/AVIF output to the 2,340,372-byte original, keep a smaller mobile source when useful, and use next/image or its documented getImageProps art-direction path. Load only the matching source, reserve its geometry and prioritize the visible image. Do not add the original PNG to tracked public assets.

## Review and validation

The owner reviewed mobile/desktop prototypes and chose the title, Admin treatment, indefinite paw loading and pink alert over successive rounds. The Impeccable audit found two implementation follow-ups: keyboard-focus contrast and the heavy PNG. This implementation addresses both. The current audit notes are in .dev/docs/login-proposals/impeccable-audit.md (local-only).

Add unit tests for pending sign-in, duplicate submissions and failed-request recovery. Update E2E text assertions and scan initial, denied and pending states with the project's axe rules. Validate the layout at narrow mobile, regular mobile, intermediate and desktop widths. Run format, lint, Knip, type checking, unit tests and E2E checks. Record actual results and any remaining limits; do not claim physical-device or production performance measurements.

No database, privacy inventory, authorization or deployment change is required. The change can be rolled back with the prior application build.
