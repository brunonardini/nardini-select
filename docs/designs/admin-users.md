# Admin user listing

Status: Approved

## Purpose

`/admin/usuarios` renders every user in one unpaginated table, with no search, filter or sorting, followed by the pending invitations. Administrators need to find a person quickly and see each person's role, state and last access at a glance.

This design replaces the table with person cards that can be searched, filtered, sorted and paginated. The server returns only the page of people the administrator is looking at. Pending invitations move into a disclosure above the team that shows their count.

## Goals and non-goals

Goals:

- Search by name or email with a 700ms debounce before each server request.
- Filter by state and role, sort by person, role or state, and paginate with 3, 6, 12 or 24 people per page (default 6). The browser remembers the page size.
- Keep the search term out of URLs, logs and browser storage.
- Keep authorization, invitation actions and the detail route unchanged.

Non-goals:

- No multi-select and no bulk actions. Account changes stay on `/admin/usuarios/[id]`.
- No per-card action menu. The person's name links to the detail route.
- No database change: no migration, extension or index.

## Layout

All widths below refer to the width of the main content area (the column next to the navigation), measured with container queries. “Narrow” means a main width below 460px.

- Horizontal padding: 16px when narrow, 24px from 460px and 32px from 760px. On viewports narrower than 360px, padding drops to 12px, the only viewport-based rule, because the main area fills the whole screen there.
- The “Usuários” heading uses Karvest at 27px when narrow, 30px from 460px, 34px from 760px and 36px from 1000px. “Convidar usuário” sits at its right.
- Below the heading, the “Convites pendentes” disclosure shows a mail icon, the number of pending invitations and a chevron that points right when closed and down when open.
- The “Equipe” heading shows the number of people matching the current search and filters.
- Below it, the toolbar holds the “Buscar por nome ou e-mail” search field and the “Filtros” and “Ordenar” buttons. All three are 44px high. When narrow, the search field takes its own row and the two buttons share the next one.
- People appear as cards: one column when narrow, two from 460px and three from 760px.
- Each card shows the initials avatar and the person's name as a link to the detail route, then the full email. Below a divider come the role (or “Sem papel”), the state and “Último acesso”. The last access is shown in the browser timezone with `LocalDateTime`, or as “Sem registro” when it is missing. Names and emails wrap, including long strings with no spaces.
- Each state is written out and preceded by a small decorative dot. The text carries the meaning, so the dot is hidden from assistive technology. Dot colors use only brand tokens: Ativo is a filled Café dot, Pendente a filled Terracota dot, “Termos desatualizados” a Terracota ring, Desabilitado an Argila ring and Anonimizado a filled Argila dot.
- The paginator holds the “Por página” select, the visible range (“1–6 de 24”), the current page (“Página 1 de 4”) and buttons named “Página anterior” and “Próxima página”. Each button is disabled on the first or last page.
- Text sizes use Montserrat: 15px for names; 14px for emails, controls and roles; 13px for counts and states. The existing brand tokens cover every color and spacing step.

## Behavior

### Invitations

- The page reads the invitations on the server and streams them through Suspense. Until they arrive, only the disclosure is disabled and shows the shared loading treatment. “Convidar usuário” works from the first render, because the invite dialog does not depend on the list.
- Opening the disclosure shows the pending invitations in place, above the team. Each invitation shows the name, “Expira em” followed by the local time, and the existing “Gerar novo link” and “Cancelar convite” actions. Cancelling asks for confirmation.
- The disclosure is shown even when there are no pending invitations. Its count is 0, and when opened it reads “Nenhum convite pendente.”
- The disclosure opens and closes without a height animation. Its content fades in, and the fade is skipped under `prefers-reduced-motion`.

### Search, filters and sorting

