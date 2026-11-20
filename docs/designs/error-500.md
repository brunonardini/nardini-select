# Shared Error 500 screen

Status: sofa proposal approved for implementation by the owner on 2026-11-20.
The owner reviewed mobile and desktop HTML mockups and explicitly requested
this component, its API, Storybook documentation, and admin integration.

## Approved experience and API

Use the approved photograph of the silver-gray Weimaraner sitting innocently
on a destroyed sofa. The fixed title is "Eu não sei o que aconteceu…".
`Error500` accepts only an optional `description` string and optional `children`
for caller-owned actions. The default description is "Não conseguimos carregar
esta página.". The image and title are not configurable.

The component centers its content in the space provided by its parent. It
does not impose a viewport height or own application navigation. Full-screen
wrappers provide the viewport height; embedded wrappers provide the available
content height. Actions stack and fill the content width in narrow containers;
at 600px of available container width they become a centered, wrapping row.
This responds to container width rather than the browser width.

Keep Café text and actions on Off-white, Karvest ExtraBold headings and
Montserrat body and controls. Use the existing Button component for actions.
The photograph is decorative, uses Next Image with reserved aspect ratio,
and is delivered as an optimized transparent WebP. No entrance animation.

## Error handling

The admin layout loads the viewer before rendering the authenticated shell.
If that operation fails, preserve framework redirects and other control-flow
exceptions, report the application failure to Sentry, and render a clean error
screen. Known connection codes (including nested causes and aggregate errors)
select the safe description "Não conseguimos conectar ao banco de dados.".
Other failures use the component default; never render raw exception messages,
SQL, connection URLs, or provider diagnostics.

The server-rendered authentication fallback is a rendered unavailable state,
not a change to HTTP status handling. Error boundaries remain responsible for
unexpected render exceptions: the root segment boundary handles public pages
and admin layout errors; the admin segment boundary preserves the shell for
errors below it. Boundaries use Next 16's `retry` callback and generic copy,
because production server error details are sanitized before reaching clients.
Retrying an authentication fallback uses a normal full-page link to `/admin`,
so a fresh session/database read is performed. No private content or account
navigation is rendered when the viewer could not be loaded.

## Documentation and validation

Storybook catalog name: **Error 500**. Cover the default without actions,
custom description, caller-supplied actions, mobile/desktop, a constrained
container on desktop, pending/disabled actions, and keyboard focus. Tests cover
the fixed content, default/custom description, action callbacks and database
classification. Browser checks cover full-screen and embedded presentation,
recovery, generic/database messages, and WCAG 2.2 A/AA plus best practices.

## Preserved design material

Keep `tmp/error-proposals/` and all its mockups and source images. The owner
explicitly prohibited deleting this mockup unless they explicitly request it.
The original comparison and prompt provenance remain local and gitignored;
production assets are copies. Do not clean up or overwrite these source images
as part of implementation, optimization, or future maintenance.
