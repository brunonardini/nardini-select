import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from './alert';

describe('Alert', () => {
  it('announces the error summary and recovery guidance', () => {
    render(
      <Alert variant="danger" title="Acesso negado">
        Use outra conta Google ou peça um convite ao administrador.
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Acesso negado');
    expect(alert).toHaveTextContent(
      'Use outra conta Google ou peça um convite ao administrador.',
    );
    expect(alert.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(alert.querySelector('svg rect')).toBeInTheDocument();
  });

  it('uses a decorative circled exclamation mark for an operational failure', () => {
    render(
      <Alert variant="danger" icon="error" title="Falha ao carregar">
        Tente novamente.
      </Alert>,
    );
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon?.querySelector('circle')).toBeInTheDocument();
  });

  it('forwards layout classes and HTML attributes without making the text a tooltip', () => {
    render(
      <Alert
        title="Não foi possível entrar"
        className="feedback"
        id="sign-in-feedback"
      >
        Tente de novo.
      </Alert>,
    );
    expect(screen.getByRole('alert')).toHaveClass('alert', 'feedback');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'sign-in-feedback');
    expect(screen.getByRole('alert')).not.toHaveAttribute('title');
  });
  it('uses the same neutral default when omitted or explicitly selected', () => {
    const { rerender } = render(
      <Alert title="Aviso">Confira as informações.</Alert>,
    );
    expect(screen.getByRole('alert')).toHaveClass('alert-default');
    expect(screen.getByRole('alert')).not.toHaveClass('alert-danger');
    rerender(
      <Alert variant="default" title="Aviso">
        Confira as informações.
      </Alert>,
    );
    expect(screen.getByRole('alert')).toHaveClass('alert-default');
    rerender(
      <Alert variant="danger" title="Acesso negado">
        Tente outra conta.
      </Alert>,
    );
    expect(screen.getByRole('alert')).toHaveClass('alert-danger');
  });

  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
  ] as const)('renders %s feedback with the %s role', (variant, role) => {
    render(
      <Alert variant={variant} title="Convite">
        Confira os detalhes do convite.
      </Alert>,
    );
    const feedback = screen.getByRole(role);
    expect(feedback).toHaveClass(`alert-${variant}`);
    expect(feedback).toHaveTextContent('Convite');
    expect(feedback).toHaveTextContent('Confira os detalhes do convite.');
    expect(feedback.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
