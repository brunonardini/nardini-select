'use client';

import { useNotice } from '@/components/toast/toast';

export function useCopyInviteLink() {
  const notice = useNotice();

  return async (link: string, origin: HTMLElement) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      notice(
        {
          variant: 'danger',
          title: 'Não foi possível copiar',
          description: 'Selecione o link e copie manualmente.',
        },
        origin,
      );
      return;
    }
    notice(
      {
        variant: 'success',
        title: 'Link copiado',
        description: 'Envie o link à pessoa convidada.',
      },
      origin,
    );
  };
}
