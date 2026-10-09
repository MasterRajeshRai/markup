import crypto from 'crypto';

/**
 * Authenticated encryption (AES-256-GCM) for secrets stored in the database (e.g. TOTP seeds).
 * Key source: APP_ENCRYPTION_KEY (preferred) or, as a fallback, a key derived from JWT_SECRET.
 * Format: v1:<iv b64url>:<tag b64url>:<ciphertext b64url>
 */

function getKey(): Buffer {
  const material = process.env.APP_ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-only-insecure-encryption-key';
  return crypto.createHash('sha256').update(`markup:crypto-box:${material}`).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${ct.toString('base64url')}`;
}

export function decryptSecret(payload: string): string | null {
  try {
    const [version, iv, tag, ct] = payload.split(':');
    if (version !== 'v1' || !iv || !tag || !ct) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(ct, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

/** Short-lived HMAC-signed token (used for the MFA challenge between password and code steps). */
export function signShortToken(payload: Record<string, unknown>, ttlSec: number): string {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec })).toString('base64url');
  const sig = crypto.createHmac('sha256', getKey()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyShortToken<T extends Record<string, unknown>>(token: string): (T & { exp: number }) | null {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = crypto.createHmac('sha256', getKey()).update(body).digest();
    const given = Buffer.from(sig, 'base64url');
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T & { exp: number };
    if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}
