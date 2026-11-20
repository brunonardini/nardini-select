import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SelectField } from '@/components/select/select';

import { OrderByAction } from './OrderByAction';

describe('OrderByAction', () => {
  it('submits the sort and closes', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <OrderByAction
        label="Ordenar"
        title="Ordenar equipe"
        submitLabel="Aplicar ordem"
        onSubmit={onSubmit}
      >
        <SelectField
          label="Ordenar por"
          name="ordem"
          defaultValue="pessoa"
          options={[
            { value: 'pessoa', label: 'Pessoa' },
            { value: 'papel', label: 'Papel' },
          ]}
        />
      </OrderByAction>,
    );
    await user.click(screen.getByRole('button', { name: 'Ordenar' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar ordem' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    const data = onSubmit.mock.calls[0][0] as FormData;
    expect(data.get('ordem')).toBe('pessoa');
    expect(
      screen.queryByRole('heading', { name: 'Ordenar equipe' }),
    ).toBeNull();
  });
});
