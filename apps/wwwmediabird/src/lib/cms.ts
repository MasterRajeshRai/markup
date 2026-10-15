import {
  CmsArticle,
  CmsArticleListResponse,
  CmsCategory,
  CmsPage,
} from '@/types';
import { EDITORIAL_CATEGORIES } from '@/data/categories';
import { INSTITUTIONAL_PAGES } from '@/data/pages';
import articlesSnapshot from '@/data/articles-snapshot.json';

const CMS_BASE_URL = process.env.CMS_BASE_URL || 'http://localhost:3000/api/v1';
const CMS_API_KEY = process.env.CMS_API_KEY || 'cms_live_caadf19cfe32247af2e4bf793e445c135990f319b9398a99';
const CMS_SITE_SLUG = process.env.CMS_SITE_SLUG || 'mediabird';

// Cast snapshot articles safely
const snapshotArticles: CmsArticle[] = (articlesSnapshot.articles || []) as CmsArticle[];

/**
 * Fetch from Markup CMS with graceful offline fallback
 */
async function fetchFromCms<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const url = `${CMS_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set('X-API-Key', CMS_API_KEY);
  headers.set('Authorization', `Bearer ${CMS_API_KEY}`);
  headers.set('x-site-slug', CMS_SITE_SLUG);
  headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const cacheSetting = isDev ? { cache: 'no-store' as RequestCache } : { next: { revalidate: 60 } };

    const res = await fetch(url, {
      ...cacheSetting,
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }
    const text = await res.text();
    if (!text || !text.trim()) {
      return null;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export interface GetArticlesOptions {
  type?: string;
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Retrieve published articles with filtering, pagination, and sorting.
 * Seamlessly checks Markup CMS API, falling back to verified snapshot data.
 */
export async function getArticles(options: GetArticlesOptions = {}): Promise<CmsArticleListResponse> {
  const {
    type = 'articles',
    category,
    tag,
    search,
    page = 1,
    limit = 12,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
  } = options;

  // Try CMS Delivery API first
  const queryParams = new URLSearchParams({
    type,
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
  });

  if (category) queryParams.set('category', category);
  if (tag) queryParams.set('tag', tag);
  if (search) queryParams.set('q', search);

  const cmsResponse = await fetchFromCms<{ data: CmsArticle[]; meta: any }>(`/content?${queryParams.toString()}`);

  if (cmsResponse && Array.isArray(cmsResponse.data) && cmsResponse.data.length > 0) {
    return {
      data: cmsResponse.data,
      meta: cmsResponse.meta || {
        total: cmsResponse.data.length,
        page,
        limit,
        totalPages: Math.ceil(cmsResponse.data.length / limit),
        hasNextPage: page * limit < cmsResponse.data.length,
        hasPrevPage: page > 1,
      },
    };
  }

  // Resilient snapshot query engine
  let filtered = [...snapshotArticles];

  if (category) {
    const catLower = category.toLowerCase();
    filtered = filtered.filter((art) => {
      const matchData = art.data?.category_slug?.toLowerCase() === catLower;
      const matchTax = art.taxonomies?.some((t) => t.slug.toLowerCase() === catLower);
      return matchData || matchTax;
    });
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (art) =>
        art.title.toLowerCase().includes(s) ||
        art.data?.summary?.toLowerCase().includes(s) ||
        art.slug.toLowerCase().includes(s)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt).getTime();
    const dateB = new Date(b.publishedAt || b.createdAt).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Retrieve a single article by its permanent URL slug.
 */
export async function getArticleBySlug(slug: string, previewToken?: string): Promise<CmsArticle | null> {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');

  if (previewToken) {
    const previewRes = await fetchFromCms<{ data: CmsArticle }>(
      `/content/${cleanSlug}?previewToken=${previewToken}`,
      { cache: 'no-store' }
    );
    if (previewRes?.data) return previewRes.data;
  }

  // Try CMS Delivery API
  const cmsRes = await fetchFromCms<{ data: CmsArticle }>(`/content/${cleanSlug}`);
  if (cmsRes?.data) return cmsRes.data;

  // Fallback to snapshot
  const found = snapshotArticles.find(
    (art) => art.slug.toLowerCase() === cleanSlug.toLowerCase() || art.id === cleanSlug
  );
  return found || null;
}

/**
 * Retrieve all categories
 */
export async function getCategories(): Promise<CmsCategory[]> {
  const cmsTax = await fetchFromCms<{ data: any[] }>('/taxonomies');
  if (cmsTax?.data && Array.isArray(cmsTax.data)) {
    const catGroup = cmsTax.data.find((t) => t.slug === 'categories');
    if (catGroup?.terms) {
      return catGroup.terms.map((term: any) => ({
        id: term.id,
        name: term.name,
        slug: term.slug,
        count: term._count?.entries || 0,
      }));
    }
  }

  return EDITORIAL_CATEGORIES;
}

/**
 * Get category by slug
 */
export function getCategoryMeta(slug: string): CmsCategory | undefined {
  return EDITORIAL_CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Get related articles for a given article
 */
export async function getRelatedArticles(currentArticle: CmsArticle, limit = 4): Promise<CmsArticle[]> {
  const categorySlug = currentArticle.data?.category_slug || currentArticle.taxonomies?.[0]?.slug;

  const { data: categoryArticles } = await getArticles({
    category: categorySlug,
    limit: limit + 2,
  });

  return categoryArticles
    .filter((art) => art.slug !== currentArticle.slug)
    .slice(0, limit);
}

/**
 * Get lead hero story for homepage
 */
export async function getLeadHeroStory(): Promise<{
  lead: CmsArticle | null;
  secondary: CmsArticle[];
}> {
  const { data } = await getArticles({ limit: 5 });
  const lead = data[0] || null;
  const secondary = data.slice(1, 5);
  return { lead, secondary };
}

/**
 * Get institutional/legal page by slug
 */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  return INSTITUTIONAL_PAGES[cleanSlug] || null;
}

/**
 * Get Editor's Picks / Most-read stories (derived from curated engagement/published features)
 */
export async function getEditorsPicks(limit = 4): Promise<CmsArticle[]> {
  try {
    const { data: liveArticles } = await getArticles({ limit: Math.max(limit * 2, 12) });
    if (liveArticles && liveArticles.length > 0) {
      const candidates = liveArticles.filter(
        (art) => Boolean(art.data?.featured_image) || Boolean(art.data?.is_featured) || (art.data?.word_count || 0) > 300
      );
      if (candidates.length >= limit) return candidates.slice(0, limit);
      return liveArticles.slice(0, limit);
    }
  } catch {}

  // Resilient fallback to snapshot
  const candidates = snapshotArticles.filter(
    (art) => Boolean(art.data?.featured_image) && (art.data?.word_count || 0) > 400
  );

  return candidates.slice(0, limit);
}
