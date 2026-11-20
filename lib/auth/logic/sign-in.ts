import { trustedGooglePhoto } from './photo';

/**
 * Better Auth answers a social sign-in with JSON plus a Location header.
 * A browser form only leaves the page for an absolute http(s) redirect.
 */
export function socialSignInLocation(location: string | null): string | null {
  if (!location) return null;
  try {
    const url = new URL(location);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export type SignInDecision =
  | { ok: false; error: 'usuario_desabilitado' }
  | { ok: true; photoUrl: string | null };

/**
 * Disabled and anonymized users share one error, so the page does not reveal
 * which state applies. A missing or untrusted picture does not clear a photo
 * that is already stored.
 */
export function decideSignIn(input: {
  disabledAt: string | null;
  anonymizedAt: string | null;
  currentPhotoUrl: string | null;
  nextImage: string | null;
}): SignInDecision {
  if (input.disabledAt || input.anonymizedAt) {
    return { ok: false, error: 'usuario_desabilitado' };
  }
  const next = trustedGooglePhoto(input.nextImage);
  if (!next || next === input.currentPhotoUrl)
    return { ok: true, photoUrl: null };
  return { ok: true, photoUrl: next };
}
