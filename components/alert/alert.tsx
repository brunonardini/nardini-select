import type { ComponentProps } from 'react';

import { Icon } from '../icon/icon';

type AlertProps = Omit<ComponentProps<'div'>, 'title' | 'children' | 'role'> & {
  /** Neutral feedback by default; danger uses the approved error colors. */
  variant?: 'default' | 'danger';
  /** Short feedback summary. Keep recovery guidance in children. */
  title: string;
  /** Safe, user-facing explanation and recovery instructions. */
  children: string;
};

/** Fluid feedback. The parent owns the width constraint and outer spacing. */
export function Alert({
  variant = 'default',
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
      role="alert"
    >
      <span className="alert-icon">
        <Icon name="lock" />
      </span>
      <div className="alert-content">
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
