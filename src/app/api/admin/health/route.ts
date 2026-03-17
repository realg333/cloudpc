import { NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';
import { getActiveVmCount } from '@/lib/provisioning/cost-safety';

const ACTIVE_STATUSES = ['provisioning', 'vm_ready', 'expiring', 'destroying'] as const;

export async function GET() {
  const admin = await getAdminFromRequest();
  if ('error' in admin) {
    if (admin.error === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [activeVmCount, perProfileRaw, recentFailures, failedWebhookLogs, failedProvisioningVms, recentVms] =
    await Promise.all([
      getActiveVmCount(),
      prisma.provisionedVm.groupBy({
        by: ['machineProfileId'],
        where: { status: { in: [...ACTIVE_STATUSES] } },
        _count: true,
      }),
      prisma.provisionedVm.findMany({
        where: {
          status: 'failed',
          updatedAt: { gte: twentyFourHoursAgo },
        },
        take: 20,
        include: { order: { include: { user: true } } },
      }),
      prisma.paymentLog.findMany({
        where: {
          outcome: { in: ['canceled', 'ignored'] },
          orderId: { not: null },
        },
        select: { orderId: true },
      }),
      prisma.provisionedVm.findMany({
        where: { status: 'failed' },
        include: { order: { select: { userId: true } } },
      }),
      prisma.provisionedVm.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        include: { order: { select: { userId: true } } },
      }),
    ]);

  const failedWebhooks = Object.entries(
    failedWebhookLogs.reduce<Record<string, number>>((acc, p) => {
      const oid = p.orderId!;
      acc[oid] = (acc[oid] ?? 0) + 1;
      return acc;
    }, {})
  ).filter(([, c]) => c > 2);

  const provisioningErrorsByUser = failedProvisioningVms.reduce<
    Record<string, { count: number; orderId: string }>
  >((acc, v) => {
    const uid = v.order.userId;
    const oid = v.orderId;
    if (!acc[uid]) acc[uid] = { count: 0, orderId: oid };
    acc[uid].count++;
    return acc;
  }, {});
  const provisioningErrors = Object.entries(provisioningErrorsByUser).filter(
    ([, v]) => v.count > 2
  );

  const restartsByUser = recentVms.reduce<Record<string, number>>((acc, v) => {
    const uid = v.order.userId;
    acc[uid] = (acc[uid] ?? 0) + 1;
    return acc;
  }, {});
  const vmRestarts = Object.entries(restartsByUser).filter(([, c]) => c > 3);

  const profileIds = [...new Set(perProfileRaw.map((p) => p.machineProfileId))];
  const profiles =
    profileIds.length > 0
      ? await prisma.machineProfile.findMany({
          where: { id: { in: profileIds } },
          select: { id: true, name: true },
        })
      : [];

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.name]));

  const perProfileCounts = perProfileRaw.map((p) => ({
    profileId: p.machineProfileId,
    profileName: profileMap[p.machineProfileId] ?? '—',
    count: p._count,
    roughCostPerProfile: '—' as const,
  }));

  const userIdsForAbuse =
    provisioningErrors.length > 0 || vmRestarts.length > 0
      ? [...new Set([...provisioningErrors.map(([uid]) => uid), ...vmRestarts.map(([uid]) => uid)])]
      : [];
  const usersForAbuse =
    userIdsForAbuse.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIdsForAbuse } },
          select: { id: true, email: true },
        })
      : [];
  const userEmailMap = Object.fromEntries(usersForAbuse.map((u) => [u.id, u.email]));

  const abuseSignals = {
    repeatedFailedWebhooks: failedWebhooks.map(([orderId, count]) => ({
      orderId,
      count,
      message: `${count} failed webhooks for order ${orderId}`,
    })),
    repeatedProvisioningErrors: provisioningErrors.map(([userId, v]) => ({
      orderId: v.orderId,
      userId,
      userEmail: userEmailMap[userId],
      count: v.count,
      message: `${v.count} provisioning errors for user ${userEmailMap[userId] ?? userId}`,
    })),
    unusualRestarts: vmRestarts.map(([userId, count]) => ({
      userId,
      userEmail: userEmailMap[userId],
      count,
      message: `User ${userEmailMap[userId] ?? userId}: ${count} VMs in 7d`,
    })),
  };

  return NextResponse.json({
    activeVmCount,
    perProfileCounts,
    recentFailures: recentFailures.map((f) => ({
      id: f.id,
      failureCode: f.failureCode,
      failureMessage: f.failureMessage,
      userEmail: f.order.user.email,
      updatedAt: f.updatedAt.toISOString(),
    })),
    abuseSignals,
  });
}
