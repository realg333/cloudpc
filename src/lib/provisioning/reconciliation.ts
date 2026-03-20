/**
 * Reconciliation — DB vs Vultr state check.
 * Detects missing instances (in DB but gone in Vultr), orphans (in Vultr but not in DB),
 * and expired VMs that should have been torn down.
 */

import { prisma } from '@/lib/db';
import * as vultr from '@/lib/vultr/client';
import { processExpiredVms } from './teardown';

export interface ReconciliationSummary {
  checked: number;
  missing: number;
  orphans: number;
  expiredFixed: number;
  /** Present when Vultr calls were skipped (e.g. missing API key in this environment). */
  skipped?: boolean;
  skipReason?: string;
}

/**
 * Run reconciliation: compare DB state with Vultr, fix drift.
 */
export async function runReconciliation(): Promise<ReconciliationSummary> {
  const summary: ReconciliationSummary = {
    checked: 0,
    missing: 0,
    orphans: 0,
    expiredFixed: 0,
  };

  if (!process.env.VULTR_API_KEY?.trim()) {
    console.warn('[reconciliation] VULTR_API_KEY not set; skipping Vultr reconciliation');
    return {
      ...summary,
      skipped: true,
      skipReason: 'VULTR_API_KEY not set',
    };
  }

  const dbVms = await prisma.provisionedVm.findMany({
    where: {
      vultrInstanceId: { not: null },
      status: { in: ['vm_ready', 'provisioning', 'destroying'] },
    },
  });

  for (const vm of dbVms) {
    if (!vm.vultrInstanceId) continue;
    summary.checked++;

    try {
      await vultr.getInstance(vm.vultrInstanceId);
    } catch (err) {
      const errObj = err as Error & { status?: number };
      if (errObj.status === 404) {
        await prisma.provisionedVm.update({
          where: { id: vm.id },
          data: {
            status: 'failed',
            failureCode: 'RECONCILIATION_MISSING',
            failureMessage: 'Instance not found in Vultr (404)',
          },
        });
        await prisma.order.update({
          where: { id: vm.orderId },
          data: { status: 'completed' },
        });
        summary.missing++;
      }
      // Re-throw other errors so caller can handle
      if (errObj.status !== 404) throw err;
    }
  }

  const vultrInstances = await vultr.listInstances();
  const cloudpcInstances = vultrInstances.filter(
    (i) => i.label?.startsWith('cloudpc-') ?? false
  );

  for (const instance of cloudpcInstances) {
    const found = await prisma.provisionedVm.findFirst({
      where: { vultrInstanceId: instance.id },
    });
    if (!found) {
      summary.orphans++;
      console.warn('[reconciliation] Orphan instance in Vultr', {
        instanceId: instance.id,
        label: instance.label,
      });
    }
  }

  summary.expiredFixed = await processExpiredVms();

  return summary;
}
