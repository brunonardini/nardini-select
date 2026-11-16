import { readFileSync, writeFileSync } from "node:fs";
import { createSign, generateKeyPairSync, randomUUID } from "node:crypto";

import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";

const databaseUrl =
  process.env.M0_DATABASE_URL ??
  "postgres://postgres:postgres@127.0.0.1:54329/nardini_m0";
const baseURL = "https://nardini-select.test";
const clientId = "m0-google-client";
const origin = baseURL;

const pool = new Pool({ connectionString: databaseUrl });
const db = new Kysely({ dialect: new PostgresDialect({ pool }) });

let currentTrx = null;
const originalTransaction = db.transaction.bind(db);
db.transaction = (...args) => {
  const builder = originalTransaction(...args);
  const originalExecute = builder.execute.bind(builder);
  builder.execute = (callback) =>
    originalExecute(async (trx) => {
      const previous = currentTrx;
      currentTrx = trx;
      try {
        return await callback(trx);
      } finally {
        currentTrx = previous;
      }
    });
  return builder;
};

const events = [];
let phase = "rollback";

const rollbackTrxInvite = randomUUID();
const rollbackOuterInvite = randomUUID();
const successInvite = randomUUID();

const omittedAccountFields = {
  accessToken: undefined,
  refreshToken: undefined,
  idToken: undefined,
  accessTokenExpiresAt: undefined,
  refreshTokenExpiresAt: undefined,
  scope: undefined,
  password: undefined,
};

function readInviteCookie(context) {
  const header =
    context?.request?.headers?.get?.("cookie") ??
    context?.headers?.get?.("cookie") ??
    "";
  const match = header.match(/(?:^|;\s*)invite=([^;]+)/);
  return {
    header,
    fromHeader: match ? decodeURIComponent(match[1]) : null,
    hasGetCookie: typeof context?.getCookie === "function",
  };
}

async function txidOf(executor) {
  const result = await sql`select pg_current_xact_id()::text as txid`.execute(
    executor,
  );
  return result.rows[0]?.txid ?? null;
}

const auth = betterAuth({
  baseURL,
  secret: "m0-probe-secret-must-be-32-chars",
  telemetry: { enabled: false },
  rateLimit: { enabled: false },
  emailAndPassword: { enabled: false },
  logger: { level: "error" },
  database: {
    db,
    type: "postgres",
    transaction: true,
  },
  advanced: {
    useSecureCookies: true,
    disableCSRFCheck: false,
    database: {
      generateId: false,
      validateSchema: false,
    },
    ipAddress: { disableIpTracking: true },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    },
  },
  user: {
    modelName: "users",
    fields: {
      name: "display_name",
      email: "email",
      emailVerified: "email_verified",
      image: "photo_url",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      fullName: {
        type: "string",
        required: false,
        fieldName: "full_name",
        input: false,
      },
    },
  },
  account: {
    modelName: "user_accounts",
    storeAccountCookie: false,
    updateAccountOnSignIn: false,
    accountLinking: {
      enabled: false,
      disableImplicitLinking: true,
    },
    fields: {
      accountId: "provider_account_id",
      providerId: "provider_id",
      userId: "user_id",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    modelName: "sessions",
    cookieCache: { enabled: false },
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      token: "token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      identifier: "identifier",
      value: "value",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  socialProviders: {
    google: {
      clientId,
      clientSecret: "m0-google-secret",
      disableImplicitSignUp: false,
    },
  },
  disabledPaths: [
    "/sign-out",
    "/sign-up/email",
    "/sign-in/email",
    "/list-sessions",
    "/revoke-session",
    "/revoke-sessions",
    "/revoke-other-sessions",
    "/update-session",
    "/update-user",
    "/change-password",
    "/change-email",
    "/delete-user",
    "/delete-user/callback",
    "/list-accounts",
    "/link-social",
    "/unlink-account",
    "/get-access-token",
    "/refresh-token",
    "/account-info",
    "/request-password-reset",
    "/reset-password",
    "/verify-password",
    "/send-verification-email",
    "/verify-email",
    "/ok",
    "/error",
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const path = ctx.path ?? "";
      const allowed =
        path === "/sign-in/social" ||
        path === "/get-session" ||
        path === "/callback/:id" ||
        path.startsWith("/callback/");
      if (!allowed) {
        throw new APIError("NOT_FOUND", { message: "Not Found" });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          const cookie = readInviteCookie(context);
          let viaApi = null;
          if (cookie.hasGetCookie) {
            viaApi = await context.getCookie("invite");
          }
          const inviteId = viaApi || cookie.fromHeader;
          const inside = currentTrx !== null;
          const txid = inside ? await txidOf(currentTrx) : null;
          events.push({
            phase,
            hook: "user.create.before",
            inviteViaGetCookie: viaApi,
            inviteViaHeader: cookie.fromHeader,
            userId: user.id ?? null,
            insideTransaction: inside,
            txid,
          });
          if (inside && inviteId) {
            await currentTrx
              .updateTable("invitations")
              .set({ used_at: new Date() })
              .where("id", "=", inviteId)
              .execute();
          }
          if (phase === "rollback" && inside) {
            await db
              .updateTable("invitations")
              .set({ used_at: new Date() })
              .where("id", "=", rollbackOuterInvite)
              .execute();
          }
          return {
            data: {
              ...user,
              fullName: "Pessoa Convidada",
            },
          };
        },
      },
    },
    account: {
      create: {
        before: async (account) => {
          const inside = currentTrx !== null;
          events.push({
            phase,
            hook: "account.create.before",
            insideTransaction: inside,
            txid: inside ? await txidOf(currentTrx) : null,
          });
          if (phase === "rollback") {
            throw new Error("forced rollback");
          }
          return { data: { ...account, ...omittedAccountFields } };
        },
      },
      update: {
        before: async (account) => ({
          data: { ...account, ...omittedAccountFields },
        }),
      },
    },
    session: {
      create: {
        before: async (session) => {
          const inside = currentTrx !== null;
          events.push({
            phase,
            hook: "session.create.before",
            insideTransaction: inside,
            txid: inside ? await txidOf(currentTrx) : null,
            sawIp: Object.prototype.hasOwnProperty.call(session, "ipAddress"),
            sawUserAgent: Object.prototype.hasOwnProperty.call(
              session,
              "userAgent",
            ),
          });
          return {
            data: {
              ...session,
              ipAddress: undefined,
              userAgent: undefined,
            },
          };
        },
      },
    },
  },
});

