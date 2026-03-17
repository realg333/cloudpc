'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavBarContentProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export default function NavBarContent({ isLoggedIn, isAdmin }: NavBarContentProps) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  const navClasses = isLanding
    ? 'border-white/10 bg-[#050506]/80 backdrop-blur-md'
    : 'border-gray-200 bg-white';

  const linkBase = isLanding
    ? 'text-slate-300 hover:text-white'
    : 'text-gray-600 hover:text-gray-900';

  const brandClasses = isLanding ? 'text-white' : 'text-gray-900';

  const ctaClasses = isLanding
    ? 'rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 font-semibold text-white hover:from-indigo-400 hover:to-violet-500'
    : 'rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700';

  const adminClasses = isLanding
    ? 'text-indigo-400 hover:text-indigo-300 font-medium'
    : 'text-indigo-600 hover:text-indigo-700 font-medium';

  return (
    <nav
      className={`flex items-center gap-6 border-b px-6 py-4 transition-colors ${navClasses}`}
      role="navigation"
      aria-label="Navegação principal"
    >
      <Link href="/" className={`font-semibold ${brandClasses}`}>
        Cloud Gaming VPS Brazil
      </Link>
      <div className="flex flex-1 gap-4">
        {isLanding ? (
          <Link href="/plans" className={linkBase}>
            Planos
          </Link>
        ) : (
          <>
            <Link href="/" className={linkBase}>
              Início
            </Link>
            {isAdmin && (
              <Link href="/admin" className={adminClasses}>
                Admin
              </Link>
            )}
            <Link href="/plans" className={linkBase}>
              Planos
            </Link>
            <Link href="/dashboard" className={linkBase}>
              Minhas Máquinas
            </Link>
            <Link href="/orders" className={linkBase}>
              Pedidos
            </Link>
            <Link href="/billing" className={linkBase}>
              Cobranças
            </Link>
            <Link href="/profile" className={linkBase}>
              Perfil
            </Link>
          </>
        )}
      </div>
      <div className="flex gap-4">
        {isLoggedIn ? (
          <>
            {isLanding && (
              <Link href="/plans" className={ctaClasses}>
                Ver planos
              </Link>
            )}
            <Link href="/logout" className={linkBase}>
              Sair
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className={linkBase}>
              Entrar
            </Link>
            <Link href="/signup" className={ctaClasses}>
              Criar conta
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
