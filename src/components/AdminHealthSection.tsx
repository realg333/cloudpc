'use client';

import { useState, useEffect, useCallback } from 'react';

interface PerProfileCount {
  profileId: string;
  profileName: string;
  count: number;
  roughCostPerProfile: string;
}

interface RecentFailure {
  id: string;
  failureCode: string | null;
  failureMessage: string | null;
  userEmail: string;
  updatedAt: string;
}

interface AbuseSignals {
  repeatedFailedWebhooks: { orderId: string; count: number; message: string }[];
  repeatedProvisioningErrors: {
    orderId: string;
    userId: string;
    userEmail: string | undefined;
    count: number;
    message: string;
  }[];
  unusualRestarts: {
    userId: string;
    userEmail: string | undefined;
    count: number;
    message: string;
  }[];
}

interface HealthData {
  activeVmCount: number;
  perProfileCounts: PerProfileCount[];
  recentFailures: RecentFailure[];
  abuseSignals: AbuseSignals;
}

export default function AdminHealthSection() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/health');
      if (!res.ok) {
        if (res.status === 401) throw new Error('Não autorizado');
        if (res.status === 403) throw new Error('Acesso negado');
        throw new Error('Erro ao carregar métricas');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Carregando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { activeVmCount, perProfileCounts, recentFailures, abuseSignals } = data;
  const hasAbuse =
    abuseSignals.repeatedFailedWebhooks.length > 0 ||
    abuseSignals.repeatedProvisioningErrors.length > 0 ||
    abuseSignals.unusualRestarts.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-6">
          <p className="text-sm font-medium text-indigo-600">VMs ativas</p>
          <p className="text-2xl font-bold text-indigo-900">{activeVmCount}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="text-xs font-medium text-emerald-700">Conformidade</span>
          <span
            className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
            title="Um VM ativo por usuário — enforced by hasActiveOrder in Phase 2"
          >
            Um VM ativo por usuário
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
          Contagem por perfil
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Perfil
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Quantidade
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Custo estimado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {perProfileCounts.map((p) => (
                <tr key={p.profileId}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                    {p.profileName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                    {p.count}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                    {p.roughCostPerProfile}
                  </td>
                </tr>
              ))}
              {perProfileCounts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                    Nenhum perfil ativo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
          Falhas recentes (24h)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  VM
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Usuário
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Código
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mensagem
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Atualizado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentFailures.map((f) => (
                <tr key={f.id}>
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-gray-600">
                    {f.id.slice(0, 8)}…
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                    {f.userEmail}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                    {f.failureCode ?? '—'}
                  </td>
                  <td className="max-w-xs truncate px-4 py-2 text-sm text-gray-600">
                    {f.failureMessage ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                    {new Date(f.updatedAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              {recentFailures.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                    Nenhuma falha recente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
          Sinais de abuso
        </h3>
        <div className="overflow-x-auto">
          {hasAbuse ? (
            <ul className="divide-y divide-gray-200 px-4 py-3">
              {abuseSignals.repeatedFailedWebhooks.map((w) => (
                <li key={w.orderId} className="py-2 text-sm text-amber-800">
                  {w.message}
                </li>
              ))}
              {abuseSignals.repeatedProvisioningErrors.map((e) => (
                <li key={e.orderId} className="py-2 text-sm text-amber-800">
                  {e.message}
                </li>
              ))}
              {abuseSignals.unusualRestarts.map((r) => (
                <li key={r.userId} className="py-2 text-sm text-amber-800">
                  {r.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-center text-sm text-gray-500">
              Nenhum sinal de abuso detectado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
