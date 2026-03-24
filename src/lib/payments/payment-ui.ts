export type FrontendPaymentStatus =
  | 'pending_payment'
  | 'paid'
  | 'provisioning'
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'error';

type PaymentStatusTone = 'pending' | 'success' | 'info' | 'inactive' | 'danger';

export interface FrontendPaymentStatusUi {
  label: string;
  hint: string;
  tone: PaymentStatusTone;
  badgeClassName: string;
  ctaText?: string;
}

export const PAYMENT_STATUS_UI: Record<FrontendPaymentStatus, FrontendPaymentStatusUi> = {
  pending_payment: {
    label: 'Aguardando pagamento',
    hint: 'Finalize o pagamento para iniciar o provisionamento.',
    tone: 'pending',
    badgeClassName: 'status-pill-pending_payment',
    ctaText: 'Pagar',
  },
  paid: {
    label: 'Pagamento confirmado',
    hint: 'Recebemos o pagamento e vamos iniciar sua máquina.',
    tone: 'success',
    badgeClassName: 'status-pill-paid',
  },
  provisioning: {
    label: 'Provisionando',
    hint: 'Sua máquina está sendo preparada agora.',
    tone: 'info',
    badgeClassName: 'status-pill-provisioning',
    ctaText: 'Atualizar status',
  },
  active: {
    label: 'Ativo',
    hint: 'Sua máquina está pronta para uso.',
    tone: 'success',
    badgeClassName: 'status-pill-active',
  },
  expired: {
    label: 'Expirado',
    hint: 'O período da máquina terminou.',
    tone: 'inactive',
    badgeClassName: 'status-pill-expired',
  },
  cancelled: {
    label: 'Cancelado',
    hint: 'O pedido foi cancelado e não será provisionado.',
    tone: 'inactive',
    badgeClassName: 'status-pill-cancelled',
  },
  error: {
    label: 'Erro',
    hint: 'Encontramos uma falha e estamos tentando novamente.',
    tone: 'danger',
    badgeClassName: 'status-pill-error',
    ctaText: 'Tentar de novo',
  },
};

export type ProductionLimitationKey = 'cold_start' | 'timeout' | 'transient_gateway_error';

export const PRODUCTION_LIMITATION_MESSAGES: Record<ProductionLimitationKey, string> = {
  cold_start:
    'Estamos acordando os serviços de pagamento. Aguarde alguns segundos e tente novamente no botão "Tentar de novo".',
  timeout:
    'A confirmação demorou mais que o esperado nesta hospedagem. Atualize a página e use "Tentar de novo" para continuar.',
  transient_gateway_error:
    'O gateway de pagamento está instável no momento. Tente novamente em instantes pelo botão "Tentar de novo".',
};
