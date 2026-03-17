/**
 * Public diagnostic endpoint — remove after debugging.
 * GET /api/db-check — tests DB connection and returns plan count.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const planCount = await prisma.plan.count();
    const profileCount = await prisma.machineProfile.count();
    return NextResponse.json({
      ok: true,
      plans: planCount,
      machineProfiles: profileCount,
      message: planCount === 0 ? 'DB conectado, mas Plan está vazio — rode: npx prisma db seed' : 'OK',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
