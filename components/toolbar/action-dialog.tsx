'use client';

import type { FormEvent, ReactNode } from 'react';

import { Dialog } from '@/components/dialog/dialog';
import { Icon } from '@/components/icon/icon';

import styles from './toolbar.module.css';

export function closeOnSubmit(
  onSubmit: (data: FormData) => void,
  close: () => void,
) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
    close();
  };
}

/** Modal button shared by the filter and sort actions. */
export function ActionDialog({
  label,
  icon,
  title,
  defaultOpen = false,
  children,
}: {
  label: string;
  icon: 'filter' | 'sort';
  title: string;
  defaultOpen?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  return (
    <Dialog
      label={label}
      title={title}
      defaultOpen={defaultOpen}
      leadingIcon={<Icon name={icon} />}
      triggerClassName={styles.trigger}
    >
      {children}
    </Dialog>
  );
}
