import type {
  PaymentGateway,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  WebhookParsed,
} from './gateway';

/**
 * Creates a mock PaymentGateway for development and tests.
 * Real gateway adapter will be added when gateway is chosen.
 */
export function createMockGateway(): PaymentGateway {
  return {
    async createPaymentIntent(_params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult> {
      return {
        paymentId: `mock_${Date.now()}`,
        qrCode: 'mock-qr-code',
        redirectUrl: undefined,
      };
    },

    verifyWebhookSignature(_payload: string, headers: Record<string, string>): boolean {
      return headers['x-test-signature'] === 'valid';
    },

    parseWebhookPayload(body: unknown): WebhookParsed | null {
      if (
        body &&
        typeof body === 'object' &&
        'id' in body &&
        'event' in body &&
        'data' in body &&
        body.data &&
        typeof body.data === 'object' &&
        'orderId' in body.data &&
        'status' in body.data
      ) {
        const data = body.data as { orderId: string; status: string };
        return {
          eventId: String((body as { id: unknown }).id),
          eventType: String((body as { event: unknown }).event),
          orderId: data.orderId,
          status: data.status as 'paid' | 'failed' | 'expired',
        };
      }
      return null;
    },
  };
}
