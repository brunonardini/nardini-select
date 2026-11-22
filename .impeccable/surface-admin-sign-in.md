# Admin sign-in — approved surface

Visitor mode: Operate. Audience: authorized Nardini Select staff managing the e-commerce operation. Goal: recognize the admin area, choose the authorized Google account and enter, with clear pending/error feedback.

## Approved composition

The approved layout uses a photographic mobile composition and a lighter desktop expansion. The official horizontal logo stays unchanged. A separate Admin word uses Karvest: Ad in Cafe, min in Terracota, same visual height as Nardini, separated by an Argila rule. Use the normal Admin letterforms.

A silver-gray Weimaraner in a sunrise mountain landscape fills the background. At <=700px the image covers the viewport with a dark Cafe bottom fade. At >=701px an Off-white fade protects a 400px left content column; the image occupies the right 80%. Keep the full dog head visible. Mobile logo width is 160px (132px below 360px), desktop 210px. Admin is 36px (30px narrow mobile), desktop 48px, with optical vertical alignment.

The heading is 39px (34px below 360px), desktop 52px. Supporting text is 13px on mobile, desktop 15px. Mobile content uses 26px side gutters (20px narrow), with the primary action near the bottom; allow vertical scrolling on short screens. Desktop content starts at max(56px, (viewport - 1240px) / 2). The back-to-site link is desktop-only. There is no footer, repeated Admin label or closing motto.

## Approved content

- Title: "Por trás de cada escolha."
- Support: "Seu espaço para cuidar da operação e levar nossa curadoria a mais cães."
- Action: "Entrar com Google"
- Pending label: "Conectando ao Google…"
- Restriction with lock: "Acesso restrito para funcionários"
- Access-denied title: "Acesso negado"
- Recovery: "Esta conta não tem acesso. Use outra conta Google ou peça um convite ao administrador."

## Shared primitives and behavior

The page consumes Button variant=primary with loading/loadingLabel/leadingIcon, Button variant=secondary and size=compact for the desktop back link, and Alert variant=danger. The page module owns composition and outer spacing only. Shared feedback uses the documented semantic tokens in DESIGN.md; these are not marketing colors. Google and lock are in Icon.

Pending uses three 14x16px paw icons with infinite staggered opacity/scale pulses; reduced motion retains opacity only. Never show a fake timeout or progress percentage. Pending blocks duplicate submissions. Provider/network failures clear the busy state and show safe, actionable error copy. Do not expose raw provider messages.

## Image and verification

Original PNG: 2,340,372 bytes. Approved WebP sources: public/images/admin-sign-in-mobile.webp (768x1152, 88,590 bytes) and admin-sign-in-desktop.webp (1024x1536, 136,450 bytes). Next getImageProps chooses a single responsive source; use eager/high priority, without preloading both. The scene is decorative to assistive technology. Photograph generated as an illustration, not documentary store photography.

The owner approved the composition, copy, two-color normal Admin, infinite paw loading and pink alert in the review chat on 2026-11-19. DESIGN.md records the lasting rules; docs/designs/admin-sign-in.md records implementation approval. Validate page states through E2E/axe and shared primitive states through Storybook play/axe tests. Preserve the already-approved visual result during extraction.

The owner clarified that primary is shared between login and other primary actions; there is no sign-in variant. Icon position uses leadingIcon/trailingIcon, including the unchanged right-hand arrows on the home. Every action variant uses the same disabled/busy three-paw loading. Surrounding surface tokens provide light/dark contrast without changing the variant.

Alert defaults to a neutral Off-white surface when variant is omitted or default. The danger variant retains the approved pink error treatment. Both fill 100% of available width; the login content column owns the width constraint.

Desktop photo cropping anchors at 50% 25% to preserve the Weimaraner head in short landscape windows. Mobile retains its own crop. Check the head bounds against the visible image and viewport, including 1254x592 and wide/short desktops.
