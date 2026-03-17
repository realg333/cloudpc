'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage =
    error === 'email_taken'
      ? 'Este e-mail já está em uso.'
      : error === 'password_mismatch'
        ? 'As senhas não coincidem.'
        : error === 'password_short'
          ? 'A senha deve ter pelo menos 8 caracteres.'
          : error === 'missing'
            ? 'Preencha e-mail e senha.'
            : error === 'server'
              ? 'Erro no servidor. Tente novamente.'
              : null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Criar conta</h1>
      {errorMessage && (
        <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
      )}
      <form method="post" action="/api/auth/signup" className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-gray-700">
            Confirmar senha
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Criar conta
        </button>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md animate-pulse rounded bg-gray-200 py-12" />}>
      <SignupForm />
    </Suspense>
  );
}
