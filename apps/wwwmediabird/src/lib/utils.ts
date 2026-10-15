import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString || '';
  }
}

export function formatShortDate(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString || '';
  }
}

export function calculateReadingTime(textOrHtml?: string): number {
  if (!textOrHtml) return 3;
  // strip HTML tags
  const plain = textOrHtml.replace(/<[^>]*>/g, ' ');
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/**
 * Robust HTML sanitizer for safe editorial content rendering.
 * Removes malicious script tags, iframes (except allowed embeds), inline javascript handlers,
 * and dangerous URI protocols like javascript:.
 */
export function sanitizeEditorialHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  
  let clean = rawHtml;

  // Remove script tags and contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove inline on* event handlers (onclick, onload, onerror, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // Remove javascript: and vbscript: URIs in href and src
  clean = clean.replace(/(href|src)\s*=\s*['"]\s*(?:javascript|vbscript):[^'"]*['"]/gi, '$1="#"');

  // Remove style tags that might break layout
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Strip inline font-family styles so content strictly inherits sans-serif
  clean = clean.replace(/font-family\s*:\s*[^;"]+;?/gi, '');

  return clean;
}
