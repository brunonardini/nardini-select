import { describe, expect, it } from 'vitest';

import { AVATAR_MAX_BYTES, avatarBytesAllowed, avatarFetchUrl } from './avatar';

const PHOTO = 'https://lh3.googleusercontent.com/a/photo';

describe('avatar proxy checks', () => {
  it('accepts only a credential-free Google photo URL', () => {
    expect(avatarFetchUrl(PHOTO)).toBe(PHOTO);
    expect(avatarFetchUrl(null)).toBeNull();
    expect(avatarFetchUrl('')).toBeNull();
    expect(avatarFetchUrl('https://evil.example/a.png')).toBeNull();
    expect(
      avatarFetchUrl('https://user:pass@lh3.googleusercontent.com/a/photo'),
    ).toBeNull();
  });

  it('accepts an image response that was not redirected and fits the limit', () => {
    expect(
      avatarBytesAllowed({
        status: 200,
        redirected: false,
        contentType: 'image/jpeg; charset=binary',
        size: AVATAR_MAX_BYTES,
      }),
    ).toBe(true);
    expect(
      avatarBytesAllowed({
        status: 302,
        redirected: false,
        contentType: 'image/jpeg',
        size: 10,
      }),
    ).toBe(false);
    expect(
      avatarBytesAllowed({
        status: 200,
        redirected: true,
        contentType: 'image/jpeg',
        size: 10,
      }),
    ).toBe(false);
    expect(
      avatarBytesAllowed({
        status: 200,
        redirected: false,
        contentType: 'text/html',
        size: 10,
      }),
    ).toBe(false);
    expect(
      avatarBytesAllowed({
        status: 200,
        redirected: false,
        contentType: null,
        size: 10,
      }),
    ).toBe(false);
    expect(
      avatarBytesAllowed({
        status: 200,
        redirected: false,
        contentType: 'image/png',
        size: 0,
      }),
    ).toBe(false);
    expect(
      avatarBytesAllowed({
        status: 200,
        redirected: false,
        contentType: 'image/png',
        size: AVATAR_MAX_BYTES + 1,
      }),
    ).toBe(false);
  });
});
