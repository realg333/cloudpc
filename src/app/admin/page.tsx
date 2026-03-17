import { requireAdmin } from '@/lib/auth/admin';
import AdminVmList from '@/components/AdminVmList';

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
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Métricas</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-gray-500">Em breve.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Logs</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-gray-500">Em breve.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
