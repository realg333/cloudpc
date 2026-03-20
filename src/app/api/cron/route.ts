import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/cron-auth';
import { processProvisioningJobs } from '@/lib/provisioning/processor';
import { runReconciliation } from '@/lib/provisioning/reconciliation';
import { processExpiredVms } from '@/lib/provisioning/teardown';

/**
 * Single daily cron entry (Vercel Hobby: crons must run at most once per day).
 * Chains teardown → provisioning → reconciliation. Sub-routes under /api/cron/*
 * remain for manual calls or Pro-tier schedules.
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const destroyed = await processExpiredVms();
    const processed = await processProvisioningJobs();
    const reconciliation = await runReconciliation();

    return NextResponse.json({
      ok: true,
      destroyed,
      processed,
      reconciliation,
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
