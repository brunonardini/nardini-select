'use client';

import { Popover } from '@base-ui/react/popover';
import { useState, type FormEvent, type ReactNode } from 'react';

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

/** Popover button shared by the filter and sort actions. */
export function ActionPopover({
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
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={styles.trigger}>
        <Icon name={icon} />
        {label}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className={styles.positioner}
          align="start"
          sideOffset={8}
          collisionPadding={12}
        >
          <Popover.Popup className={styles.popup}>
            <Popover.Title className={styles.title}>{title}</Popover.Title>
            {children(() => setOpen(false))}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
