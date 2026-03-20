import type { PrismaClient } from '@prisma/client';
import { hasActiveOrder } from '@/lib/orders/concurrency';

export type WebhookPipelineStatus = 'paid' | 'failed' | 'expired' | 'ignored';

function mapOutcome(status: WebhookPipelineStatus): 'paid' | 'canceled' | 'ignored' {
  if (status === 'paid') return 'paid';
  if (status === 'failed' || status === 'expired') return 'canceled';
  return 'ignored';
}

export interface RunPaymentWebhookPipelineInput {
  notificationId: string;
  eventType: string;
  orderId: string;
  status: WebhookPipelineStatus;
  /** External payment/charge id from gateway (e.g. Asaas pay_...) */
  gatewayPaymentId?: string;
  method?: string;
  /** Stored on PaymentLog.metadata.source */
  logSource?: string;
}

/**
 * Idempotent payment webhook side-effects: PaymentLog, Order/Payment/Job/VM.
 * @returns 'duplicate' if this notification was already processed (P2002)
 */
export async function runPaymentWebhookPipeline(
  prisma: PrismaClient,
  input: RunPaymentWebhookPipelineInput
): Promise<'ok' | 'duplicate'> {
  const outcome = mapOutcome(input.status);

  try {
    await prisma.paymentLog.create({
      data: {
        gatewayEventId: input.notificationId,
        eventType: input.eventType,
        orderId: input.orderId,
        outcome,
        metadata: {
          event: input.eventType,
          source: input.logSource ?? 'asaas',
        },
      },
    });
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2002') {
      return 'duplicate';
    }
    throw e;
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { user: true, plan: true },
  });

  if (!order || order.status !== 'pending_payment') {
    return 'ok';
  }

  if (input.status === 'ignored') {
    return 'ok';
  }

  if (input.status === 'paid') {
    const hasActive = await hasActiveOrder(order.userId);
    if (hasActive) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'canceled' },
      });
      return 'ok';
    }
  }

  if (input.status === 'paid') {
    const amountCents = order.amountCents ?? order.plan.priceCents ?? 0;
    const gatewayPaymentId =
      input.gatewayPaymentId ?? `notif_${input.notificationId}`;
    const method = input.method ?? 'pix';

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
      eventType: input.eventType,
      outcome,
    });
  } else if (input.status === 'failed' || input.status === 'expired') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'canceled' },
    });
    console.log('[webhook] order canceled', {
      orderId: order.id,
      eventType: input.eventType,
      outcome,
    });
  }

  return 'ok';
}
