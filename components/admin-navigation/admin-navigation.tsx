'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Popover } from '@base-ui/react/popover';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useState, type ReactNode } from 'react';

import { adminActionFont } from '@/app/fonts';
import { Avatar } from '@/components/avatar/avatar';
import { Icon } from '@/components/icon/icon';

import styles from './admin-navigation.module.css';

const destinations = [
  { href: '/admin', label: 'Início', icon: 'home' },
  { href: '/admin/usuarios', label: 'Usuários', icon: 'users' },
  { href: '/admin/papeis', label: 'Papéis', icon: 'roles' },
  { href: '/admin/auditoria', label: 'Auditoria', icon: 'history' },
] as const;

type Props = {
  pathname: string;
  access: 'administrator' | 'staff' | 'pending' | 'terms';
  name: string | null;
  collapsed: boolean;
  onToggle: () => void;
  signOutAction: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
};

function Links({
  pathname,
  access,
  compact,
  onSelect,
}: {
  pathname: string;
  access: Props['access'];
  compact?: boolean;
  onSelect?: () => void;
}) {
  const links =
    access === 'administrator' ? destinations : destinations.slice(0, 1);
  return links.map(({ href, label, icon }) => {
    const current =
      pathname === href ||
      (href !== '/admin' && pathname.startsWith(href + '/'));
    return (
      <Link
        key={href}
        href={href}
        onNavigate={onSelect}
        onClick={pathname === href ? onSelect : undefined}
        className={styles.destination}
        aria-current={current ? 'page' : undefined}
        title={compact ? label : undefined}
      >
        <Icon name={icon} />
        <span className={compact ? 'sr-only' : undefined}>{label}</span>
      </Link>
    );
  });
}

function MobileDrawer({
  pathname,
  access,
}: Pick<Props, 'pathname' | 'access'>) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 700px)');
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }
    wide.addEventListener('change', closeOnDesktop);
    return () => wide.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={styles.mobileTrigger} aria-label="Menu">
        <span className={styles.menuCircle}>
          <Icon name="menu" />
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.drawer}>
          <div className={styles.drawerHeader}>
            <Dialog.Title className={styles.drawerTitle}>Menu</Dialog.Title>
            <Dialog.Close className={styles.close}>
              <Icon name="close" />
              Fechar
            </Dialog.Close>
          </div>
          <nav aria-label="Administração">
            <Links
              pathname={pathname}
              access={access}
              onSelect={() => setOpen(false)}
            />
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const accessLabels = {
  administrator: 'Administrador',
  staff: 'Funcionário',
  pending: 'Cadastro pendente',
  terms: 'Termos desatualizados',
};

export function AdminNavigation({
  pathname,
  access,
  name,
  collapsed,
  onToggle,
  signOutAction,
  children,
}: Props) {
  const linksId = useId();
  const showNav = access !== 'terms';
  const toggleLabel = collapsed
    ? 'Expandir menu lateral'
    : 'Recolher menu lateral';
  const accountLabel = name ?? 'Minha conta';
  return (
    <div
      className={styles.shell}
      data-sidebar={
        showNav ? (collapsed ? 'collapsed' : 'expanded') : undefined
      }
    >
      <header className={styles.header}>
        {showNav && (
          <MobileDrawer
            key={`drawer:${pathname}`}
            pathname={pathname}
            access={access}
          />
        )}
        <Link
          className={styles.brand}
          href={showNav ? '/admin' : '/admin/termos/aceitar'}
          aria-label="Nardini Select Admin"
        >
          <Image
            src="/images/admin-signature.png"
            alt=""
            width={1200}
            height={301}
            sizes="(max-width: 699px) 139px, 199px"
            preload
          />
        </Link>
        <Popover.Root key={`account:${pathname}`}>
          <Popover.Trigger className={styles.account}>
            <span className="sr-only">Conta de {accountLabel} </span>
            <Avatar name={name} announceInitials />
            <span className={styles.identity}>
              <strong>{accountLabel}</strong>
              <small>{accessLabels[access]}</small>
            </span>
            <Icon className={styles.accountChevron} name="chevron" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner
              align="end"
              sideOffset={8}
              collisionPadding={12}
              className={styles.positioner}
            >
              <Popover.Popup
                className={`${styles.accountPopup} ${adminActionFont.variable}`}
              >
                <Popover.Title className={styles.accountTitle}>
                  {accountLabel}
                </Popover.Title>
                <small className={styles.accountRole}>
                  {accessLabels[access]}
                </small>
                <div>
                  {showNav && (
                    <Popover.Close
                      className={styles.accountAction}
                      nativeButton={false}
                      render={<Link href="/admin/perfil" />}
                      aria-current={
                        pathname === '/admin/perfil' ? 'page' : undefined
                      }
                    >
                      <Icon name="profile" />
                      Perfil
                    </Popover.Close>
                  )}
                  <form action={signOutAction}>
                    <button className={styles.accountAction} type="submit">
                      <Icon name="sign-out" />
                      Sair
                    </button>
                  </form>
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </header>
      {showNav && (
        <nav className={styles.sidebar} aria-label="Administração">
          <div className={styles.sideHeading}>
            {!collapsed && <span>Área interna</span>}
            <button
              type="button"
              className={styles.toggle}
              aria-label={toggleLabel}
              title={toggleLabel}
              aria-expanded={!collapsed}
              aria-controls={linksId}
              onClick={onToggle}
            >
              <Icon name="collapse" />
            </button>
          </div>
          <div id={linksId}>
            <Links pathname={pathname} access={access} compact={collapsed} />
          </div>
        </nav>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
