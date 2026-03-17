/**
 * Cost safety controls — kill switch, max VMs, provisioning gate.
 */

import { prisma } from '@/lib/db';

const PROVISIONING_ENABLED =
  process.env.PROVISIONING_ENABLED !== 'false' && process.env.PROVISIONING_ENABLED !== '0';

const VULTR_MAX_ACTIVE_VMS = parseInt(process.env.VULTR_MAX_ACTIVE_VMS ?? '50', 10) || 50;

const ACTIVE_STATUSES = ['provisioning', 'vm_ready', 'expiring', 'destroying'] as const;

/**
 * Check if provisioning is allowed (kill switch).
 * Returns false when PROVISIONING_ENABLED is false or 0.
 */
export function isProvisioningAllowed(): boolean {
  return PROVISIONING_ENABLED;
}

/**
 * Count ProvisionedVm with status in provisioning, vm_ready, expiring, destroying.
 */
export async function getActiveVmCount(): Promise<number> {
  return prisma.provisionedVm.count({
    where: { status: { in: [...ACTIVE_STATUSES] } },
  });
}

/**
 * Return true if provisioning is allowed and active VM count is below max.
 */
export async function canProvision(): Promise<boolean> {
  if (!isProvisioningAllowed()) return false;
  const count = await getActiveVmCount();
  return count < VULTR_MAX_ACTIVE_VMS;
}
