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
    for (const link of [
      screen.getByRole('link', { name: /Termos de uso/ }),
      screen.getByRole('link', { name: /aviso de privacidade/ }),
    ]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.getByRole('link', { name: /Termos de uso/ })).toHaveAttribute(
      'href',
      '/admin/termos',
    );
  });
});
