import { MetadataRoute } from 'next';
import { getArticles } from '@/lib/cms';
import { EDITORIAL_CATEGORIES } from '@/data/categories';
import { INSTITUTIONAL_PAGES } from '@/data/pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mediabirdmag.com';

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ];

  // 2. Category Archive Pages
  EDITORIAL_CATEGORIES.forEach((cat) => {
    staticRoutes.push({
      url: `${siteUrl}/category/${cat.slug}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  });

  // 3. Institutional Pages
  Object.keys(INSTITUTIONAL_PAGES).forEach((slug) => {
    staticRoutes.push({
      url: `${siteUrl}/${slug}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  });

  // 4. All Published Articles
  const { data: articles } = await getArticles({ limit: 1000 });
  const articleRoutes: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${siteUrl}/${art.slug}/`,
    lastModified: new Date(art.updatedAt || art.publishedAt || art.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
