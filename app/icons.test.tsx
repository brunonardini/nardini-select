import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './icons';

describe('Icon', () => {
  it.each(['down', 'pin', 'whatsapp', 'instagram'] as const)(
    'renders the %s icon hidden from assistive technology',
    (name) => {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg?.childElementCount).toBeGreaterThan(0);
    },
  );

  it('forwards extra SVG props', () => {
    const { container } = render(
      <Icon name="whatsapp" className="social-icon" />,
    );

    expect(container.querySelector('svg')).toHaveClass('social-icon');
  });
});
