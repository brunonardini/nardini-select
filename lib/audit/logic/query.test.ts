import { describe, expect, it } from 'vitest';

import {
  auditHref,
  decodeAuditCursor,
  encodeAuditCursor,
  parseAuditQuery,
} from './query';

const ID = 'a1d10000-0000-4000-8000-000000000010';

describe('audit query', () => {
  it('keeps valid filters and drops values that are not ids, actions, or days', () => {
    const parsed = parseAuditQuery({
      ator: ID,
      acao: 'user.disabled',
      entidade: 'user',
      entidade_id: [ID],
      de: '2026-06-01',
      ate: '2026-06-02',
      cursor: '',
    });
    expect(parsed.filters).toEqual({
      actorId: ID,
      action: 'user.disabled',
      entityType: 'user',
      entityId: ID,
      from: '2026-06-01',
      to: '2026-06-02',
    });
    expect(parsed.range).toEqual({
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-03T00:00:00.000Z',
    });
    expect(parsed.cursor).toBeNull();
  });

  it('rejects an inverted range and a day that does not exist', () => {
    expect(
      parseAuditQuery({ de: '2026-06-02', ate: '2026-06-01' }).range,
    ).toBeNull();
    expect(parseAuditQuery({ de: '2026-02-31' }).filters.from).toBeNull();
    expect(parseAuditQuery({ de: '2026-13-01' }).filters.from).toBeNull();
    expect(parseAuditQuery({ de: '06-01-2026' }).filters.from).toBeNull();
    expect(
      parseAuditQuery({ acao: 'nope', entidade: 'other', ator: 'x' }).filters,
    ).toMatchObject({ actorId: null, action: null, entityType: null });
  });

  it('round-trips a cursor and ignores a broken one', () => {
    const cursor = { occurredAt: '2026-06-01T12:00:00.000Z', id: ID };
    const encoded = encodeAuditCursor(cursor);
    expect(decodeAuditCursor(encoded)).toEqual(cursor);
    expect(decodeAuditCursor('%%%')).toBeNull();
    expect(
      decodeAuditCursor(encodeAuditCursor({ occurredAt: 'nope', id: ID })),
    ).toBe(null);
    expect(
      decodeAuditCursor(
        Buffer.from(
          JSON.stringify({ occurredAt: cursor.occurredAt }),
          'utf8',
        ).toString('base64url'),
      ),
    ).toBeNull();
    expect(
      decodeAuditCursor(Buffer.from('null', 'utf8').toString('base64url')),
    ).toBeNull();
    expect(parseAuditQuery({ cursor: encoded }).cursor).toEqual(cursor);
  });

  it('builds a stable filter link', () => {
    expect(
      auditHref(
        {
          actorId: null,
          action: null,
          entityType: null,
          entityId: null,
          from: null,
          to: null,
        },
        null,
      ),
    ).toBe('/admin/auditoria');
    expect(
      auditHref(
        {
          actorId: ID,
          action: 'role.created',
          entityType: 'role',
          entityId: ID,
          from: '2026-06-01',
          to: '2026-06-01',
        },
        { occurredAt: '2026-06-01T12:00:00.000Z', id: ID },
      ),
    ).toContain('acao=role.created');
  });
});
