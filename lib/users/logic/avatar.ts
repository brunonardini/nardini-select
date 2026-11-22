import { trustedGooglePhoto } from '@/lib/auth/logic/photo';

export const AVATAR_MAX_BYTES = 1_000_000;
export const AVATAR_TIMEOUT_MS = 5_000;

/** True when the stored photo may be shown through the avatar route. */
export function providerPhotoAvailable(
  photoSource: string | null | undefined,
  photoUrl: string | null | undefined,
): boolean {
  return photoSource === 'provider' && avatarFetchUrl(photoUrl) !== null;
}

/** Stored Google photo URL that the proxy is allowed to fetch. */
export function avatarFetchUrl(
  value: string | null | undefined,
): string | null {
  const trusted = trustedGooglePhoto(value);
  if (!trusted) return null;
  const url = new URL(trusted);
  if (url.username || url.password) return null;
  return trusted;
}

export function avatarBytesAllowed(input: {
  status: number;
  redirected: boolean;
  contentType: string | null;
  size: number;
}): boolean {
  if (input.redirected || input.status !== 200) return false;
  const type = input.contentType?.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!type.startsWith('image/')) return false;
  return input.size > 0 && input.size <= AVATAR_MAX_BYTES;
}
