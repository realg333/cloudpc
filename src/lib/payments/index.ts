import type { PaymentGateway } from './gateway';
import { createAsaasGateway } from './asaas-gateway';
import { readAsaasApiKeyRaw, readEnv, sanitizeAsaasApiKey } from './payment-env';

/**
 * Payment stack is Asaas-only (PIX). Configure ASAAS_API_KEY + ASAAS_WEBHOOK_TOKEN.
 */
export function getPaymentGateway(): PaymentGateway {
  const apiKey = sanitizeAsaasApiKey(readAsaasApiKeyRaw() ?? readEnv('ASAAS_API_KEY'));
  const webhookToken = readEnv('ASAAS_WEBHOOK_TOKEN')?.trim();
  if (!apiKey || !webhookToken) {
    throw new Error('ASAAS_API_KEY and ASAAS_WEBHOOK_TOKEN are required');
  }
  const baseUrl = readEnv('ASAAS_API_BASE_URL')?.trim();
  return createAsaasGateway({
    apiKey,
    webhookToken,
    baseUrl: baseUrl || undefined,
  });
}

export type { PaymentGateway, ParsedWebhookNotification, WebhookVerifyContext } from './gateway';
export { createAsaasGateway } from './asaas-gateway';
export {
  asaasApiKeyConfigHint,
  readAsaasApiKeyRaw,
  readAsaasDefaultCustomerDocumentRaw,
  readEnv,
  sanitizeAsaasApiKey,
} from './payment-env';
