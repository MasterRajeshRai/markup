import type { MetadataRoute } from 'next';
import { cmsClient } from '@/lib/cms-client';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const [articlesRes, pagesRes] = await Promise.allSettled([
      cmsClient.getEntries('articles'),
      cmsClient.getEntries('pages'),
    ]);

    const articleUrls: MetadataRoute.Sitemap =
      articlesRes.status === 'fulfilled' && Array.isArray(articlesRes.value?.data)
        ? articlesRes.value.data.map((item: any) => ({
            url: `${baseUrl}/articles/${item.slug}`,
            lastModified: new Date(item.updatedAt || item.publishedAt || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }))
        : [];

    const pageUrls: MetadataRoute.Sitemap =
      pagesRes.status === 'fulfilled' && Array.isArray(pagesRes.value?.data)
        ? pagesRes.value.data
            .filter((item: any) => item.slug !== 'home')
            .map((item: any) => ({
              url: `${baseUrl}/${item.slug}`,
              lastModified: new Date(item.updatedAt || item.publishedAt || Date.now()),
              changeFrequency: 'monthly' as const,
              priority: 0.7,
            }))
        : [];

    return [...staticRoutes, ...articleUrls, ...pageUrls];
  } catch {
    return staticRoutes;
  }
}
