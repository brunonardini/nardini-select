import { trustedGooglePhoto } from '@/lib/auth/logic/photo';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '@/lib/legal/versions';

export const DISPLAY_NAME_MAX = 80;
export const FULL_NAME_MAX = 200;

export const LAST_ADMIN_MESSAGE =
  'O sistema precisa de pelo menos um admin ativo.';

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AccountSnapshot = {
  id: string;
  roleId: string | null;
  disabledAt: string | null;
  anonymizedAt: string | null;
};

export type UserChange =
  | { kind: 'update_full_name' }
  | { kind: 'change_role'; roleId: string | null }
  | { kind: 'disable' }
  | { kind: 'enable' }
  | { kind: 'delete' }
  | { kind: 'anonymize' };

export type UserChangeRefusal =
  | 'missing'
  | 'self'
  | 'last_admin'
  | 'anonymized'
  | 'already_disabled'
  | 'not_disabled'
  | 'still_active'
  | 'has_audit';

export type MutationResult =
  { ok: true } | { ok: false; reason: string; message: string };

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export function isActiveAdmin(
  user: AccountSnapshot,
  adminRoleId: string,
): boolean {
  return (
    user.roleId === adminRoleId &&
    user.disabledAt === null &&
    user.anonymizedAt === null
  );
}

/** Pending and disabled users can be removed. An active role must be disabled first. */
export function decideUserChange(input: {
  actorId: string;
  target: AccountSnapshot | null;
  change: UserChange;
  adminRoleId: string;
  activeAdminCount: number;
  actedInAudit: boolean;
}): { ok: true } | { ok: false; reason: UserChangeRefusal } {
  const target = input.target;
  if (!target) return { ok: false, reason: 'missing' };
  if (target.anonymizedAt) return { ok: false, reason: 'anonymized' };
  if (input.change.kind === 'update_full_name') return { ok: true };
  if (input.actorId === target.id) return { ok: false, reason: 'self' };

  const lastAdmin =
    isActiveAdmin(target, input.adminRoleId) && input.activeAdminCount < 2;

  switch (input.change.kind) {
    case 'disable':
      if (target.disabledAt) return { ok: false, reason: 'already_disabled' };
      if (lastAdmin) return { ok: false, reason: 'last_admin' };
      return { ok: true };
    case 'enable':
      if (!target.disabledAt) return { ok: false, reason: 'not_disabled' };
      return { ok: true };
    case 'delete':
      if (target.roleId && !target.disabledAt) {
        return { ok: false, reason: 'still_active' };
      }
      if (input.actedInAudit) return { ok: false, reason: 'has_audit' };
      return { ok: true };
    case 'anonymize':
      if (!target.disabledAt) return { ok: false, reason: 'not_disabled' };
      return { ok: true };
    case 'change_role':
      if (lastAdmin && input.change.roleId !== input.adminRoleId) {
        return { ok: false, reason: 'last_admin' };
      }
      return { ok: true };
  }
}

export function userChangeMessage(reason: UserChangeRefusal): string {
  switch (reason) {
    case 'missing':
      return 'Usuário não encontrado.';
    case 'self':
      return 'Você não pode alterar o próprio acesso.';
    case 'last_admin':
      return LAST_ADMIN_MESSAGE;
    case 'anonymized':
      return 'Um usuário anonimizado não pode ser alterado.';
    case 'already_disabled':
      return 'Esta conta já está desabilitada.';
    case 'not_disabled':
      return 'Desabilite o usuário antes desta ação.';
    case 'still_active':
      return 'Desabilite o usuário antes de excluir.';
    case 'has_audit':
      return 'Este usuário não pode ser excluído porque já realizou ações no sistema.';
  }
}

export function mutationErrorText(code: string | undefined): string | null {
  if (!code) return null;
  const known = knownUserChange(code);
  if (known) return userChangeMessage(known);
  switch (code) {
    case 'invalid_name':
      return 'Informe o nome completo.';
    case 'role_missing':
      return 'Papel não encontrado.';
    case 'confirmation':
      return 'Digite o nome completo para confirmar.';
    case 'photo':
      return 'Escolha a foto do Google ou nenhuma.';
    case 'display_name':
      return `Informe um nome de exibição de até ${DISPLAY_NAME_MAX} caracteres.`;
    default:
      return null;
  }
}

export function knownUserChange(reason: string): UserChangeRefusal | null {
  switch (reason) {
    case 'missing':
    case 'self':
    case 'last_admin':
    case 'anonymized':
    case 'already_disabled':
    case 'not_disabled':
    case 'still_active':
    case 'has_audit':
      return reason;
    default:
      return null;
  }
}

export function personName(value: string, max: number): string | null {
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name || name.length > max) return null;
  return name;
}

export type PhotoChoice = 'provider' | 'none';

/** `none` keeps the stored Google URL so the person can choose it again. */
export function profilePhotoChoice(
  choice: string,
  storedUrl: string | null,
): PhotoChoice | null {
  if (choice === 'none') return 'none';
  if (choice === 'provider' && trustedGooglePhoto(storedUrl)) return 'provider';
  return null;
}

export function profileChanges(input: {
  displayName: string;
  previousDisplayName: string | null;
  photo: PhotoChoice;
  previousPhoto: string;
}): ('display_name' | 'photo_source')[] | null {
  const name = personName(input.displayName, DISPLAY_NAME_MAX);
  if (!name) return null;
  const fields: ('display_name' | 'photo_source')[] = [];
  if (name !== (input.previousDisplayName ?? '').trim()) {
    fields.push('display_name');
  }
  if (input.photo !== input.previousPhoto) fields.push('photo_source');
  return fields;
}

export function avatarInitials(name: string | null | undefined): string {
  const parts = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2);
  const letters = parts.map((part) =>
    part.slice(0, 1).toLocaleUpperCase('pt-BR'),
  );
  return letters.join('') || '?';
}

export function anonymizedEmail(id: string): string {
  return `anonymized+${id}@invalid`;
}

export function confirmationMatches(typed: string, expected: string): boolean {
  return expected.length > 0 && typed === expected;
}

export function userStateLabel(user: {
  anonymizedAt: string | null;
  disabledAt: string | null;
  roleId: string | null;
  termsVersion: string | null;
  privacyNoticeVersion: string | null;
}): string {
  if (user.anonymizedAt) return 'Anonimizado';
  if (user.disabledAt) return 'Desabilitado';
  if (
    user.termsVersion !== TERMS_VERSION ||
    user.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION
  ) {
    return 'Termos desatualizados';
  }
  if (!user.roleId) return 'Pendente';
  return 'Ativo';
}
