/**
 * Cron endpoint to process expired VMs (teardown).
 * Protected by CRON_SECRET header. Call periodically (e.g. every 5 minutes).
 */

import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/cron-auth';
import { processExpiredVms } from '@/lib/provisioning/teardown';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const destroyed = await processExpiredVms();
  return NextResponse.json({ destroyed });
}
