import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getTwoFactorSecret, verifyTwoFactorCode } from '@/lib/auth/twoFactor';
import { getBaseUrl } from '@/lib/auth/getBaseUrl';

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const formData = await request.formData();
  const code = (formData.get('code') as string)?.trim();
  if (!code) {
    return NextResponse.redirect(new URL('/two-factor/setup?error=missing', baseUrl));
  }

  const secret = await getTwoFactorSecret(session.user.id);
  if (!secret || !verifyTwoFactorCode(secret, code)) {
    return NextResponse.redirect(new URL('/two-factor/setup?error=invalid', baseUrl));
  }

  return NextResponse.redirect(new URL('/two-factor/setup?success=1', baseUrl));
}
