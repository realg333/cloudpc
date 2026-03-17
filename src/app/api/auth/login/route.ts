import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setPending2FA } from '@/lib/auth/session';
import { getTwoFactorSecret } from '@/lib/auth/twoFactor';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = (formData.get('email') as string)?.trim()?.toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return NextResponse.redirect(new URL('/login?error=missing', request.url));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }
  if (!user.emailVerifiedAt) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'unverified');
    url.searchParams.set('email', email);
    return NextResponse.redirect(url);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }

  const twoFactorSecret = await getTwoFactorSecret(user.id);
  const response = NextResponse.redirect(new URL('/', request.url));

  if (twoFactorSecret) {
    const redirectResponse = NextResponse.redirect(new URL('/two-factor/verify', request.url));
    await setPending2FA(user.id, redirectResponse);
    return redirectResponse;
  }

  await createSession(user.id, response);
  return response;
}
