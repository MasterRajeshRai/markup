import crypto from 'crypto';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

/**
 * Hash a password securely using PBKDF2 with SHA-512 and random salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify a password against a stored salt:hash string using timing-safe comparison
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      const keyBuffer = Buffer.from(key, 'hex');
      const match = crypto.timingSafeEqual(keyBuffer, derivedKey);
      resolve(match);
    });
  });
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure API Key pair:
 * secretKey: Given to the user once (e.g. "cms_live_abc123...")
 * keyPrefix: First 12 chars to display in UI for identification
 * keyHash: SHA256 hash stored in DB
 */
export function generateApiKey(environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' = 'PRODUCTION'): {
  secretKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const envPrefix = environment === 'PRODUCTION' ? 'cms_live' : 'cms_test';
  const random = crypto.randomBytes(24).toString('hex');
  const secretKey = `${envPrefix}_${random}`;
  const keyPrefix = secretKey.slice(0, 14);
  const keyHash = hashStringSha256(secretKey);

  return { secretKey, keyPrefix, keyHash };
}

/**
 * Hash any string with SHA-256
 */
export function hashStringSha256(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

/**
 * Generate a signed preview token with expiration
 */
export function createPreviewToken(entryId: string, secret: string, expiresInMinutes = 60): string {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const payload = `${entryId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

/**
 * Verify a signed preview token
 */
export function verifyPreviewToken(token: string, secret: string): { valid: boolean; entryId?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [entryId, expiresAtStr, signature] = decoded.split(':');
    if (!entryId || !expiresAtStr || !signature) return { valid: false };

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return { valid: false };

    const expectedPayload = `${entryId}:${expiresAtStr}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: true, entryId };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

/**
 * Sign webhook payload with HMAC-SHA256
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
