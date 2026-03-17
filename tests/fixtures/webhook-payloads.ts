/**
 * Mock webhook payloads for PIX and crypto payment events.
 * Tests pass real orderId when needed.
 */

export const PIX_SUCCESS = {
  id: 'evt_pix_123',
  event: 'payment.completed',
  data: { orderId: '' as string, status: 'paid' as const },
};

export const PIX_FAILED = {
  id: 'evt_pix_456',
  event: 'payment.failed',
  data: { orderId: '' as string, status: 'failed' as const },
};

export const CRYPTO_SUCCESS = {
  id: 'evt_crypto_789',
  event: 'payment.completed',
  data: { orderId: '' as string, status: 'paid' as const },
};

export const CRYPTO_EXPIRED = {
  id: 'evt_crypto_exp',
  event: 'payment.expired',
  data: { orderId: '' as string, status: 'expired' as const },
};
