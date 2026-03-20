import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { hasActiveOrder } from '@/lib/orders/concurrency';
import {
  getPaymentGateway,
  readAsaasDefaultCustomerDocumentRaw,
  readEnv,
  sanitizeAsaasApiKey,
} from '@/lib/payments';
import {
  createAsaasClient,
  AsaasHttpError,
  extractAsaasFirstErrorDescription,
} from '@/lib/payments/asaas-client';
import { ensureAsaasCustomerId } from '@/lib/payments/asaas-customer';
import {
  extractPaymentId,
  extractPixQrFromResponse,
  extractPaymentStatus,
} from '@/lib/payments/asaas-payment';
import { assertRealPixPaymentPayload } from '@/lib/payments/payment-invariants';
import {
  PAYER_DOCUMENT_REQUIRED,
  resolvePayerDocumentDigits,
} from '@/lib/br-tax-id';

const PROVIDER = 'asaas' as const;

/** Bumps when payment API responses change — check Response headers on /api/payments/create */
const PAYMENTS_API_REVISION = '2025-03-20';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function paymentJson(data: unknown, init?: ResponseInit) {
  const r = NextResponse.json(data, init);
  r.headers.set('X-CloudPC-Payments-API', PAYMENTS_API_REVISION);
  return r;
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return paymentJson({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: { orderId?: string; method?: string; cpfCnpj?: string };
  try {
    body = await request.json();
  } catch {
    return paymentJson({ error: 'Corpo da requisição inválido' }, { status: 400 });
  }

  const { orderId, method, cpfCnpj: cpfCnpjFromBody } = body;
  if (!orderId || !method) {
    return paymentJson(
      { error: 'orderId e method são obrigatórios' },
      { status: 400 }
    );
  }

  if (method !== 'pix' && method !== 'crypto') {
    return paymentJson(
      { error: 'method deve ser "pix" ou "crypto"' },
      { status: 400 }
    );
  }

  if (method === 'crypto') {
    return paymentJson(
      { error: 'Pagamento em cripto não está disponível no momento. Use PIX.' },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      amountCents: true,
      currency: true,
      machineProfileId: true,
      gatewayChargeId: true,
      gatewayChargeCreatedAt: true,
      plan: true,
      user: true,
    },
  });

  if (!order) {
    return paymentJson({ error: 'Pedido não encontrado' }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return paymentJson({ error: 'Acesso negado' }, { status: 403 });
  }

  if (order.status !== 'pending_payment') {
    return paymentJson(
      { error: 'Pedido não está aguardando pagamento' },
      { status: 400 }
    );
  }

  const hasActive = await hasActiveOrder(session.user.id);
  if (hasActive) {
    return paymentJson(
      { error: 'Você já possui uma máquina ativa. Aguarde o término para contratar outra.' },
      { status: 409 }
    );
  }

  const amountCents = order.amountCents ?? order.plan.priceCents;
  if (amountCents == null || amountCents <= 0) {
    return paymentJson(
      { error: 'Valor do pedido não disponível' },
      { status: 400 }
    );
  }

  const apiKey = sanitizeAsaasApiKey(readEnv('ASAAS_API_KEY'));
  const envDocDigits = readAsaasDefaultCustomerDocumentRaw()?.replace(/\D/g, '') ?? '';
  const payerDocumentDigits = resolvePayerDocumentDigits({
    bodyCpfCnpj: cpfCnpjFromBody,
    userCpfCnpj: order.user.cpfCnpj,
    envFallbackDigits: envDocDigits,
  });
  console.log('[payments/create] provider', {
    provider: PROVIDER,
    asaasApiKeySet: Boolean(apiKey),
    asaasWebhookTokenSet: Boolean(readEnv('ASAAS_WEBHOOK_TOKEN')?.trim()),
    payerDocumentResolved: payerDocumentDigits.length === 11 || payerDocumentDigits.length === 14,
    vercelDeployment: readEnv('VERCEL_DEPLOYMENT_ID') ?? null,
  });

  let gateway;
  try {
    gateway = getPaymentGateway();
  } catch (e) {
    console.error('[payments/create] gateway', e);
    return paymentJson({ error: 'Configuração de pagamentos indisponível' }, { status: 500 });
  }

  const baseUrl = readEnv('ASAAS_API_BASE_URL')?.trim();
  if (!apiKey) {
    return paymentJson({ error: 'Configuração de pagamentos indisponível' }, { status: 500 });
  }

  if (method === 'pix' && order.gatewayChargeId) {
    try {
      const client = createAsaasClient(apiKey, { baseUrl: baseUrl || undefined });
      const snap = await client.getPayment(order.gatewayChargeId);
      const st = (extractPaymentStatus(snap) ?? '').toUpperCase();
      if (st === 'RECEIVED' || st === 'CONFIRMED') {
        return paymentJson(
          { error: 'Pagamento já confirmado. Atualize a página de pedidos.' },
          { status: 400 }
        );
      }
      const payId = extractPaymentId(snap);
      if (payId) {
        const qrJson = await client.getPixQrCode(payId);
        const pix = extractPixQrFromResponse(qrJson);
        if (pix && (pix.payload || pix.encodedImage)) {
          const payload = {
            provider: PROVIDER,
            paymentId: payId,
            qrCode: pix.payload,
            qrCodeBase64: pix.encodedImage,
          };
          try {
            assertRealPixPaymentPayload(payload);
          } catch (inv) {
            console.error('[payments/create] invariant (reuse charge)', inv);
            return paymentJson(
              { error: 'Resposta de pagamento inválida. Confira o deploy e variáveis ASAAS na Vercel.' },
              { status: 500 }
            );
          }
          const r = paymentJson(payload, { status: 201 });
          r.headers.set('X-CloudPC-Payment-Provider', PROVIDER);
          return r;
        }
      }
    } catch (e) {
      if (e instanceof AsaasHttpError && e.statusCode === 404) {
        await prisma.order.update({
          where: { id: order.id },
          data: { gatewayChargeId: null, gatewayChargeCreatedAt: null },
        });
      } else {
        console.warn('[payments/create] reuse Asaas charge failed, creating new', e);
      }
    }
  }

  let asaasCustomerId: string;
  try {
    asaasCustomerId = await ensureAsaasCustomerId(
      prisma,
      createAsaasClient(apiKey, { baseUrl: baseUrl || undefined }),
      {
        id: order.user.id,
        email: order.user.email,
        asaasCustomerId: order.user.asaasCustomerId,
        cpfCnpj: order.user.cpfCnpj,
      },
      payerDocumentDigits
    );
  } catch (e) {
    console.error('[payments/create] Asaas customer', e);
    if (e instanceof Error && e.message === PAYER_DOCUMENT_REQUIRED) {
      return paymentJson(
        {
          error:
            'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) do titular do pagamento, ou defina ASAAS_DEFAULT_CUSTOMER_DOCUMENT no servidor (fallback).',
        },
        { status: 400 }
      );
    }
    if (e instanceof AsaasHttpError) {
      const fromApi = extractAsaasFirstErrorDescription(e.body);
      console.error('[payments/create] Asaas customer API', { status: e.statusCode, body: e.body });
      if (e.statusCode === 401 || e.statusCode === 403) {
        return paymentJson(
          {
            error: fromApi
              ? `${fromApi} Confira ASAAS_API_KEY, ASAAS_API_BASE_URL (produção vs sandbox) e o painel Asaas (chave ativa / ambiente).`
              : 'A API Asaas recusou a autenticação. Verifique ASAAS_API_KEY e ASAAS_API_BASE_URL (sandbox vs produção) na Vercel.',
          },
          { status: 500 }
        );
      }
      return paymentJson(
        {
          error:
            fromApi ??
            'O Asaas rejeitou o cadastro do cliente. Confira se o CPF/CNPJ em ASAAS_DEFAULT_CUSTOMER_DOCUMENT é válido, se a chave API corresponde ao ambiente (sandbox vs produção) e os logs do deploy.',
        },
        { status: e.statusCode === 400 ? 400 : 502 }
      );
    }
    return paymentJson(
      {
        error:
          'Não foi possível preparar o cadastro de pagamento. Tente de novo em instantes ou contate o suporte.',
      },
      { status: 500 }
    );
  }

  const result = await gateway.createPaymentIntent({
    orderId,
    amountCents,
    currency: order.currency ?? 'BRL',
    method: 'pix',
    metadata: {
      userId: session.user.id,
      payerEmail: order.user.email,
      asaasCustomerId,
    },
  });

  try {
    assertRealPixPaymentPayload({
      paymentId: result.paymentId,
      qrCode: result.qrCode,
      qrCodeBase64: result.qrCodeBase64,
    });
  } catch (inv) {
    console.error('[payments/create] invariant (new charge)', inv);
    return paymentJson(
      { error: 'Resposta de pagamento inválida. Confira o deploy e variáveis ASAAS na Vercel.' },
      { status: 500 }
    );
  }

  if (result.gatewayChargeId) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        gatewayChargeId: result.gatewayChargeId,
        gatewayChargeCreatedAt: new Date(),
      },
    });
  }

  const payload = {
    provider: PROVIDER,
    paymentId: result.paymentId,
    qrCode: result.qrCode,
    qrCodeBase64: result.qrCodeBase64,
    redirectUrl: result.redirectUrl,
  };

  const res = paymentJson(payload, { status: 201 });
  res.headers.set('X-CloudPC-Payment-Provider', PROVIDER);
  return res;
}
