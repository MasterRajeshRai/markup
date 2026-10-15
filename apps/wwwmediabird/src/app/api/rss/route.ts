import { getArticles } from '@/lib/cms';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: articles } = await getArticles({ limit: 30 });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mediabirdmag.com';

  const rssItems = articles
    .map((art) => {
      const pubDate = new Date(art.publishedAt || art.createdAt).toUTCString();
      const link = `${siteUrl}/${art.slug}/`;
      const description = (art.data?.summary || art.title)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const title = art.title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <category>${art.data?.category || 'Culture'}</category>
    </item>`;
    })
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Media Bird Magazine</title>
    <link>${siteUrl}</link>
    <description>Telling It Slow, Saying It Right! — Independent Digital Magazine</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
