/**
 * Action log for audit trail. Records admin actions, system events, etc.
 */

import { prisma } from '@/lib/db';

export interface CreateActionLogParams {
  action: string;
  actorId?: string;
  actorType: 'user' | 'admin' | 'system';
  entityType: 'order' | 'provisionedVm' | 'payment';
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function createActionLog(params: CreateActionLogParams): Promise<void> {
  await prisma.actionLog.create({
    data: {
      action: params.action,
      actorId: params.actorId ?? null,
      actorType: params.actorType,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      metadata: params.metadata ? (params.metadata as object) : undefined,
    },
  });
}
