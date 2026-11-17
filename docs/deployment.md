# Releases, deployment, and rollback

## Environments

| Environment | Database | Where it runs | Data |
| --- | --- | --- | --- |
| Production | Neon project `nardini-select`, database `nardini_prod` | Netlify production context | Real, after the production-data gate |
| Preview | Neon project `nardini-select-stg`, database `nardini_stg` | Not deployed by this change | Fake seed data |
| Development | Docker Postgres 18, database `nardini_dev` | `npm run dev` | Fake seed data |
| Test | Docker locally, Postgres 18 service container in CircleCI, database `nardini_test` | Playwright | Fake seed data |

Local and CI databases are created by `npm run db:provision`. Preview and production databases are created in Neon. The preview deploy job is not part of this change. Netlify still builds PR deploy previews from Git, and it skips its Git-triggered production build, so a canceled Netlify build for `main` is expected.

## Neon

Provision each Neon project once, as the project owner. Point `PROVISION_URL` at that project's direct endpoint and leave `PROVISION_CREATE_DATABASES` unset, so the script applies roles and grants to the database already in the URL. Set the three role passwords in the environment for that run. They differ per environment and never enter Git.

Then store one URL per role:

| Variable | Role | Endpoint | Database |
| --- | --- | --- | --- |
| `DATABASE_URL` | `app_runtime` | Pooled, with `sslmode=verify-full` | `nardini_prod` in production, `nardini_stg` for the preview project |
| `DATABASE_MIGRATION_URL` | `app_migrator` | Direct | Same database |
| `AUDIT_MAINTAINER_URL` | `audit_maintainer` | Direct | Same database |

`DATABASE_URL` is a Netlify variable with the Functions scope. Production and deploy previews get different values. Do not put the migration or audit URLs in Netlify.

Postgres 18 is the major for new Neon projects and for the Docker image. The major cannot be changed after a Neon project is created. If project `nardini-select` already exists, read its `pg_version` before the first production migration. A project created before June 2026 may still be on an older major. Do not adopt Neon's managed Better Auth.

## Environment variables

Configure these variables in Netlify for Production and Deploy Previews.

| Variable | Purpose |
| --- | --- |
| `WHATSAPP_NUMBER` | Store phone number with country code and digits only. The server-side redirect reads it. |
| `NEXT_PUBLIC_SENTRY_DSN` | Enables Sentry. Find the DSN under Settings > Projects > nardini-select > Client Keys (DSN). |
| `SENTRY_AUTH_TOKEN` | Sentry organization token used to upload source maps during the build. Store it only in Netlify. |
| `DATABASE_URL` | Runtime connection for Functions. See the table above. |

In CircleCI, set `CODECOV_TOKEN` for the unit coverage upload. Keep credential values out of Git.

| Context | Who can use it | Variables |
| --- | --- | --- |
| `nardini-select-prod-migrate` | `main` | `DATABASE_MIGRATION_URL` |
| `nardini-select-release` | `main` | `GH_TOKEN` |
| `nardini-select-prod-deploy` | `main` | `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` |

`NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` used to live in `nardini-select-release`. Copy them into `nardini-select-prod-deploy` before the first production deploy from this pipeline. The deploy fails without them. `GH_TOKEN` stays on the release context.

Create both new contexts before merging. The next push to `main` runs `migrate-production`.

## Release flow

CircleCI validates each push, including `db-check` (provision, migrate an empty database, Squawk, schema types, grants). On `main`, after lint, type checking, unit tests, and `db-check`, `migrate-production` applies pending migrations to Neon. semantic-release then uses the squash-merged PR titles to determine the next version. The `vX.Y.Z` tag and GitHub release record the version and its changelog. See the [release rules](../AGENTS.md#releases-and-deploys) and the [CircleCI configuration](../.circleci/config.yml).

When semantic-release creates a version, it writes `release/version`. `deploy-production` reads that file, builds with `SENTRY_RELEASE=nardini-select@X.Y.Z`, and deploys to Netlify production with `--context production`. A commit that does not call for a version leaves the file absent, and the deploy job stops. The migration still runs.

## Failed migration

`node-pg-migrate` runs each file in one transaction and records it only after commit. A failed file rolls back and is not recorded. Fix the SQL in a new commit and push again. Do not edit a file that production has already applied. Migrations are forward-only: repair a committed mistake with a new migration. The production job stores its log as `reports/migrate-production.txt`.

## M0 findings (2026-11-16)

Recorded from branch `spike/m0-better-auth-fit`, which is not merged. The findings themselves are on `main`. The Better Auth result is in [the design's M0 findings](designs/backoffice-access.md#m0-findings): version 1.7.15 fits, and the Arctic fallback is not required.

**Postgres image.** Docker and new clusters use `postgres:18`. The image pulled for the probe is PostgreSQL 18.6. Pin the major only. This environment could not read an existing Neon project. Read `pg_version` before the first production migration, as described above.

**Deploy-preview variables for functions.** Not checked with a live deploy. The Netlify CLI in this environment is not logged in, and `NETLIFY_AUTH_TOKEN` is unset. No function was published to the `staging` alias.

The CLI pinned in CircleCI, `netlify-cli@27.19.0`, copies function environment at deploy time. `netlify deploy --context deploy-preview` loads the deploy-preview envelope with the Functions scope and sends it in that deploy's function config. A variable changed afterward stays on the old deploy until the next deploy. `--alias staging` sets the draft URL only. Without `--context deploy-preview`, the CLI uses the `dev` context. `netlify.toml` values are not visible to functions. Give the variable the Functions scope in Netlify, with one value for production and another for deploy previews.

Before the preview job in the design is trusted, deploy a minimal function with `npx netlify-cli@27.19.0 deploy --context deploy-preview --alias staging` (no `--prod`), read one non-secret probe variable from it, and then delete that variable.

## Rollback

In Netlify, open **Deploys**, select the last known good deploy, and click **Publish deploy** to republish it without rebuilding. Republishing does not undo a migration that already committed. Roll the app back only when that older app still works with the migrated schema. A bad committed migration needs a new forward migration. Ship the correction in a PR with a `fix:` title to trigger a patch release.
