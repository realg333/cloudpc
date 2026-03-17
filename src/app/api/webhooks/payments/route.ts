import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createMockGateway } from '@/lib/payments/mock-gateway';
import { hasActiveOrder } from '@/lib/orders/concurrency';

function mapOutcome(status: string): 'paid' | 'canceled' | 'ignored' {
  if (status === 'paid') return 'paid';
  if (status === 'failed' || status === 'expired') return 'canceled';
  return 'ignored';
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const gateway = createMockGateway();
  const headers = Object.fromEntries(request.headers.entries());

  if (!gateway.verifyWebhookSignature(rawBody, headers)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const payload = gateway.parseWebhookPayload(parsed);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const outcome = mapOutcome(payload.status);

  try {
    await prisma.paymentLog.create({
      data: {
        gatewayEventId: payload.eventId,
        eventType: payload.eventType,
        orderId: payload.orderId,
        outcome,
        metadata: { event: payload.eventType },
      },
    });
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json({ received: true }, { status: 200 });
    }
    throw e;
  }

  const order = await prisma.order.findUnique({
    where: { id: payload.orderId },
    include: { user: true, plan: true },
  });

  if (!order || order.status !== 'pending_payment') {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (payload.status === 'paid') {
    const hasActive = await hasActiveOrder(order.userId);
    if (hasActive) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'canceled' },
      });
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  if (payload.status === 'paid') {
    const amountCents = order.amountCents ?? order.plan.priceCents ?? 0;
    const gatewayPaymentId = payload.eventId;
    const method = (payload as { method?: string }).method ?? 'pix';

    // Single transaction: order, payment, job, vm. Ensures no paid order without provisioning job.
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'paid' },
      });

      const existingPayment = await tx.payment.findUnique({ where: { orderId: order.id } });
      if (!existingPayment) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            gatewayPaymentId,
            amountCents,
            currency: order.currency ?? 'BRL',
            method: method === 'crypto' ? 'crypto' : 'pix',
            status: 'completed',
          },
        });
      }

      const existingJob = await tx.provisioningJob.findUnique({ where: { orderId: order.id } });
      if (!existingJob) {
        const job = await tx.provisioningJob.create({
          data: { orderId: order.id, status: 'pending' },
        });
        await tx.provisionedVm.create({
          data: {
            orderId: order.id,
            provisioningJobId: job.id,
            status: 'payment_confirmed',
            machineProfileId: order.machineProfileId,
          },
        });
      }
    });

    console.log('[webhook] order paid', {
      orderId: order.id,
      userId: order.userId,
      amount: amountCents,
      method,
      eventType: payload.eventType,
      outcome,
    });
  } else if (payload.status === 'failed' || payload.status === 'expired') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'canceled' },
    });
    console.log('[webhook] order canceled', {
      orderId: order.id,
      eventType: payload.eventType,
      outcome,
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
