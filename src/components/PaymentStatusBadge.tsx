import { PAYMENT_STATUS_UI, type FrontendPaymentStatus } from '@/lib/payments/payment-ui';

type PaymentStatusBadgeVariant = 'compact' | 'default';

interface PaymentStatusBadgeProps {
  status: FrontendPaymentStatus;
  variant?: PaymentStatusBadgeVariant;
  className?: string;
}

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export default function PaymentStatusBadge({
  status,
  variant = 'default',
  className,
}: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_UI[status];
  const sizeClass = variant === 'compact' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={joinClassNames('status-pill-base', `status-pill-${status}`, sizeClass, className)}
      title={config.hint}
    >
      <span
        aria-hidden="true"
        className={joinClassNames(
          'inline-block h-2 w-2 rounded-full bg-current',
          status === 'pending_payment' || status === 'provisioning' ? 'status-glow-pulse' : undefined
        )}
      />
      {config.label}
    </span>
  );
}
