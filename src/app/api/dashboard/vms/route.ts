import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

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

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const vms = await prisma.provisionedVm.findMany({
    where: { order: { userId: session.user.id } },
    include: {
      order: { include: { plan: true } },
      machineProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    vms: vms.map((vm) => ({
      id: vm.id,
      status: vm.status,
      statusLabel: statusLabel(vm.status),
      readyAt: vm.readyAt,
      expiresAt: vm.expiresAt,
      connectionMethod: vm.connectionMethod,
      connectionState: vm.connectionState,
      ipAddress: vm.ipAddress,
      hostname: vm.hostname,
      machineProfileId: vm.machineProfileId,
      machineProfileName: vm.machineProfile.name,
      planName: vm.order.plan.name,
      orderId: vm.orderId,
    })),
  });
}
