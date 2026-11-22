import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { saveProfile } from './actions';
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

  it('uses the full name when the display name is empty', () => {
    render(
      <ProfileForm
        userId="a1d10000-0000-4000-8000-000000000010"
        displayName=""
        fullName="Ana Silva"
        email="ana@example.com"
        photoSource="none"
        hasGooglePhoto={false}
      />,
    );
    expect(screen.getByText('AS')).toBeVisible();
  });

  it('shows the save error and then the confirmation', async () => {
    const user = userEvent.setup();
    vi.mocked(saveProfile).mockResolvedValueOnce({
      ok: false,
      reason: 'display_name',
      message: 'Informe um nome.',
    });
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
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Informe um nome.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
    vi.mocked(saveProfile).mockResolvedValueOnce({ ok: true });
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'As alterações foram salvas.',
    );
    expect(screen.queryByText('Informe um nome.')).not.toBeInTheDocument();
  });

  it('shows a photo choice error', async () => {
    const user = userEvent.setup();
    vi.mocked(saveProfile).mockResolvedValue({
      ok: false,
      reason: 'photo',
      message: 'Escolha a foto do Google ou nenhuma.',
    });
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
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(
      await screen.findByText('Escolha Foto do Google ou Sem foto.'),
    ).toBeVisible();
    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
  });

  it('shows a failure that is neither the name nor the photo', async () => {
    const user = userEvent.setup();
    vi.mocked(saveProfile).mockResolvedValue({
      ok: false,
      reason: 'missing',
      message: 'Usuário não encontrado.',
    });
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
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveClass('alert-danger');
    expect(alert).toHaveTextContent('Não foi possível salvar');
    expect(alert).toHaveTextContent('Usuário não encontrado.');
  });
});
