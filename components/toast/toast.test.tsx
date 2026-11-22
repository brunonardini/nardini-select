import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Notice } from './notice-queue';
import { ToastHost, ToastProvider, useNotice } from './toast';

const copied: Notice = {
  variant: 'success',
  title: 'Link copiado',
  description: 'Envie o link à pessoa convidada.',
};

function Notify({
  notice = copied,
  label = 'Avisar',
}: {
  notice?: Notice;
  label?: string;
}) {
  const add = useNotice();
  return (
    <button type="button" onClick={() => add(notice)}>
      {label}
    </button>
  );
}

function viewport() {
  const element = document.querySelector('.toast-viewport');
  if (!(element instanceof HTMLElement)) throw new Error('missing viewport');
  return element;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast', () => {
  it('shows a notice and closes it', async () => {
    render(
      <ToastProvider>
        <Notify />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Avisar' }));
    expect(screen.getByText('Link copiado')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Link copiado' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('counts a repeated notice on the same card', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Notify />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Avisar' }));
    await user.click(screen.getByRole('button', { name: 'Avisar' }));
    expect(screen.getByText('×2')).toBeVisible();
    expect(screen.getByText('Repetido 2 vezes')).toBeInTheDocument();
  });

  it('requires the provider', () => {
    expect(() => render(<Notify />)).toThrow(
      'useNotice requires ToastProvider',
    );
  });

  it('removes the portal when the provider unmounts', () => {
    const view = render(
      <ToastProvider>
        <ToastHost />
      </ToastProvider>,
    );
    expect(document.querySelector('.toast-viewport')).toBeInTheDocument();
    view.unmount();
    expect(document.querySelector('.toast-viewport')).not.toBeInTheDocument();
  });

  it('returns the portal to the document when the host leaves', () => {
    function Scene({ host }: { host: boolean }) {
      return (
        <ToastProvider>
          {host ? <ToastHost /> : null}
          <Notify />
        </ToastProvider>
      );
    }
    const view = render(<Scene host />);
    const region = viewport();
    expect(region.closest('.toast-host')).not.toBeNull();
    view.rerender(<Scene host={false} />);
    expect(viewport().closest('.toast-host')).toBeNull();
    let node: HTMLElement | null = viewport();
    while (node.parentElement && node.parentElement !== document.body) {
      node = node.parentElement;
    }
    expect(node.parentElement).toBe(document.body);
  });

  it('ignores a non-HTML opener when the host attaches', async () => {
    const user = userEvent.setup();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.tabIndex = 0;
    document.body.append(svg);
    function Scene({ host, origin }: { host: boolean; origin: boolean }) {
      return (
        <ToastProvider>
          <button type="button">Outro</button>
          {origin ? <Notify label="Copiar" /> : null}
          {host ? <ToastHost /> : null}
        </ToastProvider>
      );
    }
    const view = render(<Scene host={false} origin />);
    svg.focus();
    view.rerender(<Scene host origin />);
    expect(document.activeElement).toBe(svg);
    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    view.rerender(<Scene host origin={false} />);
    await user.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Link copiado' }),
      ).not.toBeInTheDocument(),
    );
    expect(document.activeElement).not.toHaveAccessibleName('Outro');
    svg.remove();
  });

  it('keeps the original opener when another host takes the portal', async () => {
    const user = userEvent.setup();
    function Scene({ hosts, origin }: { hosts: number; origin: boolean }) {
      return (
        <ToastProvider>
          <button type="button">Convidar</button>
          <button type="button">Outro</button>
          {origin ? <Notify label="Copiar" /> : null}
          {Array.from({ length: hosts }, (_, index) => (
            <ToastHost key={index} />
          ))}
        </ToastProvider>
      );
    }
    const view = render(<Scene hosts={0} origin />);
    await user.click(screen.getByRole('button', { name: 'Convidar' }));
    view.rerender(<Scene hosts={1} origin />);
    await user.click(screen.getByRole('button', { name: 'Outro' }));
    view.rerender(<Scene hosts={2} origin />);
    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    view.rerender(<Scene hosts={2} origin={false} />);
    await user.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName('Convidar'),
    );
  });

  it('restores focus to the origin inside the open dialog', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <div role="dialog" aria-label="Convite">
          <Notify label="Copiar" />
          <ToastHost />
        </div>
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    await user.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName('Copiar'),
    );
  });

  it('restores focus inside the dialog when the origin is outside it', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Notify label="Fora" />
        <div role="dialog" aria-label="Convite">
          <button type="button">Dentro</button>
          <ToastHost />
        </div>
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Fora' }));
    await user.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName('Dentro'),
    );
  });

  it('restores focus to the control that opened the host', async () => {
    const user = userEvent.setup();
    function Scene({ host, origin }: { host: boolean; origin: boolean }) {
      return (
        <ToastProvider>
          <button type="button">Convidar</button>
          {origin ? <Notify label="Copiar" /> : null}
          {host ? <ToastHost /> : null}
        </ToastProvider>
      );
    }
    const view = render(<Scene host={false} origin />);
    await user.click(screen.getByRole('button', { name: 'Convidar' }));
    view.rerender(<Scene host origin />);
    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    view.rerender(<Scene host origin={false} />);
    await user.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName('Convidar'),
    );
  });

  it('leaves focus alone when nothing can be restored', async () => {
    const user = userEvent.setup();
    function Scene({ origin }: { origin: boolean }) {
      return (
        <ToastProvider>
          <button type="button">Outro</button>
          {origin ? <Notify label="Copiar" /> : null}
        </ToastProvider>
      );
    }
    const view = render(<Scene origin />);
    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    view.rerender(<Scene origin={false} />);
    await user.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Link copiado' }),
      ).not.toBeInTheDocument(),
    );
    expect(document.activeElement).not.toHaveAccessibleName('Outro');
  });

  it('does not record an origin that is not an HTML control', async () => {
    const user = userEvent.setup();
    function KeepFocus() {
      const add = useNotice();
      return (
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            add(copied);
          }}
        >
          Avisar
        </button>
      );
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.tabIndex = 0;
    document.body.append(svg);
    svg.focus();
    render(
      <ToastProvider>
        <KeepFocus />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Avisar' }));
    expect(document.activeElement).toBe(svg);
    expect(screen.getByText('Link copiado')).toBeVisible();
    svg.remove();
  });

  it('keeps a background timeout from pulling focus back', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Notify />
        <button type="button">Outro</button>
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Avisar' }));
    screen.getByRole('button', { name: 'Outro' }).focus();
    await vi.advanceTimersByTimeAsync(4000);
    expect(document.activeElement).toHaveAccessibleName('Outro');
  });

  it('pauses for a mouse pointer and resumes when it leaves', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Notify />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Avisar' }));
    fireEvent.pointerEnter(viewport(), { pointerType: 'touch' });
    await vi.advanceTimersByTimeAsync(3999);
    expect(screen.getByRole('dialog', { name: 'Link copiado' })).toBeVisible();
    fireEvent.pointerEnter(viewport(), { pointerType: 'mouse' });
    await vi.advanceTimersByTimeAsync(10000);
    expect(screen.getByRole('dialog', { name: 'Link copiado' })).toBeVisible();
    fireEvent.pointerLeave(viewport());
    await vi.advanceTimersByTimeAsync(4000);
    expect(
      screen.queryByRole('dialog', { name: 'Link copiado' }),
    ).not.toBeInTheDocument();
  });

  it('pauses while focus stays in the stack and resumes when it leaves', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Notify />
        <Notify
          label="Avisar de novo"
          notice={{
            variant: 'warning',
            title: 'Convite perto de expirar',
            description: 'O link vence em menos de 2 minutos.',
          }}
        />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Avisar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Avisar de novo' }));
    screen.getByRole('button', { name: 'Fechar: Link copiado' }).focus();
    screen
      .getByRole('button', { name: 'Fechar: Convite perto de expirar' })
      .focus();
    await vi.advanceTimersByTimeAsync(10000);
    expect(screen.getByRole('dialog', { name: 'Link copiado' })).toBeVisible();
    screen.getByRole('button', { name: 'Avisar' }).focus();
    await vi.advanceTimersByTimeAsync(4000);
    expect(
      screen.queryByRole('dialog', { name: 'Link copiado' }),
    ).not.toBeInTheDocument();
  });

  it('stops Escape from leaving the notice and lets other keys through', async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    render(
      <div
        onKeyDown={(event) => {
          seen.push(event.key);
        }}
      >
        <ToastProvider>
          <Notify />
        </ToastProvider>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Avisar' }));
    const close = screen.getByRole('button', { name: 'Fechar: Link copiado' });
    fireEvent.keyDown(close, { key: 'a' });
    fireEvent.keyDown(close, { key: 'Escape' });
    expect(seen).toContain('a');
    expect(seen).not.toContain('Escape');
  });
});
