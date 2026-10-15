import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Clock,
  Calendar,
  User,
  Share2,
  ChevronRight,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';
import {
  getArticleBySlug,
  getArticles,
  getPageBySlug,
  getRelatedArticles,
} from '@/lib/cms';
import { formatShortDate, formatDate, calculateReadingTime } from '@/lib/utils';
import { BlockRenderer } from '@/components/article/BlockRenderer';
import { TableOfContents } from '@/components/article/TableOfContents';
import { ArticleCard } from '@/components/article/ArticleCard';
import { AdUnit } from '@/components/monetization/AdUnit';
import { AffiliateCard } from '@/components/monetization/AffiliateCard';
import { ADSENSE_CONFIG, CURATED_AFFILIATE_PRODUCTS, AFFILIATE_DISCLOSURE } from '@/lib/monetization';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ previewToken?: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const { data: articles } = await getArticles({ limit: 100 });
  return articles.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { previewToken } = await searchParams;

  // Check institutional page first
  const page = await getPageBySlug(slug);
  if (page) {
    return {
      title: page.seo?.metaTitle || `${page.title} — Media Bird Magazine`,
      description: page.seo?.description || `Read ${page.title} on Media Bird Magazine.`,
      alternates: {
        canonical: page.seo?.canonical || `https://www.mediabirdmag.com/${slug}/`,
      },
    };
  }

  // Check article
  const article = await getArticleBySlug(slug, previewToken);
  if (!article) {
    return { title: 'Story Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mediabirdmag.com';
  const ogImage = article.data?.featured_image || 'https://www.mediabirdmag.com/wp-content/uploads/2024/04/cropped-500x500-NEW-LOGO-1-192x192.png';
  const description = article.data?.summary || article.seo?.description || article.title;

  return {
    title: `${article.title} — Media Bird Magazine`,
    description,
    alternates: {
      canonical: `${siteUrl}/${article.slug}/`,
    },
    openGraph: {
      type: 'article',
      url: `${siteUrl}/${article.slug}/`,
      title: article.title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.data?.byline || article.author?.name || 'Team Mediabird Magazine'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.data?.featured_image_alt || article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function DynamicSlugPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { previewToken } = await searchParams;

  // 1. INSTITUTIONAL PAGE RENDER (About, Contact, Write for Us, Policies)
  const institutionalPage = await getPageBySlug(slug);
  if (institutionalPage) {
    return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <nav className="flex items-center space-x-2 text-xs font-sans text-stone-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-editorial-crimson transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-editorial-crimson font-semibold">{institutionalPage.title}</span>
        </nav>

        <header className="pb-8 mb-8 border-b border-stone-200">
          <h1 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 mb-4">
            {institutionalPage.title}
          </h1>
          <p className="font-sans text-xs text-stone-400 uppercase tracking-wider">
            Official Publication Notice • Media Bird Magazine
          </p>
        </header>

        <div className="prose prose-stone max-w-none font-sans text-base sm:text-lg leading-relaxed text-stone-800 space-y-4
          [&>h1]:font-sans [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-stone-900 [&>h1]:mb-2
          [&>h2]:font-sans [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-stone-900 [&>h2]:mt-8 [&>h2]:mb-3
          [&>h3]:font-sans [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-stone-900 [&>h3]:mt-6 [&>h3]:mb-2
          [&>p]:leading-relaxed [&>p]:mb-4
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
          [&>hr]:my-8 [&>hr]:border-stone-200
          [&>a]:text-editorial-crimson [&>a]:underline [&>a]:underline-offset-2">
          <BlockRenderer
            blocks={[{ id: 'inst_p', type: 'html', data: { html: institutionalPage.content } }]}
          />
        </div>
      </article>
    );
  }

  // 2. ARTICLE DETAIL RENDER
  const article = await getArticleBySlug(slug, previewToken);
  if (!article) {
    notFound();
  }

  const categoryName = article.data?.category || article.taxonomies?.[0]?.name || 'Culture';
  const categorySlug =
    article.data?.category_slug || article.taxonomies?.[0]?.slug || 'culture';
  const readTime = article.data?.read_time || calculateReadingTime(article.blocks[0]?.data?.html);
  const publishedDate = formatDate(article.publishedAt || article.createdAt);
  const authorName = article.data?.byline || article.author?.name || 'Team Mediabird Magazine';
  const relatedArticles = await getRelatedArticles(article, 3);

  // Relevant affiliate product based on category
  const affiliateProducts = CURATED_AFFILIATE_PRODUCTS[categorySlug.toLowerCase()] || [];

  // Structured Data JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.mediabirdmag.com/${article.slug}/`,
    },
    headline: article.title,
    image: [article.data?.featured_image || 'https://www.mediabirdmag.com/wp-content/uploads/2024/04/cropped-500x500-NEW-LOGO-1-192x192.png'],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://www.mediabirdmag.com/about/',
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Media Bird Magazine',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.mediabirdmag.com/wp-content/uploads/2022/09/logo.png',
      },
    },
    description: article.data?.summary || article.title,
    articleSection: categoryName,
  };

  return (
    <article className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-stone-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-editorial-crimson transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href={`/category/${categorySlug}`} className="hover:text-editorial-crimson transition-colors uppercase font-semibold">
          {categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-400 line-clamp-1 max-w-[200px] sm:max-w-md">{article.title}</span>
      </nav>

      {/* ARTICLE HEADER MASTHEAD */}
      <header className="max-w-4xl mx-auto text-center space-y-5 mb-10">
        <div>
          <Link
            href={`/category/${categorySlug}`}
            className="inline-block px-3 py-1 bg-editorial-crimson text-white font-sans text-xs uppercase tracking-wider font-bold rounded shadow-sm hover:bg-red-800 transition-colors"
          >
            {categoryName}
          </Link>
        </div>

        <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
          {article.title}
        </h1>

        {article.data?.summary && (
          <p className="font-sans italic text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto">
            {article.data.summary}
          </p>
        )}

        {/* Byline & Metadata Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-sans text-stone-500 border-t border-b border-stone-200/80 py-3">
          <div className="flex items-center space-x-1.5 font-medium text-stone-700">
            <User className="w-4 h-4 text-editorial-crimson" />
            <span>{authorName}</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-stone-400" />
            <time dateTime={article.publishedAt}>{publishedDate}</time>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </header>

      {/* FEATURED COVER IMAGE */}
      {article.data?.featured_image && (
        <figure className="max-w-5xl mx-auto mb-12">
          <div className="relative aspect-[16/9] sm:aspect-[21/10] w-full rounded-xl overflow-hidden shadow-sm bg-stone-100">
            <Image
              src={article.data.featured_image}
              alt={article.data.featured_image_alt || article.title}
              fill
              priority={true}
              sizes="(max-width: 1200px) 100vw, 1100px"
              className="object-cover"
            />
          </div>
          {article.data.featured_image_alt && (
            <figcaption className="text-xs text-stone-500 text-center mt-2 italic font-sans">
              {article.data.featured_image_alt}
            </figcaption>
          )}
        </figure>
      )}

      {/* ARTICLE CONTENT GRID (Reading Column + Desktop Sticky Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
        {/* Main Long-Form Reading Body (8 cols) */}
        <div className="lg:col-span-8 max-w-reading mx-auto lg:mx-0 w-full">
          {/* Table of Contents if article has multiple headings */}
          <TableOfContents contentHtml={article.blocks[0]?.data?.html} className="mb-8" />

          {/* Visual Block Renderer (Safe, sanitized, typographic) */}
          <BlockRenderer blocks={article.blocks} categorySlug={categorySlug} />

          {/* Editorial Affiliate Companion Block (if relevant products exist) */}
          {affiliateProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-stone-200">
              <div className="text-xs font-sans font-bold uppercase tracking-wider text-stone-400 mb-2">
                Editorial Companion & Recommendation
              </div>
              <AffiliateCard product={affiliateProducts[0]} />
            </div>
          )}

          {/* In-Article Mid/Bottom AdSense Placement */}
          <AdUnit
            slotId={ADSENSE_CONFIG.slots.articleInContent2}
            minHeight="280px"
            className="my-10"
            label="Advertisement"
          />

          {/* Editorial Author Bio Card */}
          <div className="mt-12 p-6 bg-white border border-stone-200 rounded-xl flex items-start space-x-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-editorial-crimson text-white font-sans font-bold text-xl flex items-center justify-center flex-shrink-0">
              {authorName.charAt(0)}
            </div>
            <div className="space-y-1">
              <h4 className="font-sans text-lg font-bold text-stone-900">{authorName}</h4>
              <p className="font-sans text-xs text-stone-600 leading-relaxed">
                Contributing writer for Media Bird Magazine. Covering cultural shifts, investigative journalism,
                and intellectual inquiry with depth and slow deliberation.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Sticky Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-8 sticky top-28">
          {/* Sidebar AdSense Slot */}
          <AdUnit
            slotId={ADSENSE_CONFIG.slots.articleSidebar}
            minHeight="280px"
            label="Sponsored Link"
          />

          {/* Related Articles in this category */}
          {relatedArticles.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-editorial-crimson">
                  Vertical Spotlight
                </span>
                <h3 className="font-sans text-lg font-bold text-stone-900 mt-0.5">
                  More in {categoryName}
                </h3>
              </div>

              <div className="divide-y divide-stone-100">
                {relatedArticles.map((art) => (
                  <ArticleCard key={art.id} article={art} variant="compact" className="py-3" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