function installFetchMock(idToken) {
  globalThis.fetch = async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith("https://oauth2.googleapis.com/token")) {
      return Response.json({
        access_token: "access-token-value",
        refresh_token: "refresh-token-value",
        id_token: idToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid email profile",
      });
    }
    if (url.startsWith("https://www.googleapis.com/oauth2/v3/certs")) {
      return Response.json({ keys: [] });
    }
    return new Response(`unexpected fetch ${url}`, { status: 599 });
  };
}

async function idTokenFor({ email, sub, name, nonce }) {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: "https://accounts.google.com",
      aud: clientId,
      sub,
      email,
      email_verified: true,
      name,
      picture: "https://lh3.googleusercontent.com/a/photo",
      nonce,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  const data = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256")
    .update(data)
    .sign(privateKey)
    .toString("base64url");
  return `${data}.${signature}`;
}

function storeCookies(jar, response) {
  const lines =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
  for (const line of lines) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!value) jar.delete(name);
    else jar.set(name, value);
  }
  return lines;
}

function cookieHeader(jar, extra) {
  const parts = [...jar.entries()].map(([name, value]) => `${name}=${value}`);
  if (extra) parts.push(extra);
  return parts.join("; ");
}

async function authFetch(path, { method = "GET", jar, body, extraCookie } = {}) {
  const headers = new Headers({
    origin,
    accept: "application/json",
  });
  const cookie = cookieHeader(jar ?? new Map(), extraCookie);
  if (cookie) headers.set("cookie", cookie);
  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }
  const response = await auth.handler(
    new Request(`${baseURL}/api/auth${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  const text = await response.text();
  return { response, text, cookies: storeCookies(jar ?? new Map(), response) };
}

async function startGoogle(jar, inviteId) {
  const started = await authFetch("/sign-in/social", {
    method: "POST",
    jar,
    extraCookie: `invite=${inviteId}`,
    body: {
      provider: "google",
      callbackURL: `${baseURL}/admin`,
      disableRedirect: true,
    },
  });
  const payload = JSON.parse(started.text);
  const url = new URL(payload.url);
  return {
    started,
    state: url.searchParams.get("state"),
    nonce: url.searchParams.get("nonce"),
  };
}

async function finishGoogle(jar, { state, nonce, email, sub, name, inviteId }) {
  installFetchMock(await idTokenFor({ email, sub, name, nonce }));
  return authFetch(
    `/callback/google?code=m0-code&state=${encodeURIComponent(state)}`,
    {
      jar,
      extraCookie: `invite=${inviteId}`,
    },
  );
}

function cookieAttributes(lines) {
  const session = lines.find((line) => line.includes("session_token"));
  if (!session) return null;
  const parts = session.split(";").map((part) => part.trim());
  const flags = new Set(parts.slice(1).map((part) => part.toLowerCase()));
  const domain = parts.find((part) => part.toLowerCase().startsWith("domain="));
  return {
    line: session.split("=")[0],
    secure: flags.has("secure"),
    httpOnly: flags.has("httponly"),
    sameSiteLax: flags.has("samesite=lax"),
    domain: domain ?? null,
    hostOnly: domain === undefined,
  };
}

async function columnNames(table) {
  const result = await sql`
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = ${table}
    order by ordinal_position
  `.execute(db);
  return result.rows.map((row) => row.column_name);
}

async function inviteState(id) {
  const result = await sql`
    select used_at is not null as used
    from invitations
    where id = ${id}
  `.execute(db);
  return result.rows[0]?.used ?? null;
}

async function main() {
  await pool.query(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  await db
    .insertInto("invitations")
    .values([
      { id: rollbackTrxInvite, label: "rollback-trx" },
      { id: rollbackOuterInvite, label: "rollback-outer" },
      { id: successInvite, label: "success" },
    ])
    .execute();

  const version = await sql`select version() as version`.execute(db);

  phase = "rollback";
  const rollbackJar = new Map();
  const rollbackStart = await startGoogle(rollbackJar, rollbackTrxInvite);
  const rollbackFinish = await finishGoogle(rollbackJar, {
    ...rollbackStart,
    email: "rollback@example.com",
    sub: "google-sub-rollback",
    name: "Rollback",
    inviteId: rollbackTrxInvite,
  });
  const usersAfterRollback = await sql`select count(*)::int as count from users`.execute(db);

  phase = "success";
  const successJar = new Map();
  const successStart = await startGoogle(successJar, successInvite);
  const successFinish = await finishGoogle(successJar, {
    ...successStart,
    email: "owner@example.com",
    sub: "google-sub-owner",
    name: "Owner Name",
    inviteId: successInvite,
  });
  const secondJar = new Map();
  const secondStart = await startGoogle(secondJar, successInvite);
  const secondFinish = await finishGoogle(secondJar, {
    ...secondStart,
    email: "owner@example.com",
    sub: "google-sub-owner",
    name: "Owner Name",
    inviteId: successInvite,
  });

  const users = await sql`
    select id::text, display_name, email, email_verified, photo_url, full_name
    from users
  `.execute(db);
  const accounts = await sql`
    select id::text, user_id::text, provider_id, provider_account_id
    from user_accounts
  `.execute(db);
  const sessions = await sql`
    select id::text, user_id::text, token, expires_at
    from sessions
    order by created_at
  `.execute(db);
  const accountColumns = await columnNames("user_accounts");
  const sessionColumns = await columnNames("sessions");

  const context = await auth.$context;
  const userId = users.rows[0].id;
  let listed = null;
  let listError = null;
  try {
    listed = await context.internalAdapter.listSessions(userId);
  } catch (error) {
    listError = error instanceof Error ? error.message : String(error);
  }
  const getSession = await authFetch("/get-session", { jar: successJar });
  await context.internalAdapter.deleteUserSessions(userId);
  const sessionsAfterDelete = await sql`select count(*)::int as count from sessions`.execute(db);
  let listedAfter = null;
  try {
    listedAfter = await context.internalAdapter.listSessions(userId);
  } catch (error) {
    listedAfter = error instanceof Error ? error.message : String(error);
  }
  const getSessionAfterDelete = await authFetch("/get-session", { jar: successJar });

  const disabled = {};
  for (const path of [
    "/sign-out",
    "/sign-up/email",
    "/list-sessions",
    "/revoke-sessions",
    "/reset-password/not-a-token",
  ]) {
    const result = await authFetch(path, {
      method: path === "/sign-out" || path === "/sign-up/email" ? "POST" : "GET",
      jar: successJar,
      body: path === "/sign-up/email" ? { name: "A", email: "a@example.com", password: "not-used" } : path === "/sign-out" ? {} : undefined,
    });
    disabled[path] = { status: result.response.status, body: result.text.slice(0, 180) };
  }

  const userHook = events.find(
    (event) => event.phase === "success" && event.hook === "user.create.before",
  );
  const accountHook = events.find(
    (event) => event.phase === "success" && event.hook === "account.create.before",
  );
  const sessionHook = events.find(
    (event) => event.phase === "success" && event.hook === "session.create.before",
  );
  const sessionAttributes = cookieAttributes(successFinish.cookies);
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const report = {
    betterAuth: "1.7.15",
    kysely: "0.28.19",
    pg: "8.23.1",
    postgres: version.rows[0]?.version ?? null,
    rollback: {
      status: rollbackFinish.response.status,
      body: rollbackFinish.text.slice(0, 300),
      userCount: usersAfterRollback.rows[0]?.count ?? null,
      trxInviteUsed: await inviteState(rollbackTrxInvite),
      outerInviteUsed: await inviteState(rollbackOuterInvite),
    },
    success: {
      status: successFinish.response.status,
      location: successFinish.response.headers.get("location"),
      body: successFinish.text.slice(0, 300),
      secondStatus: secondFinish.response.status,
      secondLocation: secondFinish.response.headers.get("location"),
      users: users.rows,
      accounts: accounts.rows,
      sessionCount: sessions.rows.length,
      accountColumns,
      sessionColumns,
    },
    events,
    sessionCookie: sessionAttributes,
    sessionsApi: {
      listedCount: Array.isArray(listed) ? listed.length : null,
      listError,
      sessionsAfterDelete: sessionsAfterDelete.rows[0]?.count ?? null,
      listedAfter,
    },
    disabled,
    getSession: {
      status: getSession.response.status,
      hasUser: getSession.text.includes("owner@example.com"),
      afterDelete: getSessionAfterDelete.text,
    },
    criteria: {},
  };

  const sameTransaction =
    userHook?.insideTransaction === true &&
    accountHook?.insideTransaction === true &&
    userHook.txid !== null &&
    userHook.txid === accountHook.txid;
  report.criteria.cookieAndTransaction = {
    pass:
      userHook?.inviteViaGetCookie === successInvite &&
      sameTransaction &&
      report.rollback.userCount === 0 &&
      report.rollback.trxInviteUsed === false &&
      report.rollback.outerInviteUsed === true &&
      (await inviteState(successInvite)) === true,
    sameTransaction,
    sessionInsideUserTransaction: sessionHook?.txid === userHook?.txid,
    inviteViaGetCookie: userHook?.inviteViaGetCookie ?? null,
  };
  report.criteria.namesIdsAndKysely = {
    pass:
      users.rows.length === 1 &&
      users.rows[0].display_name === "Owner Name" &&
      users.rows[0].full_name === "Pessoa Convidada" &&
      users.rows[0].photo_url === "https://lh3.googleusercontent.com/a/photo" &&
      users.rows[0].email_verified === true &&
      uuid.test(users.rows[0].id) &&
      userHook?.userId === null &&
      accounts.rows.length === 1 &&
      accounts.rows[0].provider_id === "google" &&
      accounts.rows[0].provider_account_id === "google-sub-owner" &&
      uuid.test(accounts.rows[0].id) &&
      sessions.rows.every((row) => uuid.test(row.id)),
  };
  report.criteria.tokensAndClientInfoUnstored = {
    pass:
      !accountColumns.some((column) =>
        ["access_token", "refresh_token", "id_token", "scope", "password"].includes(
          column,
        ),
      ) &&
      !sessionColumns.some((column) =>
        ["ip_address", "user_agent"].includes(column),
      ) &&
      secondFinish.response.status >= 300 &&
      secondFinish.response.status < 400 &&
      sessions.rows.length === 2,
  };
  report.criteria.endpointsAndCookie = {
    pass:
      disabled["/sign-out"].status === 404 &&
      disabled["/sign-up/email"].status === 404 &&
      disabled["/list-sessions"].status === 404 &&
      disabled["/revoke-sessions"].status === 404 &&
      disabled["/reset-password/not-a-token"].status === 404 &&
      getSession.response.status === 200 &&
      getSession.text.includes("owner@example.com") &&
      getSessionAfterDelete.text === "null" &&
      sessionAttributes?.secure === true &&
      sessionAttributes?.httpOnly === true &&
      sessionAttributes?.sameSiteLax === true &&
      sessionAttributes?.hostOnly === true,
  };
  report.criteria.listAndDeleteSessions = {
    pass:
      Array.isArray(listed) &&
      listed.length === 2 &&
      report.sessionsApi.sessionsAfterDelete === 0,
  };

  const failed = Object.entries(report.criteria)
    .filter(([, value]) => value.pass !== true)
    .map(([name]) => name);
  report.failed = failed;
  writeFileSync(
    new URL("./report.json", import.meta.url),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify({ failed, criteria: report.criteria, rollback: report.rollback, success: { status: report.success.status, location: report.success.location, secondStatus: report.success.secondStatus, users: report.success.users, accounts: report.success.accounts, sessionCount: report.success.sessionCount, accountColumns, sessionColumns }, disabled, getSession: report.getSession, sessionCookie: report.sessionCookie, sessionsApi: report.sessionsApi }, null, 2));
  if (failed.length > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
