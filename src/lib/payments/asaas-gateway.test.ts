import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAsaasGateway } from './asaas-gateway';

describe('createAsaasGateway', () => {
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

  it('verifyWebhookSignature accepts matching asaas-access-token', () => {
    const gw = createAsaasGateway({
      apiKey: 'k',
      webhookToken: 'my-secret-webhook-token-32chars-min',
    });
    expect(
      gw.verifyWebhookSignature('{}', { 'asaas-access-token': 'my-secret-webhook-token-32chars-min' })
    ).toBe(true);
    expect(gw.verifyWebhookSignature('{}', {})).toBe(false);
    expect(gw.verifyWebhookSignature('{}', { 'asaas-access-token': 'wrong' })).toBe(false);
  });

  it('parseWebhookPayload extracts Asaas payment fields', () => {
    const gw = createAsaasGateway({ apiKey: 'k', webhookToken: 't' });
    const parsed = gw.parseWebhookPayload({
      id: 'evt_1',
      event: 'PAYMENT_RECEIVED',
      payment: {
        object: 'payment',
        id: 'pay_abc',
        status: 'RECEIVED',
        value: 12.5,
        externalReference: 'ord_xyz',
      },
    });
    expect(parsed).toEqual({
      source: 'asaas',
      notificationId: 'evt_1',
      eventType: 'PAYMENT_RECEIVED',
      gatewayChargeId: 'pay_abc',
      externalReference: 'ord_xyz',
      valueReais: 12.5,
      paymentStatus: 'RECEIVED',
    });
  });

  it('parseWebhookPayload returns null without payment', () => {
    const gw = createAsaasGateway({ apiKey: 'k', webhookToken: 't' });
    expect(gw.parseWebhookPayload({ event: 'PAYMENT_RECEIVED' })).toBe(null);
  });
});
