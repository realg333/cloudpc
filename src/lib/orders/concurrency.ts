import { prisma } from '@/lib/db';

/**
 * Returns true if the user has an order with status='paid' (active reservation).
 * Used for PLAN-03: one active VM per user.
 */
export async function hasActiveOrder(userId: string): Promise<boolean> {
  const paid = await prisma.order.findFirst({
    where: { userId, status: 'paid' },
  });
  return !!paid;
}
