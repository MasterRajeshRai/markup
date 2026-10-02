import { prisma } from '@headless/database';
import { hashStringSha256 } from '@headless/core';
import { NextRequest, NextResponse } from 'next/server';

export interface ApiAuthResult {
  authenticated: boolean;
  apiKeyId?: string;
  role?: string;
  scopes?: string[];
  environment?: string;
  errorResponse?: NextResponse;
}

/**
 * Authenticates public Delivery and Management REST API requests
 */
export async function authenticateApiRequest(
  req: NextRequest,
  requiredScope?: string
): Promise<ApiAuthResult> {
  let token: string | null = null;

  // 1. Bearer Token
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. X-API-Key Header
  if (!token) {
    token = req.headers.get('x-api-key');
  }

  // 3. Query param api_key
  if (!token) {
    token = req.nextUrl.searchParams.get('api_key');
  }

  if (!token) {
    // If it's a GET request to read content, check if anonymous public read is permitted
    if (req.method === 'GET' && requiredScope === 'content:read') {
      return { authenticated: true, role: 'PUBLIC', scopes: ['content:read'] };
    }

    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Missing API Key. Provide via Bearer token, X-API-Key header, or ?api_key=' },
        { status: 401 }
      ),
    };
  }

  // Hash key to find in database
  const keyHash = hashStringSha256(token);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
  });

  if (!apiKey) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Invalid API key' }, { status: 401 }),
    };
  }

  if (apiKey.revokedAt) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json({ error: 'Unauthorized: API key has been revoked' }, { status: 401 }),
    };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json({ error: 'Unauthorized: API key has expired' }, { status: 401 }),
    };
  }

  const scopes = (apiKey.scopes as string[]) || [];

  if (requiredScope && !scopes.includes(requiredScope) && !scopes.includes('*')) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        { error: `Forbidden: API key lacks required scope [${requiredScope}]` },
        { status: 403 }
      ),
    };
  }

  // Asynchronously update lastUsedAt without blocking
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    authenticated: true,
    apiKeyId: apiKey.id,
    role: apiKey.role,
    scopes,
    environment: apiKey.environment,
  };
}
