import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { AdminNavigation } from './admin-navigation';

const meta = {
  title: 'Components/Admin Navigation',
  component: AdminNavigation,
  args: {
    pathname: '/admin/usuarios/124',
    access: 'administrator',
    name: 'Ana Martins',
    collapsed: false,
    onToggle: () => {},
    signOutAction: fn(),
    children: <h1>Usuários</h1>,
  },
  parameters: {
    viewport: {
      options: {
        adminTablet: {
          name: 'Tablet (834×1194)',
          styles: { width: '834px', height: '1194px' },
          type: 'tablet',
        },
      },
    },
  },
} satisfies Meta<typeof AdminNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  render: function AdjustableSidebar(args) {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <AdminNavigation
        {...args}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('link', { name: 'Usuários' }),
    ).toHaveAttribute('aria-current', 'page');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Recolher menu lateral' }),
    );
    const expand = canvas.getByRole('button', {
      name: 'Expandir menu lateral',
    });
    await expect(expand).toHaveFocus();
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(expand);
    await expect(
      canvas.getByRole('button', { name: 'Recolher menu lateral' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

export const TabletCollapsed: Story = {
  args: { collapsed: true },
  globals: { viewport: { value: 'adminTablet' } },
};

export const MobileDrawer: Story = {
  globals: { viewport: { value: 'mobile' } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Menu' });
    const account = canvas.getByRole('button', { name: /Conta de/ });
    const icon = trigger.querySelector('svg');
    await expect(trigger).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    await expect(icon).toHaveStyle({ width: '18px', height: '18px' });
    for (const circle of [
      icon?.parentElement,
      account.querySelector('.avatar'),
    ]) {
      await expect(circle).toHaveStyle({
        width: '36px',
        height: '36px',
        borderRadius: '50%',
      });
    }
    await userEvent.click(trigger);
    await expect(body.getByRole('dialog', { name: 'Menu' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
  },
};

export const Account: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Conta de/ }));
    const popup = within(canvasElement.ownerDocument.body).getByRole('dialog', {
      name: 'Ana Martins',
    });
    const profile = within(popup).getByText('Perfil');
    const signOut = within(popup).getByRole('button', { name: 'Sair' });
    await expect(profile).toHaveAttribute('href', '/admin/perfil');
    for (const action of [profile, signOut]) {
      await expect(action).toHaveStyle({
        fontSize: '14px',
        fontWeight: '650',
        textDecorationLine: 'none',
      });
      await expect(action.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    }
    await userEvent.click(signOut);
    await waitFor(() => expect(args.signOutAction).toHaveBeenCalled());
  },
};

export const AccountWithOutdatedTerms: Story = {
  args: {
    access: 'terms',
    name: 'Ana Carolina Martins de Albuquerque e Silva',
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Conta de/ }));
    const popup = within(canvasElement.ownerDocument.body).getByRole('dialog', {
      name: /Ana Carolina/,
    });
    await expect(
      within(popup).getByRole('button', { name: 'Sair' }),
    ).toBeVisible();
    await expect(within(popup).queryByText('Perfil')).not.toBeInTheDocument();
  },
};
