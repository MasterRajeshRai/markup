/**
 * Fixed-window rate limiter. Edge-safe (no Node APIs).
 *
 * NOTE: the default store is in-memory and therefore PER INSTANCE. On serverless / multi-instance
 * deployments swap in a shared store (Redis, Upstash, KV) via `setRateLimitStore()` — the limiter
 * only needs the three methods in `RateLimitStore`.
 */

export interface RateLimitRule {
  /** Bucket name, e.g. "login" */
  name: string;
  /** Max requests per window */
  limit: number;
  /** Window length in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms when the window resets */
  resetAt: number;
  /** Seconds the client should wait (only when blocked) */
  retryAfterSec: number;
}

export interface RateLimitStore {
  /** Increment counter for key, creating a window if none/expired. Returns the new count and reset time. */
  hit(key: string, windowMs: number, now: number): { count: number; resetAt: number } | Promise<{ count: number; resetAt: number }>;
}

const MAX_KEYS = 50_000;

export class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  private lastSweep = 0;

  hit(key: string, windowMs: number, now: number) {
    this.sweep(now);
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      return fresh;
    }
    existing.count += 1;
    return existing;
  }

  private sweep(now: number) {
    if (now - this.lastSweep < 30_000 && this.buckets.size < MAX_KEYS) return;
    this.lastSweep = now;
    for (const [k, v] of this.buckets) {
      if (v.resetAt <= now) this.buckets.delete(k);
    }
    // Hard cap to bound memory under key-flooding attacks.
    if (this.buckets.size >= MAX_KEYS) {
      const excess = this.buckets.size - MAX_KEYS + 1000;
      let i = 0;
      for (const k of this.buckets.keys()) {
        if (i++ >= excess) break;
        this.buckets.delete(k);
      }
    }
  }

  clear() {
    this.buckets.clear();
  }
}

let store: RateLimitStore = new MemoryRateLimitStore();

export function setRateLimitStore(next: RateLimitStore) {
  store = next;
}

export function getRateLimitStore(): RateLimitStore {
  return store;
}

export async function rateLimit(rule: RateLimitRule, identifier: string, now = Date.now()): Promise<RateLimitResult> {
  const { count, resetAt } = await store.hit(`${rule.name}:${identifier}`, rule.windowMs, now);
  const allowed = count <= rule.limit;
  return {
    allowed,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - count),
    resetAt,
    retryAfterSec: allowed ? 0 : Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

export function checkRateLimit(identifier: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  const storeInstance = store instanceof MemoryRateLimitStore ? store : new MemoryRateLimitStore();
  const { count, resetAt } = storeInstance.hit(`${rule.name}:${identifier}`, rule.windowMs, now);
  const allowed = count <= rule.limit;
  return {
    allowed,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - count),
    resetAt,
    retryAfterSec: allowed ? 0 : Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

/** Standard rule set. Values are deliberately conservative; override via env where noted in middleware. */
export const RATE_LIMITS = {
  /** Every /api request, per IP */
  api: { name: 'api', limit: 600, windowMs: 60_000 },
  /** Login attempts, per IP */
  login: { name: 'login', limit: 10, windowMs: 15 * 60_000 },
  /** Password reset / forgot, per IP */
  passwordReset: { name: 'pwreset', limit: 5, windowMs: 15 * 60_000 },
  /** MFA code attempts, per IP */
  mfa: { name: 'mfa', limit: 10, windowMs: 15 * 60_000 },
  /** Anonymous write endpoints (comments, forms, newsletter, votes), per IP */
  publicWrite: { name: 'pubwrite', limit: 20, windowMs: 60_000 },
  /** Anonymous search, per IP */
  publicSearch: { name: 'pubsearch', limit: 60, windowMs: 60_000 },
  /** Outbound mail triggers (test email etc.), per user/IP */
  email: { name: 'email', limit: 5, windowMs: 60_000 },
  /** File uploads, per user/IP */
  upload: { name: 'upload', limit: 60, windowMs: 60_000 },
  /** AI generation calls, per user */
  ai: { name: 'ai', limit: 30, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000))),
  };
  if (!result.allowed) headers['Retry-After'] = String(result.retryAfterSec);
  return headers;
}