- Search matches any part of the display name, the full name or the email. It ignores case and accents. The list sends a request 700ms after the last keystroke. A newer request replaces the previous one, and only the latest response is shown. Clearing the field sends a request at once.
- Anonymized people match on name only. Their placeholder email never matches, and they have no name to match, so a search hides them.
- “Filtros” opens two selects: Estado and Papel. The role options come from the server and include “Sem papel”. “Aplicar filtros” sends a new request. “Limpar filtros” resets both selects and sends a new request.
- “Ordenar” offers “Pessoa”, “Papel” and “Estado”, each “Crescente” or “Decrescente”. The default is “Pessoa” ascending. The sort keys are:
  - Pessoa: the name shown on the card, compared with pt-BR rules that ignore case and accents.
  - Papel: the role name compared the same way, with “Sem papel” last.
  - Estado: the order Ativo, Pendente, Termos desatualizados, Desabilitado, Anonimizado.
- Ties are broken by person name and then by user ID, so the order is deterministic. Anonymized people always sort last when ordering by Pessoa.
- A new search, filter or sort returns to page one.
- When nothing matches, the list shows “Nenhum resultado” with a “Limpar busca e filtros” button.

### Page size

- The page size is stored with the browser storage module under `nardini-select:admin-users:page-size:v1`. Allowed values are `3`, `6`, `12` and `24`. A missing or unknown value means 6.
- When the listing loads, it takes the size from the address bar if one is there, otherwise from storage, otherwise 6. It then writes the size it used into the address bar.
- Changing “Por página” saves the new size in storage and in the address bar, and returns to page one.

### Address bar

- The address bar keeps only values that are not personal data: `estado`, `papel` (a role ID or `sem-papel`), `ordem`, `direcao`, `pagina` and `por_pagina`. The search term never appears in a URL.
- The list updates these values without adding history entries. Coming back from a detail page with the browser's Back button restores the filters, sort, page and page size. The search field starts empty.

### Loading, errors and focus

- The heading, disclosure, toolbar and paginator appear on the first render, and the toolbar is usable at once. Before the first response, the list shows one placeholder card for each slot of the current page size, laid out in the same grid. The “Equipe” count and the range show “–” until then.
- While a later request runs, the current cards stay visible and the results region is marked busy.
- The “Equipe” count and the “Nenhum resultado” message sit in a polite live region, so screen readers announce result changes.
- If the server answers 401 or 403, the page reloads so the server guard can send the viewer to the right place. Any other failure, including a network error, shows “Não foi possível carregar os usuários” with “Tentar novamente”. Retrying keeps the search, filters, sort, page and page size.
- Moving to another page or changing the page size moves focus to the results region. Search, filters and sorting leave focus where it is.

## Data flow

1. The page component checks access with `requirePage({ allow: ['active'], adminOnly: true })` ([backoffice access](backoffice-access.md)). It renders the shell, streams the invitations and passes the role options from `listRoles` to the list.
2. The list client sends `POST /admin/api/usuarios` with a JSON body: `busca`, `estado`, `papel`, `ordem`, `direcao`, `pagina` and `por_pagina`.
3. The route handler is wrapped in `withRoute` for active administrators and listed in the guard route table (`lib/auth/logic/routes.ts`). `withRoute` already rejects cross-origin POST requests.
4. `parseUserListQuery` (`lib/users/logic/`) validates the body and fills in defaults:
   - `busca`: trimmed, at most 100 characters, empty by default.
   - `estado`: one of five slugs, or no filter.
   - `papel`: a UUID (checked with `isUuid`) or `sem-papel`, or no filter.
   - `ordem`: `pessoa` by default.
   - `direcao`: `asc` by default.
   - `pagina`: 1 by default.
   - `por_pagina`: 6 by default.
5. The handler reads everyone with the existing `listUsers`, then calls the pure function `selectUserPage(users, query)` (`lib/users/logic/`). That function filters, sorts, computes the total and clamps the page into range. It returns `{ items, total, page, pageSize }`.
6. Each item carries only what the card needs: `id`, `name` (from `shownPerson`, so anonymized people show “Usuário removido”), `email` (null for anonymized people), `roleName`, `state` and `lastLoginAt`.
7. The response sets `Cache-Control: no-store`. The client writes the returned `page` back into the address bar, so a page past the end is replaced by the last page.

The state of each person still comes only from `userStateLabel`, so the rule exists in one place.

