import type { ComponentPropsWithRef, ReactNode } from 'react';

type IconButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-label'
> & {
  'aria-label': string;
  icon: ReactNode;
};

/** Icon-only action with an accessible name and a 44px touch target. */
export function IconButton({
  icon,
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={['icon-button', className].filter(Boolean).join(' ')}
    >
      <span className="icon-button-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
