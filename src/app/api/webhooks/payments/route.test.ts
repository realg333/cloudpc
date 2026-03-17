import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PIX_SUCCESS, PIX_FAILED, CRYPTO_SUCCESS } from '../../../../../tests/fixtures/webhook-payloads';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => {
  const p = {
    paymentLog: { create: vi.fn() },
    order: { findUnique: vi.fn(), update: vi.fn() },
    payment: { create: vi.fn(), findUnique: vi.fn() },
    provisioningJob: { create: vi.fn(), findUnique: vi.fn() },
    provisionedVm: { create: vi.fn() },
    $transaction: vi.fn((arg: unknown) => {
      if (Array.isArray(arg)) return Promise.all(arg as Promise<unknown>[]);
      return (arg as (tx: unknown) => Promise<unknown>)(p);
    }),
  };
  return { prisma: p };
});

vi.mock('@/lib/orders/concurrency', () => ({
  hasActiveOrder: vi.fn(),
}));

const { hasActiveOrder } = await import('@/lib/orders/concurrency');

describe('webhook handler', () => {
  const orderId = 'ord_test_123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasActiveOrder).mockResolvedValue(false);
  });

  it('returns 401 for invalid signature', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify({ ...PIX_SUCCESS, data: { ...PIX_SUCCESS.data, orderId } }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(prisma.paymentLog.create).not.toHaveBeenCalled();
  });

  it('returns 200 idempotent for duplicate eventId', async () => {
    const { POST } = await import('./route');
    const payload = { ...PIX_SUCCESS, id: 'evt_dup_test', data: { ...PIX_SUCCESS.data, orderId } };
    const headers = { 'content-type': 'application/json', 'x-test-signature': 'valid' };

    vi.mocked(prisma.paymentLog.create)
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce({ code: 'P2002' });

    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: orderId,
      userId: 'u1',
      status: 'pending_payment',
      amountCents: 1000,
      currency: 'BRL',
      machineProfileId: 'mp1',
      plan: { priceCents: 1000 },
      user: {},
    } as never);
    vi.mocked(prisma.order.update).mockResolvedValue({} as never);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.payment.create).mockResolvedValue({} as never);
    vi.mocked(prisma.provisioningJob.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.provisioningJob.create).mockResolvedValue({ id: 'job_1', orderId, status: 'pending' } as never);
    vi.mocked(prisma.provisionedVm.create).mockResolvedValue({} as never);

    const req1 = new Request('http://localhost/api/webhooks/payments', { method: 'POST', body: JSON.stringify(payload), headers });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    const req2 = new Request('http://localhost/api/webhooks/payments', { method: 'POST', body: JSON.stringify(payload), headers });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
  });

  it('marks order paid on success webhook', async () => {
    const { POST } = await import('./route');
    const payload = { ...CRYPTO_SUCCESS, id: 'evt_crypto_paid', data: { ...CRYPTO_SUCCESS.data, orderId } };
    vi.mocked(prisma.paymentLog.create).mockResolvedValue({} as never);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: orderId,
      userId: 'u1',
      status: 'pending_payment',
      amountCents: 1000,
      currency: 'BRL',
      machineProfileId: 'mp1',
      plan: { priceCents: 1000 },
      user: {},
    } as never);
    vi.mocked(prisma.order.update).mockResolvedValue({} as never);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.payment.create).mockResolvedValue({} as never);
    vi.mocked(prisma.provisioningJob.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.provisioningJob.create).mockResolvedValue({ id: 'job_1', orderId, status: 'pending' } as never);
    vi.mocked(prisma.provisionedVm.create).mockResolvedValue({} as never);

    const req = new Request('http://localhost/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json', 'x-test-signature': 'valid' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: orderId }, data: { status: 'paid' } })
    );
  });

  it('marks order canceled on failed webhook', async () => {
    const { POST } = await import('./route');
    const payload = { ...PIX_FAILED, id: 'evt_pix_fail', data: { ...PIX_FAILED.data, orderId } };
    vi.mocked(prisma.paymentLog.create).mockResolvedValue({} as never);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: orderId,
      userId: 'u1',
      status: 'pending_payment',
      amountCents: 1000,
      currency: 'BRL',
      plan: { priceCents: 1000 },
      user: {},
    } as never);

    const req = new Request('http://localhost/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json', 'x-test-signature': 'valid' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: orderId }, data: { status: 'canceled' } })
    );
  });
});
