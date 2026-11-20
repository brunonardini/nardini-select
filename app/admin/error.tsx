'use client';

import { useEffect } from 'react';
import { Button } from '@/components/button/button';
import { Error500 } from '@/components/error-500/error-500';
import { reportPageError } from '@/lib/errors/io/report';
import styles from './error.module.css';

export default function AdminError({
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
    <div className={styles.embedded}>
      <Error500>
        <Button onClick={retry}>Tentar novamente</Button>
        <Button href="/" variant="secondary">
          Voltar ao site
        </Button>
      </Error500>
    </div>
  );
}
