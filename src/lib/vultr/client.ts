/**
 * Vultr REST API client for instance lifecycle (create, get, delete).
 * Uses fetch directly — no SDK. VULTR_API_KEY required at runtime.
 */

const VULTR_BASE = 'https://api.vultr.com/v2';

export interface CreateInstanceParams {
  region: string;
  plan: string;
  os_id: number;
  label?: string;
  hostname?: string;
}

export interface VultrInstance {
  id: string;
  status: 'pending' | 'active' | 'suspended' | 'stopped';
  main_ip?: string;
  region?: string;
  plan?: string;
  label?: string;
  hostname?: string;
  [key: string]: unknown;
}

function getApiKey(): string {
  const key = process.env.VULTR_API_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    throw new Error('VULTR_API_KEY is required. Set it in your environment or .env.local.');
  }
  return key.trim();
}

async function vultrFetch<T>(
  path: string,
  options: RequestInit & { parseJson?: boolean } = {}
): Promise<T> {
  const { parseJson = true, ...init } = options;
  const key = getApiKey();
  const res = await fetch(`${VULTR_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  if (!res.ok) {
    const err = new Error(`Vultr API error: ${res.status} ${res.statusText}`) as Error & {
      status?: number;
      body?: unknown;
    };
    err.status = res.status;
    err.body = body;
    throw err;
  }

  if (parseJson && body !== null) {
    return body as T;
  }
  return text as unknown as T;
}

/**
 * Create a new Vultr instance.
 * @returns Instance object with id, status, main_ip, etc.
 * @throws On non-2xx; error includes body for lastProviderResponse
 */
export async function createInstance(params: CreateInstanceParams): Promise<VultrInstance> {
  const body = {
    region: params.region,
    plan: params.plan,
    os_id: params.os_id,
    label: params.label ?? undefined,
    hostname: params.hostname ?? undefined,
  };
  const res = await vultrFetch<{ instance?: VultrInstance }>(`/instances`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const instance = (res as { instance?: VultrInstance }).instance;
  if (!instance) {
    throw new Error('Vultr API did not return instance in response');
  }
  return instance;
}

/**
 * Get instance by ID.
 * @returns Instance with status, main_ip, etc.
 * @throws On 404 or non-2xx
 */
export async function getInstance(instanceId: string): Promise<VultrInstance> {
  const res = await vultrFetch<{ instance?: VultrInstance }>(`/instances/${instanceId}`);
  const instance = (res as { instance?: VultrInstance }).instance;
  if (!instance) {
    throw new Error(`Vultr API did not return instance for id ${instanceId}`);
  }
  return instance;
}

/**
 * List instances. Supports optional cursor for pagination.
 * @returns Array of instances
 */
export async function listInstances(): Promise<VultrInstance[]> {
  const res = await vultrFetch<{ instances?: VultrInstance[] }>(`/instances`);
  const instances = (res as { instances?: VultrInstance[] }).instances;
  return instances ?? [];
}

/**
 * Delete instance by ID.
 * @returns void on 204
 * @throws On non-2xx
 */
export async function deleteInstance(instanceId: string): Promise<void> {
  const res = await fetch(`${VULTR_BASE}/instances/${instanceId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });
  if (res.status === 204 || res.status === 200) {
    return;
  }
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  const err = new Error(`Vultr API error: ${res.status} ${res.statusText}`) as Error & {
    status?: number;
    body?: unknown;
  };
  err.status = res.status;
  err.body = body;
  throw err;
}
