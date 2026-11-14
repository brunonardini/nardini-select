import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps } from 'react';

type Variant = 'primary' | 'outline';

type LinkProps = Omit<ComponentProps<'a'>, 'className'> & { href: string };
type ActionProps = Omit<BaseButton.Props, 'className' | 'render'> & {
  href?: never;
};

export type ButtonProps = (LinkProps | ActionProps) & {
  /** Filled café (`primary`) or café outline (`outline`). */
  variant?: Variant;
  className?: string;
};

const isLink = (props: LinkProps | ActionProps): props is LinkProps =>
  typeof props.href === 'string';

/**
 * Brand button. With `href` it renders a plain `<a>`, since Base UI's Button
 * is not meant for links; without it, Base UI's Button (`<button>`, which can
 * stay focusable while disabled).
 */
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  const classes = ['button', `button-${variant}`, className]
    .filter(Boolean)
    .join(' ');

  if (isLink(props)) {
    return <a className={classes} {...props} />;
  }
  return <BaseButton className={classes} {...props} />;
}
