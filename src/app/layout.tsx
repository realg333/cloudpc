import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import NavBar from '@/components/NavBar';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cloud Gaming VPS Brazil | PC na nuvem com GPU dedicada',
  description:
    'Jogue, edite vídeos e programe em qualquer lugar. PC na nuvem com GPU dedicada, infraestrutura em São Paulo. PIX ou cripto, sem assinatura.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={plusJakarta.variable}>
      <body className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
        <NavBar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
