import { describe, it, expect } from 'vitest';
import { assertRealPixPaymentPayload, looksLikeLegacyMockClientResponse } from './payment-invariants';

describe('payment-invariants', () => {
  it('assertRealPixPaymentPayload rejects legacy mock id', () => {
    expect(() =>
      assertRealPixPaymentPayload({ paymentId: 'mock_123', qrCode: 'pix-payload' })
    ).toThrow();
  });

  it('assertRealPixPaymentPayload rejects legacy mock qr string', () => {
    expect(() =>
      assertRealPixPaymentPayload({ paymentId: 'pay_abc', qrCode: 'mock-qr-code' })
    ).toThrow();
  });

  it('assertRealPixPaymentPayload accepts Asaas-like payload', () => {
    expect(() =>
      assertRealPixPaymentPayload({
        paymentId: 'pay_abc123',
        qrCode: '00020126...',
        qrCodeBase64: 'iVBORw0KGgo=',
      })
    ).not.toThrow();
  });

  it('looksLikeLegacyMockClientResponse', () => {
    expect(looksLikeLegacyMockClientResponse({ paymentId: 'mock_1', qrCode: 'x' })).toBe(true);
    expect(looksLikeLegacyMockClientResponse({ paymentId: 'pay_1', qrCode: 'mock-qr-code' })).toBe(true);
    expect(looksLikeLegacyMockClientResponse({ paymentId: 'pay_1', provider: 'asaas' })).toBe(false);
  });
});
