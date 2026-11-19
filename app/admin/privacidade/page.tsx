import { PRIVACY_NOTICE_VERSION } from '@/lib/legal/versions';

export default function PrivacyPage() {
  return (
    <article className="admin-panel admin-legal">
      <h1>Aviso de privacidade</h1>
      <p>
        Versão {PRIVACY_NOTICE_VERSION}. Texto provisório, de 18 de novembro de
        2026.
      </p>
      <p>
        A área interna trata nome, e-mail, identificador da conta Google, foto
        de perfil quando houver, sessão e o registro das ações administrativas.
        A base é a execução dos termos de uso e o interesse legítimo de
        segurança da operação.
      </p>
      <p>
        Esses dados ficam em servidores nos Estados Unidos, operados pela Neon,
        pela Netlify, pelo Google e, para relatórios de erro, pela Sentry. A
        sessão dura no máximo 12 horas sem uso e 7 dias no total. O convite dura
        7 dias. O registro de auditoria é mantido por 6 meses. O texto
        definitivo deste aviso será publicado antes do uso com dados reais.
      </p>
    </article>
  );
}
