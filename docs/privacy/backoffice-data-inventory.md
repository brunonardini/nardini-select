# Backoffice personal-data inventory

Inventory for the backoffice described in [the access design](../designs/backoffice-access.md). Update this file in the same change as any new or changed personal data.

The controller is Nardini Select, the shop in Resende, RJ, Brazil. The legal bases below refer to LGPD art. 7 (Lei 13.709/2018): II, compliance with a legal obligation; V, performance of a contract, or preliminary steps, to which the data subject is party (the terms of use); VI, exercise of rights in legal proceedings; IX, legitimate interest.

The published notice is `/admin/privacidade` and the terms are `/admin/termos`, both at version `2026-11-20`. Legal review of those texts and the processor agreements stay in the internal risk register. They still block the production-data gate: no real data of anyone other than the owner is stored in production until that register is clear and this milestone is live.

| Data | Purpose | Legal basis | Retention | Stored in | Processors |
| --- | --- | --- | --- | --- | --- |
| Full name, display name, email | Identify the user and show who acted | V | Until anonymized | Neon (US) | Neon, Netlify |
| Google account ID | Sign-in | V | Until anonymized | Neon (US) | Neon, Google |
| Photo URL | Show the user's picture | V | Until changed or anonymized | Neon (US) | Neon, Google |
| Session (token, dates) | Keep the user signed in | V | 12 h idle, 7 days max, deleted on logout, disable, delete, and anonymize | Neon (US) | Neon |
| Invited, registered, last sign-in, disabled, anonymized dates | Manage access | V | Until anonymized | Neon (US) | Neon |
| Terms and notice versions and dates | Prove acceptance and acknowledgment | V and II | Until anonymized | Neon (US) | Neon |
| Invitation (full name typed by an admin) | Let the invited person join | V (preliminary steps) and IX | 7 days, whatever the status | Neon (US) | Neon |
| Audit events (actor UUID, action, entity, metadata) | Security, fraud prevention, accountability | IX and VI | 6 months, plus up to 4 days until the next deletion | Neon (US) | Neon |
| Error reports (user UUID only, scrubbed) | Fix errors | IX | Sentry plan retention | Sentry (US) | Sentry |

`email_verified` and `photo_source` are account flags stored with the user until anonymization. They are not free text and they are not a separate purpose.

## Account administration

`/admin/usuarios` shows name, email, role, state, and last access to administrators. Those fields are already held for account administration. The listing adds no purpose and no storage. A search term travels only in the request body. It is not stored in the URL, browser storage, audit metadata, or logs.

Anonymization is irreversible. An administrator types the disabled user's full name. The action clears full name, display name, photo, and the linked Google account, replaces the email with `anonymized+<id>@invalid`, deletes sessions, clears the full name on an invitation that user consumed, and sets `anonymized_at`. The UUID and the audit rows stay. The interface shows "Usuário removido". A user who already acted in the audit log is not deleted.

## Browser storage

The browser does not store personal data for the backoffice. It stores only:

| Key | Value | Purpose |
| --- | --- | --- |
| `nardini-select:admin-users:page-size:v1` | Page size `6`, `12`, or `24` | How many people the users list shows |
| `nardini-select:admin-nav:v1` | `collapsed` or `expanded` | Whether the sidebar is collapsed |

## Where the data lives

Neon Postgres is in AWS US East (Ohio). Netlify runs the application in `us-east-2`. Google provides sign-in and, when present, the photo. Sentry receives scrubbed error reports. The notice discloses this international transfer. There is no advertising use and no sale of the data.

## Retention job

Monday and Friday at 06:00 UTC, `npm run db:retain` connects as `audit_maintainer` and deletes `audit.events` with `occurred_at` older than six calendar months and `invitations` with `created_at` older than seven days. The job writes nothing else. See [the deployment guide](../deployment.md#retention).
