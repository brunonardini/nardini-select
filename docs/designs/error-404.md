# Shared Error 404 screen

Status: rug proposal selected and approved for implementation by the owner on
2026-11-20. This records the reviewed mobile and desktop mockup and the explicit
request to make it the default 404 page and document it in Storybook.

## Approved composition and component

Use the approved silver-gray Weimaraner looking under a rug and the fixed
Karvest title "Procurei em todo canto.". The default description is "Até debaixo
do tapete. Mas esta página não foi encontrada.". Error404 accepts an optional
description and children for caller-owned recovery controls, following Error500.
The photograph and title are fixed.

Keep the approved centered composition, Off-white/Café palette, Karvest
ExtraBold and Montserrat. The component takes its height from its parent.
Actions stack in narrow containers and form a centered wrapping row from 600px
of container width. Use the same documented dimensions and spacing as Error500.
The decorative transparent WebP is a copy of the mockup asset, rendered with
Next Image and reserved dimensions; preserve the mockup and original photo.

## Default routing and recovery

Use app/not-found.tsx, the stable Next.js convention, within the existing root
layout. It handles unmatched URLs and notFound() calls without introducing an
experimental global-not-found option or fetching data. Keep the existing admin
authentication proxy and authorization rules.

The default screen provides "Voltar ao início" (a native link to /) and "Voltar"
(a small client control using the router's back method). If no prior browser
history exists, Voltar replaces the current route with /. The error screen
itself remains a Server Component. It introduces no new private route.

Next.js owns HTTP status and noindex handling. Unmatched non-streamed URLs must
return 404; streamed notFound() responses may retain 200, as documented by Next.
Do not turn an unknown URL into a redirect or expose route/data diagnostics.

## Storybook and verification

Catalog: Components / Error 404. Document the default, actions, custom
description, mobile, constrained container, pending/disabled controls, keyboard
focus, and long description. Unit tests verify fixed/default content, custom
copy/actions, and both back-navigation paths. Production E2E verifies an
unmatched route returns 404, shows the selected photo/title, is noindex,
passes the project's axe rules on desktop and mobile, and provides working
home/back recovery.

Keep tmp/error-404-proposals/ and tmp/error-proposals/ intact. They are local,
gitignored design references; the owner has prohibited deleting mockups unless
explicitly requested.
