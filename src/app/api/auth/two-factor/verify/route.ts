import { NextRequest, NextResponse } from 'next/server';
import { createSession, getPending2FAUserId, clearPending2FA } from '@/lib/auth/session';
import { getTwoFactorSecret, verifyTwoFactorCode } from '@/lib/auth/twoFactor';

export async function POST(request: NextRequest) {
  const userId = await getPending2FAUserId(request);
  if (!userId) {
    return NextResponse.redirect(new URL('/login?error=2fa_expired', request.url));
  }

  const formData = await request.formData();
  const code = (formData.get('code') as string)?.trim();
  if (!code) {
    return NextResponse.redirect(new URL('/two-factor/verify?error=missing', request.url));
  }

  const secret = await getTwoFactorSecret(userId);
  if (!secret || !verifyTwoFactorCode(secret, code)) {
    return NextResponse.redirect(new URL('/two-factor/verify?error=invalid', request.url));
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  clearPending2FA(response);
  await createSession(userId, response);
  return response;
}
