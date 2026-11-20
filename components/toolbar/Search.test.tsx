import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Search } from './Search';

function SearchField() {
  const [value, setValue] = useState('');
  return (
    <Search
      label="Buscar por nome ou e-mail"
      value={value}
      onChange={setValue}
    />
  );
}

describe('Search', () => {
  it('keeps the typed search', async () => {
    const user = userEvent.setup();
    render(<SearchField />);
    const field = screen.getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    await user.type(field, 'ana');
    expect(field).toHaveValue('ana');
  });
});
