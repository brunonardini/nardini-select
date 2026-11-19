const GOOGLE_PHOTO_HOST = 'lh3.googleusercontent.com';

/** Google profile photos are stored only from this host, over HTTPS. */
export function trustedGooglePhoto(
  image: string | null | undefined,
): string | null {
  if (!image) return null;
  try {
    const url = new URL(image);
    if (url.protocol !== 'https:' || url.hostname !== GOOGLE_PHOTO_HOST) {
      return null;
    }
    return image;
  } catch {
    return null;
  }
}

/** Display name from the Google profile, then the mailbox, then a fallback. */
export function displayNameFromProfile(
  name: string | null | undefined,
  email: string,
): string {
  const trimmed = name?.trim() ?? '';
  if (trimmed) return trimmed;
  const local = email.split('@')[0].trim();
  return local || 'Convidado';
}
