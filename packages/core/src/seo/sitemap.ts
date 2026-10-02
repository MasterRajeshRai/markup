export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Builds standard XML sitemap
 */
export function buildXmlSitemap(entries: SitemapUrlEntry[]): string {
  const urlsXml = entries
    .map((e) => {
      const parts = [`<loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
      if (e.priority !== undefined) parts.push(`<priority>${e.priority.toFixed(1)}</priority>`);
      return `  <url>\n    ${parts.join('\n    ')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`;
}

/**
 * Builds robots.txt content
 */
export function buildRobotsTxt(options: {
  sitemapUrl?: string;
  disallowPaths?: string[];
  customRules?: string;
}): string {
  const lines: string[] = ['User-agent: *'];

  if (options.disallowPaths && options.disallowPaths.length > 0) {
    for (const p of options.disallowPaths) {
      lines.push(`Disallow: ${p}`);
    }
  } else {
    lines.push('Allow: /');
  }

  if (options.customRules) {
    lines.push(options.customRules);
  }

  if (options.sitemapUrl) {
    lines.push(`Sitemap: ${options.sitemapUrl}`);
  }

  return lines.join('\n');
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
