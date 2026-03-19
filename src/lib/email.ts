import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Cloud Gaming VPS <onboarding@resend.dev>';

export interface SendVerificationEmailParams {
  to: string;
  verifyUrl: string;
}

/**
 * Sends the email verification link to the user.
 * Requires RESEND_API_KEY in .env. If not set, logs the link to console (dev fallback).
 * @returns true if email was sent, false if failed or API key missing
 */
export async function sendVerificationEmail({ to, verifyUrl }: SendVerificationEmailParams): Promise<boolean> {
  if (resend) {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Ative sua conta - Cloud Gaming VPS Brazil',
      html: `
        <p>Olá,</p>
        <p>Clique no link abaixo para ativar sua conta:</p>
        <p><a href="${verifyUrl}" style="color: #4F46E5; font-weight: 600;">${verifyUrl}</a></p>
        <p>O link expira em 24 horas.</p>
        <p>Se você não criou esta conta, ignore este e-mail.</p>
        <p>— Cloud Gaming VPS Brazil</p>
      `,
    });
    if (error) {
      console.error('[email] Resend error:', JSON.stringify(error));
      return false;
    }
    return !!data?.id;
  }
  console.warn('[email] RESEND_API_KEY not set. Verification link (add RESEND_API_KEY to .env to send emails):', verifyUrl);
  return false;
}
