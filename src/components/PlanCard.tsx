'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface PlanCardProps {
  planId: string;
  planName: string;
  durationHours: number;
  priceCents: number;
  machineProfileId: string;
  profileName: string;
  gpuTier: string;
  ramGb: number;
  cpuSummary: string;
  featured?: boolean;
  isLoggedIn?: boolean;
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${hours}h`;
  if (hours < 168) return `${hours / 24} dias`;
  return `${hours / 168} semana${hours >= 336 ? 's' : ''}`;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export default function PlanCard({
  planId,
  planName,
  durationHours,
  priceCents,
  profileName,
  gpuTier,
  ramGb,
  cpuSummary,
  machineProfileId,
  featured = false,
  isLoggedIn = false,
}: PlanCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChoosePlan() {
    if (!isLoggedIn) {
      router.push('/login?redirect=/plans');
      return;
    }

    setLoading(true);
    setError(null);
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, machineProfileId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Erro ao criar pedido. Tente novamente.');
          return;
        }
        router.push('/orders');
      })
      .catch(() => {
        setError('Erro de conexão. Tente novamente.');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const ctaLabel = loading
    ? 'Criando pedido...'
    : isLoggedIn
      ? 'Começar agora'
      : 'Entrar para escolher';

  return (
    <article
      className={`
        group relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ease-out
        ${featured
          ? 'border-indigo-500/50 bg-[#16161f] shadow-[0_0_40px_-12px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/30'
          : 'border-white/10 bg-[#12121a] hover:border-white/20 hover:bg-[#16161f]'
        }
      `}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25">
            Melhor custo-benefício
          </span>
        </div>
      )}

      {/* Header: profile + duration */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">{profileName}</h3>
          <p className="mt-0.5 text-sm font-medium text-indigo-400">{gpuTier} GPU</p>
        </div>
        <div className="shrink-0 rounded-lg bg-white/5 px-3 py-1.5 text-right">
          <span className="text-sm font-medium text-slate-400">{formatDuration(durationHours)}</span>
        </div>
      </div>

      {/* Price - dominant */}
      <div className="mb-5 flex flex-wrap items-baseline gap-2">
        <span
          className={`text-3xl font-extrabold tracking-tight ${featured ? 'text-white' : 'text-white'}`}
        >
          {formatPrice(priceCents)}
        </span>
        <span className="text-sm text-slate-500">/ {planName}</span>
      </div>

      {/* Specs - clear comparison */}
      <ul className="mb-5 space-y-3 text-sm text-slate-400">
        <li className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-500/20">
            <svg className="h-3 w-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span>{ramGb} GB RAM</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-500/20">
            <svg className="h-3 w-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span>{cpuSummary}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-500/20">
            <svg className="h-3 w-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span>GPU dedicada</span>
        </li>
      </ul>

      {/* Payment note - compact */}
      <div className="mb-5 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
        <p className="text-xs text-slate-500">
          PIX ou cripto — cripto com melhor taxa
        </p>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* CTA - strong, frictionless */}
      <button
        type="button"
        onClick={handleChoosePlan}
        disabled={loading}
        className={`
          mt-auto flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-xl font-semibold
          transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-60
          active:scale-[0.98]
          ${featured
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 focus:ring-indigo-500 focus:ring-offset-[#16161f]'
            : 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/30 focus:ring-offset-[#12121a]'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Criando pedido...
          </span>
        ) : (
          ctaLabel
        )}
      </button>
    </article>
  );
}
