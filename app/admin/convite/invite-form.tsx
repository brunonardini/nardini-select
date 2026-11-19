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
        <a href="/admin/termos">Termos de uso</a>
        {' e '}
        <a href="/admin/privacidade">aviso de privacidade</a>.
      </p>
      <Button type="submit" disabled={!accepted}>
        Entrar com Google
      </Button>
    </form>
  );
}
