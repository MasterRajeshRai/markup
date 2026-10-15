/**
 * Small, dependency-free sanitisation helpers. Edge-safe.
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"'`]/g, (c) => HTML_ESCAPES[c]);
}

/** Escape a string for safe use inside a RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates and normalises a relative URL path segment list for file serving.
 * Returns null when any segment could escape the base directory.
 */
export function safePathSegments(segments: string[] | undefined): string[] | null {
  if (!segments || segments.length === 0 || segments.length > 8) return null;
  const out: string[] = [];
  for (const seg of segments) {
    if (!seg || seg.length > 200) return null;
    if (seg === '.' || seg === '..') return null;
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(seg)) return null;
    out.push(seg);
  }
  return out;
}

/** Produce a safe base filename (no directories, no control chars). */
export function sanitizeFilename(name: string): string {
  const base = (name || 'file').split(/[\\/]/).pop() || 'file';
  const cleaned = base
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[.-]+/, '')
    .slice(0, 100);
  return cleaned || 'file';
}

/** Only allow same-site relative redirects such as "/admin/articles". Prevents open redirects. */
export function safeRedirectPath(target: string | null | undefined, fallback = '/admin'): string {
  if (!target) return fallback;
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  if (/[\r\n]/.test(target)) return fallback;
  return target;
}

/** Strips control characters and limits length for log / audit strings. */
export function sanitizeLogValue(value: unknown, max = 300): string {
  // eslint-disable-next-line no-control-regex
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max);
}
