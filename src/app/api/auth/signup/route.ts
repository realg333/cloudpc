import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { randomBytes } from 'crypto';

const VERIFICATION_EXPIRY_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = (formData.get('email') as string)?.trim()?.toLowerCase();
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (!email || !password) {
      return NextResponse.redirect(new URL('/signup?error=missing', request.url));
    }
    if (password !== passwordConfirm) {
      return NextResponse.redirect(new URL('/signup?error=password_mismatch', request.url));
    }
    if (password.length < 8) {
      return NextResponse.redirect(new URL('/signup?error=password_short', request.url));
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.redirect(new URL('/signup?error=email_taken', request.url));
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, emailVerifiedAt: null },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const verifyUrl = new URL('/verify-email', request.url);
    verifyUrl.searchParams.set('token', token);
    console.log('[stub] Verification link for', email, ':', verifyUrl.toString());

    return NextResponse.redirect(new URL('/login?signup=1', request.url));
  } catch (e) {
    console.error('Signup error', e);
    return NextResponse.redirect(new URL('/signup?error=server', request.url));
  }
}
