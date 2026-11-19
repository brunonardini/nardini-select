import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SignOutForm } from './sign-out-form';

vi.mock('./actions', () => ({
  signOut: vi.fn(),
}));

describe('SignOutForm', () => {
  it('offers a sign-out button', () => {
    render(<SignOutForm />);
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });
});
