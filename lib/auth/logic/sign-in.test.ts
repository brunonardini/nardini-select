import { describe, expect, it } from 'vitest';

import { decideSignIn } from './sign-in';

function errorCode(decision: { ok: boolean; error?: string }): string {
  if (!('error' in decision) || decision.ok || !decision.error) {
    throw new Error('expected a refusal');
  }
  return decision.error;
}

const PHOTO = 'https://lh3.googleusercontent.com/a/new';

describe('decideSignIn', () => {
  it('refuses disabled and anonymized users with the same code', () => {
    expect(
      decideSignIn({
        disabledAt: '2026-11-01T00:00:00.000Z',
        anonymizedAt: null,
        currentPhotoUrl: PHOTO,
        nextImage: PHOTO,
      }),
    ).toEqual({ ok: false, error: 'usuario_desabilitado' });
    expect(
      errorCode(
        decideSignIn({
          disabledAt: null,
          anonymizedAt: '2026-11-01T00:00:00.000Z',
          currentPhotoUrl: null,
          nextImage: null,
        }),
      ),
    ).toBe('usuario_desabilitado');
  });

  it('stores a new trusted picture and leaves the current one otherwise', () => {
    expect(
      decideSignIn({
        disabledAt: null,
        anonymizedAt: null,
        currentPhotoUrl: null,
        nextImage: PHOTO,
      }),
    ).toEqual({ ok: true, photoUrl: PHOTO });
    expect(
      decideSignIn({
        disabledAt: null,
        anonymizedAt: null,
        currentPhotoUrl: PHOTO,
        nextImage: PHOTO,
      }),
    ).toEqual({ ok: true, photoUrl: null });
    expect(
      decideSignIn({
        disabledAt: null,
        anonymizedAt: null,
        currentPhotoUrl: PHOTO,
        nextImage: null,
      }),
    ).toEqual({ ok: true, photoUrl: null });
    expect(
      decideSignIn({
        disabledAt: null,
        anonymizedAt: null,
        currentPhotoUrl: null,
        nextImage: 'https://evil.example/a',
      }),
    ).toEqual({ ok: true, photoUrl: null });
  });
});
