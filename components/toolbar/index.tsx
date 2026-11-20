import type { ReactNode } from 'react';

import styles from './toolbar.module.css';

function Content({ children }: { children: ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}

function Actions({ children }: { children: ReactNode }) {
  return <div className={styles.toolbarActions}>{children}</div>;
}

function ToolbarRoot({ children }: { children: ReactNode }) {
  return <div className={styles.toolbar}>{children}</div>;
}

Content.displayName = 'Toolbar.Content';
Actions.displayName = 'Toolbar.Actions';
ToolbarRoot.displayName = 'Toolbar';

/** Full-width bar. Content takes the leftover space; actions stay as wide as their buttons. */
export const Toolbar = Object.assign(ToolbarRoot, {
  Content,
  Actions,
});
