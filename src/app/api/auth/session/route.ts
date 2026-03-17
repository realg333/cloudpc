import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getTwoFactorSecret } from '@/lib/auth/twoFactor';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const twoFactorEnabled = !!(await getTwoFactorSecret(session.user.id));
  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    twoFactorEnabled,
  });
}
