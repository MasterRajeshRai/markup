import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/lib/cms';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const { data: results } = await getArticles({
    search: q,
    limit: 5,
  });

  return NextResponse.json({
    results: results.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.data?.category || article.taxonomies?.[0]?.name || 'Culture',
      categorySlug: article.data?.category_slug || article.taxonomies?.[0]?.slug || 'culture',
      date: article.publishedAt || article.createdAt,
    })),
  });
}
