'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface PlanCardProps {
  planId: string;
  planName: string;
  durationHours: number;
  machineProfileId: string;
  profileName: string;
  gpuTier: string;
  ramGb: number;
  cpuSummary: string;
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${hours} horas`;
  if (hours < 168) return `${hours / 24} dias`;
  return `${hours / 168} semana${hours >= 336 ? 's' : ''}`;
}

export default function PlanCard({
  planId,
  planName,
  durationHours,
  profileName,
  gpuTier,
  ramGb,
  cpuSummary,
  machineProfileId,
}: PlanCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChoosePlan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, machineProfileId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Erro ao criar pedido. Tente novamente.');
        return;
      }
      router.push('/orders');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{profileName}</h3>
        <p className="mt-1 text-sm text-indigo-600">GPU: {gpuTier}</p>
      </div>
      <p className="mb-2 text-sm text-gray-600">
        {ramGb} GB RAM, {cpuSummary}
      </p>
      <p className="mb-4 text-sm font-medium text-gray-700">
        {planName} — {formatDuration(durationHours)}
      </p>
      <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm">
        <span className="inline-block rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
          Cripto recomendado
        </span>
        <p className="mt-2 text-gray-700">
          Pagamento via PIX ou criptomoeda. Cripto oferece melhor taxa e confirmação mais rápida.
        </p>
      </div>
      {error && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}
      <button
        type="button"
        onClick={handleChoosePlan}
        disabled={loading}
        className="mt-auto rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Criando...' : 'Escolher plano'}
      </button>
    </div>
  );
}
