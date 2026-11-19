import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { InviteForm } from './invite-form';

describe('InviteForm', () => {
  it('keeps Google sign-in disabled until the terms are accepted', async () => {
    render(<InviteForm token="abc" />);
    const button = screen.getByRole('button', { name: 'Entrar com Google' });

    expect(button).toBeDisabled();
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Li e aceito os termos de uso' }),
    );
    expect(button).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Termos de uso' })).toHaveAttribute(
      'href',
      '/admin/termos',
    );
  });
});
