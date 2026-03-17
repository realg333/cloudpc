import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth/admin';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest();
  if ('error' in admin) {
    if (admin.error === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100);

  const where = entityType ? { entityType } : {};

  const [actionLogs, paymentLogs] = await Promise.all([
    prisma.actionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.paymentLog.findMany({
      orderBy: { processedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        gatewayEventId: true,
        eventType: true,
        orderId: true,
        outcome: true,
        processedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    actionLogs: actionLogs.map((l) => ({
      id: l.id,
      action: l.action,
      actorId: l.actorId,
      actorType: l.actorType,
      entityType: l.entityType,
      entityId: l.entityId,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    })),
    paymentLogs: paymentLogs.map((p) => ({
      id: p.id,
      gatewayEventId: p.gatewayEventId,
      eventType: p.eventType,
      orderId: p.orderId,
      outcome: p.outcome,
      processedAt: p.processedAt.toISOString(),
    })),
  });
}
