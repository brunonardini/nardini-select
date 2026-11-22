'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/button/button';

import { ActionDialog, closeOnSubmit } from './action-dialog';
import styles from './toolbar.module.css';

/** Sort dialog. The fields are submitted together. */
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
    <ActionDialog
      label={label}
      icon="sort"
      title={title}
      defaultOpen={defaultOpen}
    >
      {(close) => (
        <form className={styles.form} onSubmit={closeOnSubmit(onSubmit, close)}>
          {children}
          <div className="dialog-actions">
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      )}
    </ActionDialog>
  );
}
