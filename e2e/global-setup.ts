import { spawn } from 'node:child_process';

import { loadLocalEnv, withDatabaseName } from './database-env';

function run(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${command} ${args.join(' ')} exited with ${code ?? 'no code'}.`,
          ),
        );
    });
  });
}

export default async function globalSetup(): Promise<void> {
  if (process.env.CI) return;

  loadLocalEnv();
  const migrationUrl = process.env.DATABASE_MIGRATION_URL;
  const runtimeUrl = process.env.DATABASE_URL;
  const provisionUrl = process.env.PROVISION_URL;
  if (!migrationUrl || !runtimeUrl || !provisionUrl) {
    throw new Error(
      'DATABASE_URL, DATABASE_MIGRATION_URL, and PROVISION_URL are required for local E2E.',
    );
  }

  const env = {
    ...process.env,
    DATABASE_MIGRATION_URL: withDatabaseName(migrationUrl),
    DATABASE_URL: withDatabaseName(runtimeUrl),
    PROVISION_CREATE_DATABASES: process.env.PROVISION_CREATE_DATABASES ?? '1',
  };

  await run('npm', ['run', 'db:provision'], env);
  // Drop leftover seed rows so a second local run starts from empty tables.
  await run(
    'node',
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'db/provision/reset.ts'],
    env,
  );
  await run('npm', ['run', 'db:migrate'], env);
  await run('npm', ['run', 'db:seed'], env);
}
