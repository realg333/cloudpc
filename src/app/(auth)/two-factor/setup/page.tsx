import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import { generateTwoFactorSecret, generateTwoFactorOtpauthUrl } from '@/lib/auth/twoFactor';
import Link from 'next/link';

export default async function TwoFactorSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const secret = await generateTwoFactorSecret(session.user.id);
  const otpauthUrl = generateTwoFactorOtpauthUrl(secret, session.user.email);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Configurar autenticação em duas etapas</h1>
      {params.success === '1' && (
        <p className="mb-4 text-green-600">2FA ativado com sucesso.</p>
      )}
      {params.error === 'invalid' && (
        <p className="mb-4 text-sm text-red-600">Código inválido. Escaneie o QR e tente novamente.</p>
      )}
      {params.error === 'missing' && (
        <p className="mb-4 text-sm text-red-600">Informe o código de 6 dígitos.</p>
      )}
      <p className="mb-4 text-gray-600">
        Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc.) ou adicione manualmente o segredo abaixo.
      </p>
      <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-4 font-mono text-sm break-all">
        {otpauthUrl}
      </div>
      <p className="mb-2 text-sm text-gray-600">Segredo (manual):</p>
      <p className="mb-6 font-mono text-sm break-all">{secret}</p>
      <form method="post" action="/api/auth/two-factor/setup/confirm" className="space-y-4">
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">
            Código de confirmação (6 dígitos)
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="000000"
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Ativar 2FA
        </button>
      </form>
      <p className="mt-4">
        <Link href="/profile" className="text-indigo-600 hover:underline">
          Voltar ao perfil
        </Link>
      </p>
    </div>
  );
}
