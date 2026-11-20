'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, type ComponentProps } from 'react';

type Props = {
  label: string;
  className?: string;
  /** Keeps the label as the accessible name without showing it. */
  labelHidden?: boolean;
} & Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className' | 'id'>;

/** Brand checkbox. Base UI keeps the native input in the form. */
export function Checkbox({
  label,
  className,
  labelHidden = false,
  ...props
}: Props) {
  const id = useId();
  const classes = ['checkbox', className].filter(Boolean).join(' ');

  return (
    <label className={classes} htmlFor={id}>
      <BaseCheckbox.Root id={id} className="checkbox-control" {...props}>
        <BaseCheckbox.Indicator className="checkbox-indicator" />
      </BaseCheckbox.Root>
      <span className={labelHidden ? 'sr-only' : undefined}>{label}</span>
    </label>
  );
}
