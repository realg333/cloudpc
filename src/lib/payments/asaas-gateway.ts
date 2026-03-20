import { createHash, timingSafeEqual } from 'crypto';
import type {
  PaymentGateway,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  ParsedWebhookNotification,
} from './gateway';
import { createAsaasClient, AsaasHttpError } from './asaas-client';
import { extractPaymentId, extractPixQrFromResponse } from './asaas-payment';

function todaySaoPauloYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

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

export interface AsaasGatewayConfig {
  apiKey: string;
  webhookToken: string;
  baseUrl?: string;
}

export function createAsaasGateway(config: AsaasGatewayConfig): PaymentGateway {
  const client = createAsaasClient(config.apiKey, { baseUrl: config.baseUrl });

  return {
    async createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult> {
      if (params.method !== 'pix') {
        throw new Error('Asaas gateway supports PIX only in this phase');
      }

      const customerId = params.metadata?.asaasCustomerId?.trim();
      if (!customerId) {
        throw new Error('asaasCustomerId is required in metadata for Asaas PIX');
      }

      const valueReais = params.amountCents / 100;
      const json = await client.createPixPayment({
        customerId,
        valueReais,
        dueDateYmd: todaySaoPauloYmd(),
        externalReference: params.orderId,
        description: `Pedido ${params.orderId}`,
      });

      const paymentId = extractPaymentId(json);
      if (!paymentId) {
        throw new AsaasHttpError('Unexpected Asaas create payment response shape', 502, json);
      }

      let qrCode: string | undefined;
      let qrCodeBase64: string | undefined;

      try {
        const qrJson = await client.getPixQrCode(paymentId);
        const pix = extractPixQrFromResponse(qrJson);
        if (pix) {
          qrCode = pix.payload;
          qrCodeBase64 = pix.encodedImage;
        }
      } catch (e) {
        if (e instanceof AsaasHttpError && e.statusCode === 404) {
          /* QR may not be ready yet; client can retry create route */
        } else {
          throw e;
        }
      }

      return {
        paymentId,
        gatewayChargeId: paymentId,
        qrCode,
        qrCodeBase64,
      };
    },

    verifyWebhookSignature(payload: string, headers: Record<string, string>): boolean {
      const expected = config.webhookToken.trim();
      if (!expected) return false;

      const headerRaw =
        headers['asaas-access-token'] ??
        headers['Asaas-Access-Token'] ??
        headers['ASAAS-ACCESS-TOKEN'];
      if (!headerRaw) return false;

      try {
        const a = Buffer.from(headerRaw, 'utf8');
        const b = Buffer.from(expected, 'utf8');
        if (a.length !== b.length) return false;
        return timingSafeEqual(a, b);
      } catch {
        return false;
      }
    },

    parseWebhookPayload(body: unknown): ParsedWebhookNotification | null {
      if (!body || typeof body !== 'object') return null;
      const o = body as Record<string, unknown>;

      const eventType = getString(o, 'event');
      if (!eventType) return null;

      const payment = o.payment;
      const p = asRecord(payment);
      if (!p) return null;

      const gatewayChargeId = getString(p, 'id');
      if (!gatewayChargeId) return null;

      const externalReference = getString(p, 'externalReference') ?? null;
      const valueReais = getNumber(p, 'value') ?? null;
      const paymentStatus = getString(p, 'status') ?? null;

      const rawId = o.id;
      const notificationId =
        rawId != null
          ? String(rawId)
          : createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 32);

      return {
        source: 'asaas',
        notificationId,
        eventType,
        gatewayChargeId,
        externalReference,
        valueReais,
        paymentStatus,
      };
    },
  };
}

export { AsaasHttpError };
