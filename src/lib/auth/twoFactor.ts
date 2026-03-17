import { authenticator } from 'otplib';
import { prisma } from '@/lib/db';

const ISSUER = 'Cloud Gaming VPS Brazil';

export async function generateTwoFactorSecret(userId: string): Promise<string> {
  const secret = authenticator.generateSecret();
  await prisma.twoFactorSecret.upsert({
    where: { userId },
    create: { userId, secret },
    update: { secret, disabledAt: null },
  });
  return secret;
}

export function generateTwoFactorOtpauthUrl(secret: string, email: string): string {
  return authenticator.keyuri(email, ISSUER, secret);
}

export function verifyTwoFactorCode(secret: string, code: string): boolean {
  try {
    return authenticator.verify({ token: code, secret });
  } catch {
    return false;
  }
}

export async function getTwoFactorSecret(userId: string): Promise<string | null> {
  const row = await prisma.twoFactorSecret.findUnique({
    where: { userId },
  });
  if (!row || row.disabledAt) return null;
  return row.secret;
}
