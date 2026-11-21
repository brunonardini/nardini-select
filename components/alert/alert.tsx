import type { ComponentProps } from 'react';

import { Icon } from '../icon/icon';

type AlertProps = Omit<ComponentProps<'div'>, 'title' | 'children' | 'role'> & {
  /** Message tone. Defaults to neutral feedback. */
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  /** Override the decorative icon for a failure unrelated to access. */
  icon?: 'error';
  /** Short feedback summary. Keep recovery guidance in children. */
  title: string;
  /** Safe, user-facing explanation and recovery instructions. */
  children: string;
};

const alertIcons = {
  default: 'lock',
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'lock',
} satisfies Record<
  NonNullable<AlertProps['variant']>,
  ComponentProps<typeof Icon>['name']
>;

/** Fluid feedback. The parent owns the width constraint and outer spacing. */
export function Alert({
  variant = 'default',
  icon,
  title,
  children,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      className={['alert', `alert-${variant}`, className]
        .filter(Boolean)
        .join(' ')}
      role={variant === 'info' || variant === 'success' ? 'status' : 'alert'}
    >
      <span className="alert-icon">
        <Icon name={icon ?? alertIcons[variant]} />
      </span>
      <div className="alert-content">
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
