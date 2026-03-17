import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/profile');
  }

  const twoFactorRow = await prisma.twoFactorSecret.findUnique({
    where: { userId: session.user.id },
  });
  const twoFAEnabled = !!twoFactorRow && twoFactorRow.disabledAt === null;

  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Meu perfil</h1>

      {params.success === '2fa-disabled' && (
        <p className="mb-4 text-green-600">2FA desativado com sucesso.</p>
      )}
      {params.error === 'invalid-password' && (
        <p className="mb-4 text-sm text-red-600">Senha incorreta.</p>
      )}
      {params.error === 'missing-password' && (
        <p className="mb-4 text-sm text-red-600">Informe sua senha.</p>
      )}

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Segurança</h2>
        {twoFAEnabled ? (
          <div>
            <p className="mb-4 text-gray-600">Autenticação em duas etapas: Ativada</p>
            <form method="post" action="/api/auth/two-factor/disable" className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Senha (confirmação)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
              >
                Desativar 2FA
              </button>
            </form>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-600">Autenticação em duas etapas: Desativada</p>
            <Link
              href="/two-factor/setup"
              className="inline-block rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Ativar 2FA
            </Link>
          </div>
        )}
      </section>

      <p>
        <Link href="/" className="text-indigo-600 hover:underline">
          Voltar ao dashboard
        </Link>
      </p>
    </div>
  );
}
