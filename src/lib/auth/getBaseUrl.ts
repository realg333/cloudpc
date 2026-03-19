import type { NextRequest } from 'next/server';

/**
 * Returns the public base URL for redirects.
 * Uses x-forwarded-host and x-forwarded-proto when behind a proxy (e.g. Vercel)
 * to avoid redirecting to internal URLs.
 * Falls back to APP_URL (Vercel env) when headers are missing.
 */
export function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    return appUrl.replace(/\/$/, '');
  }
  return new URL(request.url).origin;
}
