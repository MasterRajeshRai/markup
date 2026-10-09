import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, requirePermission, type AdminAuthSession } from '@/lib/auth';
import { authenticateApiRequest } from '@/lib/api-auth';
import { getClientIp } from '@/lib/security/client-ip';
import { rateLimit, rateLimitHeaders, type RateLimitRule } from '@/lib/security/rate-limit';

/**
 * Route-level guard. Every API route handler must call `guard()` as its first statement.
 * `security-routes.test.ts` enforces that invariant, so a new route is DENY-BY-DEFAULT:
 * calling `guard(req)` with no options requires a logged-in session.
 */
export interface GuardOptions {
  /** Intentionally unauthenticated endpoint. Pair with `rate` and strict input validation. */
  public?: boolean;
  /** Require this RBAC permission (e.g. "settings.manage"). */
  permission?: string;
  /** Require ANY of these permissions. */
  anyPermission?: string[];
  /** Also accept an API key carrying this scope (for machine-to-machine delivery endpoints). */
  apiKeyScope?: string;
  /** Rate-limit rule. Keyed by user id when logged in, else by client IP. */
  rate?: RateLimitRule;
}

export type GuardResult =
  | { ok: true; session: AdminAuthSession | null; ip: string; apiKeyId?: string }
  | { ok: false; response: NextResponse };

function deny(status: number, error: string, extra?: Record<string, string>): { ok: false; response: NextResponse } {
  return { ok: false, response: NextResponse.json({ error }, { status, headers: extra }) };
}

export async function guard(req: NextRequest, options: GuardOptions = {}): Promise<GuardResult> {
  const ip = getClientIp(req.headers, (req as unknown as { ip?: string }).ip);

  let session: AdminAuthSession | null = null;
  if (!options.public || options.permission || options.anyPermission) {
    session = await getAdminSession(req);
  }

  if (options.rate) {
    const rl = await rateLimit(options.rate, session?.user.id ?? ip);
    if (!rl.allowed) {
      return deny(429, 'Too many requests. Please slow down and try again shortly.', rateLimitHeaders(rl));
    }
  }

  if (options.public && !options.permission && !options.anyPermission) {
    return { ok: true, session, ip };
  }

  if (!session) {
    if (options.apiKeyScope) {
      const api = await authenticateApiRequest(req, options.apiKeyScope);
      if (api.authenticated && api.role !== 'PUBLIC') {
        return { ok: true, session: null, ip, apiKeyId: api.apiKeyId };
      }
      if (api.errorResponse) return { ok: false, response: api.errorResponse };
    }
    return deny(401, 'Unauthorized: Authentication required');
  }

  if (options.permission) {
    const check = requirePermission(session, options.permission);
    if (!check.authorized) return { ok: false, response: check.response! };
  }
  if (options.anyPermission && options.anyPermission.length > 0) {
    const allowed = options.anyPermission.some((p) => requirePermission(session, p).authorized);
    if (!allowed) return deny(403, 'Forbidden: Missing required permission');
  }

  return { ok: true, session, ip };
}

/** Returns a generic 500 body. Detailed errors go to server logs only. */
export function serverError(err: unknown, context: string): NextResponse {
  console.error(`[api:${context}]`, err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
