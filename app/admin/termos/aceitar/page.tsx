import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import { requirePage } from '@/lib/auth/io/guard';
import { signInErrorText } from '@/lib/auth/logic/errors';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '@/lib/legal/versions';

import { acceptTerms } from './actions';

export default async function AcceptTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await requirePage({ allow: ['terms_outdated'] });
  const params = await searchParams;
  const message = signInErrorText(params.erro);

  return (
    <section className="admin-panel">
      <h1>Aceite os termos</h1>
      <p>
        Para continuar, aceite os documentos na versão {TERMS_VERSION}. O aviso
        de privacidade está na versão {PRIVACY_NOTICE_VERSION}.
      </p>
      <form className="admin-form" action={acceptTerms}>
        {message ? (
          <Alert variant="danger" title="Não foi possível continuar">
            {message}
          </Alert>
        ) : null}
        <Checkbox
          name="aceite"
          value="on"
          label="Li e aceito os termos de uso"
        />
        <p className="admin-links">
          <a href="/admin/termos" target="_blank" rel="noopener noreferrer">
            Termos de uso
            <span className="sr-only"> em uma nova aba</span>
          </a>
          {' e '}
          <a
            href="/admin/privacidade"
            target="_blank"
            rel="noopener noreferrer"
          >
            aviso de privacidade
            <span className="sr-only"> em uma nova aba</span>
          </a>
          .
        </p>
        <Button type="submit">Continuar</Button>
      </form>
    </section>
  );
}
