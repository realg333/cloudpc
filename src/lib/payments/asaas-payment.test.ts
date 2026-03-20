import { describe, it, expect } from 'vitest';
import { mapAsaasWebhookToPipelineStatus, reaisToCents } from './asaas-payment';

describe('mapAsaasWebhookToPipelineStatus', () => {
  it('maps PAYMENT_RECEIVED + RECEIVED to paid', () => {
    expect(mapAsaasWebhookToPipelineStatus('PAYMENT_RECEIVED', 'RECEIVED')).toBe('paid');
  });

  it('maps PAYMENT_CONFIRMED + CONFIRMED to paid', () => {
    expect(mapAsaasWebhookToPipelineStatus('PAYMENT_CONFIRMED', 'CONFIRMED')).toBe('paid');
  });

  it('maps PAYMENT_OVERDUE to expired', () => {
    expect(mapAsaasWebhookToPipelineStatus('PAYMENT_OVERDUE', 'OVERDUE')).toBe('expired');
  });

  it('maps PAYMENT_DELETED to failed', () => {
    expect(mapAsaasWebhookToPipelineStatus('PAYMENT_DELETED', 'DELETED')).toBe('failed');
  });

  it('ignores PAYMENT_CREATED', () => {
    expect(mapAsaasWebhookToPipelineStatus('PAYMENT_CREATED', 'PENDING')).toBe('ignored');
  });
});

describe('reaisToCents', () => {
  it('converts reais to integer cents', () => {
    expect(reaisToCents(12.5)).toBe(1250);
    expect(reaisToCents(10)).toBe(1000);
  });
});
