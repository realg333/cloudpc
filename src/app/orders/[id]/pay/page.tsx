import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import PaymentForm from '@/components/PaymentForm';

interface PayPageProps {
  params: Promise<{ id: string }>;
}

export default async function PayPage({ params }: PayPageProps) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/orders');
  }

  const { id: orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { plan: true, machineProfile: true },
  });

  if (!order || order.userId !== session.user.id) {
    redirect('/orders');
  }

  if (order.status !== 'pending_payment') {
    redirect('/orders');
  }

  const amountCents = order.amountCents ?? order.plan.priceCents ?? 0;
  const amountFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: order.currency ?? 'BRL',
  }).format(amountCents / 100);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Pagamento</h1>
      <p className="mb-6 text-gray-600">
        Complete o pagamento para ativar sua máquina na nuvem.
      </p>

      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Resumo do pedido</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Plano</dt>
            <dd className="font-medium text-gray-900">{order.plan.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Perfil</dt>
            <dd className="font-medium text-gray-900">{order.machineProfile.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Valor</dt>
            <dd className="font-medium text-gray-900">{amountFormatted}</dd>
          </div>
        </dl>
      </div>

      <PaymentForm orderId={order.id} />

      <p className="mt-6">
        <Link href="/orders" className="text-indigo-600 hover:underline">
          ← Voltar aos pedidos
        </Link>
      </p>
    </div>
  );
}
