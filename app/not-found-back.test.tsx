import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotFoundBack } from './not-found-back';

const { back, replace } = vi.hoisted(() => ({
  back: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ back, replace }) }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('NotFoundBack', () => {
  it('returns to the previous history entry', () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(2);
    render(<NotFoundBack />);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(back).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
  });
  it('returns home when a direct visit has no previous entry', () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
    render(<NotFoundBack />);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(replace).toHaveBeenCalledWith('/');
    expect(back).not.toHaveBeenCalled();
  });
});
