export const ROLE_NAME_MAX = 40;

export const ROLE_NAME_MESSAGE = 'Informe um nome de até 40 caracteres.';
export const ROLE_SYSTEM_MESSAGE = 'O papel admin não pode ser alterado.';
export const ROLE_IN_USE_MESSAGE = 'Este papel ainda tem usuários.';
export const ROLE_TAKEN_MESSAGE = 'Já existe um papel com esse nome.';

export function roleName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name || name.length > ROLE_NAME_MAX) return null;
  return name;
}

export function sameRoleName(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export function canRenameRole(role: { isSystem: boolean }): boolean {
  return !role.isSystem;
}

export function roleErrorText(code: string | undefined): string | null {
  switch (code) {
    case 'invalid_name':
      return ROLE_NAME_MESSAGE;
    case 'system':
      return ROLE_SYSTEM_MESSAGE;
    case 'in_use':
      return ROLE_IN_USE_MESSAGE;
    case 'taken':
      return ROLE_TAKEN_MESSAGE;
    case 'missing':
      return 'Papel não encontrado.';
    default:
      return null;
  }
}

export function canDeleteRole(role: {
  isSystem: boolean;
  userCount: number;
}): boolean {
  return !role.isSystem && role.userCount === 0;
}
