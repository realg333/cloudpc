/**
 * Cron endpoint to process pending provisioning jobs.
 * Protected by CRON_SECRET header. Call periodically (e.g. every minute).
 */

import { NextResponse } from 'next/server';
import { processProvisioningJobs } from '@/lib/provisioning/processor';

export async function GET(request: Request) {
  const cronSecret = request.headers.get('x-cron-secret') ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;

  if (!expected || cronSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const processed = await processProvisioningJobs();
  return NextResponse.json({ processed });
}
