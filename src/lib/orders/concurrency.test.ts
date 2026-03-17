import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
    },
  },
}));

import { hasActiveOrder } from './concurrency';
import { prisma } from '@/lib/db';

describe('hasActiveOrder', () => {
  beforeEach(() => {
    vi.mocked(prisma.order.findFirst).mockReset();
  });

  it('returns true when user has order with status=paid', async () => {
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'o1' } as never);
    const result = await hasActiveOrder('user-1');
    expect(result).toBe(true);
    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: 'paid' },
    });
  });

  it('returns false when user has no orders', async () => {
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);
    const result = await hasActiveOrder('user-2');
    expect(result).toBe(false);
  });

  it('returns false when user has only pending_payment orders', async () => {
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);
    const result = await hasActiveOrder('user-3');
    expect(result).toBe(false);
  });
});
