'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useState, type ReactElement, type ReactNode, type Ref } from 'react';

import { Icon } from '../icon/icon';
import { IconButton } from '../icon-button/icon-button';

type Props = {
  label: string;
  title: string;
  description?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  defaultOpen?: boolean;
  leadingIcon?: ReactNode;
  triggerClassName?: string;
  trigger?: ReactElement;
  closeLabel?: string;
  initialFocus?: BaseDialog.Popup.Props['initialFocus'];
  onClose?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  viewportOverlay?: ReactNode;
};

/** Modal dialog. The trigger label is the accessible name of the button. */
export function Dialog({
  label,
  title,
  description,
  children,
  variant = 'outline',
  defaultOpen = false,
  leadingIcon,
  triggerClassName,
  trigger,
  closeLabel,
  initialFocus,
  onClose,
  viewportOverlay,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) onClose?.();
  }

  const heading = (
    <BaseDialog.Title className="dialog-title">{title}</BaseDialog.Title>
  );
  const content = (
    <>
      {closeLabel ? (
        <div className="dialog-heading">
          {heading}
          <BaseDialog.Close
            render={
              <IconButton
                aria-label={closeLabel}
                icon={<Icon name="close" />}
              />
            }
          />
        </div>
      ) : (
        heading
      )}
      {description ? (
        <BaseDialog.Description className="dialog-description">
          {description}
        </BaseDialog.Description>
      ) : null}
      {typeof children === 'function'
        ? children(() => handleOpenChange(false))
        : children}
    </>
  );
  return (
    <BaseDialog.Root open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <BaseDialog.Trigger render={trigger} />
      ) : (
        <BaseDialog.Trigger
          className={triggerClassName ?? `button button-${variant}`}
        >
          {leadingIcon}
          {label}
        </BaseDialog.Trigger>
      )}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="dialog-backdrop" />
        <BaseDialog.Popup
          initialFocus={initialFocus}
          className={viewportOverlay ? 'dialog-popup-viewport' : 'dialog-popup'}
        >
          {viewportOverlay ? (
            <>
              <div className="dialog-popup">{content}</div>
              {viewportOverlay}
            </>
          ) : (
            content
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export function DialogClose({
  children,
  compact,
  ref,
}: {
  children: ReactNode;
  compact?: boolean;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <BaseDialog.Close
      ref={ref}
      className={
        compact
          ? 'button button-secondary button-compact'
          : 'button button-secondary'
      }
      type="button"
    >
      {children}
    </BaseDialog.Close>
  );
}
