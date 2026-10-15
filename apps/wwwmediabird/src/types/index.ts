export interface CmsTaxonomyTerm {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface CmsAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string;
  email?: string;
}

export interface CmsBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface CmsArticleData {
  summary?: string;
  byline?: string;
  read_time?: number;
  is_featured?: boolean;
  featured_image?: string;
  featured_image_alt?: string;
  category?: string;
  category_slug?: string;
  word_count?: number;
  [key: string]: any;
}

export interface CmsSeo {
  metaTitle?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  keywords?: string;
  robots?: string;
}

export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  status: 'PUBLISHED' | 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'ARCHIVED';
  locale?: string;
  contentType: string;
  currentVersion?: number;
  data: CmsArticleData;
  blocks: CmsBlock[];
  seo: CmsSeo;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author?: CmsAuthor | null;
  taxonomies?: CmsTaxonomyTerm[];
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  blocks?: CmsBlock[];
  seo?: CmsSeo;
  date?: string;
  modified?: string;
}

export interface CmsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface CmsPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CmsArticleListResponse {
  data: CmsArticle[];
  meta: CmsPaginationMeta;
}

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  merchant: string;
  merchantUrl: string;
  imageUrl?: string;
  badge?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
}
