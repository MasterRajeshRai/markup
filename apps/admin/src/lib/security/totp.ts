import crypto from 'crypto';

/**
 * RFC 6238 TOTP (SHA-1, 6 digits, 30 s) — compatible with Google Authenticator, Authy, 1Password, etc.
 */

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes));
}

export function hotp(secret: Buffer, counter: number, digits = 6): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, '0');
}

export function totp(secretB32: string, timeMs = Date.now(), stepSec = 30, digits = 6): string {
  return hotp(base32Decode(secretB32), Math.floor(timeMs / 1000 / stepSec), digits);
}

export const generateTotpCode = totp;

/** Verifies a code allowing ±`window` steps of clock drift. Returns the matched step counter or null. */
export function verifyTotp(secretB32: string, code: string, window = 1, timeMs = Date.now(), stepSec = 30): number | null {
  const cleaned = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleaned)) return null;
  const secret = base32Decode(secretB32);
  const current = Math.floor(timeMs / 1000 / stepSec);
  for (let w = -window; w <= window; w++) {
    const expected = hotp(secret, current + w);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleaned))) return current + w;
  }
  return null;
}

export function buildOtpAuthUri(secretB32: string, accountEmail: string, issuer = 'Markup CMS'): string {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  return `otpauth://totp/${label}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** Generates N human-friendly one-time backup codes like "a1b2-c3d4". */
export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const h = crypto.randomBytes(4).toString('hex');
    return `${h.slice(0, 4)}-${h.slice(4)}`;
  });
}
