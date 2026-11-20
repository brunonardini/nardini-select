'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/button/button';

/** Return to the previous page, with a usable fallback for direct visits. */
export function NotFoundBack() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.replace('/');
      }}
    >
      Voltar
    </Button>
  );
}
