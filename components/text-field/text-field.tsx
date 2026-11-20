'use client';

import { Field } from '@base-ui/react/field';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<'input'>, 'className' | 'id'> & {
  label: string;
  error?: string;
  description?: string;
};

/** Labeled text input. The server owns the validation message. */
export function TextField({ label, error, description, ...props }: Props) {
  return (
    <Field.Root className="text-field" invalid={Boolean(error)}>
      <Field.Label className="text-field-label">{label}</Field.Label>
      <Field.Control className="text-field-control" {...props} />
      {description ? (
        <Field.Description className="text-field-description">
          {description}
        </Field.Description>
      ) : null}
      {error ? (
        <p className="text-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </Field.Root>
  );
}
