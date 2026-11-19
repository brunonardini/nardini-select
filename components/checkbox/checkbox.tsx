'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, type ComponentProps } from 'react';

type Props = {
  label: string;
  className?: string;
} & Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className' | 'id'>;

/** Terms checkbox. Base UI keeps the native input in the form. */
export function Checkbox({ label, className, ...props }: Props) {
  const id = useId();
  const classes = ['checkbox', className].filter(Boolean).join(' ');

  return (
    <label className={classes} htmlFor={id}>
      <BaseCheckbox.Root id={id} className="checkbox-control" {...props}>
        <BaseCheckbox.Indicator className="checkbox-indicator" />
      </BaseCheckbox.Root>
      <span>{label}</span>
    </label>
  );
}
