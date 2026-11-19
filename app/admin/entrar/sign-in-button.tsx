'use client';

import { useRef, useState } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { Icon } from '@/components/icon/icon';
import { authClient } from '@/lib/auth/io/client';
import { SIGN_IN_ERRORS } from '@/lib/auth/logic/errors';

import styles from './sign-in.module.css';

export function SignInButton({
  initialMessage = null,
  initialTitle = 'Não foi possível entrar',
}: {
  initialMessage?: string | null;
  initialTitle?: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [title, setTitle] = useState(initialTitle);
  const submitting = useRef(false);

  async function signIn() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setMessage(null);

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/admin',
        errorCallbackURL: '/admin/entrar',
      });
      if (!result.error && result.data?.url) return;
    } catch {
      // Keep provider/network details out of the interface; allow another attempt.
    }

    submitting.current = false;
    setPending(false);
    setTitle('Não foi possível entrar');
    setMessage(SIGN_IN_ERRORS.erro);
  }

  return (
    <>
      {message ? (
        <Alert variant="danger" className={styles.feedback} title={title}>
          {message}
        </Alert>
      ) : null}
      <Button
        variant="primary"
        className={styles.action}
        type="button"
        loading={pending}
        loadingLabel="Conectando ao Google…"
        aria-busy={pending}
        leadingIcon={<Icon name="google" />}
        onClick={() => {
          void signIn();
        }}
      >
        Entrar com Google
      </Button>
    </>
  );
}
