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
    <div className="dark-plans relative -mt-8 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen overflow-x-hidden bg-[#0a0a0f] text-slate-100">
      <div className="mx-auto max-w-4xl px-4 pt-12 pb-16 sm:px-6">
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Minhas Máquinas
          </h1>
          <p className="mt-1.5 text-base text-slate-400">
            Suas VMs ativas e recentes. O status é atualizado automaticamente.
          </p>
          <Link
            href="/orders"
            className="mt-3 inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-[#0a0a0f] rounded"
          >
            Ver histórico de pedidos →
          </Link>
        </header>

      {initialVms.length === 0 ? (
        <div
          className="rounded-2xl border border-white/10 bg-[#16161f] p-10 sm:p-14 text-center shadow-[0_0_40px_rgba(99,102,241,0.08)]"
          role="status"
          aria-label="Nenhuma máquina provisionada"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-white">
            Sua primeira máquina está a um clique
          </h2>
          <p className="mt-3 max-w-md mx-auto text-slate-400 leading-relaxed">
            Provisione uma VM com GPU em minutos. Jogue seus jogos favoritos ou use para trabalho pesado — sem precisar de hardware caro.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              GPU dedicada
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Conexão Parsec
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Pague só pelo uso
            </li>
          </ul>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/plans"
              className="inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 hover:from-indigo-400 hover:to-violet-500 hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-[#0a0a0f]"
            >
              Ver planos e começar
            </Link>
            <Link
              href="/orders"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-medium text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-[#0a0a0f]"
            >
              Ver histórico de pedidos
            </Link>
          </div>
        </div>
      ) : (
        <DashboardVmList initialVms={initialVms} />
      )}
      </div>
    </div>
  );
}
