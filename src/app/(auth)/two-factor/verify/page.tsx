'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TwoFactorVerifyForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Código de autenticação</h1>
      <p className="mb-4 text-gray-600">
        Digite o código de 6 dígitos do seu aplicativo autenticador.
      </p>
      {error === 'invalid' && (
        <p className="mb-4 text-sm text-red-600">Código inválido. Tente novamente.</p>
      )}
      {error === 'missing' && (
        <p className="mb-4 text-sm text-red-600">Informe o código.</p>
      )}
      <form method="post" action="/api/auth/two-factor/verify" className="space-y-4">
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">
            Código
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="000000"
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-lg tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Verificar
        </button>
      </form>
    </div>
  );
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md animate-pulse rounded bg-gray-200 py-12" />}>
      <TwoFactorVerifyForm />
    </Suspense>
  );
}
