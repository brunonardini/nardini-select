import type { AuditAction } from './actions';

const REMOVED = 'Usuário removido';

function person(name: string | null | undefined): string {
  const trimmed = name?.trim() ?? '';
  return trimmed || REMOVED;
}

function label(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** pt-BR sentence. The person's name is joined at display time. */
export function renderAudit(
  action: AuditAction,
  metadata: Record<string, unknown>,
  names: { user?: string | null },
): string {
  const user = person(names.user);
  switch (action) {
    case 'bootstrap.claimed':
      return 'o primeiro admin foi criado';
    case 'user.registered':
      return `${user} entrou no sistema`;
    case 'user.terms_accepted':
      return `aceitou os termos de uso versão ${label(metadata.terms_version)}`;
    case 'user.profile_updated':
      return 'atualizou o perfil';
    case 'user.full_name_updated':
      return `alterou o nome completo de ${user}`;
    case 'user.role_changed':
      return `mudou o papel de ${user} de '${label(metadata.from_role_name)}' para '${label(metadata.to_role_name)}'`;
    case 'user.disabled':
      return `desabilitou ${user}`;
    case 'user.enabled':
      return `habilitou ${user}`;
    case 'user.deleted':
      return 'excluiu um usuário';
    case 'user.anonymized':
      return 'anonimizou um usuário';
    case 'invitation.created':
      return 'criou um convite';
    case 'invitation.canceled':
      return 'cancelou um convite';
    case 'role.created':
      return `criou o papel '${label(metadata.name)}'`;
    case 'role.renamed':
      return `renomeou o papel '${label(metadata.previous_name)}' para '${label(metadata.name)}'`;
    case 'role.deleted':
      return `excluiu o papel '${label(metadata.name)}'`;
  }
}
