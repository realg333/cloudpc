import { prisma } from '@/lib/db';

export interface PlanOption {
  planId: string;
  planName: string;
  durationHours: number;
  priceCents: number;
  machineProfileId: string;
  profileName: string;
  gpuTier: string;
  ramGb: number;
  cpuSummary: string;
}

export async function listPlanOptions(): Promise<PlanOption[]> {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
  });
  const profiles = await prisma.machineProfile.findMany({
    where: { isActive: true },
  });

  const options: PlanOption[] = [];
  for (const plan of plans) {
    for (const profile of profiles) {
      options.push({
        planId: plan.id,
        planName: plan.name,
        durationHours: plan.durationHours,
        priceCents: plan.priceCents,
        machineProfileId: profile.id,
        profileName: profile.name,
        gpuTier: profile.gpuTier,
        ramGb: profile.ramGb,
        cpuSummary: profile.cpuSummary,
      });
    }
  }
  return options;
}
