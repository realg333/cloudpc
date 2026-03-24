import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import PaymentAmbientMotion from '@/components/PaymentAmbientMotion';
import PaymentStatusBadge from '@/components/PaymentStatusBadge';
import { PAYMENT_STATUS_UI, type FrontendPaymentStatus } from '@/lib/payments/payment-ui';

function toFrontendPaymentStatus(status: string): FrontendPaymentStatus {
  switch (status) {
    case 'pending_payment':
    case 'paid':
    case 'provisioning':
    case 'active':
    case 'expired':
    case 'cancelled':
      return status;
    default:
      return 'error';
  }
}

function pendingGuidance(status: FrontendPaymentStatus): string | null {
  switch (status) {
    case 'pending_payment':
      return 'Pagar agora libera o provisionamento da maquina automaticamente.';
    case 'paid':
      return 'Pagamento confirmado. Se demorar para atualizar, aguarde alguns segundos e recarregue.';
    case 'provisioning':
      return 'A confirmacao pode levar alguns instantes enquanto sua maquina e preparada.';
    default:
      return null;
  }
}

function vmStatusLabel(status: string): string {
  switch (status) {
    case 'payment_confirmed':
      return 'Confirmando pagamento';
    case 'provisioning':
      return 'Provisionando';
    case 'vm_ready':
      return 'Pronto';
    case 'expiring':
      return 'Expirando';
    case 'destroying':
      return 'Encerrando';
    case 'destroyed':
      return 'Encerrado';
    case 'failed':
      return 'Falhou';
    default:
      return status;
  }
}

const dateOpts: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export default async function OrdersPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      plan: true,
      machineProfile: true,
      provisionedVm: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="checkout-shell relative isolate overflow-hidden rounded-2xl border border-violet-500/25 p-4 sm:p-6 lg:p-8">
      <PaymentAmbientMotion intensity="subtle" section="orders" className="opacity-70" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5" />
      <div className="relative z-10">
        <h1 className="mb-2 text-2xl font-bold text-violet-50">Meus pedidos</h1>
        <p className="mb-6 max-w-3xl text-sm text-violet-100/80 sm:text-base">
          Estes sao os pedidos que voce criou. O pagamento e o provisionamento da maquina serao tratados nas proximas etapas.
        </p>

        {orders.length === 0 ? (
          <div className="checkout-card rounded-xl p-8 text-center">
            <p className="text-violet-100/80">Voce ainda nao tem pedidos.</p>
            <Link href="/plans" className="mt-4 inline-block text-violet-300 hover:text-violet-200 hover:underline">
              Ver planos disponiveis
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 lg:hidden">
              {orders.map((order) => {
                const status = toFrontendPaymentStatus(order.status);
                const statusUi = PAYMENT_STATUS_UI[status];
                const guidance = pendingGuidance(status);

                return (
                  <article key={order.id} className="checkout-card rounded-xl p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/70">Data</p>
                        <p className="text-sm text-violet-50">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', dateOpts)}
                        </p>
                      </div>
                      <PaymentStatusBadge status={status} />
                    </div>

                    <dl className="grid grid-cols-1 gap-3 text-sm text-violet-100/85">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-violet-200/70">Plano</dt>
                        <dd className="text-violet-50">{order.plan.name}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-violet-200/70">Perfil</dt>
                        <dd className="text-violet-50">{order.machineProfile.name}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-violet-200/70">Status</dt>
                        <dd>{statusUi.hint}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-violet-200/70">Maquina</dt>
                        <dd>
                          {order.provisionedVm ? (
                            <>
                              Maquina: {vmStatusLabel(order.provisionedVm.status)} - Iniciado em{' '}
                              {order.provisionedVm.readyAt
                                ? new Date(order.provisionedVm.readyAt).toLocaleDateString('pt-BR', dateOpts)
                                : '-'}
                              , Encerrado em{' '}
                              {(order.provisionedVm.destroyedAt ?? order.provisionedVm.expiresAt)
                                ? new Date(
                                    order.provisionedVm.destroyedAt ?? order.provisionedVm.expiresAt!
                                  ).toLocaleDateString('pt-BR', dateOpts)
                                : '-'}
                            </>
                          ) : order.status !== 'pending_payment' ? (
                            'Provisionando...'
                          ) : (
                            '-'
                          )}
                        </dd>
                      </div>
                    </dl>

                    {guidance && <p className="mt-3 text-xs text-violet-200/80">{guidance}</p>}

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-200/70">Acoes</p>
                      {order.status === 'pending_payment' ? (
                        <Link
                          href={`/orders/${order.id}/pay`}
                          className="inline-flex rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                        >
                          Pagar
                        </Link>
                      ) : (
                        <span className="text-sm text-violet-200/70">-</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-violet-500/20 lg:block">
              <table className="min-w-full divide-y divide-violet-500/20">
                <thead className="bg-violet-500/10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-violet-100/80">
                      Data
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-violet-100/80">
                      Plano
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-violet-100/80">
                      Perfil
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-violet-100/80">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-violet-100/80">
                      Maquina
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-violet-100/80">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-500/15 bg-black/20">
                  {orders.map((order) => {
                    const status = toFrontendPaymentStatus(order.status);
                    const statusUi = PAYMENT_STATUS_UI[status];
                    const guidance = pendingGuidance(status);

                    return (
                      <tr key={order.id}>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-violet-100/85">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', dateOpts)}
                        </td>
                        <td className="px-3 py-3 text-sm text-violet-50">{order.plan.name}</td>
                        <td className="px-3 py-3 text-sm text-violet-50">{order.machineProfile.name}</td>
                        <td className="px-3 py-3 text-sm text-violet-100/85">
                          <div className="space-y-1">
                            <PaymentStatusBadge status={status} variant="compact" />
                            <p className="text-xs text-violet-200/70">{statusUi.hint}</p>
                            {guidance && <p className="text-xs text-violet-200/80">{guidance}</p>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-violet-100/85">
                          {order.provisionedVm ? (
                            <>
                              Maquina: {vmStatusLabel(order.provisionedVm.status)} - Iniciado em{' '}
                              {order.provisionedVm.readyAt
                                ? new Date(order.provisionedVm.readyAt).toLocaleDateString('pt-BR', dateOpts)
                                : '-'}
                              , Encerrado em{' '}
                              {(order.provisionedVm.destroyedAt ?? order.provisionedVm.expiresAt)
                                ? new Date(
                                    order.provisionedVm.destroyedAt ?? order.provisionedVm.expiresAt!
                                  ).toLocaleDateString('pt-BR', dateOpts)
                                : '-'}
                            </>
                          ) : order.status !== 'pending_payment' ? (
                            'Provisionando...'
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {order.status === 'pending_payment' ? (
                            <Link
                              href={`/orders/${order.id}/pay`}
                              className="inline-flex rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                            >
                              Pagar
                            </Link>
                          ) : (
                            <span className="text-xs text-violet-200/70">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
