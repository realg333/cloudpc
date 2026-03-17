import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import DashboardVmList from '@/components/DashboardVmList';

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  const vms = await prisma.provisionedVm.findMany({
    where: { order: { userId: session.user.id } },
    include: {
      order: { include: { plan: true } },
      machineProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const initialVms = vms.map((vm) => ({
    id: vm.id,
    status: vm.status,
    readyAt: vm.readyAt?.toISOString() ?? null,
    expiresAt: vm.expiresAt?.toISOString() ?? null,
    connectionMethod: vm.connectionMethod,
    connectionState: vm.connectionState,
    machineProfileName: vm.machineProfile.name,
    planName: vm.order.plan.name,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Minhas Máquinas</h1>
      <p className="mb-6 text-gray-600">
        Suas VMs ativas e recentes. O status é atualizado automaticamente.{' '}
        <Link href="/orders" className="text-indigo-600 hover:underline">
          Ver histórico de pedidos
        </Link>
      </p>
      {initialVms.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Você ainda não tem máquinas. Faça um pedido para começar.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/plans" className="text-indigo-600 hover:underline">
              Ver planos disponíveis
            </Link>
            <Link href="/orders" className="text-indigo-600 hover:underline">
              Ver histórico de pedidos
            </Link>
          </div>
        </div>
      ) : (
        <DashboardVmList initialVms={initialVms} />
      )}
    </div>
  );
}
