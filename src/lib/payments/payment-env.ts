/**
 * Runtime env reads use process.env['NAME'] so Next.js is less likely to inline
 * undefined at build time for Route Handlers (see Next.js env bundling).
 */

export function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === 'string' ? v : undefined;
}

/** Strip accidental leading $ from pasted shell-style values. */
export function sanitizeAsaasApiKey(v: string | undefined): string | undefined {
  const t = v?.trim();
  if (!t) return undefined;
  return t.replace(/^\$+/, '').trim() || undefined;
}
