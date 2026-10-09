/**
 * Origin / CORS / CSRF helpers. Edge-safe.
 *
 * CSRF model: the session cookie is `SameSite=Lax`, which already blocks cross-site POSTs from
 * most browsers. This adds defence in depth: any state-changing request authenticated by the
 * session COOKIE must come from an allowed Origin (or Sec-Fetch-Site same-origin). Requests that
 * authenticate with an explicit `Authorization` / `X-API-Key` header are not CSRF-able (browsers
 * never attach those automatically) and are exempt.
 */

export const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function parseAllowedOrigins(raw: string | undefined = process.env.ALLOWED_ORIGINS): string[] {
  return (raw || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

export function isOriginAllowed(origin: string | null, allowed: string[], selfOrigin?: string): boolean {
  if (!origin) return false;
  const o = origin.replace(/\/+$/, '');
  if (selfOrigin && o === selfOrigin.replace(/\/+$/, '')) return true;
  return allowed.includes(o);
}

export interface CsrfInput {
  method: string;
  origin: string | null;
  referer: string | null;
  secFetchSite: string | null;
  /** The request's own origin, e.g. https://cms.example.com */
  selfOrigin: string;
  allowedOrigins: string[];
  hasSessionCookie: boolean;
  hasExplicitCredentials: boolean;
}

export type CsrfDecision = { ok: true } | { ok: false; reason: string };

export function checkCsrf(input: CsrfInput): CsrfDecision {
  if (!UNSAFE_METHODS.has(input.method.toUpperCase())) return { ok: true };
  // Not cookie-authenticated, or authenticated by an explicit header → not CSRF-able.
  if (!input.hasSessionCookie || input.hasExplicitCredentials) return { ok: true };

  if (input.secFetchSite === 'same-origin') return { ok: true };

  let source = input.origin;
  if (!source && input.referer) {
    try {
      source = new URL(input.referer).origin;
    } catch {
      source = null;
    }
  }
  if (!source) {
    // Non-browser clients and old browsers: be strict for cookie-authenticated writes.
    return { ok: false, reason: 'missing_origin' };
  }
  if (isOriginAllowed(source, input.allowedOrigins, input.selfOrigin)) return { ok: true };
  return { ok: false, reason: 'cross_origin' };
}

export interface CorsDecision {
  headers: Record<string, string>;
}

const CORS_ALLOW_HEADERS = 'Content-Type, Authorization, X-API-Key, X-Site-Slug, X-Requested-With, If-None-Match';
const CORS_ALLOW_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';

/**
 * Credentialed CORS is only granted to origins on the allowlist. Everyone else gets wildcard
 * CORS WITHOUT credentials, which is enough for the public delivery API (API key in header) and
 * can never expose a logged-in user's cookies.
 */
export function buildCorsHeaders(origin: string | null, allowed: string[], selfOrigin?: string): Record<string, string> {
  const base: Record<string, string> = {
    'Access-Control-Allow-Methods': CORS_ALLOW_METHODS,
    'Access-Control-Allow-Headers': CORS_ALLOW_HEADERS,
    'Access-Control-Max-Age': '600',
    'Access-Control-Expose-Headers': 'ETag, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After',
  };
  if (origin && isOriginAllowed(origin, allowed, selfOrigin)) {
    return {
      ...base,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin',
    };
  }
  return { ...base, 'Access-Control-Allow-Origin': '*' };
}
