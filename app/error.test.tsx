import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PageError from './error';
import AdminError from './admin/error';

const { reportPageError } = vi.hoisted(() => ({ reportPageError: vi.fn() }));
vi.mock('@/lib/errors/io/report', () => ({ reportPageError }));

describe.each([
  ['public', PageError],
  ['admin', AdminError],
] as const)('%s error boundary', (_, ErrorPage) => {
  it('reports diagnostics, keeps raw errors private and retries on request', () => {
    const error = new Error('private database host and query');
    const retry = vi.fn();
    render(<ErrorPage error={error} retry={retry} />);
    expect(reportPageError).toHaveBeenCalledWith(error);
    expect(
      screen.getByText('Não conseguimos carregar esta página.'),
    ).toBeVisible();
    expect(screen.queryByText(error.message)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('link', { name: 'Voltar ao site' }),
    ).toHaveAttribute('href', '/');
  });
});
