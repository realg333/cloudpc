import { prisma } from '@/lib/db';
import { getPaymentGateway, readAsaasApiKeyRaw, readEnv, sanitizeAsaasApiKey } from '@/lib/payments';
import { createAsaasClient, AsaasHttpError } from '@/lib/payments/asaas-client';
import {
  extractExternalReference,
  extractPaymentStatus,
  extractPaymentValueReais,
  mapAsaasWebhookToPipelineStatus,
  reaisToCents,
  validateAsaasValueMatchesOrder,
} from '@/lib/payments/asaas-payment';
import { runPaymentWebhookPipeline } from '@/lib/payments/webhook-processor';

function jsonResponse(body: object, httpStatus: number) {
  return new Response(JSON.stringify(body), {
    status: httpStatus,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/**
 * Best-effort public URL for logs (Vercel/proxies set x-forwarded-*; tests use localhost).
 * Configure APP_URL (e.g. https://cloudpc.vercel.app) so local logs match production host when needed.
 */
function effectiveRequestUrl(request: Request): { raw: string; effective: string } {
  const raw = request.url;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { raw, effective: raw };
  }

  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    (parsed.protocol === 'https:' ? 'https' : parsed.protocol === 'http:' ? 'http' : 'https');
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.split(',')[0]?.trim() ||
    parsed.host;

  const hostLooksPublic =
    host && host !== 'localhost' && !host.startsWith('127.') && host !== '[::1]';
  if (hostLooksPublic) {
    const scheme = proto === 'http' ? 'http' : 'https';
    return { raw, effective: `${scheme}://${host}${parsed.pathname}${parsed.search}` };
  }

  const appBase = readEnv('APP_URL')?.trim().replace(/\/$/, '');
  if (appBase) {
    try {
      const base = new URL(appBase.includes('://') ? appBase : `https://${appBase}`);
      return { raw, effective: `${base.origin}${parsed.pathname}${parsed.search}` };
    } catch {
      /* ignore */
    }
  }

  return { raw, effective: raw };
}

/** Log-friendly headers: keeps keys, redacts typical secrets. */
function redactHeadersForLog(headers: Record<string, string>): Record<string, string> {
  const sensitive = new Set([
    'asaas-access-token',
    'authorization',
    'cookie',
    'x-signature',
    'x-hub-signature',
  ]);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = sensitive.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return out;
}

export async function POST(request: Request) {
  const headers = Object.fromEntries(request.headers.entries());

  const { raw: urlRaw, effective: url } = effectiveRequestUrl(request);
  console.log('[webhook] webhook hit', {
    method: request.method,
    url,
    urlRaw,
    gateway: 'asaas',
  });
  console.log('[webhook] headers (sanitized)', redactHeadersForLog(headers));

  const rawBody = await request.text();
  console.log('[webhook] raw body', rawBody);

  let gateway;
  try {
    gateway = getPaymentGateway();
  } catch (e) {
    console.error('[webhook] reject', { reason: 'gateway_misconfigured', status: 500 }, e);
    return jsonResponse({ error: 'Payment gateway misconfigured' }, 500);
  }

  const signatureOk = gateway.verifyWebhookSignature(rawBody, headers, { requestUrl: request.url });
  console.log('[webhook] signature verify', signatureOk ? 'ok' : 'fail', { gateway: 'asaas' });

  if (!signatureOk) {
    console.warn('[webhook] reject', {
      reason: 'invalid_signature',
      status: 401,
      hint: 'compare ASAAS_WEBHOOK_TOKEN with asaas-access-token from Asaas webhook config',
    });
    return jsonResponse({ error: 'Invalid signature' }, 401);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch (err) {
    console.warn('[webhook] reject', { reason: 'invalid_json', status: 400 }, err);
    return jsonResponse({ error: 'Invalid payload' }, 400);
  }

  const topLevel =
    parsedJson && typeof parsedJson === 'object' && !Array.isArray(parsedJson)
      ? (parsedJson as Record<string, unknown>)
      : null;
  const eventName = typeof topLevel?.event === 'string' ? topLevel.event : '';
  /** Chave API desativada/expirada — não é evento de pagamento; ack 200 para o Asaas parar retries */
  if (eventName.startsWith('ACCESS_TOKEN')) {
    console.warn('[webhook] asaas token lifecycle (not a payment)', {
      event: eventName,
      hint:
        'ACCESS_TOKEN_DISABLED → reative a chave em Integrações > API Key ou gere nova e atualize ASAAS_API_KEY na Vercel (401 nas chamadas até corrigir).',
    });
    return jsonResponse({ received: true }, 200);
  }

  const parsed = gateway.parseWebhookPayload(parsedJson);
  if (!parsed) {
    console.warn('[webhook] reject', {
      reason: 'payload_parse_failed',
      status: 400,
      hint: 'expect Asaas shape: { event, payment: { id, externalReference?, value?, status? } }',
    });
    return jsonResponse({ error: 'Invalid payload' }, 400);
  }

  console.log('[webhook] event parsed', {
    source: parsed.source,
    event: parsed.eventType,
    notificationId: parsed.notificationId,
    gatewayChargeId: parsed.gatewayChargeId,
    externalReference: parsed.externalReference,
    paymentStatus: parsed.paymentStatus,
    valueReais: parsed.valueReais,
  });

  console.log('[webhook] branch', 'asaas_pipeline');

  const apiKey = sanitizeAsaasApiKey(readAsaasApiKeyRaw() ?? readEnv('ASAAS_API_KEY'));
  if (!apiKey) {
    console.error('[webhook] reject', { reason: 'asaas_api_key_missing', status: 500 });
    return jsonResponse({ error: 'Misconfigured' }, 500);
  }

  let externalRef = parsed.externalReference;
  let valueReais = parsed.valueReais;
  let paymentStatus = parsed.paymentStatus;

  if (!externalRef || valueReais == null || !paymentStatus) {
    const baseUrl = readEnv('ASAAS_API_BASE_URL')?.trim();
    try {
      const client = createAsaasClient(apiKey, { baseUrl: baseUrl || undefined });
      const snap = await client.getPayment(parsed.gatewayChargeId);
      if (!externalRef) externalRef = extractExternalReference(snap);
      if (valueReais == null) {
        const vr = extractPaymentValueReais(snap);
        if (vr != null) valueReais = vr;
      }
      if (!paymentStatus) paymentStatus = extractPaymentStatus(snap);
    } catch (e) {
      if (e instanceof AsaasHttpError) {
        if (e.statusCode === 404) {
          console.warn('[webhook] reject', {
            reason: 'asaas_payment_not_found',
            status: 200,
            gatewayChargeId: parsed.gatewayChargeId,
          });
          return jsonResponse({ received: true }, 200);
        }
        if (e.statusCode >= 500 || e.statusCode === 429) {
          console.error('[webhook] reject', {
            reason: 'asaas_upstream_error',
            status: 500,
            httpStatus: e.statusCode,
          });
          return jsonResponse({ error: 'Upstream error' }, 500);
        }
        console.error('[webhook] reject', {
          reason: 'asaas_get_payment_failed',
          status: 500,
          httpStatus: e.statusCode,
          body: e.body,
        });
        return jsonResponse({ error: 'Upstream error' }, 500);
      }
      console.error('[webhook] reject', { reason: 'asaas_get_payment_exception', status: 500 }, e);
      return jsonResponse({ error: 'Upstream error' }, 500);
    }
  }

  if (!externalRef) {
    console.warn('[webhook] reject', {
      reason: 'missing_external_reference_after_enrich',
      status: 200,
      gatewayChargeId: parsed.gatewayChargeId,
    });
    return jsonResponse({ received: true }, 200);
  }

  const order = await prisma.order.findUnique({
    where: { id: externalRef },
    include: { plan: true, user: true },
  });

  if (!order) {
    console.warn('[webhook] reject', {
      reason: 'order_not_found',
      status: 200,
      externalReference: externalRef,
    });
    return jsonResponse({ received: true }, 200);
  }

  if (order.gatewayChargeId && order.gatewayChargeId !== parsed.gatewayChargeId) {
    console.error('[webhook] reject', {
      reason: 'gateway_charge_id_mismatch',
      status: 200,
      orderId: order.id,
      expected: order.gatewayChargeId,
      got: parsed.gatewayChargeId,
    });
    const dup = await runPaymentWebhookPipeline(prisma, {
      notificationId: parsed.notificationId,
      eventType: parsed.eventType,
      orderId: order.id,
      status: 'ignored',
      gatewayPaymentId: parsed.gatewayChargeId,
      method: 'pix',
      logSource: 'asaas',
    });
    if (dup === 'duplicate') {
      return jsonResponse({ received: true }, 200);
    }
    return jsonResponse({ received: true }, 200);
  }

  let pipelineStatus = mapAsaasWebhookToPipelineStatus(parsed.eventType, paymentStatus);

  if (pipelineStatus === 'paid') {
    const amountCents = order.amountCents ?? order.plan.priceCents ?? 0;
    if (amountCents <= 0) {
      pipelineStatus = 'ignored';
    } else if (valueReais != null) {
      if (reaisToCents(valueReais) !== amountCents) {
        console.error('[webhook] reject', {
          reason: 'amount_mismatch',
          orderId: order.id,
          expectedCents: amountCents,
          valueReais,
        });
        pipelineStatus = 'ignored';
      }
    } else {
      try {
        const client = createAsaasClient(apiKey, {
          baseUrl: readEnv('ASAAS_API_BASE_URL')?.trim() || undefined,
        });
        const snap = await client.getPayment(parsed.gatewayChargeId);
        if (!validateAsaasValueMatchesOrder(snap, amountCents)) {
          console.warn('[webhook] reject', {
            reason: 'amount_validation_failed_from_api',
            orderId: order.id,
            gatewayChargeId: parsed.gatewayChargeId,
          });
          pipelineStatus = 'ignored';
        }
      } catch (err) {
        console.warn('[webhook] reject', { reason: 'amount_validation_fetch_failed', orderId: order.id }, err);
        pipelineStatus = 'ignored';
      }
    }
  }

  console.log('[webhook] asaas pipeline', {
    orderId: order.id,
    pipelineStatus,
    eventType: parsed.eventType,
    paymentStatus,
  });

  const dup = await runPaymentWebhookPipeline(prisma, {
    notificationId: parsed.notificationId,
    eventType: parsed.eventType,
    orderId: order.id,
    status: pipelineStatus,
    gatewayPaymentId: parsed.gatewayChargeId,
    method: 'pix',
    logSource: 'asaas',
  });

  if (dup === 'duplicate') {
    return jsonResponse({ received: true }, 200);
  }

  return jsonResponse({ received: true }, 200);
}
