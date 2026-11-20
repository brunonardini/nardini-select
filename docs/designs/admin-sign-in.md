# Admin sign-in visual update

Status: approved for implementation by the owner in the design review chat on 2026-11-19. This document records the approved sign-in appearance and behavior. It extends the sign-in surface of backoffice-access.md; authentication and authorization architecture stay unchanged.

## Approved experience

The mobile layout uses the original horizontal logo and a separate Admin word in Karvest, with Ad in Cafe and min in Terracota, separated by an Argila rule. A silver-gray Weimaraner in a sunrise mountain landscape fills the background. A dark Cafe transition protects mobile copy and controls; desktop uses a light transition and a left-hand content column. Keep the original logo file unchanged.

Copy is Portuguese: title "Por trás de cada escolha." and subtitle "Seu espaço para cuidar da operação e levar nossa curadoria a mais cães." The single action is "Entrar com Google". A lock accompanies "Acesso restrito para funcionários". The back-to-site link appears only on desktop. There is no footer, "Nardini Select · Admin" label or closing brand motto.

The user explicitly approved two scoped brand exceptions: Karvest for the Admin word and semantic red for authentication errors. The selected error treatment has a pink surface, red top rule, red title and a lock icon. Keep server-owned safe error messages and recovery guidance; never render raw provider errors.

## State and implementation decisions

- Keep the page as a Server Component. Following the owner's design-system extraction request, use the shared Button primary variant and its loading/loadingLabel/leadingIcon/trailingIcon API, and secondary for the back link, shared Alert variant=danger, and Icon family. The route retains only composition and outer spacing. DESIGN.md and the Impeccable surface brief record these decisions; Storybook covers the primitives and their states.
- Retain the existing Google social sign-in, callback and error callback URLs. Show disabled/busy feedback immediately. Three 14 x 16px paw icons pulse in a staggered infinite loop while redirecting. The loop does not indicate progress. Restore an actionable error state if the request fails, without a fake timeout or percentage.
- Keep keyboard focus visible: Cafe on light surfaces and Off-white around the mobile action. Reduced motion replaces scaling with opacity fades.
- Scope full-viewport styling to the sign-in page so other admin routes retain their current shell and guards. No new private entry point, role cache or personal-data store is introduced.
- Optimize the approved image with Sharp. Compare responsive WebP/AVIF output to the 2,340,372-byte original, keep a smaller mobile source when useful, and use next/image or its documented getImageProps art-direction path. Load only the matching source, reserve its geometry and prioritize the visible image. Do not add the original PNG to tracked public assets.

## Review and validation

The approved mobile and desktop experience includes the title, Admin treatment, indefinite paw loading and pink alert. The implementation addresses keyboard-focus contrast and image optimization.

Add unit tests for pending sign-in, duplicate submissions and failed-request recovery. Update E2E text assertions and scan initial, denied and pending states with the project's axe rules. Validate the layout at narrow mobile, regular mobile, intermediate and desktop widths. Run format, lint, Knip, type checking, unit tests and E2E checks. Record actual results and any remaining limits; do not claim physical-device or production performance measurements.

No database, privacy inventory, authorization or deployment change is required. The change can be rolled back with the prior application build.

The owner clarified that primary is shared between login and other primary actions; there is no sign-in variant. Icon position uses leadingIcon/trailingIcon, including the unchanged right-hand arrows on the home. Every action variant uses the same disabled/busy three-paw loading. Surrounding surface tokens provide light/dark contrast without changing the variant.
