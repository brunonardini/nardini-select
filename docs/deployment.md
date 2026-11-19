# Releases, deployment, and rollback

## Environments

| Environment | Database | Where it runs | Data |
| --- | --- | --- | --- |
| Production | Neon project `nardini-select`, database `nardini_prod` | Netlify production context | Real, after the production-data gate |
| Preview | Neon project `nardini-select-stg`, database `nardini_stg` | Netlify alias `staging`, deploy-preview context, after the `preview-approval` hold | Fake seed data |
| Development | Docker Postgres 18, database `nardini_dev` | `npm run dev` | Fake seed data |
| Test | Docker locally, Postgres 18 service container in CircleCI, database `nardini_test` | Playwright | Fake seed data |

Local and CI databases are created by `npm run db:provision`. Preview and production databases are created in Neon. Netlify does not build from Git. Two settings do that. In Project configuration, Developer settings, Build settings, Build status is Stopped builds, so a push does not start a build and does not leave a canceled deploy. `netlify.toml` sets `ignore` to `exit 0` as the backup. The CLI does not run that command. It runs only if builds are active again, including after the repository is relinked, and then that Git build is canceled. CircleCI deploys production and, after a manual approval, the `staging` alias. `netlify deploy` builds on the CircleCI machine and uploads the result. Do not pass `--remote`: that asks Netlify to build, and a stopped site refuses it.

## Neon

Provision each Neon project once, as the project owner. Point `PROVISION_URL` at that project's direct endpoint and leave `PROVISION_CREATE_DATABASES` unset, so the script applies roles and grants to the database already in the URL. Set the three role passwords in the environment for that run. They differ per environment and never enter Git.

Then store one URL per role:

| Variable | Role | Endpoint | Database |
| --- | --- | --- | --- |
| `DATABASE_URL` | `app_runtime` | Pooled, with `sslmode=verify-full` | `nardini_prod` in production, `nardini_stg` for the preview project |
| `DATABASE_MIGRATION_URL` | `app_migrator` | Direct | Same database |
| `AUDIT_MAINTAINER_URL` | `audit_maintainer` | Direct | Same database |

`DATABASE_URL` is a Netlify variable with the Functions scope. Production and deploy previews get different values. Do not put the migration or audit URLs in Netlify. On Neon, keep `channel_binding=require` beside `sslmode=verify-full`.

Postgres 18 is the major for new Neon projects and for the Docker image. The major cannot be changed after a Neon project is created. If project `nardini-select` already exists, read its `pg_version` before the first production migration. A project created before June 2026 may still be on an older major. Do not adopt Neon's managed Better Auth.

## Environment variables

Configure these variables in Netlify for Production and Deploy Previews.

| Variable | Purpose |
| --- | --- |
| `WHATSAPP_NUMBER` | Store phone number with country code and digits only. The server-side redirect reads it. |
| `NEXT_PUBLIC_SENTRY_DSN` | Enables Sentry. Find the DSN under Settings > Projects > nardini-select > Client Keys (DSN). |
| `SENTRY_AUTH_TOKEN` | Sentry organization token used to upload source maps during the build. Store it only in Netlify. |
| `DATABASE_URL` | Runtime connection for Functions. See the table above. |
| `BETTER_AUTH_SECRET` | Signs the session cookie. At least 32 characters. Rotation deletes every row in `sessions`. |
| `BETTER_AUTH_URL` | Public origin of this environment, with no path. |
| `GOOGLE_CLIENT_ID` | Google OAuth client for admin sign-in. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `BOOTSTRAP_ADMIN_EMAIL` | Google account that becomes the first admin while `users` is empty. |

In CircleCI, set `CODECOV_TOKEN` for the unit coverage upload. Keep credential values out of Git.

| Context | Who can use it | Variables |
| --- | --- | --- |
| `nardini-select-prod-migrate` | `main` | `DATABASE_MIGRATION_URL` |
| `nardini-select-release` | `main` | `GH_TOKEN` |
| `nardini-select-prod-deploy` | `main` | `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` |
| `nardini-select-preview-db` | Branches of this repository, not `main` | `DATABASE_MIGRATION_URL`, `DATABASE_URL` |
| `nardini-select-preview-deploy` | Branches of this repository, not `main` | `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` |

`NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` used to live in `nardini-select-release`. Copy them into `nardini-select-prod-deploy` before the first production deploy from this pipeline, and into `nardini-select-preview-deploy` before the first preview. The deploy fails without them. `GH_TOKEN` stays on the release context.

In CircleCI, restrict the production contexts to `main` and the preview contexts to non-fork pipelines. The config also ignores `main` for the preview group and stops a fork before it uses those variables.

Create the preview contexts before approving the first preview. Merging to `main` does not deploy the `staging` alias.

The preview database URLs point at `nardini_stg`. `DATABASE_MIGRATION_URL` is the direct endpoint as `app_migrator`. `DATABASE_URL` is the pooled endpoint as `app_runtime`. Both use `sslmode=verify-full&channel_binding=require`. Provision the Neon project `nardini-select-stg` once, the same way as production, with `PROVISION_CREATE_DATABASES` empty, before that approval.

