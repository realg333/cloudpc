import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import PaymentForm from '@/components/PaymentForm';
import PaymentAmbientMotion from '@/components/PaymentAmbientMotion';

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
    include: { plan: true, machineProfile: true, user: true },
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
    <div className="dark-plans checkout-shell relative -mt-8 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <PaymentAmbientMotion
        intensity="subtle"
        section="checkout"
        className="opacity-70 [mask-image:radial-gradient(circle_at_center,black_0%,black_62%,transparent_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">Pagamento</h1>
            <p className="text-sm text-slate-300 sm:text-base">
              Complete o pagamento para ativar sua máquina na nuvem.
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-violet-400/35 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
          >
            ← Voltar aos pedidos
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="checkout-card checkout-card-elevated rounded-2xl p-5 sm:p-6">
            <PaymentForm orderId={order.id} initialPayerDocument={order.user.cpfCnpj ?? ''} />
          </section>

          <aside className="checkout-card rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24 lg:h-fit">
            <h2 className="mb-4 text-lg font-semibold text-white">Resumo do pedido</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-400">Plano</dt>
                <dd className="text-right font-medium text-slate-100">{order.plan.name}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-400">Perfil</dt>
                <dd className="text-right font-medium text-slate-100">{order.machineProfile.name}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-white/10 pt-3">
                <dt className="text-slate-300">Valor</dt>
                <dd className="text-right text-base font-semibold text-violet-100">{amountFormatted}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
