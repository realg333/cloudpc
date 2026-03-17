import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';

export default async function NavBar() {
  const session = await getSessionFromCookies();

  return (
    <nav className="flex items-center gap-6 border-b border-gray-200 bg-white px-6 py-4">
      <Link href="/" className="font-semibold text-gray-900">
        Cloud Gaming VPS Brazil
      </Link>
      <div className="flex flex-1 gap-4">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          Dashboard
        </Link>
        {session?.user?.isAdmin && (
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Admin
          </Link>
        )}
        <Link href="/plans" className="text-gray-600 hover:text-gray-900">
          Planos
        </Link>
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
          Minhas Máquinas
        </Link>
        <Link href="/orders" className="text-gray-600 hover:text-gray-900">
          Pedidos
        </Link>
        <Link href="/billing" className="text-gray-600 hover:text-gray-900">
          Cobranças
        </Link>
        <Link href="/profile" className="text-gray-600 hover:text-gray-900">
          Perfil
        </Link>
      </div>
      <div className="flex gap-4">
        <Link href="/login" className="text-gray-600 hover:text-gray-900">
          Entrar
        </Link>
        <Link href="/signup" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Criar conta
        </Link>
        <Link href="/logout" className="text-gray-600 hover:text-gray-900">
          Sair
        </Link>
      </div>
    </nav>
  );
}
