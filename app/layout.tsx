import type { Metadata, Viewport } from 'next';
import { brandFont } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nardini Select | Curadoria especializada para cães em Resende, RJ',
  description:
    'Mais bem-estar começa com boas escolhas. Curadoria especializada para cães: produtos selecionados com critério. Conheça nossa loja na Avenida Riachuelo, 350, Liberdade, Resende, RJ.',
  openGraph: {
    title: 'Nardini Select',
    description:
      'Uma escolha com assinatura. Curadoria especializada para cães em Resende, RJ.',
    locale: 'pt_BR',
    type: 'website',
  },
};
export const viewport: Viewport = { themeColor: '#522e24' };
export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={brandFont.variable}>
      <body>{children}</body>
    </html>
  );
}
