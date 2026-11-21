'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useState, type ReactNode } from 'react';

type Props = {
  label: string;
  title: string;
  description?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  defaultOpen?: boolean;
  leadingIcon?: ReactNode;
  triggerClassName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
};

/** Modal dialog. The trigger label is the accessible name of the button. */
export function Dialog({
  label,
  title,
  description,
  children,
  variant = 'outline',
  defaultOpen = false,
  leadingIcon,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger
        className={triggerClassName ?? `button button-${variant}`}
      >
        {leadingIcon}
        {label}
      </BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="dialog-backdrop" />
        <BaseDialog.Popup className="dialog-popup">
          <BaseDialog.Title className="dialog-title">{title}</BaseDialog.Title>
          {description ? (
            <BaseDialog.Description className="dialog-description">
              {description}
            </BaseDialog.Description>
          ) : null}
          {typeof children === 'function'
            ? children(() => setOpen(false))
            : children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export function DialogClose({ children }: { children: ReactNode }) {
  return (
    <BaseDialog.Close className="button button-secondary" type="button">
      {children}
    </BaseDialog.Close>
  );
}
