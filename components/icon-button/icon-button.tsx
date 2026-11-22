import type { ComponentPropsWithRef, ReactNode } from 'react';

type IconButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-label'
> & {
  'aria-label': string;
  icon: ReactNode;
  /** Small matches the admin header avatar and fits dismiss actions. */
  size?: 'normal' | 'small';
};

/** Icon-only action with a required accessible name. */
export function IconButton({
  icon,
  size = 'normal',
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        'icon-button',
        size === 'small' && 'icon-button-small',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="icon-button-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
