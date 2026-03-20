/**
 * Validates x-cron-secret or Authorization: Bearer against CRON_SECRET.
 * Trims whitespace to avoid mismatches from copy/paste in GitHub / Vercel UIs.
 */
export function isCronAuthorized(request: Request): boolean {
  const raw =
    request.headers.get('x-cron-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token = raw?.trim() ?? '';
  const expected = process.env.CRON_SECRET?.trim() ?? '';
  return Boolean(expected && token && token === expected);
}
