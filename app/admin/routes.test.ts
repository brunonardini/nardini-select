import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { guardedRoutes, publicAdminFiles } from '@/lib/auth/logic/routes';

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) return walk(full);
    return [full];
  });
}

describe('admin routes', () => {
  it('guards every admin page, action, and route that is not public', () => {
    const files = walk(path.join(process.cwd(), 'app/admin'))
      .map((file) => path.relative(process.cwd(), file))
      .filter((file) => /\/(?:page\.tsx|actions\.ts|route\.ts)$/.test(file));
    const guarded = new Set(guardedRoutes.map((route) => route.file));
    const pub = new Set<string>(publicAdminFiles);

    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(path.join(process.cwd(), file), 'utf8');
      if (pub.has(file)) {
        expect(guarded.has(file), file).toBe(false);
        continue;
      }
      expect(guarded.has(file), file).toBe(true);
      expect(source, file).toMatch(/requirePage|withAction|withRoute/);
    }
  });
});
