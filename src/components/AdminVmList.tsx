'use client';

import { useState, useEffect, useCallback } from 'react';

const TERMINATABLE_STATUSES = ['vm_ready', 'expiring', 'provisioning', 'destroying'];

function statusLabel(status: string): string {
  switch (status) {
    case 'payment_confirmed':
      return 'Confirmando pagamento';
    case 'provisioning':
      return 'Provisionando';
    case 'vm_ready':
      return 'Pronto';
    case 'expiring':
      return 'Expirando';
    case 'destroying':
      return 'Encerrando';
    case 'destroyed':
      return 'Encerrado';
    case 'failed':
      return 'Falhou';
    default:
      return status;
  }
}

export interface AdminVm {
  id: string;
  status: string;
  vultrInstanceId: string | null;
  readyAt: string | null;
  expiresAt: string | null;
  userEmail: string;
  machineProfileName: string;
  remainingMinutes: number | null;
}

export default function AdminVmList() {
  const [vms, setVms] = useState<AdminVm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  const fetchVms = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/vms');
      if (!res.ok) {
        if (res.status === 401) throw new Error('Não autorizado');
        if (res.status === 403) throw new Error('Acesso negado');
        throw new Error('Erro ao carregar VMs');
      }
      const data = await res.json();
      setVms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setVms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVms();
  }, [fetchVms]);

  async function handleTerminate(vm: AdminVm) {
    if (!confirm(`Encerrar VM de ${vm.userEmail} (${vm.machineProfileName})?`)) return;
    setTerminatingId(vm.id);
    try {
      const res = await fetch(`/api/admin/vms/${vm.id}/terminate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao encerrar VM');
      }
      await fetchVms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao encerrar VM');
    } finally {
      setTerminatingId(null);
    }
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('pt-BR');
    } catch {
      return iso;
    }
  }

  function formatRemaining(min: number | null): string {
    if (min === null) return '—';
    if (min <= 0) return '0 min';
    return `${min} min`;
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Carregando VMs...</p>
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

  if (vms.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Nenhuma VM ativa no momento.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Usuário
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Perfil
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Vultr ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Pronto em
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Restante
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {vms.map((vm) => {
            const canTerminate =
              TERMINATABLE_STATUSES.includes(vm.status) && vm.vultrInstanceId;
            return (
              <tr key={vm.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {vm.userEmail}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {vm.machineProfileName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                  {vm.vultrInstanceId ?? '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {statusLabel(vm.status)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {formatDate(vm.readyAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {formatRemaining(vm.remainingMinutes)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {canTerminate && (
                    <button
                      type="button"
                      onClick={() => handleTerminate(vm)}
                      disabled={terminatingId === vm.id}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {terminatingId === vm.id ? 'Encerrando...' : 'Terminar'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
