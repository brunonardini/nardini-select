import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LocalDateTime } from './local-date-time';

describe('LocalDateTime', () => {
  it('renders a time when the value is an instant', () => {
    render(<LocalDateTime value="2026-06-01T12:00:00.000Z" />);
    expect(screen.getByRole('time')).toHaveAttribute(
      'dateTime',
      '2026-06-01T12:00:00.000Z',
    );
  });

  it('renders a dash for an empty or broken value', () => {
    const { rerender } = render(<LocalDateTime value={null} />);
    expect(screen.getByText('—')).toBeVisible();
    rerender(<LocalDateTime value="not-a-date" />);
    expect(screen.getByText('—')).toBeVisible();
  });
});
