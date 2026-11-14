import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GlobalError from './global-error';

const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }));
vi.mock('@sentry/nextjs', () => ({ captureException }));

describe('GlobalError', () => {
  it('reports the error to Sentry', () => {
    const error = new Error('Render failed');

    // GlobalError renders its own <html>, so mount it into the document.
    render(<GlobalError error={error} />, { container: document });

    expect(captureException).toHaveBeenCalledWith(error);
  });
});
