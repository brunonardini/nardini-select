# M0 Better Auth spike

Throwaway investigation for milestone M0 of
[docs/designs/backoffice-access.md](../../docs/designs/backoffice-access.md).
This branch is not merged. The result M1 needs is the findings section in
that design and the matching section in
[docs/deployment.md](../../docs/deployment.md).

## Run

From the repository root, with the Node version in `.nvmrc`:

```sh
nvm use
cd spike/m0
npm ci
docker compose up -d --wait
node probe.mjs
docker compose down
```

`node probe.mjs` exits 0 when criteria 1–5 pass and writes `report.json`.
It uses Postgres on `127.0.0.1:54329` (`M0_DATABASE_URL` overrides that)
and mocks Google's token endpoint. It does not call Google or Netlify.

The log prints one forced rollback error and one Not Found error. Both
are cases the probe asserts.

## Versions

`better-auth` 1.7.15, `kysely` 0.28.19, `pg` 8.23.1, image `postgres:18`.

`eslint.config.mjs` and `knip.json` ignore `spike/**` on this branch so
the probe stays out of CI. Drop those ignore lines when the findings are
copied onto `main` and this directory is not.
