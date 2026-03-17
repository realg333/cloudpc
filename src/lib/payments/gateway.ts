/**
 * Gateway-agnostic payment interface.
 * Plan 01 will add mock adapter; concrete adapters (PIX, crypto) in later plans.
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
  qrCode?: string;
  redirectUrl?: string;
}

export interface WebhookPayload {
  eventId: string;
  eventType: string;
  orderId: string;
  status: 'paid' | 'failed' | 'expired';
}

/** Alias for WebhookPayload (plan naming) */
export type WebhookParsed = WebhookPayload;

export interface PaymentGateway {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult>;
  verifyWebhookSignature(payload: string, headers: Record<string, string>): boolean;
  parseWebhookPayload(body: unknown): WebhookPayload | null;
}
