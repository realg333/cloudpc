/**
 * Gateway-agnostic payment interface (Asaas implementation only).
 */

export interface CreatePaymentIntentParams {
  orderId: string;
  amountCents: number;
  currency: string;
  method: 'pix' | 'crypto';
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResult {
  paymentId: string;
  /** External charge id (e.g. Asaas pay_...), persisted on Order.gatewayChargeId */
  gatewayChargeId?: string;
  qrCode?: string;
  /** Raw base64 image (without data: prefix) */
  qrCodeBase64?: string;
  redirectUrl?: string;
}

/** Webhook parse result from Asaas. */
export type ParsedWebhookNotification = {
  source: 'asaas';
  notificationId: string;
  eventType: string;
  gatewayChargeId: string;
  externalReference: string | null;
  valueReais: number | null;
  paymentStatus: string | null;
};

export interface WebhookVerifyContext {
  /** Reserved for gateways that need full request URL (e.g. query params). */
  requestUrl?: string;
}

export interface PaymentGateway {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult>;
  verifyWebhookSignature(
    payload: string,
    headers: Record<string, string>,
    context?: WebhookVerifyContext
  ): boolean;
  parseWebhookPayload(body: unknown): ParsedWebhookNotification | null;
}
