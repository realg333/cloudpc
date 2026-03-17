/**
 * Provisioning job processor — finds pending jobs and processes them.
 * Called by cron endpoint. Cost safety (kill switch, max VMs) enforced via canProvision().
 */

import { prisma } from '@/lib/db';
import { processOneJob } from './service';
import { canProvision } from './cost-safety';

/**
 * Find and process up to 5 pending provisioning jobs.
 * Skips if canProvision() is false (kill switch or max VMs reached).
 */
export async function processProvisioningJobs(): Promise<number> {
  const jobs = await prisma.provisioningJob.findMany({
    where: { status: 'pending' },
    take: 5,
    orderBy: { createdAt: 'asc' },
    include: { provisionedVm: true },
  });

  let processed = 0;
  for (const job of jobs) {
    if (!(await canProvision())) {
      if (job.provisionedVm) {
        await prisma.provisionedVm.update({
          where: { id: job.provisionedVm.id },
          data: { nextRetryAt: new Date(Date.now() + 5 * 60 * 1000) },
        });
      }
      continue;
    }

    try {
      await processOneJob(job.id);
      processed++;
    } catch (err) {
      console.error('[provisioning] processOneJob failed', { jobId: job.id, error: err });
      // Continue with next job; failure is stored in ProvisionedVm
    }
  }

  return processed;
}
