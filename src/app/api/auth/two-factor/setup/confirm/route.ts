import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getTwoFactorSecret, verifyTwoFactorCode } from '@/lib/auth/twoFactor';

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const formData = await request.formData();
  const code = (formData.get('code') as string)?.trim();
  if (!code) {
    return NextResponse.redirect(new URL('/two-factor/setup?error=missing', request.url));
  }

  const secret = await getTwoFactorSecret(session.user.id);
  if (!secret || !verifyTwoFactorCode(secret, code)) {
    return NextResponse.redirect(new URL('/two-factor/setup?error=invalid', request.url));
  }

  return NextResponse.redirect(new URL('/two-factor/setup?success=1', request.url));
}
