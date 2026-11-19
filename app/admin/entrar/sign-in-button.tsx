'use client';

import { Button } from '@/components/button/button';
import { authClient } from '@/lib/auth/io/client';

export function SignInButton() {
  return (
    <Button
      type="button"
      onClick={() => {
        void authClient.signIn.social({
          provider: 'google',
          callbackURL: '/admin',
          errorCallbackURL: '/admin/entrar',
        });
      }}
    >
      Entrar com Google
    </Button>
  );
}
