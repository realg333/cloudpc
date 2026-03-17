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

/**
 * Returns true if the user has a paid order with id !== excludeOrderId.
 * Used for defense-in-depth: skip provisioning when user already has another active order.
 */
export async function hasOtherActiveOrder(
  userId: string,
  excludeOrderId: string
): Promise<boolean> {
  const result = await prisma.order.findFirst({
    where: { userId, status: 'paid', id: { not: excludeOrderId } },
  });
  return !!result;
}