## Decisions

- **Filtering in server memory, not in SQL.** The staff is a few people, so reading everyone and paging in a pure function is cheap. It keeps the state rule in one place, with 100% unit coverage, and needs no migration or extension. The browser still receives only one page. Beyond about 1,000 users, the same `selectUserPage` contract moves into a SQL query.
- **A POST body, not query parameters.** Search terms are names and emails, and backoffice access forbids personal data in URLs. A body keeps the term out of the address bar, server logs and Sentry transactions. A Server Component driven by `searchParams`, as in the audit viewer, would put it in the URL.
- **Offset pagination.** The paginator shows a total and “Página X de Y”, which keyset pagination cannot provide cheaply. The list is small. When people change between requests, a row can shift by one position, which is acceptable here.
- **Cards instead of the table.** Cards give each person room for the role, state and last access on a phone without horizontal scrolling. Fewer people fit on one screen, and pagination makes up for it.

## Risks

- **Growth.** Reading every user on each request becomes slow with thousands of rows. The 1,000-user threshold and the unchanged response contract limit the cost of moving the work into SQL.
- **Search-term exposure.** The term travels only in the request body. It is not stored in the URL, browser storage, audit metadata or logs. The route handler never logs request bodies.
- **Stale states.** State labels depend on the current terms and privacy notice versions. Reading through `userStateLabel` on every request keeps them current.

## Components

Storybook already has Button, Avatar, Icon, TextField, SelectField, Dialog, ConfirmDialog, LocalDateTime, Alert, EmptyState and ToastProvider, and the listing reuses them.

- **New shared component:** `StatusText`, the written state with its decorative dot. It replaces the plain state text on the detail page as well, so it has two consumers. It lives in `components/status-text/` with tests and stories for the five states at 390 × 844, 834 × 1194 and 1440 × 900.
- **Shared listing patterns:** `PageHeader`, `Card`, `CardGrid`, `Toolbar` (`Toolbar.Content` and `Toolbar.Actions`), `Search`, `FiltersAction` and `OrderByAction`, each with tests and stories. The listing uses them for the heading and invite action, the person card, the responsive grid and paginator, and the search, filter and sort controls. `CardGrid` can also show a page-selection bar; this listing does not, because account changes stay on the detail route.
- **Page-local code** in `app/admin/usuarios/`, with unit tests: the invitations disclosure (a Base UI Collapsible), the list client, and the fields the toolbar actions submit.

## Privacy

The listing shows names, emails, role, state and last access. Backoffice access already lists all of these for account administration, so the listing adds no new purpose and no new storage. The browser stores only the page size. The personal-data inventory file arrives in M5 and must include this listing under account administration.

## Integration and verification

1. Build `StatusText` in Storybook and run its story tests and axe checks. Use it on the detail page.
2. Add `parseUserListQuery` and `selectUserPage` with 100% unit coverage. The tests cover:
   - accents and case;
   - anonymized people in search and sorting;
   - every sort key in both directions;
   - every state filter, plus “Sem papel” and an unknown role;
   - page clamping and partial last pages;
   - the defaults.
3. Add the route handler and its guard table entry. Then build the list client, with unit tests for:
   - the 700ms debounce with fake timers;
   - superseded requests;
   - the page-size precedence across the address bar, storage and the default, with storage available, missing and throwing;
   - 401/403 reload versus retry;
   - focus after paging.
4. Replace the table on `/admin/usuarios`. The listing's unused `?erro=` handling goes away, since account actions report errors on the detail route.
5. End-to-end tests run against the per-worker seeded users, located by their marker names:
   - one search with accents, one filter and one sort;
   - the page size restored after a reload;
   - the address bar restored after Back from a detail page;
   - the error and retry path.

   Run axe at 390 × 844, at 834 × 1194 (viewport set per test) and at 1440 × 900, with the disclosure, filters and sort open.

6. Run typecheck, lint, Prettier, Knip, unit tests with coverage, Storybook tests and E2E. Refresh the code graph with `GRAPHIFY_VIZ_NODE_LIMIT=0 graphify update .`.
