import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './avatar';

describe('Avatar', () => {
  it('shows initials when there is no photo', () => {
    render(<Avatar name="Ana Silva" />);
    expect(screen.getByText('AS')).toBeVisible();
  });

  it('shows the photo without a competing name', () => {
    render(<Avatar name="Ana" src="/images/admin-sign-in-mobile.webp" />);
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'src',
      expect.stringContaining('admin-sign-in-mobile'),
    );
  });
});
