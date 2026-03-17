'use client';

import { useState } from 'react';
import { getRemainingMinutes, isExpired } from '@/lib/provisioning/time-tracking';

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

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'provisioning':
    case 'payment_confirmed':
      return 'bg-amber-100 text-amber-800';
    case 'vm_ready':
      return 'bg-green-100 text-green-800';
    case 'expiring':
    case 'destroying':
      return 'bg-orange-100 text-orange-800';
    case 'destroyed':
    case 'failed':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export interface VmStatusCardProps {
  vm: {
    id: string;
    status: string;
    readyAt: Date | null;
    expiresAt: Date | null;
    machineProfileName: string;
    planName: string;
    connectionMethod?: string | null;
    connectionState?: string | null;
  };
}

export default function VmStatusCard({ vm }: VmStatusCardProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const remaining = getRemainingMinutes({ readyAt: vm.readyAt, expiresAt: vm.expiresAt });
  const expired = isExpired({ expiresAt: vm.expiresAt });
  const isProvisioning = vm.status === 'provisioning' || vm.status === 'payment_confirmed';
  const isActive = vm.status === 'vm_ready' || vm.status === 'expiring';
  const canConnect = vm.status === 'vm_ready' && vm.connectionState === 'ready';

  async function handleConnect() {
    setLoading(true);
    setCopyStatus('idle');
    try {
      const res = await fetch(`/api/dashboard/vms/${vm.id}/connection`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao obter dados de conexão');
      }
      const data = await res.json();
      let text = '';
      if (data.peerId) {
        text = `Host: ${data.hostname || data.ipAddress || 'N/A'}\nIP: ${data.ipAddress || 'N/A'}\nParsec Peer ID: ${data.peerId}`;
      } else {
        text = `Host: ${data.hostname || data.ipAddress || 'N/A'}\nIP: ${data.ipAddress || 'N/A'}`;
      }
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-gray-900">{vm.machineProfileName}</h3>
          <p className="text-sm text-gray-600">{vm.planName}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(vm.status)}`}>
          {statusLabel(vm.status)}
        </span>
      </div>
      <div className="mt-3 text-sm text-gray-600">
        {isProvisioning && <p>Aguardando VM ficar pronta...</p>}
        {isActive && (
          <>
            <p>Estado: Rodando</p>
            <p>
              {expired ? 'Expirado' : `Tempo restante: ${remaining ?? 0} minutos`}
            </p>
          </>
        )}
        {(vm.status === 'destroyed' || vm.status === 'failed') && expired && <p>Expirado</p>}
      </div>
      {isActive && (
        <div className="mt-2">
          <button
            type="button"
            disabled
            title="Em breve — o tempo continua contando até o fim do período"
            className="cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500"
          >
            Parar
          </button>
        </div>
      )}
      {canConnect && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Conectando...' : 'Conectar'}
          </button>
          {copyStatus === 'copied' && (
            <span className="text-sm text-green-600">
              Copiado! Abra o Parsec e conecte usando o endereço.
            </span>
          )}
          {copyStatus === 'error' && (
            <span className="text-sm text-red-600">Erro ao copiar. Tente novamente.</span>
          )}
          <a
            href="https://parsec.app/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
          >
            Baixar Parsec
          </a>
        </div>
      )}
    </div>
  );
}
