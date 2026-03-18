import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBaseUrl } from '@/lib/auth/getBaseUrl';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', baseUrl));
  }

  const verification = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl));
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

  return NextResponse.redirect(new URL('/login?verified=1', baseUrl));
}
