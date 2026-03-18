import { NextRequest, NextResponse } from 'next/server';
import { createSession, getPending2FAUserId, clearPending2FA } from '@/lib/auth/session';
import { getTwoFactorSecret, verifyTwoFactorCode } from '@/lib/auth/twoFactor';
import { getBaseUrl } from '@/lib/auth/getBaseUrl';

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const userId = await getPending2FAUserId(request);
  if (!userId) {
    return NextResponse.redirect(new URL('/login?error=2fa_expired', baseUrl));
  }

  const formData = await request.formData();
  const code = (formData.get('code') as string)?.trim();
  if (!code) {
    return NextResponse.redirect(new URL('/two-factor/verify?error=missing', baseUrl));
  }

  const secret = await getTwoFactorSecret(userId);
  if (!secret || !verifyTwoFactorCode(secret, code)) {
    return NextResponse.redirect(new URL('/two-factor/verify?error=invalid', baseUrl));
  }

  const response = NextResponse.redirect(new URL('/', baseUrl));
  clearPending2FA(response);
  await createSession(userId, response);
  return response;
}
