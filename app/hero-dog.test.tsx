import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeroDog from './hero-dog';

const rect = (values: Partial<DOMRect>) =>
  ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    ...values,
  }) as DOMRect;

const lineRect = rect({ top: 300, height: 80, right: 600 });
const frameRect = rect({ top: 0, left: 0, height: 900 });

function renderInHero() {
  render(
    <div>
      <h1>
        Mais bem-estar <span className="hero-second-line">começa com</span>
      </h1>
      <div data-testid="frame">
        <HeroDog />
      </div>
    </div>,
  );
  return screen.getByRole('img');
}

describe('HeroDog', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('hero-second-line')) return lineRect;
        if (this.dataset.testid === 'frame') return frameRect;
        return rect({});
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('describes the brand dog for screen readers', () => {
    vi.stubGlobal('innerWidth', 390);

    expect(renderInHero()).toHaveAccessibleName(
      'Weimaraner cinza prateado, o cão que inspira a identidade da Nardini Select',
    );
  });

  it('leaves positioning to CSS up to 1100px wide', () => {
    vi.stubGlobal('innerWidth', 1100);

    expect(renderInHero()).not.toHaveAttribute('style');
  });

  it('aligns the nose with the second heading line on wide screens', () => {
    vi.stubGlobal('innerWidth', 1440);

    const style = renderInHero().style;

    // Nose at 31% of the image height, centered on the line (300 + 80 / 2).
    const noseY = 340;
    const height = (900 - noseY + 2) / 0.69;
    const width = (height * 1507) / 1044;
    expect(parseFloat(style.top)).toBeCloseTo(noseY - height * 0.31, 1);
    expect(parseFloat(style.left)).toBeCloseTo(600 + 32 - width * 0.24, 1);
    expect(parseFloat(style.width)).toBeCloseTo(width, 1);
    expect(style.right).toBe('auto');
    expect(style.bottom).toBe('auto');
  });

  it('leaves positioning to CSS when the heading line is missing', () => {
    vi.stubGlobal('innerWidth', 1440);
    render(<HeroDog />);

    expect(screen.getByRole('img')).not.toHaveAttribute('style');
  });

  it('drops the computed position when the window shrinks', () => {
    vi.stubGlobal('innerWidth', 1440);
    const image = renderInHero();
    expect(image.style.width).not.toBe('');

    vi.stubGlobal('innerWidth', 760);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(image.style.top).toBe('');
    expect(image.style.left).toBe('');
    expect(image.style.width).toBe('');
  });
});
