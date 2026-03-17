import { requireAdmin } from '@/lib/auth/admin';

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Painel Admin</h1>
      <p className="mb-6 text-gray-600">
        Monitoramento de VMs, logs e métricas em breve.
      </p>
    </div>
  );
}
