import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileForm } from './profile-form';

vi.mock('./actions', () => ({ saveProfile: vi.fn() }));

describe('ProfileForm', () => {
  it('shows the read-only identity and the photo choice', () => {
    render(
      <ProfileForm
        userId="a1d10000-0000-4000-8000-000000000010"
        displayName="Ana"
        fullName="Ana Silva"
        email="ana@example.com"
        photoSource="none"
        hasGooglePhoto={false}
      />,
    );
    expect(
      screen.getByRole('textbox', { name: 'Nome de exibição' }),
    ).toHaveValue('Ana');
    expect(screen.getByText('ana@example.com')).toBeVisible();
    expect(
      screen.getByRole('radio', { name: 'Foto do Google' }),
    ).toBeDisabled();
    expect(screen.getByText('Não há uma foto do Google salva.')).toBeVisible();
  });

  it('enables the Google photo when one is stored', () => {
    render(
      <ProfileForm
        userId="a1d10000-0000-4000-8000-000000000010"
        displayName="Ana"
        fullName={null}
        email="ana@example.com"
        photoSource="provider"
        hasGooglePhoto
      />,
    );
    expect(screen.getByRole('radio', { name: 'Foto do Google' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'Foto do Google' })).toBeChecked();
  });
});
