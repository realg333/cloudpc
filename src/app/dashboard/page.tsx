import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import VmStatusCard from '@/components/VmStatusCard';

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

  const activeFirst = [...vms].sort((a, b) => {
    const active = ['vm_ready', 'expiring', 'provisioning', 'payment_confirmed'];
    const aIdx = active.indexOf(a.status);
    const bIdx = active.indexOf(b.status);
    if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
    if (aIdx >= 0) return -1;
    if (bIdx >= 0) return 1;
    return 0;
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Minhas Máquinas</h1>
      <p className="mb-6 text-gray-600">
        Suas VMs ativas e recentes.
      </p>
      {vms.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Você ainda não tem máquinas. Faça um pedido para começar.</p>
          <Link href="/plans" className="mt-4 inline-block text-indigo-600 hover:underline">
            Ver planos disponíveis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeFirst.map((vm) => (
            <VmStatusCard
              key={vm.id}
              vm={{
                id: vm.id,
                status: vm.status,
                readyAt: vm.readyAt,
                expiresAt: vm.expiresAt,
                machineProfileName: vm.machineProfile.name,
                planName: vm.order.plan.name,
                connectionMethod: vm.connectionMethod,
                connectionState: vm.connectionState,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
