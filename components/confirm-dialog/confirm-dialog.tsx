'use client';

import { useState } from 'react';

import { Button } from '../button/button';
import { TextField } from '../text-field/text-field';

import { Dialog, DialogClose } from '../dialog/dialog';

type Props = {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  /** When set, the confirm button stays disabled until the field matches. */
  expectedText?: string;
  fields: Record<string, string>;
  action: (formData: FormData) => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline';
};

/** Confirmation dialog. A typed phrase is required only for irreversible erasure. */
export function ConfirmDialog({
  label,
  title,
  description,
  confirmLabel,
  expectedText,
  fields,
  action,
  variant = 'outline',
}: Props) {
  const [typed, setTyped] = useState('');
  const ready = !expectedText || typed === expectedText;

  return (
    <Dialog
      label={label}
      title={title}
      description={description}
      variant={variant}
    >
      <form className="dialog-form" action={action}>
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {expectedText ? (
          <TextField
            label={`Digite “${expectedText}” para confirmar`}
            name="confirmacao"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
          />
        ) : null}
        <div className="dialog-actions">
          <DialogClose>Cancelar</DialogClose>
          <Button type="submit" disabled={!ready}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
