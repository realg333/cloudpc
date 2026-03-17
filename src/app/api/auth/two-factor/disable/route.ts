import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const formData = await request.formData();
  const password = formData.get('password')?.toString();
  if (!password) {
    return NextResponse.redirect(new URL('/profile?error=missing-password', request.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL('/profile?error=invalid-password', request.url));
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

  return NextResponse.redirect(new URL('/profile?success=2fa-disabled', request.url));
}
