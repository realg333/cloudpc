import { describe, it, expect, vi, afterEach } from 'vitest';
import { sanitizeAsaasApiKey } from './payment-env';

describe('sanitizeAsaasApiKey', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('removes leading dollar signs', () => {
    expect(sanitizeAsaasApiKey('$aact_123')).toBe('aact_123');
    expect(sanitizeAsaasApiKey('aact_123')).toBe('aact_123');
  });
});
