'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/button/button';

import { ActionPopover, closeOnSubmit } from './action-popover';
import styles from './toolbar.module.css';

/** Filter popover. Fields are submitted together, or cleared at once. */
export function FiltersAction({
  label,
  title,
  submitLabel,
  clearLabel,
  defaultOpen = false,
  onSubmit,
  onClear,
  children,
}: {
  label: string;
  title: string;
  submitLabel: string;
  clearLabel: string;
  defaultOpen?: boolean;
  onSubmit: (data: FormData) => void;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <ActionPopover
      label={label}
      icon="filter"
      title={title}
      defaultOpen={defaultOpen}
    >
      {(close) => (
        <form className={styles.form} onSubmit={closeOnSubmit(onSubmit, close)}>
          {children}
          <div className={styles.formActions}>
            <Button type="submit">{submitLabel}</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onClear();
                close();
              }}
            >
              {clearLabel}
            </Button>
          </div>
        </form>
      )}
    </ActionPopover>
  );
}
