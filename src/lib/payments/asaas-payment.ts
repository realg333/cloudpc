/**
 * Parse Asaas payment payloads for webhooks and reconciliation.
 */

import type { WebhookPipelineStatus } from './webhook-processor';

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' ? v : undefined;
}

function getNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return undefined;
}

export function reaisToCents(value: number): number {
  return Math.round(value * 100 + Number.EPSILON);
}

export function extractPaymentId(snapshot: unknown): string | null {
  const o = asRecord(snapshot);
  if (!o) return null;
  return getString(o, 'id') ?? null;
}

export function extractExternalReference(snapshot: unknown): string | null {
  const o = asRecord(snapshot);
  if (!o) return null;
  return getString(o, 'externalReference') ?? null;
}

export function extractPaymentValueReais(snapshot: unknown): number | null {
  const o = asRecord(snapshot);
  if (!o) return null;
  const v = getNumber(o, 'value');
  return v != null ? v : null;
}

export function extractPaymentStatus(snapshot: unknown): string | null {
  const o = asRecord(snapshot);
  if (!o) return null;
  const s = getString(o, 'status');
  return s ?? null;
}

export function validateAsaasValueMatchesOrder(snapshot: unknown, expectedAmountCents: number): boolean {
  const reais = extractPaymentValueReais(snapshot);
  if (reais == null) return false;
  return reaisToCents(reais) === expectedAmountCents;
}

/**
 * Map Asaas charge webhook event + payment.status → pipeline status.
 */
export function mapAsaasWebhookToPipelineStatus(
  eventType: string,
  paymentStatus: string | null
): WebhookPipelineStatus {
  const ev = eventType.toUpperCase();
  const st = (paymentStatus ?? '').toUpperCase();

  if (ev === 'PAYMENT_OVERDUE') {
    return 'expired';
  }

  if (ev === 'PAYMENT_DELETED') {
    return 'failed';
  }

  if (ev === 'PAYMENT_CONFIRMED' || ev === 'PAYMENT_RECEIVED') {
    if (st === 'RECEIVED' || st === 'CONFIRMED') {
      return 'paid';
    }
    return 'ignored';
  }

  return 'ignored';
}

export interface PixQrFromAsaas {
  payload?: string;
  encodedImage?: string;
}

export function extractPixQrFromResponse(json: unknown): PixQrFromAsaas | null {
  const o = asRecord(json);
  if (!o) return null;
  const payload = getString(o, 'payload');
  const encodedImage = getString(o, 'encodedImage');
  if (!payload && !encodedImage) return null;
  return { payload, encodedImage };
}
