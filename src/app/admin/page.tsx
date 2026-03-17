import { requireAdmin } from '@/lib/auth/admin';
import AdminVmList from '@/components/AdminVmList';
import AdminHealthSection from '@/components/AdminHealthSection';
import AdminLogsSection from '@/components/AdminLogsSection';

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Painel Admin</h1>
      <p className="mb-6 text-gray-600">
        Monitoramento de VMs, logs e métricas.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">VMs Ativas</h2>
          <AdminVmList />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Métricas e Saúde</h2>
          <AdminHealthSection />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Logs</h2>
          <AdminLogsSection />
        </section>
      </div>
    </div>
  );
}
