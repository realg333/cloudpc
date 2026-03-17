/**
 * Cron endpoint to run DB vs Vultr reconciliation.
 * Protected by CRON_SECRET header. Call periodically (e.g. every 15 minutes).
 */

import { NextResponse } from 'next/server';
import { runReconciliation } from '@/lib/provisioning/reconciliation';

export async function GET(request: Request) {
  const cronSecret =
    request.headers.get('x-cron-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;

  if (!expected || cronSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await runReconciliation();
  return NextResponse.json(summary);
}
