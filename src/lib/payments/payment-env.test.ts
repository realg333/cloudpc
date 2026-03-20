import { describe, it, expect, vi, afterEach } from 'vitest';
import { asaasApiKeyConfigHint, sanitizeAsaasApiKey } from './payment-env';

describe('sanitizeAsaasApiKey', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('removes leading dollar signs', () => {
    expect(sanitizeAsaasApiKey('$aact_123')).toBe('aact_123');
    expect(sanitizeAsaasApiKey('aact_123')).toBe('aact_123');
  });

  it('removes whitespace and newlines from pasted keys', () => {
    expect(sanitizeAsaasApiKey('aact_\nprod_\t123')).toBe('aact_prod_123');
  });
});

describe('asaasApiKeyConfigHint', () => {
  it('detects webhook secret in wrong place', () => {
    expect(asaasApiKeyConfigHint('whsec_abc')).toMatch(/webhook/);
  });

  it('detects non-aact keys', () => {
    expect(asaasApiKeyConfigHint('sk_live_123')).toMatch(/aact_/);
  });

  it('returns undefined for plausible keys', () => {
    expect(asaasApiKeyConfigHint('aact_prod_xyz')).toBeUndefined();
  });
});
