/**
 * Asaas-shaped webhook bodies for tests (event + payment object).
 */

export const ASAAS_WEBHOOK_TOKEN = 'my-secret-webhook-token-32chars-min';

export function asaasPaymentWebhook(opts: {
  id?: string;
  event: string;
  paymentId: string;
  orderId: string;
  valueReais: number;
  paymentStatus: string;
}) {
  return {
    id: opts.id ?? 'notif_1',
    event: opts.event,
    payment: {
      id: opts.paymentId,
      externalReference: opts.orderId,
      value: opts.valueReais,
      status: opts.paymentStatus,
    },
  };
}
