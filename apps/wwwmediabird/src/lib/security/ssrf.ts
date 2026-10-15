import dns from 'dns';
import net from 'net';

/**
 * SSRF defences for any server-side fetch of a user-supplied URL (webhooks, link checks, ...).
 * Blocks non-http(s) schemes, embedded credentials, and any destination that resolves to a
 * private, loopback, link-local, multicast or cloud-metadata address.
 *
 * Residual risk: DNS rebinding between check and connect. For defence in depth, also run the
 * CMS in a network segment with egress filtering.
 */

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, o) => (acc << 8) + parseInt(o, 10), 0) >>> 0;
}

const V4_BLOCKS: Array<[string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

export function isPrivateIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) {
    const n = ipv4ToInt(ip);
    return V4_BLOCKS.some(([base, bits]) => {
      const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
      return (n & mask) === (ipv4ToInt(base) & mask);
    });
  }
  if (family === 6) {
    const v = ip.toLowerCase();
    if (v === '::' || v === '::1') return true;
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    if (/^f[cd]/.test(v)) return true; // fc00::/7 unique local
    if (/^fe[89ab]/.test(v)) return true; // fe80::/10 link local
    if (v.startsWith('ff')) return true; // multicast
    if (v.startsWith('64:ff9b:')) return true; // NAT64
    return false;
  }
  return true; // not an IP → treat as unsafe
}

const BLOCKED_HOSTNAMES = [/^localhost$/i, /\.localhost$/i, /\.local$/i, /\.internal$/i, /\.lan$/i, /^metadata\.google\.internal$/i];

/** Validates a URL string without any DNS lookups (cheap; usable at create/update time). */
export function parseOutboundUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError('Invalid URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new UnsafeUrlError('Only http(s) URLs are allowed');
  }
  if (url.username || url.password) throw new UnsafeUrlError('URLs with embedded credentials are not allowed');
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:' && process.env.ALLOW_INSECURE_WEBHOOKS !== 'true') {
    throw new UnsafeUrlError('Only https URLs are allowed in production');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (BLOCKED_HOSTNAMES.some((re) => re.test(host))) throw new UnsafeUrlError('Destination host is not allowed');
  if (net.isIP(host) && isPrivateIp(host)) throw new UnsafeUrlError('Destination address is not allowed');
  return url;
}

/**
 * Full check including DNS resolution. Throws `UnsafeUrlError` when unsafe.
 * Set ALLOW_PRIVATE_WEBHOOKS=true (non-production only) to permit local test receivers.
 */
export async function assertSafeOutboundUrl(raw: string): Promise<URL> {
  if (process.env.ALLOW_PRIVATE_WEBHOOKS === 'true' && process.env.NODE_ENV !== 'production') {
    try {
      return new URL(raw);
    } catch {
      throw new UnsafeUrlError('Invalid URL');
    }
  }
  const url = parseOutboundUrl(raw);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host)) return url;

  let records: dns.LookupAddress[];
  try {
    records = await dns.promises.lookup(host, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError('Destination host could not be resolved');
  }
  if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) {
    throw new UnsafeUrlError('Destination resolves to a disallowed address');
  }
  return url;
}
