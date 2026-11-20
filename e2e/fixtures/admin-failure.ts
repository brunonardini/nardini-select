import { spawn } from 'node:child_process';
import { once } from 'node:events';

/** An isolated app process; never stop or reconfigure the shared database. */
export async function withAdminFailure(
  kind: 'database' | 'generic',
  port: number,
  run: (url: string) => Promise<void>,
): Promise<void> {
  const url = 'http://localhost:' + port;
  const server = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      env: {
        ...process.env,
        CONTEXT: 'production',
        DATABASE_URL:
          kind === 'database'
            ? 'postgresql://test:test@127.0.0.1:1/nardini_test?connect_timeout=1'
            : 'postgresql://[',
        BETTER_AUTH_URL: url,
        BETTER_AUTH_SECRET: 'error-screen-test-secret-at-least-32-characters',
        NEXT_PUBLIC_SENTRY_DSN: '',
      },
      stdio: 'ignore',
    },
  );
  const exited = once(server, 'exit');
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null)
        throw new Error('Isolated error-screen server stopped.');
      try {
        ready = (await fetch(url + '/images/error-500-sofa.webp')).ok;
      } catch {
        /* Wait for the local server to listen. */
      }
      if (ready) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!ready) throw new Error('Isolated error-screen server did not start.');
    await run(url);
  } finally {
    server.kill('SIGTERM');
    await exited;
  }
}
