import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const emptyServerOnly = pathToFileURL(
  path.join(root, 'node_modules/server-only/empty.js'),
).href;

function projectFile(specifier: string): string | null {
  if (!specifier.startsWith('@/')) return null;
  const base = path.join(root, specifier.slice(2));
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mts`,
    path.join(base, 'index.ts'),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') {
      return { url: emptyServerOnly, shortCircuit: true };
    }
    const file = projectFile(specifier);
    if (file) {
      return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
