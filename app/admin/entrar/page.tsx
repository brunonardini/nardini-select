import { signInErrorText } from '@/lib/auth/logic/errors';

import { SignInButton } from './sign-in-button';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; error?: string }>;
}) {
  const params = await searchParams;
  const message = signInErrorText(params.erro ?? params.error);

  return (
    <section className="admin-panel">
      <h1>Entrar</h1>
      <p>Use a conta Google autorizada para a área interna.</p>
      {message ? <p role="alert">{message}</p> : null}
      <SignInButton />
    </section>
  );
}
