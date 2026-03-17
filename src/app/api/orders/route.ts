import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      plan: true,
      machineProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      planName: o.plan.name,
      profileName: o.machineProfile.name,
      status: o.status,
      createdAt: o.createdAt,
    }))
  );
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: { planId?: string; machineProfileId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
  }

  const { planId, machineProfileId } = body;
  if (!planId || !machineProfileId) {
    return NextResponse.json(
      { error: 'planId e machineProfileId são obrigatórios' },
      { status: 400 }
    );
  }

  const [plan, machineProfile] = await Promise.all([
    prisma.plan.findFirst({ where: { id: planId, isActive: true } }),
    prisma.machineProfile.findFirst({ where: { id: machineProfileId, isActive: true } }),
  ]);

  if (!plan) {
    return NextResponse.json({ error: 'Plano não encontrado ou inativo' }, { status: 404 });
  }
  if (!machineProfile) {
    return NextResponse.json({ error: 'Perfil de máquina não encontrado ou inativo' }, { status: 404 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      machineProfileId: machineProfile.id,
      status: 'pending_payment',
      amountCents: plan.priceCents,
      currency: 'BRL',
    },
    include: {
      plan: true,
      machineProfile: true,
    },
  });

  return NextResponse.json({
    id: order.id,
    planName: order.plan.name,
    profileName: order.machineProfile.name,
    status: order.status,
    createdAt: order.createdAt,
  });
}
