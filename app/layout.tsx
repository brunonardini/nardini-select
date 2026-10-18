import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/manrope';
import './globals.css';
export const metadata: Metadata = {
  title: 'Nardini Select Pet Shop | Resende, RJ',
  description:
    'Mais bem-estar começa com boas escolhas. Qualidade, especialização e curadoria para seu pet. Conheça nossa loja na Avenida Riachuelo, 350, Liberdade, Resende, RJ.',
  openGraph: {
    title: 'Nardini Select Pet Shop',
    description:
      'Uma escolha com assinatura. Conheça nossa loja em Resende, RJ.',
    locale: 'pt_BR',
    type: 'website',
  },
};
export const viewport: Viewport = { themeColor: '#542e20' };
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
