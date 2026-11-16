# Releases, deployment, and rollback

## Environment variables

Configure these variables in Netlify for Production and Deploy Previews.

| Variable                 | Purpose                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `WHATSAPP_NUMBER`        | Store phone number with country code and digits only. The server-side redirect reads it.         |
| `NEXT_PUBLIC_SENTRY_DSN` | Enables Sentry. Find the DSN under Settings > Projects > nardini-select > Client Keys (DSN).     |
| `SENTRY_AUTH_TOKEN`      | Sentry organization token used to upload source maps during the build. Store it only in Netlify. |

In CircleCI, set `CODECOV_TOKEN` for the unit coverage upload. The `nardini-select-release` context provides `GH_TOKEN`, `NETLIFY_AUTH_TOKEN`, and `NETLIFY_SITE_ID` to the release job. The job sets `SENTRY_RELEASE` for the production build. Keep credential values out of Git.

## Release flow

CircleCI validates each push. On `main`, semantic-release uses the squash-merged PR titles to determine the next version. The `vX.Y.Z` tag and GitHub release record the version and its changelog. See the [release rules](../AGENTS.md#releases-and-deploys) and the [CircleCI configuration](../.circleci/config.yml).

When semantic-release creates a version, CircleCI deploys it to Netlify production and records the release in Sentry. Netlify builds deploy previews for PRs and skips its Git-triggered production build, so a canceled Netlify build for `main` is expected.

## M0 findings (2026-11-16)

Recorded from branch `spike/m0-better-auth-fit`, which is not merged. Copy this section onto `main` before M1 merges. The Better Auth result is in [the design's M0 findings](designs/backoffice-access.md#m0-findings): version 1.7.15 fits, and the Arctic fallback is not required.

**Postgres image.** Use `postgres:18`. Neon defaults new projects to Postgres 18, and the major cannot be changed after the project is created. The image pulled for the probe is PostgreSQL 18.6. Pin the major only. This environment could not read project `nardini-select`. If that project already exists, read its `pg_version` before M1 freezes the tag. A project created before June 2026 may still be on an older major.

**Deploy-preview variables for functions.** Not checked with a live deploy. The Netlify CLI in this environment is not logged in, and `NETLIFY_AUTH_TOKEN` is unset. No function was published to the `staging` alias.

The CLI pinned in CircleCI, `netlify-cli@27.19.0`, copies function environment at deploy time. `netlify deploy --context deploy-preview` loads the deploy-preview envelope with the Functions scope and sends it in that deploy's function config. A variable changed afterward stays on the old deploy until the next deploy. `--alias staging` sets the draft URL only. Without `--context deploy-preview`, the CLI uses the `dev` context. `netlify.toml` values are not visible to functions. Give the variable the Functions scope in Netlify, with one value for production and another for deploy previews.

Before the preview job in the design is trusted, deploy a minimal function with `npx netlify-cli@27.19.0 deploy --context deploy-preview --alias staging` (no `--prod`), read one non-secret probe variable from it, and then delete that variable.

## Rollback

In Netlify, open **Deploys**, select the last known good deploy, and click **Publish deploy** to republish it without rebuilding. Ship the correction in a PR with a `fix:` title to trigger a patch release.
