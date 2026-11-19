import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="Li e aceito os termos de uso"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

describe('Checkbox', () => {
  it('toggles and exposes the accessible name', async () => {
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', {
      name: 'Li e aceito os termos de uso',
    });

    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('does not toggle while disabled', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        label="Li e aceito os termos de uso"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
