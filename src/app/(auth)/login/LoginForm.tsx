'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LoginFormProps {
  redirectParam?: string;
  errorParam?: string;
  verifiedParam?: string;
  signupParam?: string;
  emailParam?: string;
}

export default function LoginForm({
  redirectParam = '',
  errorParam,
  verifiedParam,
  signupParam,
  emailParam = '',
}: LoginFormProps) {
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  const showResend = signupParam === '1' || errorParam === 'unverified';

  const errorMessage =
    errorParam === 'invalid'
      ? 'E-mail ou senha incorretos.'
      : errorParam === 'unverified'
        ? 'Verifique seu e-mail antes de entrar. Acesse o link que enviamos.'
        : errorParam === 'missing'
          ? 'Preencha e-mail e senha.'
          : errorParam === '2fa_expired'
            ? 'Sessão expirada. Faça login novamente.'
            : null;

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendStatus('loading');
    setResendMessage('');
    try {
      const formData = new FormData();
      formData.set('email', resendEmail.trim().toLowerCase());
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendStatus('success');
        setResendMessage('E-mail reenviado. Verifique sua caixa de entrada e spam.');
      } else {
        setResendStatus('error');
        setResendMessage(data.error ?? 'Erro ao reenviar. Tente novamente.');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('Erro de conexão. Tente novamente.');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Entrar</h1>
      {signupParam === '1' && (
        <p className="mb-4 text-sm text-green-600">Conta criada. Verifique seu e-mail e depois entre aqui.</p>
      )}
      {verifiedParam === '1' && (
        <p className="mb-4 text-sm text-green-600">E-mail verificado. Você já pode entrar.</p>
      )}
      {errorMessage && (
        <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
      )}
      <form method="post" action="/api/auth/login" className="space-y-4">
        {redirectParam && (
          <input type="hidden" name="redirect" value={redirectParam} />
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={emailParam}
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

      {showResend && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Não recebeu o e-mail de ativação?</p>
          <form onSubmit={handleResend} className="flex gap-2">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={resendStatus === 'loading'}
              className="rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {resendStatus === 'loading' ? 'Enviando...' : 'Reenviar'}
            </button>
          </form>
          {resendStatus === 'success' && (
            <p className="mt-2 text-sm text-green-600">{resendMessage}</p>
          )}
          {resendStatus === 'error' && (
            <p className="mt-2 text-sm text-red-600">{resendMessage}</p>
          )}
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        Não tem conta? <Link href="/signup" className="text-indigo-600 hover:underline">Criar conta</Link>
      </p>
    </div>
  );
}
