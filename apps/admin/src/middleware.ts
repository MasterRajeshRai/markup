import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from './lib/security/client-ip';
import { checkCsrf, parseAllowedOrigins, isOriginAllowed } from './lib/security/origin';
import { checkRateLimit, RATE_LIMITS } from './lib/security/rate-limit';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  const origin = req.headers.get('origin');
  const allowedOrigins = parseAllowedOrigins();
  const selfOrigin = req.nextUrl.origin;

  // 1. CORS Preflight Handling for API
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const isAllowed = isOriginAllowed(origin, allowedOrigins, selfOrigin);
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-Key, X-Site-Slug, x-request-id',
      'Access-Control-Max-Age': '86400',
    };

    if (isAllowed && origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    } else {
      // Allow public inspection without credentials
      corsHeaders['Access-Control-Allow-Origin'] = origin || '*';
    }

    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 2. Edge Rate Limiting for high-risk auth endpoints
  if (pathname === '/api/v1/auth/login' || pathname === '/api/v1/auth/mfa/verify') {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`edge:auth:${ip}`, RATE_LIMITS.login);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait before retrying.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.retryAfterSec),
            'X-RateLimit-Limit': String(rate.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rate.resetAt / 1000)),
          },
        }
      );
    }
  } else if (pathname === '/api/v1/auth/forgot-password') {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`edge:forgot:${ip}`, RATE_LIMITS.strict);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please wait.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.retryAfterSec),
            'X-RateLimit-Limit': String(rate.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // 3. CSRF Verification for Cookie-Authenticated State-Changing API Requests
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/v1/forms/') && !pathname.startsWith('/api/v1/comments')) {
    const hasSessionCookie = Boolean(req.cookies.get('cms_session')?.value);
    const hasExplicitCredentials = Boolean(
      req.headers.get('authorization') || req.headers.get('x-api-key')
    );

    const csrf = checkCsrf({
      method: req.method,
      origin,
      referer: req.headers.get('referer'),
      secFetchSite: req.headers.get('sec-fetch-site'),
      selfOrigin,
      allowedOrigins,
      hasSessionCookie,
      hasExplicitCredentials,
    });

    if (!csrf.ok) {
      return NextResponse.json(
        { error: 'Cross-site request blocked (CSRF protection)' },
        { status: 403 }
      );
    }
  }

  // 4. Session Protection for Admin App Routes
  const hasSession = Boolean(req.cookies.get('cms_session')?.value);

  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === '/login') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  // 5. Proceed with Request and Attach Security Headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-request-id', requestId);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // If API request from allowed origin, attach CORS headers
  if (origin && isOriginAllowed(origin, allowedOrigins, selfOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
