/**
 * Client IP resolution. Edge-safe.
 *
 * `x-forwarded-for` is attacker-controlled unless a trusted proxy overwrites it. Set `TRUSTED_PROXY`:
 *   - "cloudflare" → use `cf-connecting-ip`
 *   - "vercel"     → use `x-real-ip` / last hop of `x-forwarded-for` (Vercel overwrites it)
 *   - "true"       → use the right-most `x-forwarded-for` hop (one trusted proxy in front)
 *   - unset        → use the platform-provided `req.ip` if present, otherwise `x-real-ip`, else "unknown"
 */

type HeaderReader = { get(name: string): string | null };

function clean(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const v = ip.trim().replace(/^\[|\]$/g, '');
  // Reject anything that is clearly not an IP to keep rate-limit keys well-formed.
  if (v.length > 45 || !/^[0-9a-fA-F:.]+$/.test(v)) return null;
  return v;
}

export function getClientIp(headers: HeaderReader, platformIp?: string | null): string {
  const mode = (process.env.TRUSTED_PROXY || '').toLowerCase();

  if (mode === 'cloudflare') {
    const cf = clean(headers.get('cf-connecting-ip'));
    if (cf) return cf;
  }
  if (mode === 'vercel' || mode === 'true' || mode === '1') {
    const real = clean(headers.get('x-real-ip'));
    if (mode === 'vercel' && real) return real;
    const xff = headers.get('x-forwarded-for');
    if (xff) {
      const hops = xff.split(',').map((h) => h.trim()).filter(Boolean);
      const last = clean(hops[hops.length - 1]);
      if (last) return last;
    }
    if (real) return real;
  }

  return clean(platformIp) || clean(headers.get('x-real-ip')) || 'unknown';
}
