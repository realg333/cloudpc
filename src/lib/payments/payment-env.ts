/**
 * Runtime env reads use process.env['NAME'] so Next.js is less likely to inline
 * undefined at build time for Route Handlers (see Next.js env bundling).
 */

export function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === 'string' ? v : undefined;
}

/**
 * CPF/CNPJ default for creating Asaas customers (first charge per user).
 * Uses a static `process.env.ASAAS_*` property so the server bundle always
 * reads the value at runtime on Vercel (avoids edge cases with dynamic keys).
 */
export function readAsaasDefaultCustomerDocumentRaw(): string | undefined {
  const v = process.env.ASAAS_DEFAULT_CUSTOMER_DOCUMENT;
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Lê a chave Asaas com `process.env.ASAAS_API_KEY` estático (Vercel/Next no servidor).
 */
export function readAsaasApiKeyRaw(): string | undefined {
  const v = process.env.ASAAS_API_KEY;
  return typeof v === 'string' ? v : undefined;
}

/** Remove $ inicial, espaços e quebras (paste multi-linha na Vercel). */
export function sanitizeAsaasApiKey(v: string | undefined): string | undefined {
  let t = v?.trim();
  if (!t) return undefined;
  t = t.replace(/^\$+/, '');
  t = t.replace(/\s+/g, '').trim();
  return t || undefined;
}

/**
 * Erro comum: colar token do webhook (whsec_) ou valor truncado.
 * Chaves de API do Asaas começam com `aact_` (produção/sandbox).
 */
export function asaasApiKeyConfigHint(key: string): string | undefined {
  if (key.startsWith('whsec_')) {
    return 'ASAAS_API_KEY está com o token do webhook (whsec_…). No Asaas use Integrações → API Key (chave que começa com aact_), não o segredo do webhook.';
  }
  if (!key.startsWith('aact_')) {
    return 'ASAAS_API_KEY deve ser a chave de API (começa com aact_). Gere em Integrações → API Key no painel Asaas e cole o valor inteiro na Vercel.';
  }
  return undefined;
}
