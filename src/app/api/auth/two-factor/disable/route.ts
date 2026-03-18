import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';
import { getBaseUrl } from '@/lib/auth/getBaseUrl';

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const formData = await request.formData();
  const password = formData.get('password')?.toString();
  if (!password) {
    return NextResponse.redirect(new URL('/profile?error=missing-password', baseUrl));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL('/profile?error=invalid-password', baseUrl));
  }

  const secret = await prisma.twoFactorSecret.findFirst({
    where: { userId: session.user.id, disabledAt: null },
  });
  if (secret) {
    await prisma.twoFactorSecret.update({
      where: { id: secret.id },
      data: { disabledAt: new Date() },
    });
  }

  return NextResponse.redirect(new URL('/profile?success=2fa-disabled', baseUrl));
}
