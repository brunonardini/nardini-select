'use client';

import { useEffect } from 'react';
import { Button } from '@/components/button/button';
import { Error500 } from '@/components/error-500/error-500';
import { reportPageError } from '@/lib/errors/io/report';

export default function PageError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    reportPageError(error);
  }, [error]);
  return (
    <main className="page-error">
      <Error500>
        <Button onClick={retry}>Tentar novamente</Button>
        <Button href="/" variant="secondary">
          Voltar ao site
        </Button>
      </Error500>
    </main>
  );
}
