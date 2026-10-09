import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { checkRateLimit, MemoryRateLimitStore } from './lib/security/rate-limit';
import { checkCsrf, isOriginAllowed } from './lib/security/origin';
import { isPrivateIp, parseOutboundUrl } from './lib/security/ssrf';
import { generateTotpSecret, generateTotpCode, verifyTotp, generateBackupCodes } from './lib/security/totp';
import { validatePasswordPolicy } from './lib/security/password-policy';
import { encryptSecret, decryptSecret, signShortToken, verifyShortToken } from './lib/security/crypto-box';
import { hashPassword, verifyPassword, safeEqual } from '../../../packages/core/src/security/hash';
import { evaluateImageSeo, generateSmartAltFromFilename } from './lib/image-seo';

describe('Security Suite: Invariants & Hardening', () => {
  describe('1. Rate Limiting', () => {
    it('allows requests within limit and decrements remaining', () => {
      const rule = { name: 'test_limit', limit: 3, windowMs: 10_000 };
      const res1 = checkRateLimit('user_ip_1', rule);
      assert.equal(res1.allowed, true);
      assert.equal(res1.remaining, 2);

      const res2 = checkRateLimit('user_ip_1', rule);
      assert.equal(res2.allowed, true);
      assert.equal(res2.remaining, 1);

      const res3 = checkRateLimit('user_ip_1', rule);
      assert.equal(res3.allowed, true);
      assert.equal(res3.remaining, 0);

      const res4 = checkRateLimit('user_ip_1', rule);
      assert.equal(res4.allowed, false);
      assert.ok(res4.retryAfterSec > 0);
    });

    it('isolates different keys', () => {
      const rule = { name: 'test_isolate', limit: 1, windowMs: 10_000 };
      checkRateLimit('ip_a', rule);
      const resA = checkRateLimit('ip_a', rule);
      assert.equal(resA.allowed, false);

      const resB = checkRateLimit('ip_b', rule);
      assert.equal(resB.allowed, true);
    });
  });

  describe('2. Origin & CSRF Protection', () => {
    it('allows safe HTTP GET without origin check', () => {
      const res = checkCsrf({
        method: 'GET',
        origin: 'https://evil.com',
        referer: null,
        secFetchSite: 'cross-site',
        selfOrigin: 'https://cms.local',
        allowedOrigins: [],
        hasSessionCookie: true,
        hasExplicitCredentials: false,
      });
      assert.equal(res.ok, true);
    });

    it('blocks cross-site cookie-authenticated mutating requests', () => {
      const res = checkCsrf({
        method: 'POST',
        origin: 'https://evil.com',
        referer: 'https://evil.com/attacker',
        secFetchSite: 'cross-site',
        selfOrigin: 'https://cms.local',
        allowedOrigins: ['https://frontend.com'],
        hasSessionCookie: true,
        hasExplicitCredentials: false,
      });
      assert.equal(res.ok, false);
    });

    it('allows cookie writes from verified same-origin or allowed frontend', () => {
      const resSelf = checkCsrf({
        method: 'POST',
        origin: 'https://cms.local',
        referer: 'https://cms.local/admin',
        secFetchSite: 'same-origin',
        selfOrigin: 'https://cms.local',
        allowedOrigins: ['https://frontend.com'],
        hasSessionCookie: true,
        hasExplicitCredentials: false,
      });
      assert.equal(resSelf.ok, true);

      const resFrontend = checkCsrf({
        method: 'POST',
        origin: 'https://frontend.com',
        referer: 'https://frontend.com/',
        secFetchSite: 'cross-site',
        selfOrigin: 'https://cms.local',
        allowedOrigins: ['https://frontend.com'],
        hasSessionCookie: true,
        hasExplicitCredentials: false,
      });
      assert.equal(resFrontend.ok, true);
    });

    it('allows mutating requests with explicit API credentials regardless of origin', () => {
      const res = checkCsrf({
        method: 'DELETE',
        origin: 'https://mobile-app.internal',
        referer: null,
        secFetchSite: 'cross-site',
        selfOrigin: 'https://cms.local',
        allowedOrigins: [],
        hasSessionCookie: false,
        hasExplicitCredentials: true,
      });
      assert.equal(res.ok, true);
    });
  });

  describe('3. SSRF Protection', () => {
    it('correctly identifies private and loopback IPv4/IPv6 addresses', () => {
      assert.equal(isPrivateIp('127.0.0.1'), true);
      assert.equal(isPrivateIp('10.0.0.1'), true);
      assert.equal(isPrivateIp('192.168.1.50'), true);
      assert.equal(isPrivateIp('172.16.0.1'), true);
      assert.equal(isPrivateIp('169.254.169.254'), true); // AWS/GCP metadata
      assert.equal(isPrivateIp('::1'), true);
      assert.equal(isPrivateIp('fe80::1'), true);
      assert.equal(isPrivateIp('8.8.8.8'), false);
      assert.equal(isPrivateIp('1.1.1.1'), false);
    });

    it('rejects non-HTTP protocols', () => {
      assert.throws(() => parseOutboundUrl('file:///etc/passwd'));
      assert.throws(() => parseOutboundUrl('gopher://127.0.0.1:6379/_flushall'));
      assert.throws(() => parseOutboundUrl('javascript:alert(1)'));
    });
  });

  describe('4. Two-Factor Authentication (RFC 6238 TOTP)', () => {
    it('generates valid base32 secrets, codes, and verifies accurately', () => {
      const secret = generateTotpSecret(20);
      assert.ok(secret.length >= 16);

      const code = generateTotpCode(secret);
      assert.match(code, /^[0-9]{6}$/);

      const verified = verifyTotp(secret, code);
      assert.notEqual(verified, null);

      const bogus = verifyTotp(secret, '000000' === code ? '111111' : '000000');
      assert.equal(bogus, null);
    });

    it('generates unguessable backup codes', () => {
      const codes = generateBackupCodes(8);
      assert.equal(codes.length, 8);
      codes.forEach((c) => {
        assert.match(c, /^[0-9a-f]{4}-[0-9a-f]{4}$/);
      });
      // All codes unique
      const unique = new Set(codes);
      assert.equal(unique.size, 8);
    });
  });

  describe('5. Password Policy (NIST 800-63B)', () => {
    it('accepts compliant passwords', () => {
      const res = validatePasswordPolicy('V3ry$tr0ngP@ssw0rd2026!');
      assert.equal(res.ok, true);
    });

    it('rejects passwords that are too short or on common denylist', () => {
      const shortRes = validatePasswordPolicy('Short1!');
      assert.equal(shortRes.ok, false);

      const commonRes = validatePasswordPolicy('Password123!');
      assert.equal(commonRes.ok, false);
    });
  });

  describe('6. Cryptographic Box & Tokens', () => {
    it('encrypts and decrypts secret payloads with AES-256-GCM', () => {
      const plaintext = 'super-secret-mfa-key-12345';
      const encrypted = encryptSecret(plaintext);
      assert.notEqual(encrypted, plaintext);

      const decrypted = decryptSecret(encrypted);
      assert.equal(decrypted, plaintext);
    });

    it('rejects tampered ciphertexts', () => {
      const encrypted = encryptSecret('confidential');
      const tampered = encrypted.slice(0, -4) + '0000';
      const decrypted = decryptSecret(tampered);
      assert.equal(decrypted, null);
    });

    it('signs and verifies short-lived HMAC tokens', () => {
      const token = signShortToken({ userId: 'usr_1', purpose: 'mfa' }, 60);
      const payload = verifyShortToken<{ userId: string; purpose: string }>(token);
      assert.ok(payload);
      assert.equal(payload.userId, 'usr_1');
      assert.equal(payload.purpose, 'mfa');
    });
  });

  describe('7. PBKDF2 Password Hashing', () => {
    it('hashes with PBKDF2-SHA512 and verifies correctly', async () => {
      const raw = 'SecureSecret99#';
      const hash = await hashPassword(raw);
      assert.ok(hash.startsWith('pbkdf2-sha512$210000$'));

      const valid = await verifyPassword(raw, hash);
      assert.equal(valid, true);

      const invalid = await verifyPassword('WrongSecret99#', hash);
      assert.equal(invalid, false);
    });

    it('constant time equality comparison operates reliably', () => {
      assert.equal(safeEqual('token-abc-123', 'token-abc-123'), true);
      assert.equal(safeEqual('token-abc-123', 'token-abc-999'), false);
      assert.equal(safeEqual('short', 'longer-string'), false);
    });
  });

  describe('8. WordPress Image SEO Engine', () => {
    it('accurately scores well-optimized WebP image with alt text and keyword', () => {
      const result = evaluateImageSeo({
        filename: 'delhi-school-campus-library.webp',
        altText: 'Modern digital library at Prince Public School campus',
        title: 'School Campus Digital Library',
        focusKeyword: 'school campus',
        size: 145 * 1024,
        mimeType: 'image/webp',
      });

      assert.ok(result.score >= 80);
      assert.equal(result.grade, 'Good');
      assert.equal(result.gradeColor, 'emerald');
      const passedAlt = result.checks.find((c) => c.id === 'alt_presence');
      assert.equal(passedAlt?.status, 'passed');
    });

    it('identifies missing alt text and poor filenames', () => {
      const result = evaluateImageSeo({
        filename: 'IMG_0001.jpg',
        altText: '',
        size: 2500 * 1024,
        mimeType: 'image/jpeg',
      });

      assert.ok(result.score < 50);
      assert.equal(result.grade, 'Poor');
      const failedAlt = result.checks.find((c) => c.id === 'alt_presence');
      assert.equal(failedAlt?.status, 'failed');
    });

    it('generates clean smart alt text from messy filenames', () => {
      const alt1 = generateSmartAltFromFilename('IMG_2026_modern_delhi_classroom.jpg');
      assert.equal(alt1, 'Modern delhi classroom');

      const alt2 = generateSmartAltFromFilename('Screenshot_prince_public_school_banner.png');
      assert.equal(alt2, 'Prince public school banner');
    });
  });
});
