import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

function statusLabel(status: string): string {
  switch (status) {
    case 'pending_payment':
      return 'Aguardando pagamento';
    case 'paid':
      return 'Pago';
    case 'provisioning':
      return 'Provisionando';
    case 'active':
      return 'Ativo';
    case 'expired':
      return 'Expirado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
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
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Meus pedidos</h1>
      <p className="mb-6 text-gray-600">
        Estes são os pedidos que você criou. O pagamento e o provisionamento da máquina serão tratados nas próximas etapas.
      </p>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Você ainda não tem pedidos.</p>
          <Link href="/plans" className="mt-4 inline-block text-indigo-600 hover:underline">
            Ver planos disponíveis
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Plano</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Perfil</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Máquina</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.plan.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.machineProfile.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {statusLabel(order.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.provisionedVm ? (
                      <>
                        Máquina: {vmStatusLabel(order.provisionedVm.status)} — Iniciado em{' '}
                        {order.provisionedVm.readyAt
                          ? new Date(order.provisionedVm.readyAt).toLocaleDateString('pt-BR', dateOpts)
                          : '—'}
                        , Encerrado em{' '}
                        {(order.provisionedVm.destroyedAt ?? order.provisionedVm.expiresAt)
                          ? new Date(
                              order.provisionedVm.destroyedAt ?? order.provisionedVm.expiresAt!
                            ).toLocaleDateString('pt-BR', dateOpts)
                          : '—'}
                      </>
                    ) : order.status !== 'pending_payment' ? (
                      'Provisionando...'
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.status === 'pending_payment' && (
                      <Link
                        href={`/orders/${order.id}/pay`}
                        className="inline-block rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
                      >
                        Pagar
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
