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

/** Strip accidental leading $ from pasted shell-style values. */
export function sanitizeAsaasApiKey(v: string | undefined): string | undefined {
  const t = v?.trim();
  if (!t) return undefined;
  return t.replace(/^\$+/, '').trim() || undefined;
}
