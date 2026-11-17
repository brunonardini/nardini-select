import { readFileSync } from 'node:fs';
import path from 'node:path';

const TEST_DATABASE = 'nardini_test';

/** Loads .env without printing it. Existing variables win, so CI and the shell stay in charge. */
export function loadLocalEnv(): void {
  if (process.env.CI) return;

  let text: string;
  try {
    text = readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  } catch {
    return;
  }

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

/** Points a Postgres URL at another database on the same server. */
export function withDatabaseName(
  connectionString: string,
  database = TEST_DATABASE,
): string {
  const url = new URL(connectionString);
  url.pathname = `/${database}`;
  return url.toString();
}
