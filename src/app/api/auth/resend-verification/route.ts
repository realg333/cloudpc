import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { getBaseUrl } from '@/lib/auth/getBaseUrl';
import { randomBytes } from 'crypto';

const VERIFICATION_EXPIRY_HOURS = 24;

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  try {
    const formData = await request.formData();
    const email = (formData.get('email') as string)?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'E-mail não encontrado.' }, { status: 404 });
    }
    if (user.emailVerifiedAt) {
      return NextResponse.json({ error: 'E-mail já verificado. Faça login.' }, { status: 400 });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
      prisma.emailVerificationToken.create({
        data: { userId: user.id, token, expiresAt },
      }),
    ]);

    const verifyUrl = new URL('/verify-email', baseUrl);
    verifyUrl.searchParams.set('token', token);

    await sendVerificationEmail({ to: email, verifyUrl: verifyUrl.toString() });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Resend verification error', e);
    return NextResponse.json(
      { error: 'Erro ao reenviar. Tente novamente.' },
      { status: 500 }
    );
  }
}
