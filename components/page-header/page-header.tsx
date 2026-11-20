import type { ReactNode } from 'react';

import styles from './page-header.module.css';

/** Page heading. The action, when present, sits on the right. */
export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      {action}
    </header>
  );
}
