'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const verified = searchParams.get('verified');
  const signup = searchParams.get('signup');

  const errorMessage =
    error === 'invalid'
      ? 'E-mail ou senha incorretos.'
      : error === 'unverified'
        ? 'Verifique seu e-mail antes de entrar. Acesse o link que enviamos.'
        : error === 'missing'
          ? 'Preencha e-mail e senha.'
          : error === '2fa_expired'
            ? 'Sessão expirada. Faça login novamente.'
            : null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Entrar</h1>
      {signup === '1' && (
        <p className="mb-4 text-sm text-green-600">Conta criada. Verifique seu e-mail e depois entre aqui.</p>
      )}
      {verified === '1' && (
        <p className="mb-4 text-sm text-green-600">E-mail verificado. Você já pode entrar.</p>
      )}
      {errorMessage && (
        <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
      )}
      <form method="post" action="/api/auth/login" className="space-y-4">
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
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          Entrar
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Não tem conta? <Link href="/signup" className="text-indigo-600 hover:underline">Criar conta</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md animate-pulse rounded bg-gray-200 py-12" />}>
      <LoginForm />
    </Suspense>
  );
}
