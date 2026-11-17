import { readFileSync } from 'node:fs';

import pg from 'pg';

const SECTION_PATTERN = /^-- @(roles|database-grants|schema-grants)\s*$/gm;

export type RoleSections = {
  roles: string;
  'database-grants': string;
  'schema-grants': string;
};

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

export function quoteLiteral(value: string): string {
  if (value.length === 0) throw new Error('A role password is empty.');
  return `'${value.replaceAll("'", "''")}'`;
}

export function quoteIdent(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function withDatabase(
  connectionString: string,
  database: string,
): string {
  const url = new URL(connectionString);
  url.pathname = `/${database}`;
  return url.toString();
}

export function databaseName(connectionString: string): string {
  const name = new URL(connectionString).pathname.replace(/^\//, '');
  if (!name) throw new Error('The connection URL has no database name.');
  return decodeURIComponent(name);
}

export function readRoleSections(): RoleSections {
  const sql = readFileSync(new URL('./roles.sql', import.meta.url), 'utf8');
  const matches = [...sql.matchAll(SECTION_PATTERN)];
  if (matches.length !== 3) {
    throw new Error('roles.sql is missing a section marker.');
  }

  const sections = {} as RoleSections;
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? sql.length;
    const name = match[1] as keyof RoleSections;
    sections[name] = sql.slice(start, end);
  }
  return sections;
}

export function roleSql(
  sections: RoleSections,
  passwords: Record<string, string>,
): string {
  return sections.roles
    .replaceAll(
      '__APP_MIGRATOR_PASSWORD__',
      quoteLiteral(passwords.APP_MIGRATOR_PASSWORD),
    )
    .replaceAll(
      '__APP_RUNTIME_PASSWORD__',
      quoteLiteral(passwords.APP_RUNTIME_PASSWORD),
    )
    .replaceAll(
      '__AUDIT_MAINTAINER_PASSWORD__',
      quoteLiteral(passwords.AUDIT_MAINTAINER_PASSWORD),
    );
}

export async function withClient<T>(
  connectionString: string,
  fn: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function createDatabase(
  client: pg.Client,
  name: string,
): Promise<void> {
  const existing = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [name],
  );
  if (existing.rowCount) return;
  await client.query(`CREATE DATABASE ${quoteIdent(name)}`);
}
