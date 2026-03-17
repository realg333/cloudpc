/**
 * Cron endpoint to process expired VMs (teardown).
 * Protected by CRON_SECRET header. Call periodically (e.g. every 5 minutes).
 */

import { NextResponse } from 'next/server';
import { processExpiredVms } from '@/lib/provisioning/teardown';

export async function GET(request: Request) {
  const cronSecret =
    request.headers.get('x-cron-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;

  if (!expected || cronSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const destroyed = await processExpiredVms();
  return NextResponse.json({ destroyed });
}
