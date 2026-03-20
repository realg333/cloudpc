import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { hasActiveOrder } from '@/lib/orders/concurrency';
import { getPaymentGateway, readEnv, sanitizeAsaasApiKey } from '@/lib/payments';
import { createAsaasClient, AsaasHttpError } from '@/lib/payments/asaas-client';
import { ensureAsaasCustomerId } from '@/lib/payments/asaas-customer';
import {
  extractPaymentId,
  extractPixQrFromResponse,
  extractPaymentStatus,
} from '@/lib/payments/asaas-payment';
import { assertRealPixPaymentPayload } from '@/lib/payments/payment-invariants';

const PROVIDER = 'asaas' as const;

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: { orderId?: string; method?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
  }

  const { orderId, method } = body;
  if (!orderId || !method) {
    return NextResponse.json(
      { error: 'orderId e method são obrigatórios' },
      { status: 400 }
    );
  }

  if (method !== 'pix' && method !== 'crypto') {
    return NextResponse.json(
      { error: 'method deve ser "pix" ou "crypto"' },
      { status: 400 }
    );
  }

  if (method === 'crypto') {
    return NextResponse.json(
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
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  if (order.status !== 'pending_payment') {
    return NextResponse.json(
      { error: 'Pedido não está aguardando pagamento' },
      { status: 400 }
    );
  }

  const hasActive = await hasActiveOrder(session.user.id);
  if (hasActive) {
    return NextResponse.json(
      { error: 'Você já possui uma máquina ativa. Aguarde o término para contratar outra.' },
      { status: 409 }
    );
  }

  const amountCents = order.amountCents ?? order.plan.priceCents;
  if (amountCents == null || amountCents <= 0) {
    return NextResponse.json(
      { error: 'Valor do pedido não disponível' },
      { status: 400 }
    );
  }

  const apiKey = sanitizeAsaasApiKey(readEnv('ASAAS_API_KEY'));
  console.log('[payments/create] provider', {
    provider: PROVIDER,
    asaasApiKeySet: Boolean(apiKey),
    asaasWebhookTokenSet: Boolean(readEnv('ASAAS_WEBHOOK_TOKEN')?.trim()),
    vercelDeployment: readEnv('VERCEL_DEPLOYMENT_ID') ?? null,
  });

  let gateway;
  try {
    gateway = getPaymentGateway();
  } catch (e) {
    console.error('[payments/create] gateway', e);
    return NextResponse.json({ error: 'Configuração de pagamentos indisponível' }, { status: 500 });
  }

  const baseUrl = readEnv('ASAAS_API_BASE_URL')?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'Configuração de pagamentos indisponível' }, { status: 500 });
  }

  if (method === 'pix' && order.gatewayChargeId) {
    try {
      const client = createAsaasClient(apiKey, { baseUrl: baseUrl || undefined });
      const snap = await client.getPayment(order.gatewayChargeId);
      const st = (extractPaymentStatus(snap) ?? '').toUpperCase();
      if (st === 'RECEIVED' || st === 'CONFIRMED') {
        return NextResponse.json(
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
            return NextResponse.json(
              { error: 'Resposta de pagamento inválida. Confira o deploy e variáveis ASAAS na Vercel.' },
              { status: 500 }
            );
          }
          const r = NextResponse.json(payload, { status: 201 });
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
    asaasCustomerId = await ensureAsaasCustomerId(prisma, createAsaasClient(apiKey, { baseUrl: baseUrl || undefined }), {
      id: order.user.id,
      email: order.user.email,
      asaasCustomerId: order.user.asaasCustomerId,
    });
  } catch (e) {
    console.error('[payments/create] Asaas customer', e);
    return NextResponse.json(
      { error: 'Não foi possível preparar o cadastro de pagamento. Verifique ASAAS_DEFAULT_CUSTOMER_DOCUMENT.' },
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
    return NextResponse.json(
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

  const res = NextResponse.json(payload, { status: 201 });
  res.headers.set('X-CloudPC-Payment-Provider', PROVIDER);
  return res;
}
