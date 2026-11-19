import { displayNameFromProfile, trustedGooglePhoto } from './photo';

export type GoogleProfile = {
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
};

type SignUpError =
  | 'convite_invalido'
  | 'convite_expirado'
  | 'termos_obrigatorios'
  | 'email_nao_verificado'
  | 'acesso_negado'
  | 'erro';

type InvitationGateStatus =
  'valid' | 'used' | 'canceled' | 'expired' | 'missing';

export type SignUpInvite =
  | { kind: 'absent' }
  | { kind: 'invalid' }
  | {
      kind: 'present';
      id: string;
      status: InvitationGateStatus;
      createdAt: string;
      termsVersion: string;
      privacyVersion: string;
    };

type NewUserFields = {
  name: string;
  image: string | null;
  photoSource: 'provider' | 'none';
  roleId: string | null;
  termsVersion: string | null;
  termsAcceptedAt: string | null;
  privacyNoticeVersion: string | null;
  privacyNoticeAcknowledgedAt: string | null;
  invitedAt: string | null;
  registeredAt: string;
};

export type SignUpDecision =
  | { ok: true; path: 'invitation' | 'first_admin'; fields: NewUserFields }
  | { ok: false; error: SignUpError };

export function decideSignUp(input: {
  profile: GoogleProfile;
  invite: SignUpInvite;
  userCount: number;
  bootstrapEmail: string | null;
  adminRoleId: string;
  currentTermsVersion: string;
  currentPrivacyVersion: string;
  now: Date;
}): SignUpDecision {
  const email = input.profile.email.trim();
  if (!email) return { ok: false, error: 'erro' };
  if (!input.profile.emailVerified) {
    return { ok: false, error: 'email_nao_verificado' };
  }

  const photo = trustedGooglePhoto(input.profile.image);
  const registeredAt = input.now.toISOString();
  const base = {
    name: displayNameFromProfile(input.profile.name, email),
    image: photo,
    photoSource: photo ? ('provider' as const) : ('none' as const),
    registeredAt,
  };

  if (input.invite.kind === 'invalid') {
    return { ok: false, error: 'convite_invalido' };
  }

  if (input.invite.kind === 'present') {
    if (input.invite.status === 'expired') {
      return { ok: false, error: 'convite_expirado' };
    }
    if (input.invite.status !== 'valid') {
      return { ok: false, error: 'convite_invalido' };
    }
    if (
      input.invite.termsVersion !== input.currentTermsVersion ||
      input.invite.privacyVersion !== input.currentPrivacyVersion
    ) {
      return { ok: false, error: 'termos_obrigatorios' };
    }
    return {
      ok: true,
      path: 'invitation',
      fields: {
        ...base,
        roleId: null,
        termsVersion: input.currentTermsVersion,
        termsAcceptedAt: registeredAt,
        privacyNoticeVersion: input.currentPrivacyVersion,
        privacyNoticeAcknowledgedAt: registeredAt,
        invitedAt: input.invite.createdAt,
      },
    };
  }

  const bootstrap = input.bootstrapEmail?.trim().toLowerCase() ?? '';
  if (
    input.userCount === 0 &&
    bootstrap.length > 0 &&
    email.toLowerCase() === bootstrap
  ) {
    return {
      ok: true,
      path: 'first_admin',
      fields: {
        ...base,
        roleId: input.adminRoleId,
        termsVersion: null,
        termsAcceptedAt: null,
        privacyNoticeVersion: null,
        privacyNoticeAcknowledgedAt: null,
        invitedAt: null,
      },
    };
  }

  return { ok: false, error: 'acesso_negado' };
}
