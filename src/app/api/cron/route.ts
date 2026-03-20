import { NextResponse } from 'next/server';
import { processProvisioningJobs } from '@/lib/provisioning/processor';
import { runReconciliation } from '@/lib/provisioning/reconciliation';
import { processExpiredVms } from '@/lib/provisioning/teardown';

/**
 * Single daily cron entry (Vercel Hobby: crons must run at most once per day).
 * Chains teardown → provisioning → reconciliation. Sub-routes under /api/cron/*
 * remain for manual calls or Pro-tier schedules.
 */
export async function GET(request: Request) {
  const cronSecret =
    request.headers.get('x-cron-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;

  if (!expected || cronSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const destroyed = await processExpiredVms();
  const processed = await processProvisioningJobs();
  const reconciliation = await runReconciliation();

  return NextResponse.json({
    ok: true,
    destroyed,
    processed,
    reconciliation,
  });
}
