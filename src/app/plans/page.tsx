import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import { listPlanOptions } from '@/lib/plans/catalog';
import PlanCard from '@/components/PlanCard';

export default async function PlansPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/plans');
  }

  const options = await listPlanOptions();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Planos disponíveis</h1>
      <p className="mb-8 text-gray-600">
        Escolha um pacote de tempo fixo combinado com um perfil de máquina. Cada plano define por quanto tempo
        você terá acesso; cada perfil define a GPU, RAM e CPU da sua máquina na nuvem. Pagamento via PIX ou cripto.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => (
          <PlanCard
            key={`${opt.planId}-${opt.machineProfileId}`}
            planId={opt.planId}
            planName={opt.planName}
            durationHours={opt.durationHours}
            machineProfileId={opt.machineProfileId}
            profileName={opt.profileName}
            gpuTier={opt.gpuTier}
            ramGb={opt.ramGb}
            cpuSummary={opt.cpuSummary}
          />
        ))}
      </div>
    </div>
  );
}
