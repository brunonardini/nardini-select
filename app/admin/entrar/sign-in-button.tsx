'use client';

import { useRef, useState } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { Icon } from '@/components/icon/icon';
import { authClient } from '@/lib/auth/io/client';

import { signInFeedback } from './feedback';
import styles from './sign-in.module.css';

export function SignInButton({
  initialFeedback = null,
}: {
  initialFeedback?: ReturnType<typeof signInFeedback> | null;
}) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);
  const submitting = useRef(false);

  async function signIn() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setFeedback(null);

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
    setFeedback(signInFeedback('erro'));
  }

  return (
    <>
      {feedback ? (
        <Alert
          variant={feedback.variant}
          icon={feedback.icon}
          className={styles.feedback}
          title={feedback.title}
        >
          {feedback.message}
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
