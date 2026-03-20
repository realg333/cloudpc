import { describe, it, expect, vi, afterEach } from 'vitest';
import { getPaymentGateway } from './index';

describe('getPaymentGateway', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when ASAAS_API_KEY is missing', () => {
    vi.stubEnv('ASAAS_API_KEY', '');
    vi.stubEnv('ASAAS_WEBHOOK_TOKEN', 't');
    expect(() => getPaymentGateway()).toThrow(/ASAAS_API_KEY and ASAAS_WEBHOOK_TOKEN are required/);
  });

  it('throws when ASAAS_WEBHOOK_TOKEN is missing', () => {
    vi.stubEnv('ASAAS_API_KEY', 'k');
    vi.stubEnv('ASAAS_WEBHOOK_TOKEN', '');
    expect(() => getPaymentGateway()).toThrow(/ASAAS_API_KEY and ASAAS_WEBHOOK_TOKEN are required/);
  });

  it('returns Asaas gateway when configured', () => {
    vi.stubEnv('ASAAS_API_KEY', 'k');
    vi.stubEnv('ASAAS_WEBHOOK_TOKEN', 't');
    const g = getPaymentGateway();
    expect(typeof g.verifyWebhookSignature).toBe('function');
    expect(typeof g.parseWebhookPayload).toBe('function');
  });
});
