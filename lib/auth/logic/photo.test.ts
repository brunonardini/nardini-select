import { describe, expect, it } from 'vitest';

import { displayNameFromProfile, trustedGooglePhoto } from './photo';

const PHOTO = 'https://lh3.googleusercontent.com/a/picture';

describe('trustedGooglePhoto', () => {
  it('keeps an https picture from the Google host', () => {
    expect(trustedGooglePhoto(PHOTO)).toBe(PHOTO);
  });

  it('rejects anything else', () => {
    expect(trustedGooglePhoto(null)).toBeNull();
    expect(trustedGooglePhoto(undefined)).toBeNull();
    expect(trustedGooglePhoto('')).toBeNull();
    expect(trustedGooglePhoto('not a url')).toBeNull();
    expect(
      trustedGooglePhoto(`http://lh3.googleusercontent.com/a/picture`),
    ).toBeNull();
    expect(trustedGooglePhoto('https://evil.example/a')).toBeNull();
    expect(
      trustedGooglePhoto('https://lh3.googleusercontent.com.evil.example/a'),
    ).toBeNull();
  });
});

describe('displayNameFromProfile', () => {
  it('uses the Google name', () => {
    expect(displayNameFromProfile('  Ana  ', 'ana@example.com')).toBe('Ana');
  });

  it('falls back to the mailbox, then a label', () => {
    expect(displayNameFromProfile('   ', 'ana@example.com')).toBe('ana');
    expect(displayNameFromProfile(null, '   ')).toBe('Convidado');
    expect(displayNameFromProfile(undefined, '@')).toBe('Convidado');
  });
});
