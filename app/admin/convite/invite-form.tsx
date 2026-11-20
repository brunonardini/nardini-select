'use client';

import { useState } from 'react';

import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';

export function InviteForm({ token }: { token: string }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <form
      className="admin-form"
      method="post"
      action={`/admin/convite/${encodeURIComponent(token)}/iniciar`}
    >
      <Checkbox
        name="aceite"
        value="on"
        label="Li e aceito os termos de uso"
        checked={accepted}
        onCheckedChange={setAccepted}
      />
      <p className="admin-links">
        <a href="/admin/termos" target="_blank" rel="noopener noreferrer">
          Termos de uso
          <span className="sr-only"> em uma nova aba</span>
        </a>
        {' e '}
        <a href="/admin/privacidade" target="_blank" rel="noopener noreferrer">
          aviso de privacidade
          <span className="sr-only"> em uma nova aba</span>
        </a>
        .
      </p>
      <Button type="submit" disabled={!accepted}>
        Entrar com Google
      </Button>
    </form>
  );
}
