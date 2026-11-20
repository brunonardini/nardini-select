import type { Metadata } from 'next';

import { Button } from '@/components/button/button';
import { Error404 } from '@/components/error-404/error-404';

import { NotFoundBack } from './not-found-back';

export const metadata: Metadata = {
  title: 'Página não encontrada | Nardini Select',
};

export default function NotFound() {
  return (
    <main className="page-error">
      <Error404>
        <Button href="/">Voltar ao início</Button>
        <NotFoundBack />
      </Error404>
    </main>
  );
}
