import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { hasActiveOrder } from '@/lib/orders/concurrency';
import { createMockGateway } from '@/lib/payments/mock-gateway';

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

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { plan: true },
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

  const gateway = createMockGateway();
  const result = await gateway.createPaymentIntent({
    orderId,
    amountCents,
    currency: order.currency ?? 'BRL',
    method: method as 'pix' | 'crypto',
    metadata: { userId: session.user.id },
  });

  return NextResponse.json(
    {
      paymentId: result.paymentId,
      qrCode: result.qrCode,
      redirectUrl: result.redirectUrl,
    },
    { status: 201 }
  );
}
