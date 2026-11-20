// @vitest-environment node

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DEFAULT_QUERY } from '@/lib/users/logic/list-query';

import { useUserList } from './use-user-list';

function Probe() {
  const list = useUserList({ ...DEFAULT_QUERY, search: 'ana' }, true);
  return createElement(
    'p',
    null,
    `${list.query.search}:${list.query.pageSize}:${list.status}`,
  );
}

describe('useUserList on the server', () => {
  it('keeps the query from the server when there is no window', () => {
    expect(renderToStaticMarkup(createElement(Probe))).toBe(
      '<p>ana:6:loading</p>',
    );
  });
});
