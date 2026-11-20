'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';

type Props = {
  label: string;
  title: string;
  description: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
};

/** Modal dialog. The trigger label is the accessible name of the button. */
export function Dialog({
  label,
  title,
  description,
  children,
  variant = 'outline',
}: Props) {
  return (
    <BaseDialog.Root>
      <BaseDialog.Trigger className={`button button-${variant}`}>
        {label}
      </BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="dialog-backdrop" />
        <BaseDialog.Popup className="dialog-popup">
          <BaseDialog.Title className="dialog-title">{title}</BaseDialog.Title>
          <BaseDialog.Description className="dialog-description">
            {description}
          </BaseDialog.Description>
          {children}
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
