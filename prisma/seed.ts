import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing Order records (if any)
  await prisma.order.deleteMany({});

  // Vultr Cloud GPU plan IDs — verify at api.vultr.com/v2/plans for your region.
  // Region: gru (São Paulo) for Brazilian users. Use ewr or other if gru has no GPU.
  const VULTR_REGION = 'gru';

  // Upsert MachineProfile records with Vultr plan mapping
  await prisma.machineProfile.upsert({
    where: { name: 'Mid GPU' },
    create: {
      name: 'Mid GPU',
      gpuTier: 'Mid',
      ramGb: 16,
      cpuSummary: '4 vCPUs',
      providerType: 'vultr',
      vultrPlanId: 'vcg-a16-2c-16g-4vram',
      vultrRegion: VULTR_REGION,
      isActive: true,
    },
    update: {
      gpuTier: 'Mid',
      ramGb: 16,
      cpuSummary: '4 vCPUs',
      providerType: 'vultr',
      vultrPlanId: 'vcg-a16-2c-16g-4vram',
      vultrRegion: VULTR_REGION,
      isActive: true,
    },
  });
  await prisma.machineProfile.upsert({
    where: { name: 'High GPU' },
    create: {
      name: 'High GPU',
      gpuTier: 'High',
      ramGb: 32,
      cpuSummary: '8 vCPUs',
      providerType: 'vultr',
      vultrPlanId: 'vcg-a16-3c-32g-8vram',
      vultrRegion: VULTR_REGION,
      isActive: true,
    },
    update: {
      gpuTier: 'High',
      ramGb: 32,
      cpuSummary: '8 vCPUs',
      providerType: 'vultr',
      vultrPlanId: 'vcg-a16-3c-32g-8vram',
      vultrRegion: VULTR_REGION,
      isActive: true,
    },
  });
  await prisma.machineProfile.upsert({
    where: { name: 'Ultra GPU' },
    create: {
      name: 'Ultra GPU',
      gpuTier: 'Ultra',
      ramGb: 64,
      cpuSummary: '16 vCPUs',
      providerType: 'vultr',
      vultrPlanId: 'vcg-a40-8c-64g-24vram',
      vultrRegion: VULTR_REGION,
      isActive: true,
    },
    update: {
      gpuTier: 'Ultra',
      ramGb: 64,
      cpuSummary: '16 vCPUs',
      providerType: 'vultr',
      vultrPlanId: 'vcg-a40-8c-64g-24vram',
      vultrRegion: VULTR_REGION,
      isActive: true,
    },
  });

  // Upsert Plan records
  await prisma.plan.upsert({
    where: { name: 'Pacote 4h' },
    create: {
      name: 'Pacote 4h',
      durationHours: 4,
      priceCents: 1500,
      description: '4 horas de uso',
      isActive: true,
    },
    update: {
      durationHours: 4,
      priceCents: 1500,
      description: '4 horas de uso',
      isActive: true,
    },
  });
  await prisma.plan.upsert({
    where: { name: 'Pacote 24h' },
    create: {
      name: 'Pacote 24h',
      durationHours: 24,
      priceCents: 4500,
      description: '24 horas de uso',
      isActive: true,
    },
    update: {
      durationHours: 24,
      priceCents: 4500,
      description: '24 horas de uso',
      isActive: true,
    },
  });
  await prisma.plan.upsert({
    where: { name: 'Pacote semanal' },
    create: {
      name: 'Pacote semanal',
      durationHours: 168, // 7 days
      priceCents: 12000,
      description: '7 dias de uso',
      isActive: true,
    },
    update: {
      durationHours: 168,
      priceCents: 12000,
      description: '7 dias de uso',
      isActive: true,
    },
  });

  console.log('Seed completed: MachineProfile and Plan records created/updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
