import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Card, CardPlaceholder } from './card';

function renderCard(ui: ReactNode) {
  return render(<ul>{ui}</ul>);
}

describe('Card', () => {
  it('links the title and shows the description and facts', () => {
    renderCard(
      <Card
        title="Ana Souza"
        href="/admin/usuarios/ana"
        description="ana@exemplo.com"
        facts={[
          { key: 'role', label: 'Estoque', value: 'Ativo' },
          { key: 'access', label: 'Último acesso', value: 'Sem registro' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Ana Souza' })).toHaveAttribute(
      'href',
      '/admin/usuarios/ana',
    );
    const card = screen.getByRole('listitem');
    expect(within(card).getByText('ana@exemplo.com')).toBeVisible();
    expect(within(card).getByText('Estoque')).toBeVisible();
    expect(within(card).getByText('Sem registro')).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders a plain title when there is no link or description', () => {
    renderCard(<Card title="Usuário removido" />);
    expect(screen.getByText('Usuário removido').tagName).toBe('SPAN');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('toggles selection from its checkbox', async () => {
    const onSelectedChange = vi.fn();
    const { rerender } = renderCard(
      <Card
        title="Ana Souza"
        selected={false}
        onSelectedChange={onSelectedChange}
      />,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: 'Selecionar Ana Souza',
    });
    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole('listitem')).not.toHaveAttribute('data-selected');
    await userEvent.click(checkbox);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    rerender(
      <ul>
        <Card title="Ana Souza" selected onSelectedChange={onSelectedChange} />
      </ul>,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('listitem')).toHaveAttribute('data-selected');
  });
});

describe('CardPlaceholder', () => {
  it('is hidden from assistive technology', () => {
    renderCard(<CardPlaceholder />);
    expect(screen.getByRole('listitem', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
