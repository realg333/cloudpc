import { describe, it, expect } from 'vitest';
import type { CreatePaymentIntentParams } from './gateway';
import { createMockGateway } from './mock-gateway';

describe('PaymentGateway', () => {
  it('has createPaymentIntent method', () => {
    const gateway = createMockGateway();
    expect(typeof gateway.createPaymentIntent).toBe('function');
  });

  it('createMockGateway returns object satisfying PaymentGateway with stub implementations', async () => {
    const adapter = createMockGateway();

    const result = await adapter.createPaymentIntent({
      orderId: 'ord-1',
      amountCents: 10000,
      currency: 'BRL',
      method: 'pix',
    } as CreatePaymentIntentParams);
    expect(result.paymentId).toMatch(/^mock_\d+$/);
    expect(result.qrCode).toBe('mock-qr-code');

    expect(adapter.verifyWebhookSignature('body', { 'x-test-signature': 'valid' })).toBe(true);
    expect(adapter.verifyWebhookSignature('body', {})).toBe(false);
    expect(adapter.parseWebhookPayload({})).toBe(null);
  });

  it('createMockGateway parseWebhookPayload accepts { id, event, data: { orderId, status } } and returns WebhookParsed', () => {
    const adapter = createMockGateway();
    const payload = {
      id: 'evt-123',
      event: 'payment.paid',
      data: { orderId: 'ord-1', status: 'paid' },
    };
    const parsed = adapter.parseWebhookPayload(payload);
    expect(parsed).toEqual({
      eventId: 'evt-123',
      eventType: 'payment.paid',
      orderId: 'ord-1',
      status: 'paid',
    });
  });
});
