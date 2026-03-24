import {
  PAYMENT_STATUS_UI,
  PRODUCTION_LIMITATION_MESSAGES,
  type FrontendPaymentStatus,
} from '@/lib/payments/payment-ui';

describe('payment-ui contract', () => {
  it('provides non-empty PT-BR labels for every frontend payment status', () => {
    const statuses: FrontendPaymentStatus[] = [
      'pending_payment',
      'paid',
      'provisioning',
      'active',
      'expired',
      'cancelled',
      'error',
    ];

    for (const status of statuses) {
      expect(PAYMENT_STATUS_UI[status].label.trim().length).toBeGreaterThan(0);
    }
  });

  it('includes all required production limitation keys', () => {
    expect(PRODUCTION_LIMITATION_MESSAGES).toHaveProperty('cold_start');
    expect(PRODUCTION_LIMITATION_MESSAGES).toHaveProperty('timeout');
    expect(PRODUCTION_LIMITATION_MESSAGES).toHaveProperty('transient_gateway_error');
  });

  it('keeps visual class mapping and actionable CTA text for critical statuses', () => {
    const criticalStatuses: FrontendPaymentStatus[] = ['pending_payment', 'provisioning', 'error'];

    for (const status of criticalStatuses) {
      const config = PAYMENT_STATUS_UI[status];

      expect(config.badgeClassName).toMatch(/^status-pill-/);
      expect(config.ctaText?.trim().length).toBeGreaterThan(0);
    }
  });
});
