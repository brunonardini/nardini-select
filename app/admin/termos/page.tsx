import { TERMS_VERSION } from '@/lib/legal/versions';

export default function TermsPage() {
  return (
    <article className="admin-panel admin-legal">
      <h1>Termos de uso</h1>
      <p>
        Versão {TERMS_VERSION}. Texto provisório, de 18 de novembro de 2026.
      </p>
      <p>
        A área interna da Nardini Select é de uso das pessoas autorizadas pela
        loja. O acesso é feito com uma conta Google. Ao entrar, você confirma
        que leu estes termos e o aviso de privacidade.
      </p>
      <p>
        Os dados informados no cadastro são usados para identificar quem acessa
        a área e registrar as ações administrativas. O texto definitivo destes
        termos será publicado antes do uso com dados reais.
      </p>
    </article>
  );
}
