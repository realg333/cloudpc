import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cloud Gaming VPS Brazil',
  description: 'Aluguel de PCs na nuvem com GPU para jogos e trabalho.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <NavBar />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
