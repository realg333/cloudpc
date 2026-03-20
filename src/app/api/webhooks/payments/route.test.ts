import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ASAAS_WEBHOOK_TOKEN, asaasPaymentWebhook } from '../../../../../tests/fixtures/webhook-payloads';
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

const authHeaders = {
  'content-type': 'application/json',
  'asaas-access-token': ASAAS_WEBHOOK_TOKEN,
};

describe('webhook handler', () => {
  const orderId = 'ord_test_123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ASAAS_API_KEY', 'test_asaas_api_key');
    vi.stubEnv('ASAAS_WEBHOOK_TOKEN', ASAAS_WEBHOOK_TOKEN);
    vi.mocked(hasActiveOrder).mockResolvedValue(false);
  });

  it('returns 401 for invalid signature', async () => {
    const { POST } = await import('./route');
    const body = asaasPaymentWebhook({
      event: 'PAYMENT_RECEIVED',
      paymentId: 'pay_1',
      orderId,
      valueReais: 10,
      paymentStatus: 'RECEIVED',
    });
    const req = new Request('http://localhost/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(prisma.paymentLog.create).not.toHaveBeenCalled();
  });

  it('returns 200 idempotent for duplicate eventId', async () => {
    const { POST } = await import('./route');
    const payload = asaasPaymentWebhook({
      id: 'evt_dup_test',
      event: 'PAYMENT_RECEIVED',
      paymentId: 'pay_dup',
      orderId,
      valueReais: 10,
      paymentStatus: 'RECEIVED',
    });

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

    const req1 = new Request('http://localhost/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: authHeaders,
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    const req2 = new Request('http://localhost/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: authHeaders,
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
  });

  it('marks order paid on PAYMENT_RECEIVED + RECEIVED', async () => {
    const { POST } = await import('./route');
    const payload = asaasPaymentWebhook({
      id: 'evt_paid_1',
      event: 'PAYMENT_RECEIVED',
      paymentId: 'pay_paid',
      orderId,
      valueReais: 10,
      paymentStatus: 'RECEIVED',
    });
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
      headers: authHeaders,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: orderId }, data: { status: 'paid' } })
    );
  });

  it('marks order canceled on PAYMENT_DELETED', async () => {
    const { POST } = await import('./route');
    const payload = asaasPaymentWebhook({
      id: 'evt_del_1',
      event: 'PAYMENT_DELETED',
      paymentId: 'pay_del',
      orderId,
      valueReais: 10,
      paymentStatus: 'DELETED',
    });
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
      headers: authHeaders,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: orderId }, data: { status: 'canceled' } })
    );
  });
});
