import { Button } from '@/components/button/button';

import { signOut } from './actions';

export function SignOutForm() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Sair
      </Button>
    </form>
  );
}
