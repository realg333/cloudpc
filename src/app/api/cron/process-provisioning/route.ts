/**
 * Cron endpoint to process pending provisioning jobs.
 * Protected by CRON_SECRET header. Call periodically (e.g. every minute).
 */

import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/cron-auth';
import { processProvisioningJobs } from '@/lib/provisioning/processor';

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const processed = await processProvisioningJobs();
  return NextResponse.json({ processed });
}
