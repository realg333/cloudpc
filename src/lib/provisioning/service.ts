/**
 * Provisioning service — state machine, Vultr create, poll, record metadata.
 * Handles one job at a time. Idempotent per order.
 */

import { prisma } from '@/lib/db';
import * as vultr from '@/lib/vultr/client';

const POLL_INTERVAL_MS = 30_000;
const MAX_POLL_DURATION_MS = 15 * 60 * 1000; // 15 min
const VULTR_WINDOWS_GPU_OS_ID = parseInt(process.env.VULTR_WINDOWS_GPU_OS_ID ?? '215', 10);

function serializeError(err: unknown): Record<string, unknown> {
  const msg = err instanceof Error ? err.message : String(err);
  if (err && typeof err === 'object' && 'body' in err) {
    return { message: msg, body: (err as { body?: unknown }).body };
  }
  return { message: msg };
}

/**
 * Process a single provisioning job.
 * Idempotent: skips if ProvisionedVm already has vultrInstanceId.
 */
export async function processOneJob(jobId: string): Promise<void> {
  const job = await prisma.provisioningJob.findUnique({
    where: { id: jobId },
    include: {
      order: { include: { plan: true, machineProfile: true } },
      provisionedVm: true,
    },
  });

  if (!job) return;
  if (!job.provisionedVm) return;

  const vm = job.provisionedVm;
  const order = job.order;
  const plan = order.plan;
  const profile = order.machineProfile;

  // Idempotency: already ready
  if (vm.status === 'vm_ready') return;

  // Check nextRetryAt: skip if we're before retry time
  if (vm.nextRetryAt && vm.nextRetryAt > new Date()) return;

  const vultrPlanId = profile.vultrPlanId;
  const vultrRegion = profile.vultrRegion;

  if (!vultrPlanId || !vultrRegion) {
    await prisma.provisionedVm.update({
      where: { id: vm.id },
      data: {
        status: 'failed',
        failureCode: 'MISSING_PROFILE',
        failureMessage: `MachineProfile ${profile.id} missing vultrPlanId or vultrRegion`,
      },
    });
    await prisma.provisioningJob.update({
      where: { id: jobId },
      data: { status: 'failed' },
    });
    return;
  }

  let instanceId = vm.vultrInstanceId;

  try {
    if (!instanceId) {
      // Transition: payment_confirmed → provisioning
      await prisma.provisionedVm.update({
        where: { id: vm.id },
        data: {
          status: 'provisioning',
          provisioningStartedAt: vm.provisioningStartedAt ?? new Date(),
        },
      });

      const label = `cloudpc-${order.id}`;
      const hostname = `cloudpc-${order.id}`.slice(0, 63);

      // Idempotency: if createInstance succeeded but DB update failed previously,
      // an instance with this label may already exist. Reuse it to avoid duplicates.
      let instance = await vultr.findInstanceByLabel(label);
      if (!instance) {
        instance = await vultr.createInstance({
          region: vultrRegion,
          plan: vultrPlanId,
          os_id: VULTR_WINDOWS_GPU_OS_ID,
          label,
          hostname,
        });
      }

      instanceId = instance.id;
      await prisma.provisionedVm.update({
        where: { id: vm.id },
        data: {
          vultrInstanceId: instance.id,
          ipAddress: instance.main_ip ?? vm.ipAddress ?? null,
          label,
          hostname,
        },
      });
    }

    // Poll until active
    const startedAt = Date.now();
    while (Date.now() - startedAt < MAX_POLL_DURATION_MS) {
      const current = await vultr.getInstance(instanceId!);
      if (current.status === 'active') {
        const readyAt = new Date();
        const durationHours = plan.durationHours;
        const expiresAt = new Date(readyAt.getTime() + durationHours * 60 * 60 * 1000);

        await prisma.provisionedVm.update({
          where: { id: vm.id },
          data: {
            status: 'vm_ready',
            readyAt,
            expiresAt,
            ipAddress: current.main_ip ?? vm.ipAddress,
            connectionMethod: 'parsec',
            connectionState: 'ready',
          },
        });
        await prisma.provisioningJob.update({
          where: { id: jobId },
          data: { status: 'completed' },
        });
        return;
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    // Timeout
    await prisma.provisionedVm.update({
      where: { id: vm.id },
      data: {
        status: 'failed',
        failureCode: 'PROVISIONING_TIMEOUT',
        failureMessage: 'VM did not become active within 15 minutes',
        lastProviderResponse: { instanceId, lastStatus: 'pending' },
        retryCount: vm.retryCount + 1,
        nextRetryAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  } catch (err) {
    const errObj = err as Error & { body?: unknown };
    const lastProviderResponse = serializeError(err);

    await prisma.provisionedVm.update({
      where: { id: vm.id },
      data: {
        status: 'failed',
        failureCode: errObj.name || 'PROVISIONING_ERROR',
        failureMessage: errObj.message ?? String(err),
        lastProviderResponse: lastProviderResponse as object,
        retryCount: vm.retryCount + 1,
        nextRetryAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
    // Keep job status 'pending' so it can be retried when nextRetryAt passes
    throw err;
  }
}
