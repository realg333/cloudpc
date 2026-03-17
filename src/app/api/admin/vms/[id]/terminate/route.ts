import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';
import * as vultr from '@/lib/vultr/client';
import { createActionLog } from '@/lib/action-log';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest();
  if ('error' in admin) {
    if (admin.error === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const vm = await prisma.provisionedVm.findUnique({
    where: { id },
    include: { order: true },
  });

  if (!vm) {
    return NextResponse.json({ error: 'VM not found' }, { status: 404 });
  }

  if (!vm.vultrInstanceId) {
    return NextResponse.json(
      { error: 'VM has no Vultr instance ID' },
      { status: 400 }
    );
  }

  if (vm.status === 'destroyed' || vm.status === 'failed') {
    return NextResponse.json(
      { error: 'VM already terminated' },
      { status: 400 }
    );
  }

  try {
    await vultr.deleteInstance(vm.vultrInstanceId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Vultr delete failed: ${msg}` },
      { status: 502 }
    );
  }

  const destroyedAt = new Date();

  await prisma.provisionedVm.update({
    where: { id: vm.id },
    data: {
      status: 'destroyed',
      destroyedAt,
    },
  });

  await prisma.order.update({
    where: { id: vm.orderId },
    data: { status: 'completed' },
  });

  await createActionLog({
    action: 'admin_terminate',
    actorId: admin.user.id,
    actorType: 'admin',
    entityType: 'provisionedVm',
    entityId: vm.id,
    metadata: { vultrInstanceId: vm.vultrInstanceId },
  });

  return NextResponse.json({ success: true });
}
