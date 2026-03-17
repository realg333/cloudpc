import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';
import { getRemainingMinutes } from '@/lib/provisioning/time-tracking';

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if ('error' in admin) {
    if (admin.error === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const vms = await prisma.provisionedVm.findMany({
    where: {
      status: { in: ['provisioning', 'vm_ready', 'expiring', 'destroying'] },
    },
    include: {
      order: { include: { user: true } },
      machineProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = vms.map((vm) => ({
    id: vm.id,
    status: vm.status,
    vultrInstanceId: vm.vultrInstanceId,
    readyAt: vm.readyAt?.toISOString() ?? null,
    expiresAt: vm.expiresAt?.toISOString() ?? null,
    userEmail: vm.order.user.email,
    machineProfileName: vm.machineProfile.name,
    remainingMinutes: getRemainingMinutes(vm),
  }));

  return NextResponse.json(result);
}
