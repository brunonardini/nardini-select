import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionWatcher } from './session-watcher';

const getSession = vi.fn();

vi.mock('@/lib/auth/io/client', () => ({
  authClient: { getSession: () => getSession() },
}));

describe('SessionWatcher', () => {
  afterEach(() => {
    getSession.mockReset();
  });

  it('leaves the page when the focused tab has no session', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });
    getSession.mockResolvedValue({ data: null });
    render(<SessionWatcher />);

    window.dispatchEvent(new Event('focus'));
    await vi.waitFor(() => {
      expect(assign).toHaveBeenCalledWith('/admin/entrar');
    });
  });

  it('stays put while the session is still there', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });
    getSession.mockResolvedValue({ data: { user: { id: 'user' } } });
    render(<SessionWatcher />);

    window.dispatchEvent(new Event('focus'));
    await vi.waitFor(() => expect(getSession).toHaveBeenCalled());
    expect(assign).not.toHaveBeenCalled();
  });
});
