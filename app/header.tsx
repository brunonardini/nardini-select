'use client';
import { useEffect, useRef, useState } from 'react';
export default function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  return (
    <header className="site-header">
      <a
        className="brand-link"
        href="#inicio"
        aria-label="Nardini Select — início"
        onClick={() => setOpen(false)}
      >
        <img
          src="/images/logo-horizontal.png"
          width="1938"
          height="563"
          alt="Nardini Select"
        />
      </a>
      <button
        ref={toggle}
        className={'menu-toggle' + (open ? ' is-open' : '')}
        aria-expanded={open}
        aria-controls="navigation"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
      </button>
      <nav
        id="navigation"
        className={'navigation' + (open ? ' is-open' : '')}
        aria-label="Navegação principal"
      >
        <a href="#marca" onClick={() => setOpen(false)}>
          A marca
        </a>
        <a href="#selecao" onClick={() => setOpen(false)}>
          Nossa seleção
        </a>
        <a href="#loja" onClick={() => setOpen(false)}>
          Nossa loja
        </a>
        <a
          href="#contato"
          className="header-contact"
          onClick={() => setOpen(false)}
        >
          Fale com a gente
        </a>
      </nav>
    </header>
  );
}
