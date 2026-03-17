/**
 * Teardown flow — destroy expired VMs via Vultr API, update order status to completed.
 */

import { prisma } from '@/lib/db';
import * as vultr from '@/lib/vultr/client';
import { createActionLog } from '@/lib/action-log';

function serializeError(err: unknown): Record<string, unknown> {
  const msg = err instanceof Error ? err.message : String(err);
  if (err && typeof err === 'object' && 'body' in err) {
    return { message: msg, body: (err as { body?: unknown }).body };
  }
  return { message: msg };
}

/**
 * Find and destroy expired VMs. Limit 10 per run.
 * Transitions: vm_ready/expiring → destroying → destroyed.
 * On success: sets destroyedAt, status=destroyed, Order status=completed.
 * On error: sets failureCode, failureMessage, lastProviderResponse, status=failed.
 */
export async function processExpiredVms(): Promise<number> {
  const now = new Date();

  const expired = await prisma.provisionedVm.findMany({
    where: {
      status: { in: ['vm_ready', 'expiring'] },
      expiresAt: { lt: now },
    },
    take: 10,
    include: { order: true },
  });

  let destroyed = 0;

  for (const vm of expired) {
    if (!vm.vultrInstanceId) {
      await prisma.provisionedVm.update({
        where: { id: vm.id },
        data: {
          status: 'failed',
          failureCode: 'TEARDOWN_NO_INSTANCE',
          failureMessage: 'No vultrInstanceId for expired VM',
        },
      });
      continue;
    }

    await prisma.provisionedVm.update({
      where: { id: vm.id },
      data: { status: 'destroying' },
    });

    try {
      await vultr.deleteInstance(vm.vultrInstanceId);
      const destroyedAt = new Date();

      await prisma.provisionedVm.update({
        where: { id: vm.id },
        data: {
          status: 'destroyed',
          destroyedAt,
        },
      });

      await createActionLog({
        action: 'vm_destroyed',
        actorType: 'system',
        entityType: 'provisionedVm',
        entityId: vm.id,
        metadata: { vultrInstanceId: vm.vultrInstanceId, orderId: vm.orderId },
      });

      await prisma.order.update({
        where: { id: vm.orderId },
        data: { status: 'completed' },
      });

      destroyed++;
    } catch (err) {
      const errObj = err as Error & { body?: unknown };
      const lastProviderResponse = serializeError(err);

      await prisma.provisionedVm.update({
        where: { id: vm.id },
        data: {
          status: 'failed',
          failureCode: errObj.name || 'TEARDOWN_ERROR',
          failureMessage: errObj.message ?? String(err),
          lastProviderResponse: lastProviderResponse as object,
        },
      });
    }
  }

  return destroyed;
}
