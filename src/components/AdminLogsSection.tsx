'use client';

import { useState, useEffect, useCallback } from 'react';

interface ActionLogEntry {
  id: string;
  action: string;
  actorId: string | null;
  actorType: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface PaymentLogEntry {
  id: string;
  gatewayEventId: string;
  eventType: string;
  orderId: string | null;
  outcome: string;
  processedAt: string;
}

interface LogsData {
  actionLogs: ActionLogEntry[];
  paymentLogs: PaymentLogEntry[];
}

type UnifiedLogEntry =
  | { type: 'action'; data: ActionLogEntry }
  | { type: 'payment'; data: PaymentLogEntry };

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    vm_created: 'VM criada',
    vm_destroyed: 'VM destruída',
    payment_processed: 'Pagamento processado',
  };
  return map[action] ?? action;
}

export default function AdminLogsSection() {
  const [data, setData] = useState<LogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/logs');
      if (!res.ok) {
        if (res.status === 401) throw new Error('Não autorizado');
        if (res.status === 403) throw new Error('Acesso negado');
        throw new Error('Erro ao carregar logs');
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
    fetchLogs();
  }, [fetchLogs]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Carregando logs...</p>
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

  const unified: UnifiedLogEntry[] = [
    ...data.actionLogs.map((e) => ({ type: 'action' as const, data: e })),
    ...data.paymentLogs.map((e) => ({ type: 'payment' as const, data: e })),
  ].sort((a, b) => {
    const tsA =
      a.type === 'action' ? a.data.createdAt : a.data.processedAt;
    const tsB =
      b.type === 'action' ? b.data.createdAt : b.data.processedAt;
    return new Date(tsB).getTime() - new Date(tsA).getTime();
  });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Data
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Ação / Evento
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Ator
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Entidade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Detalhes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {unified.map((entry) => {
            if (entry.type === 'action') {
              const e = entry.data;
              return (
                <tr key={`action-${e.id}`} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {formatTimestamp(e.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {actionLabel(e.action)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {e.actorType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {e.entityType} {e.entityId ? `(${e.entityId.slice(0, 8)}…)` : ''}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                    {e.metadata ? JSON.stringify(e.metadata) : '—'}
                  </td>
                </tr>
              );
            }
            const p = entry.data;
            return (
              <tr key={`payment-${p.id}`} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {formatTimestamp(p.processedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {p.eventType} ({p.outcome})
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  webhook
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  order {p.orderId ?? '—'}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                  {p.gatewayEventId}
                </td>
              </tr>
            );
          })}
          {unified.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                Nenhum log encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
