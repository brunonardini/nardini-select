import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignInButton } from './sign-in-button';

const signInSocial = vi.fn();
vi.mock('@/lib/auth/io/client', () => ({
  authClient: {
    signIn: { social: (...args: unknown[]) => signInSocial(...args) },
  },
}));

beforeEach(() => {
  signInSocial.mockReset();
});

describe('SignInButton', () => {
  it('starts Google sign-in and keeps the action busy while redirecting', async () => {
    signInSocial.mockResolvedValue({
      data: { url: 'https://accounts.google.com/' },
      error: null,
    });
    render(<SignInButton />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Entrar com Google' }),
    );
    expect(signInSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/admin',
      errorCallbackURL: '/admin/entrar',
    });
    const button = screen.getByRole('button', {
      name: 'Conectando ao Google…',
    });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('prevents duplicate submissions while the request is pending', async () => {
    signInSocial.mockReturnValue(new Promise(() => {}));
    render(<SignInButton />);
    await userEvent.dblClick(
      screen.getByRole('button', { name: 'Entrar com Google' }),
    );
    expect(signInSocial).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('drops a second sign-in that starts before the button disables', async () => {
    render(<SignInButton />);
    const button = screen.getByRole('button', { name: 'Entrar com Google' });
    signInSocial.mockImplementation(() => {
      // A second activation can land before React commits the disabled state.
      button.click();
      return new Promise(() => {});
    });
    await userEvent.click(button);
    expect(signInSocial).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the safe server error and clears it when retrying', async () => {
    signInSocial.mockReturnValue(new Promise(() => {}));
    render(
      <SignInButton
        initialTitle="Acesso negado"
        initialMessage="Peça um convite ao administrador."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Acesso negado');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Peça um convite ao administrador.',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Entrar com Google' }),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    {
      name: 'provider error',
      result: { error: { message: 'private provider detail' }, data: null },
    },
    { name: 'missing redirect', result: { error: null, data: {} } },
  ])(
    'allows a retry after a $name without exposing response details',
    async ({ result }) => {
      signInSocial.mockResolvedValue(result);
      render(<SignInButton />);
      await userEvent.click(
        screen.getByRole('button', { name: 'Entrar com Google' }),
      );
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Não foi possível entrar. Tente de novo.',
        ),
      );
      expect(
        screen.getByRole('button', { name: 'Entrar com Google' }),
      ).toBeEnabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false');
      expect(
        screen.queryByText('private provider detail'),
      ).not.toBeInTheDocument();
      await userEvent.click(
        screen.getByRole('button', { name: 'Entrar com Google' }),
      );
      expect(signInSocial).toHaveBeenCalledTimes(2);
    },
  );

  it('recovers after a network rejection', async () => {
    signInSocial.mockRejectedValue(new Error('private network detail'));
    render(<SignInButton />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Entrar com Google' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível entrar. Tente de novo.',
    );
    expect(
      screen.getByRole('button', { name: 'Entrar com Google' }),
    ).toBeEnabled();
    expect(
      screen.queryByText('private network detail'),
    ).not.toBeInTheDocument();
  });
});
