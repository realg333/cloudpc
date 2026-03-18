import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setPending2FA } from '@/lib/auth/session';
import { getTwoFactorSecret } from '@/lib/auth/twoFactor';
import { getBaseUrl } from '@/lib/auth/getBaseUrl';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = (formData.get('email') as string)?.trim()?.toLowerCase();
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirect') as string)?.trim();
  const safeRedirect =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';

  const baseUrl = getBaseUrl(request);

  if (!email || !password) {
    return NextResponse.redirect(new URL('/login?error=missing', baseUrl));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid', baseUrl));
  }
  if (!user.emailVerifiedAt) {
    const url = new URL('/login', baseUrl);
    url.searchParams.set('error', 'unverified');
    url.searchParams.set('email', email);
    return NextResponse.redirect(url);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL('/login?error=invalid', baseUrl));
  }

  const twoFactorSecret = await getTwoFactorSecret(user.id);
  const response = NextResponse.redirect(new URL(safeRedirect, baseUrl));

  if (twoFactorSecret) {
    const redirectResponse = NextResponse.redirect(new URL('/two-factor/verify', baseUrl));
    await setPending2FA(user.id, redirectResponse);
    return redirectResponse;
  }

  await createSession(user.id, response);
  return response;
}
