/**
 * Guards against any legacy mock-gateway payload ever reaching clients.
 * Asaas PIX uses real charge ids (e.g. pay_...) and EMV/PIX copy-paste payloads — never mock-qr-code.
 */
export function assertRealPixPaymentPayload(result: {
  paymentId: string;
  qrCode?: string;
  qrCodeBase64?: string;
}): void {
  const id = result.paymentId.trim();
  if (/^mock_/i.test(id)) {
    throw new Error('INVARIANT_LEGACY_MOCK_PAYMENT_ID');
  }
  if (result.qrCode === 'mock-qr-code') {
    throw new Error('INVARIANT_LEGACY_MOCK_QR');
  }
}

export function looksLikeLegacyMockClientResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  const pid = typeof o.paymentId === 'string' ? o.paymentId : '';
  const qr = typeof o.qrCode === 'string' ? o.qrCode : '';
  return /^mock_/i.test(pid.trim()) || qr === 'mock-qr-code';
}
