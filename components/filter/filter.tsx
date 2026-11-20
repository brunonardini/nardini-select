'use client';

import { Popover } from '@base-ui/react/popover';
import { useState, type FormEvent, type ReactNode } from 'react';

import { Button } from '@/components/button/button';
import { Icon } from '@/components/icon/icon';

import styles from './filter.module.css';

function closeOnSubmit(onSubmit: (data: FormData) => void, close: () => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
    close();
  };
}

/** Popover button shared by a listing's filter and sort controls. */
export function ToolbarPopover({
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

export function PopoverForm({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function PopoverActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

/** Filter popover. Fields are submitted together, or cleared at once. */
export function Filter({
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
    <ToolbarPopover
      label={label}
      icon="filter"
      title={title}
      defaultOpen={defaultOpen}
    >
      {(close) => (
        <PopoverForm onSubmit={closeOnSubmit(onSubmit, close)}>
          {children}
          <PopoverActions>
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
          </PopoverActions>
        </PopoverForm>
      )}
    </ToolbarPopover>
  );
}
