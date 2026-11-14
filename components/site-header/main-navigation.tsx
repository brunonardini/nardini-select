'use client';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { useRef, useState } from 'react';

const links = [
  { href: '#marca', label: 'A marca' },
  { href: '#selecao', label: 'Nossa seleção' },
  { href: '#loja', label: 'Nossa loja' },
  { href: '#contato', label: 'Fale com a gente', className: 'header-contact' },
];

const MENU = 'menu';

/**
 * Main site navigation. Wide screens show the links inline; up to 760px a
 * toggle opens them in a panel under the header. Base UI handles Escape,
 * outside clicks, focus leaving the panel, and focus return.
 */
export function MainNavigation() {
  const [value, setValue] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const open = value === MENU;

  return (
    <NavigationMenu.Root
      ref={root}
      className="navigation"
      aria-label="Navegação principal"
      value={value}
      onValueChange={(next, details) => {
        // The toggle opens on press only, never on hover.
        if (details.reason !== 'trigger-hover') setValue(next);
      }}
    >
      <NavigationMenu.List className="navigation-list">
        {links.map((link) => (
          <NavigationMenu.Item key={link.href} className="navigation-item">
            <NavigationMenu.Link href={link.href} className={link.className}>
              {link.label}
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
        <NavigationMenu.Item value={MENU} className="navigation-menu-item">
          <NavigationMenu.Trigger
            className={'menu-toggle' + (open ? ' is-open' : '')}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            <span />
            <span />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="navigation-panel-links">
            {links.map((link) => (
              <NavigationMenu.Link
                key={link.href}
                href={link.href}
                className={link.className}
                closeOnClick
              >
                {link.label}
              </NavigationMenu.Link>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      {/* Rendered inside the <nav>, so the panel links stay in its landmark. */}
      <NavigationMenu.Portal container={root}>
        <NavigationMenu.Positioner
          // Hangs from the header's bottom edge, overlapping it by 12px.
          anchor={() => root.current?.closest('header') ?? null}
          side="bottom"
          align="end"
          sideOffset={-12}
          collisionPadding={0}
        >
          <NavigationMenu.Popup className="navigation-panel" render={<div />}>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
