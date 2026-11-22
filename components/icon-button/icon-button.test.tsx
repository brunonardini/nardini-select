import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expect, it, vi } from 'vitest';

import { IconButton } from './icon-button';

it('names the action, forwards its ref and activates from the keyboard', async () => {
  const onClick = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <IconButton
      aria-label="Fechar menu"
      icon={<span>×</span>}
      ref={ref}
      onClick={onClick}
      className="close"
    />,
  );
  const button = screen.getByRole('button', { name: 'Fechar menu' });
  expect(ref.current).toBe(button);
  expect(button).toHaveClass('icon-button', 'close');
  expect(button).toHaveAttribute('type', 'button');
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  expect(onClick).toHaveBeenCalledOnce();
});

it('honors native disabled and type props', () => {
  render(
    <IconButton
      aria-label="Salvar"
      icon={<span>+</span>}
      disabled
      type="submit"
    />,
  );
  const button = screen.getByRole('button', { name: 'Salvar' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('type', 'submit');
});
