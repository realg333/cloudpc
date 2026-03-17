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
  const remaining = getRemainingMinutes({ readyAt: vm.readyAt, expiresAt: vm.expiresAt });
  const expired = isExpired({ expiresAt: vm.expiresAt });
  const isProvisioning = vm.status === 'provisioning' || vm.status === 'payment_confirmed';
  const isActive = vm.status === 'vm_ready' || vm.status === 'expiring';

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
          <p>
            {expired ? 'Expirado' : `Tempo restante: ${remaining ?? 0} minutos`}
          </p>
        )}
        {(vm.status === 'destroyed' || vm.status === 'failed') && expired && <p>Expirado</p>}
      </div>
    </div>
  );
}
