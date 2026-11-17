import { requiredEnv, withClient } from './sql.ts';

const RUNTIME_TABLE = ['DELETE', 'INSERT', 'SELECT', 'UPDATE'];
const connectionString = requiredEnv('DATABASE_MIGRATION_URL');

type Row = Record<string, string | null>;

function lines(rows: Row[], columns: string[]): string[] {
  return rows
    .map((row) => columns.map((column) => row[column] ?? 'PUBLIC').join(' '))
    .sort();
}

function diff(label: string, actual: string[], expected: string[]): string[] {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const problems: string[] = [];
  for (const line of expected) {
    if (!actualSet.has(line)) problems.push(`${label} missing: ${line}`);
  }
  for (const line of actual) {
    if (!expectedSet.has(line)) problems.push(`${label} unexpected: ${line}`);
  }
  return problems;
}

await withClient(connectionString, async (client) => {
  const tables = await client.query<{ schema: string; name: string }>(`
    SELECT n.nspname AS schema, c.relname AS name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname IN ('public', 'audit')
    ORDER BY 1, 2
  `);

  const expectedTableGrants: string[] = [];
  for (const table of tables.rows) {
    if (table.schema === 'public') {
      for (const privilege of RUNTIME_TABLE) {
        expectedTableGrants.push(
          `public ${table.name} app_runtime ${privilege}`,
        );
      }
    }
    if (table.schema === 'public' && table.name === 'invitations') {
      expectedTableGrants.push('public invitations audit_maintainer DELETE');
      expectedTableGrants.push('public invitations audit_maintainer SELECT');
    }
    if (table.schema === 'audit' && table.name === 'events') {
      expectedTableGrants.push('audit events app_runtime INSERT');
      expectedTableGrants.push('audit events app_runtime SELECT');
      expectedTableGrants.push('audit events audit_maintainer DELETE');
      expectedTableGrants.push('audit events audit_maintainer SELECT');
    }
  }

  const tableGrants = await client.query<Row>(`
    SELECT table_schema, table_name, grantee, privilege_type
    FROM information_schema.role_table_grants
    WHERE grantee IN ('app_runtime', 'audit_maintainer')
      AND table_schema IN ('public', 'audit')
  `);

  const owners = await client.query<Row>(`
    SELECT n.nspname AS schema, c.relname AS name, r.rolname AS owner
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles r ON r.oid = c.relowner
    WHERE c.relkind = 'r'
      AND n.nspname IN ('public', 'audit')
  `);

  const schemaPrivileges = await client.query<Row>(`
    SELECT n.nspname AS schema, r.rolname AS grantee, a.privilege_type
    FROM pg_namespace n
    CROSS JOIN LATERAL aclexplode(n.nspacl) AS a
    LEFT JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname IN ('public', 'audit')
      AND (r.rolname IN ('app_runtime', 'audit_maintainer', 'PUBLIC') OR r.rolname IS NULL)
  `);

  const defaults = await client.query<Row>(`
    SELECT n.nspname AS schema, grantor.rolname AS grantor,
           grantee.rolname AS grantee, a.privilege_type
    FROM pg_default_acl d
    JOIN pg_namespace n ON n.oid = d.defaclnamespace
    JOIN pg_roles grantor ON grantor.oid = d.defaclrole
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS a
    LEFT JOIN pg_roles grantee ON grantee.oid = a.grantee
    WHERE d.defaclobjtype = 'r'
      AND grantor.rolname = 'app_migrator'
  `);

  const databasePrivileges = await client.query<Row>(`
    SELECT r.rolname AS grantee, a.privilege_type
    FROM pg_database d
    CROSS JOIN LATERAL aclexplode(d.datacl) AS a
    LEFT JOIN pg_roles r ON r.oid = a.grantee
    WHERE d.datname = current_database()
      AND (
        r.rolname IN ('app_migrator', 'app_runtime', 'audit_maintainer', 'PUBLIC')
        OR r.rolname IS NULL
      )
  `);

  const problems = [
    ...diff(
      'table grant',
      lines(tableGrants.rows, [
        'table_schema',
        'table_name',
        'grantee',
        'privilege_type',
      ]),
      expectedTableGrants.sort(),
    ),
    ...diff(
      'owner',
      lines(owners.rows, ['schema', 'name', 'owner']),
      tables.rows.map((table) => `${table.schema} ${table.name} app_migrator`),
    ),
    ...diff(
      'schema',
      lines(schemaPrivileges.rows, [
        'schema',
        'grantee',
        'privilege_type',
      ]).filter(
        // Postgres keeps USAGE for PUBLIC on schema public. The provision
        // revokes CREATE, which is the privilege A2 removes.
        (line) => line !== 'public PUBLIC USAGE',
      ),
      [
        'audit audit_maintainer USAGE',
        'audit app_runtime USAGE',
        'public audit_maintainer USAGE',
        'public app_runtime USAGE',
      ],
    ),
    ...diff(
      'default',
      lines(defaults.rows, ['schema', 'grantor', 'grantee', 'privilege_type']),
      [
        'public app_migrator app_runtime DELETE',
        'public app_migrator app_runtime INSERT',
        'public app_migrator app_runtime SELECT',
        'public app_migrator app_runtime UPDATE',
      ],
    ),
    ...diff(
      'database',
      lines(databasePrivileges.rows, ['grantee', 'privilege_type']),
      [
        'app_migrator CONNECT',
        'app_migrator CREATE',
        'app_runtime CONNECT',
        'audit_maintainer CONNECT',
      ],
    ),
  ];

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  }
});
