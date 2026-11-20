'use client';

import { Field } from '@base-ui/react/field';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<'input'>, 'className' | 'id'> & {
  label: string;
  error?: string;
  description?: string;
  /** Decorative icon displayed inside the input on the left. */
  leadingIcon?: ReactNode;
};

/** Labeled text input. The server owns the validation message. */
export function TextField({
  label,
  error,
  description,
  leadingIcon,
  ...props
}: Props) {
  return (
    <Field.Root className="text-field" invalid={Boolean(error)}>
      <Field.Label className="text-field-label">{label}</Field.Label>
      <div className="text-field-input">
        {leadingIcon ? (
          <span className="text-field-leading-icon" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <Field.Control className="text-field-control" {...props} />
      </div>
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
