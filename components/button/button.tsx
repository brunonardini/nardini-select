import { Button as BaseButton } from '@base-ui/react/button';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline';
type LinkProps = Omit<ComponentProps<'a'>, 'className'> & {
  href: string;
  loading?: never;
  loadingLabel?: never;
};
type ActionProps = Omit<BaseButton.Props, 'className' | 'render'> & {
  href?: never;
  /** Disable the action and show the indeterminate paw animation. */
  loading?: boolean;
  /** Accessible text shown while loading; no estimated progress. */
  loadingLabel?: string;
};
export type ButtonProps = (LinkProps | ActionProps) & {
  /** Primary action, quiet secondary action, or outlined action. */
  variant?: Variant;
  className?: string;
  /** Decorative leading icon, replaced by paws while loading. */
  leadingIcon?: ReactNode;
  /** Decorative trailing icon, hidden while loading. */
  trailingIcon?: ReactNode;
};
const isLink = (props: LinkProps | ActionProps): props is LinkProps =>
  typeof props.href === 'string';

function PawLoading() {
  return (
    <span className="button-paws" aria-hidden="true">
      {[0, 1, 2].map((paw) => (
        <span key={paw}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <ellipse
              cx="5"
              cy="9"
              rx="2.7"
              ry="3.5"
              transform="rotate(-25 5 9)"
            />
            <ellipse
              cx="10"
              cy="5"
              rx="2.6"
              ry="3.5"
              transform="rotate(-8 10 5)"
            />
            <ellipse
              cx="16"
              cy="5.5"
              rx="2.6"
              ry="3.5"
              transform="rotate(15 16 5.5)"
            />
            <ellipse
              cx="20"
              cy="10"
              rx="2.6"
              ry="3.5"
              transform="rotate(30 20 10)"
            />
            <path d="M12 11c-2.2 0-3.5 2-4.5 3.5S4 17.2 4.5 19.4c.6 2.7 3.3 2.5 5.1 1.6 1.6-.8 3.2-.8 4.8 0 1.8.9 4.5 1.1 5.1-1.6.5-2.2-2-3.4-3-4.9S14.2 11 12 11Z" />
          </svg>
        </span>
      ))}
    </span>
  );
}

/** Brand action or native link. Loading belongs to actions, never navigation. */
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  const classes = ['button', `button-${variant}`, className]
    .filter(Boolean)
    .join(' ');
  if (isLink(props)) {
    const { leadingIcon, trailingIcon, children, ...linkProps } = props;
    return (
      <a className={classes} {...linkProps}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </a>
    );
  }
  const {
    leadingIcon,
    trailingIcon,
    loading = false,
    loadingLabel = 'Carregando…',
    children,
    ...actionProps
  } = props;
  return (
    <BaseButton
      className={classes}
      {...actionProps}
      disabled={loading || actionProps.disabled}
      aria-busy={loading || actionProps['aria-busy']}
    >
      {loading ? <PawLoading /> : leadingIcon}
      {loading ? loadingLabel : children}
      {loading ? null : trailingIcon}
    </BaseButton>
  );
}
