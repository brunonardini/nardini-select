export const INVITATION_TTL_MS = 30 * 60 * 1000;

const INVITATION_NAME_MAX = 200;

export type InvitationValidity = 'valid' | 'used' | 'canceled' | 'expired';

export function invitationExpiresAt(now: Date): string {
  return new Date(now.getTime() + INVITATION_TTL_MS).toISOString();
}

/** Used, then canceled, then expired. A later state does not hide an earlier one. */
export function invitationValidity(
  invitation: {
    usedAt: string | null;
    canceledAt: string | null;
    expiresAt: string;
  },
  now: Date,
): InvitationValidity {
  if (invitation.usedAt) return 'used';
  if (invitation.canceledAt) return 'canceled';
  const expires = Date.parse(invitation.expiresAt);
  if (Number.isNaN(expires) || expires <= now.getTime()) return 'expired';
  return 'valid';
}

export function invitationName(value: string): string | null {
  const name = value.trim();
  if (!name || name.length > INVITATION_NAME_MAX) return null;
  return name;
}

export function invitationPageError(
  validity: InvitationValidity,
): 'convite_invalido' | 'convite_expirado' | null {
  if (validity === 'valid') return null;
  if (validity === 'expired') return 'convite_expirado';
  return 'convite_invalido';
}
