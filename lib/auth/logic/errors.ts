export const SIGN_IN_ERRORS = {
  convite_invalido: 'Este convite não é válido.',
  convite_expirado: 'Este convite expirou.',
  termos_obrigatorios: 'Aceite os termos de uso para entrar.',
  email_nao_verificado: 'O e-mail da conta Google não está verificado.',
  acesso_negado:
    'Esta conta não tem acesso. Peça um convite a um administrador.',
  usuario_desabilitado: 'Esta conta está desabilitada.',
  erro: 'Não foi possível entrar. Tente de novo.',
} as const;

type SignInError = keyof typeof SIGN_IN_ERRORS;

const CODES = new Set<string>(Object.keys(SIGN_IN_ERRORS));

/** Fixed pt-BR text for `?erro=`. Any unknown code uses the generic text. */
export function signInErrorText(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  if (CODES.has(code)) return SIGN_IN_ERRORS[code as SignInError];
  return SIGN_IN_ERRORS.erro;
}
