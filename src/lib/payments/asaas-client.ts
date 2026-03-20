/**
 * HTTP client for Asaas API v3.
 * @see https://docs.asaas.com/reference
 */

const DEFAULT_TIMEOUT_MS = 25_000;
const DEFAULT_BASE_URL = 'https://api.asaas.com';

export class AsaasHttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly body?: unknown
  ) {
    super(message);
    this.name = 'AsaasHttpError';
  }
}

export class AsaasNetworkError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AsaasNetworkError';
  }
}

function firstAsaasErrorEntry(body: unknown): Record<string, unknown> | null {
  const o = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  if (!o) return null;
  const errors = o.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;
  const first = errors[0];
  if (first && typeof first === 'object' && first !== null) return first as Record<string, unknown>;
  return null;
}

/** `code` + `description` do primeiro item de `errors[]` (logs e mensagens ao utilizador). */
export function extractAsaasFirstErrorFields(body: unknown): { code?: string; description?: string } {
  const e = firstAsaasErrorEntry(body);
  if (!e) return {};
  const code = e.code;
  const description = e.description;
  return {
    code: typeof code === 'string' ? code : undefined,
    description: typeof description === 'string' && description.trim() ? description.trim() : undefined,
  };
}

/** First error description from Asaas JSON body `{ errors: [{ description }] }`. */
export function extractAsaasFirstErrorDescription(body: unknown): string | undefined {
  return extractAsaasFirstErrorFields(body).description;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      throw new AsaasNetworkError(`Request timed out after ${timeoutMs}ms`);
    }
    throw new AsaasNetworkError('Network error calling Asaas', e);
  } finally {
    clearTimeout(id);
  }
}

export function effectiveAsaasApiBaseUrl(override?: string): string {
  let raw = (override ?? DEFAULT_BASE_URL).trim().replace(/\/$/, '');
  // Paths already include /v3/...; strip accidental /v3 on env (common misconfig)
  if (raw.endsWith('/v3')) {
    raw = raw.slice(0, -3);
  }
  return raw;
}

export interface CreateAsaasCustomerInput {
  name: string;
  email?: string;
  cpfCnpj: string;
  externalReference: string;
}

export interface CreateAsaasPixPaymentInput {
  customerId: string;
  valueReais: number;
  dueDateYmd: string;
  externalReference: string;
  description?: string;
}

export function createAsaasClient(apiKey: string, options?: { baseUrl?: string; timeoutMs?: number }) {
  const baseUrl = effectiveAsaasApiBaseUrl(options?.baseUrl);
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Asaas exige User-Agent em contas criadas após 11/06/2024 (senão pode retornar 401)
  const headers: Record<string, string> = {
    access_token: apiKey,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'CloudPC-CloudGamingVPS/1.0 (Asaas API)',
  };

  async function parseJson(res: Response): Promise<unknown> {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  return {
    async listCustomers(params: {
      email?: string;
      externalReference?: string;
      limit?: number;
    }): Promise<unknown> {
      const q = new URLSearchParams();
      if (params.email) q.set('email', params.email);
      if (params.externalReference) q.set('externalReference', params.externalReference);
      q.set('limit', String(params.limit ?? 10));
      const url = `${baseUrl}/v3/customers?${q.toString()}`;
      const res = await fetchWithTimeout(url, { method: 'GET', headers }, timeoutMs);
      const json = await parseJson(res);
      if (!res.ok) {
        throw new AsaasHttpError(`Asaas list customers failed: ${res.status}`, res.status, json);
      }
      return json;
    },

    async createCustomer(input: CreateAsaasCustomerInput): Promise<unknown> {
      const body = {
        name: input.name,
        email: input.email,
        cpfCnpj: input.cpfCnpj.replace(/\D/g, ''),
        externalReference: input.externalReference,
      };
      const res = await fetchWithTimeout(
        `${baseUrl}/v3/customers`,
        { method: 'POST', headers, body: JSON.stringify(body) },
        timeoutMs
      );
      const json = await parseJson(res);
      if (!res.ok) {
        throw new AsaasHttpError(`Asaas create customer failed: ${res.status}`, res.status, json);
      }
      return json;
    },

    async createPixPayment(input: CreateAsaasPixPaymentInput): Promise<unknown> {
      const body = {
        customer: input.customerId,
        billingType: 'PIX',
        value: input.valueReais,
        dueDate: input.dueDateYmd,
        externalReference: input.externalReference,
        description: input.description,
      };
      const res = await fetchWithTimeout(
        `${baseUrl}/v3/payments`,
        { method: 'POST', headers, body: JSON.stringify(body) },
        timeoutMs
      );
      const json = await parseJson(res);
      if (!res.ok) {
        throw new AsaasHttpError(`Asaas create payment failed: ${res.status}`, res.status, json);
      }
      return json;
    },

    async getPayment(paymentId: string): Promise<unknown> {
      const res = await fetchWithTimeout(
        `${baseUrl}/v3/payments/${encodeURIComponent(paymentId)}`,
        { method: 'GET', headers },
        timeoutMs
      );
      const json = await parseJson(res);
      if (!res.ok) {
        throw new AsaasHttpError(`Asaas get payment failed: ${res.status}`, res.status, json);
      }
      return json;
    },

    async getPixQrCode(paymentId: string): Promise<unknown> {
      const res = await fetchWithTimeout(
        `${baseUrl}/v3/payments/${encodeURIComponent(paymentId)}/pixQrCode`,
        { method: 'GET', headers },
        timeoutMs
      );
      const json = await parseJson(res);
      if (!res.ok) {
        throw new AsaasHttpError(`Asaas get pix QR failed: ${res.status}`, res.status, json);
      }
      return json;
    },
  };
}

export type AsaasClient = ReturnType<typeof createAsaasClient>;
