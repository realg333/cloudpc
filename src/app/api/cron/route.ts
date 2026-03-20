import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/cron-auth';
import { processProvisioningJobs } from '@/lib/provisioning/processor';
import { runReconciliation } from '@/lib/provisioning/reconciliation';
import { processExpiredVms } from '@/lib/provisioning/teardown';

/**
 * Chains teardown → provisioning → optionally reconciliation.
 *
 * Query: `reconcile=0` skips full DB↔Vultr reconciliation (avoids listInstances every run).
 * Use frequent runs with reconcile=0 for cost control; call /api/cron/reconciliation on a slower schedule.
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const reconcileParam = url.searchParams.get('reconcile');
  const runFullReconcile =
    reconcileParam !== '0' && reconcileParam?.toLowerCase() !== 'false';

  try {
    const destroyed = await processExpiredVms();
    const processed = await processProvisioningJobs();
    const reconciliation = runFullReconcile ? await runReconciliation() : null;

    return NextResponse.json({
      ok: true,
      destroyed,
      processed,
      reconciliation,
      reconcileSkipped: !runFullReconcile,
    });
  } catch (err) {
    console.error('[api/cron]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: 'Cron handler failed', message },
      { status: 500 }
    );
  }
}
