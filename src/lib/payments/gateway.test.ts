import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CreatePaymentIntentParams } from './gateway';
import { createAsaasGateway } from './asaas-gateway';

describe('PaymentGateway (Asaas)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('{}'),
        } as Response)
      )
    );
  });

  it('createAsaasGateway exposes verifyWebhookSignature and parseWebhookPayload', () => {
    const gateway = createAsaasGateway({ apiKey: 'k', webhookToken: 't' });
    expect(typeof gateway.verifyWebhookSignature).toBe('function');
    expect(typeof gateway.parseWebhookPayload).toBe('function');
  });

  it('parseWebhookPayload accepts Asaas webhook body', () => {
    const gw = createAsaasGateway({ apiKey: 'k', webhookToken: 't' });
    const parsed = gw.parseWebhookPayload({
      id: 'evt_1',
      event: 'PAYMENT_RECEIVED',
      payment: {
        id: 'pay_abc',
        status: 'RECEIVED',
        value: 10,
        externalReference: 'ord-1',
      },
    });
    expect(parsed).toMatchObject({
      source: 'asaas',
      gatewayChargeId: 'pay_abc',
      externalReference: 'ord-1',
      eventType: 'PAYMENT_RECEIVED',
    });
  });

  it('createPaymentIntent throws for non-pix (crypto not wired)', async () => {
    const gw = createAsaasGateway({ apiKey: 'k', webhookToken: 't' });
    await expect(
      gw.createPaymentIntent({
        orderId: 'o1',
        amountCents: 100,
        currency: 'BRL',
        method: 'crypto',
      } as CreatePaymentIntentParams)
    ).rejects.toThrow();
  });
});