## Release flow

CircleCI validates each push, including `db-check` (provision, migrate an empty database, Squawk, schema types, grants). On `main`, after lint, type checking, unit tests, and `db-check`, `migrate-production` applies pending migrations to Neon. semantic-release then uses the squash-merged PR titles to determine the next version. The `vX.Y.Z` tag and GitHub release record the version and its changelog. See the [release rules](../AGENTS.md#releases-and-deploys) and the [CircleCI configuration](../.circleci/config.yml).

When semantic-release creates a version, it writes `release/version`. `deploy-production` reads that file, builds with `SENTRY_RELEASE=nardini-select@X.Y.Z`, and deploys to Netlify production with `--context production`. A commit that does not call for a version leaves the file absent, and the deploy job stops. The migration still runs.

## Preview

On a branch of this repository, after lint, type checking, unit tests, the database check, the build, Storybook, and end-to-end tests pass, CircleCI shows the `preview-approval` hold. It is not a required status check. Approving it runs `npm run db:reset` against `nardini_stg` (drop `public` and `audit`, reapply schema grants, migrate, and seed), then builds on the CircleCI machine and deploys with `netlify deploy --context deploy-preview --alias staging`. The message is `Preview <branch> <sha>`. There is no `--prod`, no `--remote`, and no `SENTRY_RELEASE`; the preview release is the commit SHA.

The approval, the database reset, and the deploy share the serial group `preview`. Only one preview runs at a time. CircleCI skips an older preview still queued when a newer pipeline is waiting. The reset refuses any database other than `nardini_dev`, `nardini_test`, and `nardini_stg`.

Google sign-in is the admin sign-in. Keep these variables in Netlify, Functions scope, with one value for production and another for deploy previews. Do not put them in Git or in CircleCI: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `BOOTSTRAP_ADMIN_EMAIL`.

Set `BOOTSTRAP_ADMIN_EMAIL` to the owner's Google account before the first sign-in, and only while `users` is empty. After the first user, that path no longer runs. The owner accepts the terms and stays the only administrator until the production-data gate. To rotate the secret, change `BETTER_AUTH_SECRET` and delete every row in `sessions`.

| Environment | Redirect URI |
| --- | --- |
| Production | `https://nardiniselect.com.br/api/auth/callback/google` |
| Preview | `https://staging--<site-name>.netlify.app/api/auth/callback/google` |
| Development | `http://localhost:4473/api/auth/callback/google` |

`<site-name>` is the site name in Netlify (Site configuration, Site details). Keep both Netlify protections: Stopped builds, and `ignore` in `netlify.toml`.

## Failed migration

`node-pg-migrate` runs each file in one transaction and records it only after commit. A failed file rolls back and is not recorded. Fix the SQL in a new commit and push again. Do not edit a file that production has already applied. Migrations are forward-only: repair a committed mistake with a new migration. The production job stores its log as `reports/migrate-production.txt`.

## M0 findings (2026-11-16)

Recorded from branch `spike/m0-better-auth-fit`, which is not merged. The findings themselves are on `main`. The Better Auth result is in [the design's M0 findings](designs/backoffice-access.md#m0-findings): version 1.7.15 fits, and the Arctic fallback is not required.

**Postgres image.** Docker and new clusters use `postgres:18`. The image pulled for the probe is PostgreSQL 18.6. Pin the major only. This environment could not read an existing Neon project. Read `pg_version` before the first production migration, as described above.

**Deploy-preview variables for functions.** Not checked with a live deploy. The Netlify CLI in this environment is not logged in, and `NETLIFY_AUTH_TOKEN` is unset. No function was published to the `staging` alias.

The CLI pinned in CircleCI, `netlify-cli@27.19.0`, copies function environment at deploy time. `netlify deploy --context deploy-preview` loads the deploy-preview envelope with the Functions scope and sends it in that deploy's function config. A variable changed afterward stays on the old deploy until the next deploy. `--alias staging` sets the draft URL only. Without `--context deploy-preview`, the CLI uses the `dev` context. `netlify.toml` only sets `ignore`. A value set only there would not reach functions. Give the variable the Functions scope in Netlify, with one value for production and another for deploy previews.

The preview deploy job is in the pipeline. Before trusting function environment on that deploy, run a minimal function with `npx netlify-cli@27.19.0 deploy --context deploy-preview --alias staging` (no `--prod`), read one non-secret probe variable from it, and then delete that variable. That live check has not been run.

## Rollback

In Netlify, open **Deploys**, select the last known good deploy, and click **Publish deploy** to republish it without rebuilding. Republishing does not undo a migration that already committed. Roll the app back only when that older app still works with the migrated schema. A bad committed migration needs a new forward migration. Ship the correction in a PR with a `fix:` title to trigger a patch release.
