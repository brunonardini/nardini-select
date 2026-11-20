import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TextField } from './text-field';

describe('TextField', () => {
  it('names the input from the label and shows an error', () => {
    render(
      <TextField
        label="Nome completo"
        name="full_name"
        error="Informe o nome."
      />,
    );
    expect(
      screen.getByRole('textbox', { name: 'Nome completo' }),
    ).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome.');
  });

  it('shows the description and stays disabled', () => {
    render(
      <TextField label="Nome" description="Como você aparece." disabled />,
    );
    expect(screen.getByText('Como você aparece.')).toBeVisible();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('accepts typing', async () => {
    render(<TextField label="Nome" name="name" />);
    await userEvent.type(screen.getByRole('textbox'), 'Ana');
    expect(screen.getByRole('textbox')).toHaveValue('Ana');
  });
});
