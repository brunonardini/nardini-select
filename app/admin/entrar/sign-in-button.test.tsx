import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SignInButton } from './sign-in-button';

const signInSocial = vi.fn();

vi.mock('@/lib/auth/io/client', () => ({
  authClient: {
    signIn: { social: (...args: unknown[]) => signInSocial(...args) },
  },
}));

describe('SignInButton', () => {
  it('starts the Google sign-in', async () => {
    render(<SignInButton />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Entrar com Google' }),
    );
    expect(signInSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/admin',
      errorCallbackURL: '/admin/entrar',
    });
  });
});
