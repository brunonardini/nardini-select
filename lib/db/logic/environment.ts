const PRODUCTION_DATABASE = 'nardini_prod';

const SEED_DATABASES = new Set(['nardini_dev', 'nardini_test', 'nardini_stg']);

/** Database name the production context must be connected to. Other contexts are not checked. */
export function expectedDatabaseName(
  context: string | undefined,
): string | null {
  if (context === 'production') return PRODUCTION_DATABASE;
  return null;
}

/** Seed and reset are allowed only on databases that never hold real customer data. */
export function isSeedDatabase(name: string): boolean {
  return SEED_DATABASES.has(name);
}

/** UTC ISO 8601, the form timestamps use once they leave Postgres. */
export function toUtcIso(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new Error('Invalid date.');
  }
  return value.toISOString();
}

/** Converts a Postgres timestamptz text value into a UTC ISO 8601 string. */
export function postgresTimestamptzToIso(value: string): string {
  return toUtcIso(new Date(value));
}
