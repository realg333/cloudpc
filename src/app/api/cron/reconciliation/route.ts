/**
 * Cron endpoint to run DB vs Vultr reconciliation.
 * Protected by CRON_SECRET header. Call periodically (e.g. every 15 minutes).
 */

import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/cron-auth';
import { runReconciliation } from '@/lib/provisioning/reconciliation';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await runReconciliation();
  return NextResponse.json(summary);
}
