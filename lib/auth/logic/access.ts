export type ViewerState = 'terms_outdated' | 'pending' | 'active';

export type Viewer = {
  id: string;
  email: string;
  displayName: string | null;
  fullName: string | null;
  /** A trusted Google photo the avatar route can serve. */
  photo: boolean;
  roleId: string | null;
  isAdmin: boolean;
  state: ViewerState;
  termsAcceptedAt: string | null;
  sessionCreatedAt: string;
};

export type AccessOptions = {
  allow: readonly ViewerState[];
  adminOnly?: boolean;
};

export type AccessDecision =
  | { kind: 'sign_in' }
  | { kind: 'redirect'; to: string }
  | { kind: 'forbidden' }
  | { kind: 'allow' };

export const MAX_SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Same-origin photo for the account menu. The avatar route refuses a
 * viewer whose terms are outdated, so that state keeps the initials.
 */
export function accountAvatarSrc(
  viewer: Pick<Viewer, 'id' | 'photo' | 'state'>,
): string | null {
  if (!viewer.photo || viewer.state === 'terms_outdated') return null;
  return `/admin/api/avatar/${viewer.id}`;
}

const DESTINATION: Record<ViewerState, string> = {
  terms_outdated: '/admin/termos/aceitar',
  pending: '/admin',
  active: '/admin',
};

export function viewerState(input: {
  roleId: string | null;
  termsVersion: string | null;
  privacyNoticeVersion: string | null;
  currentTermsVersion: string;
  currentPrivacyVersion: string;
}): ViewerState {
  if (
    input.termsVersion !== input.currentTermsVersion ||
    input.privacyNoticeVersion !== input.currentPrivacyVersion
  ) {
    return 'terms_outdated';
  }
  if (!input.roleId) return 'pending';
  return 'active';
}

export function sessionWithinLimit(createdAt: string, now: Date): boolean {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return now.getTime() - created <= MAX_SESSION_AGE_MS;
}

export function decideAccess(
  viewer: Viewer | null,
  options: AccessOptions,
  now: Date,
): AccessDecision {
  if (!viewer || !sessionWithinLimit(viewer.sessionCreatedAt, now)) {
    return { kind: 'sign_in' };
  }
  if (!options.allow.includes(viewer.state)) {
    return { kind: 'redirect', to: DESTINATION[viewer.state] };
  }
  if (options.adminOnly && !viewer.isAdmin) return { kind: 'forbidden' };
  return { kind: 'allow' };
}

/** Non-GET route handlers accept same-origin fetches or a matching Origin. */
export function allowsMutationOrigin(input: {
  method: string;
  secFetchSite: string | null;
  origin: string | null;
  siteUrl: string;
}): boolean {
  const method = input.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD') return true;
  if (input.secFetchSite === 'same-origin') return true;
  if (!input.origin) return false;
  try {
    return new URL(input.origin).origin === new URL(input.siteUrl).origin;
  } catch {
    return false;
  }
}
