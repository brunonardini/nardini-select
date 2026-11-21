import type { SIGN_IN_ERRORS } from '@/lib/auth/logic/errors';

type Feedback = {
  variant: 'danger' | 'warning';
  icon?: 'error';
  title: string;
  message: string;
};

const feedback = {
  acesso_negado: {
    variant: 'danger',
    title: 'Acesso negado',
    message: 'Use outra conta Google ou peça um convite a um administrador.',
  },
  usuario_desabilitado: {
    variant: 'danger',
    title: 'Conta desabilitada',
    message: 'Fale com um administrador para verificar seu acesso.',
  },
  convite_invalido: {
    variant: 'danger',
    title: 'Convite indisponível',
    message:
      'Peça um novo link a um administrador se ainda precisar de acesso.',
  },
  convite_expirado: {
    variant: 'warning',
    title: 'Convite expirado',
    message: 'Peça um novo link a um administrador para continuar.',
  },
  termos_obrigatorios: {
    variant: 'warning',
    title: 'Aceite os termos para continuar',
    message: 'Abra o link do convite e marque a caixa de aceite.',
  },
  email_nao_verificado: {
    variant: 'warning',
    title: 'Verifique seu e-mail do Google',
    message:
      'Verifique o endereço da conta Google ou use outra conta com e-mail verificado.',
  },
  erro: {
    variant: 'danger',
    icon: 'error',
    title: 'Não foi possível entrar',
    message: 'Tente entrar com o Google novamente.',
  },
} satisfies Record<keyof typeof SIGN_IN_ERRORS, Feedback>;

export function signInFeedback(code: string): Feedback {
  return Object.hasOwn(feedback, code)
    ? feedback[code as keyof typeof feedback]
    : feedback.erro;
}
