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

## Rollback

In Netlify, open **Deploys**, select the last known good deploy, and click **Publish deploy** to republish it without rebuilding. Ship the correction in a PR with a `fix:` title to trigger a patch release.
