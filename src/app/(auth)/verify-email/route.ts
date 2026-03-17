import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  const verification = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL('/login?verified=1', request.url));
}
