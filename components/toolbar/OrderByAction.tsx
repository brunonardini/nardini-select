'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/button/button';

import { ActionPopover, closeOnSubmit } from './action-popover';
import styles from './toolbar.module.css';

/** Sort popover. The fields are submitted together. */
export function OrderByAction({
  label,
  title,
  submitLabel,
  defaultOpen = false,
  onSubmit,
  children,
}: {
  label: string;
  title: string;
  submitLabel: string;
  defaultOpen?: boolean;
  onSubmit: (data: FormData) => void;
  children: ReactNode;
}) {
  return (
    <ActionPopover
      label={label}
      icon="sort"
      title={title}
      defaultOpen={defaultOpen}
    >
      {(close) => (
        <form className={styles.form} onSubmit={closeOnSubmit(onSubmit, close)}>
          {children}
          <div className={styles.formActions}>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      )}
    </ActionPopover>
  );
}
