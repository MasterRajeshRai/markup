import crypto from 'crypto';

/** Iteration count for newly created hashes (OWASP guidance for PBKDF2-HMAC-SHA512 is 210k). */
const PBKDF2_ITERATIONS = 210_000;
/** Iteration count used by the legacy `salt:hash` format. */
const LEGACY_PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const HASH_PREFIX = 'pbkdf2-sha512';

function derive(password: string, salt: string, iterations: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
}

/** Parses either `pbkdf2-sha512$<iterations>$<salt>$<hash>` or the legacy `<salt>:<hash>`. */
function parseStoredHash(stored: string): { iterations: number; salt: string; key: string } | null {
  if (typeof stored !== 'string') return null;
  if (stored.startsWith(`${HASH_PREFIX}$`)) {
    const [, iter, salt, key] = stored.split('$');
    const iterations = parseInt(iter, 10);
    if (!salt || !key || !Number.isFinite(iterations) || iterations < 1000) return null;
    return { iterations, salt, key };
  }
  const [salt, key] = stored.split(':');
  if (!salt || !key) return null;
  return { iterations: LEGACY_PBKDF2_ITERATIONS, salt, key };
}

/**
 * Hash a password securely using PBKDF2 with SHA-512 and random salt.
 * Output is self-describing so the work factor can be raised later.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await derive(password, salt, PBKDF2_ITERATIONS);
  return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a stored hash using timing-safe comparison.
 * Accepts both the current versioned format and the legacy `salt:hash` format.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parsed = parseStoredHash(storedHash);
  if (!parsed) return false;

  const derivedKey = await derive(password, parsed.salt, parsed.iterations);
  const keyBuffer = Buffer.from(parsed.key, 'hex');
  if (keyBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * True when a stored hash uses a weaker/legacy format and should be re-hashed on next successful login.
 */
export function passwordNeedsRehash(storedHash: string): boolean {
  const parsed = parseStoredHash(storedHash);
  if (!parsed) return true;
  return !storedHash.startsWith(`${HASH_PREFIX}$`) || parsed.iterations < PBKDF2_ITERATIONS;
}

/**
 * Burn roughly the same CPU time as a real verification. Used for unknown users so response
 * timing does not reveal whether an account exists.
 */
export async function dummyPasswordVerify(password: string): Promise<void> {
  await derive(password, 'dummy-salt-for-timing-equalisation', PBKDF2_ITERATIONS);
}

/**
 * Hash a session / reset token for storage at rest. Tokens are 256-bit random, so an unsalted
 * SHA-256 is sufficient; a database leak then does not yield usable credentials.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(`token:${token}`).digest('hex');
}

/**
 * Constant-time string comparison (safe for differing lengths).
 */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
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
