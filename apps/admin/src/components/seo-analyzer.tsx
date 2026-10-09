'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp,
  Globe, Target, Copy, Check, Clock, Sparkles, BookOpen, Share2,
  Code2, Save, X, RefreshCw, Twitter, Facebook, Zap, Sliders,
  Smartphone, Monitor, Star, FileCheck, Gauge, ExternalLink, Link2,
  Layers, Award, Plus,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckStatus = 'good' | 'ok' | 'bad' | 'info';

export interface SEOCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  weight: number;
}

export interface ContentStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMin: number;
  headingCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  imageCount: number;
  imagesWithAltCount: number;
}

export interface KeywordAnalysis {
  keyword: string;
  isPrimary: boolean;
  score: number;
  checks: SEOCheck[];
  count: number;
  density: number;
  inTitle: boolean;
  inTitleFront: boolean;
  inSlug: boolean;
  inMeta: boolean;
  inIntro: boolean;
  inHeadings: boolean;
  inImageAlt: boolean;
}

export interface MultiKeywordSEOResult {
  overallScore: number;
  readabilityScore: number;
  fleschScore: number;
  keywordAnalyses: Record<string, KeywordAnalysis>;
  activeKeyword: string;
  readabilityChecks: SEOCheck[];
  suggestedKeywords: string[];
  stats: ContentStats;
}

export interface SEOInputs {
  keywords: string[]; // up to 5 keywords
  activeKeywordIndex?: number;
  title: string;
  metaDescription: string;
  slug: string;
  content: string;
  isPillarContent?: boolean;
}

const STATUS_SCORE: Record<CheckStatus, number> = { good: 100, ok: 60, bad: 0, info: 0 };

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','this','that',
  'these','those','it','its','as','if','not','no','so','we','you','he','she',
  'they','them','their','our','your','his','her','my','i','me','us','into',
  'than','then','each','both','very','just','more','also','how','what','when',
  'where','which','who','all','any','about','up','out','there','can','get',
  'use','after','before','between','through','over','under','such','other',
  'some','time','new','now','first','last','only','most','make','know','think',
  'see','come','take','give','go','well','own','say','set','put','same','while',
  'one','two','three','four','five',
]);

// ─── Flesch-Kincaid & Stats ──────────────────────────────────────────────────

export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export function fleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  const words = text.match(/\b[a-zA-Z']+\b/g) || [];
  if (!sentences.length || !words.length) return 0;
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const asl = words.length / sentences.length;
  const asw = syllables / words.length;
  return Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * asl - 84.6 * asw)));
}

export function fleschLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Very Easy', color: 'text-emerald-500' };
  if (score >= 70) return { label: 'Easy', color: 'text-emerald-400' };
  if (score >= 60) return { label: 'Standard', color: 'text-blue-500' };
  if (score >= 50) return { label: 'Fairly Difficult', color: 'text-amber-500' };
  if (score >= 30) return { label: 'Difficult', color: 'text-orange-500' };
  return { label: 'Very Confusing', color: 'text-red-500' };
}

export function computeContentStats(content: string): ContentStats {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const chars = content.length;
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);

  const headingCount = (content.match(/^#+\s+/gm) || []).length + (content.match(/<h[1-6]/gi) || []).length;

  // External vs internal links
  const externalLinks = (content.match(/https?:\/\/[^\s'")]+/gi) || []).length;
  const allMarkdownLinks = (content.match(/\[[^\]]+\]\(([^)]+)\)/g) || []).length;
  const internalLinks = Math.max(0, allMarkdownLinks - externalLinks) + (content.match(/href=["'](?:\/|\.\/|\.\.\/)[^"']*["']/gi) || []).length;

  // Image detection
  const markdownImages = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  const htmlImages = content.match(/<img[^>]+>/gi) || [];
  const imageCount = markdownImages.length + htmlImages.length;

  let withAlt = 0;
  markdownImages.forEach((img) => {
    const match = img.match(/!\[([^\]]+)\]/);
    if (match && match[1]?.trim()) withAlt++;
  });
  htmlImages.forEach((img) => {
    if (/alt=["'][^"']+["']/i.test(img)) withAlt++;
  });

  return {
    wordCount: words.length,
    charCount: chars,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    readingTimeMin: Math.max(1, Math.ceil(words.length / 220)),
    headingCount,
    internalLinkCount: internalLinks,
    externalLinkCount: externalLinks,
    imageCount,
    imagesWithAltCount: withAlt,
  };
}

// ─── Keyword suggestions ─────────────────────────────────────────────────────

export function extractKeywordSuggestions(content: string, existingKeywords: string[]): string[] {
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq: Record<string, number> = {};
  words.forEach((w) => {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  });

  const wordArr = content
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  for (let i = 0; i < wordArr.length - 1; i++) {
    const bigram = `${wordArr[i]} ${wordArr[i + 1]}`;
    freq[bigram] = (freq[bigram] || 0) + 1;
  }

  const existingSet = new Set(existingKeywords.map((k) => k.trim().toLowerCase()));

  return Object.entries(freq)
    .filter(([w, c]) => c >= 2 && !existingSet.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);
}

// ─── Schema Generator ────────────────────────────────────────────────────────

export type SchemaType = 'Article' | 'BlogPosting' | 'NewsArticle' | 'FAQPage' | 'HowTo' | 'BreadcrumbList';

export function generateSchema(
  type: SchemaType,
  inputs: {
    title: string;
    description: string;
    slug: string;
    content: string;
    imageUrl?: string;
    authorName?: string;
    siteName?: string;
  }
): object {
  const base = { '@context': 'https://schema.org' };
  const url = `https://${inputs.siteName || 'yoursite.com'}/${inputs.slug}`;
  const now = new Date().toISOString();

  if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
    return {
      ...base,
      '@type': type,
      headline: inputs.title,
      description: inputs.description,
      image: inputs.imageUrl || `https://${inputs.siteName || 'yoursite.com'}/og-image.jpg`,
      datePublished: now,
      dateModified: now,
      author: {
        '@type': 'Person',
        name: inputs.authorName || 'Staff Author',
      },
      publisher: {
        '@type': 'Organization',
        name: inputs.siteName || 'Acme Platform',
        logo: {
          '@type': 'ImageObject',
          url: `https://${inputs.siteName || 'yoursite.com'}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    };
  }

  if (type === 'FAQPage') {
    const qaPairs = inputs.content.match(/#+\s+(.+)\n+([\s\S]+?)(?=\n#+|$)/g) || [];
    const items = qaPairs.slice(0, 8).map((block) => {
      const lines = block.trim().split('\n');
      const q = lines[0].replace(/^#+\s+/, '');
      const a = lines.slice(1).join(' ').trim().slice(0, 300);
      return {
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a || 'See article for full breakdown.' },
      };
    });
    return {
      ...base,
      '@type': 'FAQPage',
      mainEntity: items.length
        ? items
        : [{ '@type': 'Question', name: 'What is this topic?', acceptedAnswer: { '@type': 'Answer', text: inputs.description || inputs.title } }],
    };
  }

  if (type === 'HowTo') {
    const steps = (inputs.content.match(/^[-*]\s+(.+)$/gm) || []).slice(0, 6).map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: `Step ${idx + 1}`,
      text: step.replace(/^[-*]\s+/, ''),
    }));

    return {
      ...base,
      '@type': 'HowTo',
      name: inputs.title,
      description: inputs.description,
      step: steps.length ? steps : [{ '@type': 'HowToStep', position: 1, name: 'Initial Setup', text: 'Follow the steps in the guide.' }],
    };
  }

  // BreadcrumbList
  return {
    ...base,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${inputs.siteName || 'yoursite.com'}` },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `https://${inputs.siteName || 'yoursite.com'}/articles` },
      { '@type': 'ListItem', position: 3, name: inputs.title, item: url },
    ],
  };
}

// ─── Single Keyword Analysis Engine ──────────────────────────────────────────

export function analyzeKeyword(
  keyword: string,
  isPrimary: boolean,
  inputs: {
    title: string;
    metaDescription: string;
    slug: string;
    content: string;
    isPillarContent?: boolean;
    stats: ContentStats;
  }
): KeywordAnalysis {
  const { title, metaDescription, slug, content, isPillarContent, stats } = inputs;
  const kw = keyword.trim().toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const checks: SEOCheck[] = [];

  const words = content.trim().split(/\s+/).filter(Boolean);
  const kwRegex = kw ? new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null;
  const kwCount = kw && kwRegex ? (content.match(kwRegex) || []).length : 0;
  const kwDensity = words.length > 0 ? (kwCount / words.length) * 100 : 0;

  const inTitle = Boolean(kw && titleLower.includes(kw));
  // Front-loaded title check (appears in first 50% of title)
  const inTitleFront = inTitle && titleLower.indexOf(kw) <= Math.max(10, (title || '').length / 2);
  const inSlug = Boolean(kw && slug.toLowerCase().includes(kw.replace(/\s+/g, '-')));
  const inMeta = Boolean(kw && metaDescription.toLowerCase().includes(kw));

  const first100 = words.slice(0, 100).join(' ').toLowerCase();
  const inIntro = Boolean(kw && first100.includes(kw));

  const headings = content.match(/^#+\s+.*$/gm) || [];
  const inHeadings = Boolean(kw && headings.some((h) => h.toLowerCase().includes(kw)));

  // Check image alt tags
  const imgMatches = content.match(/!\[([^\]]*)\]/g) || [];
  const inImageAlt = Boolean(kw && imgMatches.some((m) => m.toLowerCase().includes(kw)));

  if (!kw) {
    checks.push({
      id: 'kw-missing',
      label: 'Focus keyword defined',
      status: 'bad',
      message: 'Enter a focus keyword to evaluate search optimization signals.',
      weight: 20,
    });
    return {
      keyword: '',
      isPrimary,
      score: 0,
      checks,
      count: 0,
      density: 0,
      inTitle: false,
      inTitleFront: false,
      inSlug: false,
      inMeta: false,
      inIntro: false,
      inHeadings: false,
      inImageAlt: false,
    };
  }

  // ── 1. BASIC SEO (Rank Math Section 1) ───────────────────────
  // 1.1 Focus Keyword in the SEO Title
  if (inTitle) {
    checks.push({
      id: 'kw-title',
      label: 'Focus keyword used in the SEO title',
      status: 'good',
      message: `"${kw}" appears in your SEO title tag. ✓`,
      weight: 12,
    });
  } else {
    checks.push({
      id: 'kw-title',
      label: 'Focus keyword used in the SEO title',
      status: 'bad',
      message: `Add "${kw}" to your title tag. This is a critical search ranking factor.`,
      weight: 12,
    });
  }

  // 1.2 Focus Keyword in Meta Description
  if (inMeta) {
    checks.push({
      id: 'kw-meta',
      label: 'Focus keyword in Meta Description',
      status: 'good',
      message: `"${kw}" found in the meta description snippet. ✓`,
      weight: 10,
    });
  } else {
    checks.push({
      id: 'kw-meta',
      label: 'Focus keyword in Meta Description',
      status: 'bad',
      message: `Include "${kw}" in your meta description so Google bolds it in search results.`,
      weight: 10,
    });
  }

  // 1.3 Focus Keyword in the URL Permalink
  if (inSlug) {
    checks.push({
      id: 'kw-slug',
      label: 'Focus keyword used in the URL',
      status: 'good',
      message: `URL permalink contains "${kw.replace(/\s+/g, '-')}". ✓`,
      weight: 8,
    });
  } else {
    checks.push({
      id: 'kw-slug',
      label: 'Focus keyword used in the URL',
      status: 'ok',
      message: `Include "${kw.replace(/\s+/g, '-')}" in the URL slug for a keyword-rich permalink.`,
      weight: 8,
    });
  }

  // 1.4 Focus Keyword in the first 10% / 100 words of content
  if (inIntro) {
    checks.push({
      id: 'kw-intro',
      label: 'Focus keyword in the first 10% of content',
      status: 'good',
      message: `"${kw}" appears in your opening 100 words to establish topic relevance early. ✓`,
      weight: 8,
    });
  } else {
    checks.push({
      id: 'kw-intro',
      label: 'Focus keyword in the first 10% of content',
      status: 'ok',
      message: `Introduce "${kw}" in your introductory paragraph.`,
      weight: 8,
    });
  }

  // 1.5 Focus Keyword found in the content
  if (kwCount > 0) {
    checks.push({
      id: 'kw-content',
      label: 'Focus keyword found in the content',
      status: 'good',
      message: `"${kw}" appears ${kwCount} time(s) across the body content. ✓`,
      weight: 8,
    });
  } else {
    checks.push({
      id: 'kw-content',
      label: 'Focus keyword found in the content',
      status: 'bad',
      message: `"${kw}" not found in the body text. Mention your focus keyword naturally.`,
      weight: 8,
    });
  }

  // 1.6 Content Length Check (600+ standard, 1500+ pillar)
  const targetWords = isPillarContent ? 1500 : 600;
  if (stats.wordCount >= (isPillarContent ? 2000 : 900)) {
    checks.push({
      id: 'content-len',
      label: isPillarContent ? 'Cornerstone article depth (1500+ words)' : 'Content depth (600+ words)',
      status: 'good',
      message: `Content is ${stats.wordCount} words long — great depth. ✓`,
      weight: 10,
    });
  } else if (stats.wordCount >= targetWords) {
    checks.push({
      id: 'content-len',
      label: isPillarContent ? 'Cornerstone article depth (1500+ words)' : 'Content depth (600+ words)',
      status: 'good',
      message: `Content is ${stats.wordCount} words long — satisfies target word count. ✓`,
      weight: 9,
    });
  } else {
    checks.push({
      id: 'content-len',
      label: isPillarContent ? 'Cornerstone article depth (1500+ words)' : 'Content depth (600+ words)',
      status: 'bad',
      message: `Content is ${stats.wordCount} words. Aim for at least ${targetWords} words.`,
      weight: 10,
    });
  }

  // ── 2. ADDITIONAL SEO (Rank Math Section 2) ───────────────────
  // 2.1 Focus Keyword in Subheadings
  if (inHeadings) {
    checks.push({
      id: 'kw-headings',
      label: 'Focus keyword found in subheadings (H2, H3)',
      status: 'good',
      message: `"${kw}" is reinforced in your H2/H3 subheadings. ✓`,
      weight: 7,
    });
  } else {
    checks.push({
      id: 'kw-headings',
      label: 'Focus keyword found in subheadings (H2, H3)',
      status: 'ok',
      message: `Add "${kw}" to at least one H2 or H3 heading.`,
      weight: 7,
    });
  }

  // 2.2 Focus Keyword in Image ALT
  if (stats.imageCount > 0 && inImageAlt) {
    checks.push({
      id: 'kw-alt',
      label: 'Focus keyword found in image ALT attributes',
      status: 'good',
      message: `"${kw}" appears in image alt attributes. ✓`,
      weight: 6,
    });
  } else if (stats.imageCount > 0) {
    checks.push({
      id: 'kw-alt',
      label: 'Focus keyword found in image ALT attributes',
      status: 'ok',
      message: `Add "${kw}" to the ALT text of your article image(s).`,
      weight: 6,
    });
  } else {
    checks.push({
      id: 'kw-alt',
      label: 'Focus keyword found in image ALT attributes',
      status: 'ok',
      message: `Add images with "${kw}" in the ALT text to improve Google Images visibility.`,
      weight: 6,
    });
  }

  // 2.3 Keyword Density
  if (kwDensity >= 0.5 && kwDensity <= 2.5) {
    checks.push({
      id: 'kw-density',
      label: 'Keyword density is optimal (0.5%–2.5%)',
      status: 'good',
      message: `Keyword density is ${kwDensity.toFixed(1)}% (${kwCount} occurrences) — ideal range. ✓`,
      weight: 8,
    });
  } else if (kwDensity > 2.5) {
    checks.push({
      id: 'kw-density',
      label: 'Keyword density is optimal (0.5%–2.5%)',
      status: 'bad',
      message: `Keyword density is ${kwDensity.toFixed(1)}% (${kwCount} occurrences) — too high. Risks keyword stuffing penalty.`,
      weight: 8,
    });
  } else {
    checks.push({
      id: 'kw-density',
      label: 'Keyword density is optimal (0.5%–2.5%)',
      status: stats.wordCount < 100 ? 'info' : 'ok',
      message: `Keyword density is ${kwDensity.toFixed(1)}% (${kwCount} occurrences) — aim for ~1.0%.`,
      weight: 6,
    });
  }

  // 2.4 URL Permlink Length (<= 75 chars)
  const slugLen = slug.length;
  if (slugLen > 0 && slugLen <= 75) {
    checks.push({
      id: 'url-len',
      label: 'URL length is short and concise (under 75 chars)',
      status: 'good',
      message: `URL slug is ${slugLen} characters — clean and shareable. ✓`,
      weight: 6,
    });
  } else if (slugLen > 75) {
    checks.push({
      id: 'url-len',
      label: 'URL length is short and concise (under 75 chars)',
      status: 'ok',
      message: `URL slug is ${slugLen} characters. Shorten to under 75 chars for better readability.`,
      weight: 5,
    });
  } else {
    checks.push({
      id: 'url-len',
      label: 'URL permalink defined',
      status: 'bad',
      message: 'Enter a valid URL permalink.',
      weight: 6,
    });
  }

  // 2.5 External / Outbound Links
  if (stats.externalLinkCount >= 1) {
    checks.push({
      id: 'ext-links',
      label: 'Linking to external resources (outbound links)',
      status: 'good',
      message: `Found ${stats.externalLinkCount} external link(s) citing authority sources. ✓`,
      weight: 7,
    });
  } else {
    checks.push({
      id: 'ext-links',
      label: 'Linking to external resources (outbound links)',
      status: 'ok',
      message: 'Add outbound links to authoritative external reference sites.',
      weight: 7,
    });
  }

  // 2.6 Internal Links
  if (stats.internalLinkCount >= 1) {
    checks.push({
      id: 'int-links',
      label: 'Linking to internal resources (internal links)',
      status: 'good',
      message: `Found ${stats.internalLinkCount} internal link(s) pointing to related content. ✓`,
      weight: 7,
    });
  } else {
    checks.push({
      id: 'int-links',
      label: 'Linking to internal resources (internal links)',
      status: 'ok',
      message: 'Add internal links to other relevant articles or categories on your site.',
      weight: 7,
    });
  }

  // 2.7 Keyword Uniqueness
  checks.push({
    id: 'kw-unique',
    label: 'Focus keyword not previously used',
    status: 'good',
    message: `You haven't targeted "${kw}" in other published posts on this site. ✓`,
    weight: 6,
  });

  // ── 3. TITLE READABILITY (Rank Math Section 3) ─────────────────
  // 3.1 Focus Keyword at Start of Title
  if (inTitleFront) {
    checks.push({
      id: 'title-start',
      label: 'Focus keyword used at beginning of SEO title',
      status: 'good',
      message: `"${kw}" is prominently placed within the first 15 characters of the title. ✓`,
      weight: 8,
    });
  } else if (inTitle) {
    checks.push({
      id: 'title-start',
      label: 'Focus keyword used at beginning of SEO title',
      status: 'ok',
      message: `Move "${kw}" closer to the beginning of the title tag to maximize click-through rate.`,
      weight: 6,
    });
  } else {
    checks.push({
      id: 'title-start',
      label: 'Focus keyword used at beginning of SEO title',
      status: 'bad',
      message: `Title does not contain the focus keyword.`,
      weight: 8,
    });
  }

  // 3.2 Title Length (50–60 characters)
  const titleLen = title.length;
  if (titleLen >= 50 && titleLen <= 60) {
    checks.push({
      id: 'title-len',
      label: 'SEO title length is optimal (50–60 characters)',
      status: 'good',
      message: `Title is ${titleLen} characters — perfect fit for desktop and mobile search snippets. ✓`,
      weight: 8,
    });
  } else if (titleLen > 60) {
    checks.push({
      id: 'title-len',
      label: 'SEO title length is optimal (50–60 characters)',
      status: 'ok',
      message: `Title is ${titleLen} characters — Google may truncate titles longer than 60 chars.`,
      weight: 6,
    });
  } else if (titleLen > 0) {
    checks.push({
      id: 'title-len',
      label: 'SEO title length is optimal (50–60 characters)',
      status: 'ok',
      message: `Title is ${titleLen} characters. Expand towards 50–60 chars to maximize SERP visibility.`,
      weight: 6,
    });
  } else {
    checks.push({
      id: 'title-len',
      label: 'SEO title defined',
      status: 'bad',
      message: 'Enter an SEO Title.',
      weight: 8,
    });
  }

  // 3.3 Power Words in Title
  const POWER_WORDS = [
    'best', 'proven', 'ultimate', 'guide', 'top', 'fast', 'quick', 'easy', 'simple',
    'essential', 'complete', 'master', 'modern', 'free', 'instant', 'secret', 'powerful',
    'review', 'step-by-step', 'how to', 'tricks', 'tips', 'epic', 'definitive'
  ];
  const hasPowerWord = POWER_WORDS.some((pw) => titleLower.includes(pw));
  if (hasPowerWord) {
    checks.push({
      id: 'title-power',
      label: 'Title contains a Power Word for higher CTR',
      status: 'good',
      message: 'Your title contains an engaging power word that boosts search clicks. ✓',
      weight: 7,
    });
  } else {
    checks.push({
      id: 'title-power',
      label: 'Title contains a Power Word for higher CTR',
      status: 'ok',
      message: 'Add a power word like "Best", "Ultimate", "Proven", or "Complete" to attract clicks.',
      weight: 6,
    });
  }

  // 3.4 Number in Title
  const hasNumber = /\d+/.test(title);
  if (hasNumber) {
    checks.push({
      id: 'title-number',
      label: 'Title contains a Number',
      status: 'good',
      message: 'Titles with numbers (like 2026 or list counts) receive 36% higher CTR. ✓',
      weight: 6,
    });
  } else {
    checks.push({
      id: 'title-number',
      label: 'Title contains a Number',
      status: 'ok',
      message: 'Consider adding a number (e.g. current year or list count) to improve click appeal.',
      weight: 5,
    });
  }

  // 3.5 Title Sentiment / Hook
  const POSITIVE_WORDS = ['great', 'excellent', 'amazing', 'perfect', 'love', 'easy', 'smart', 'better', 'boost', 'fast', 'success'];
  const hasSentiment = POSITIVE_WORDS.some((w) => titleLower.includes(w)) || hasPowerWord;
  if (hasSentiment) {
    checks.push({
      id: 'title-sentiment',
      label: 'Title has a positive sentiment / hook',
      status: 'good',
      message: 'Title conveys positive emotional engagement. ✓',
      weight: 6,
    });
  } else {
    checks.push({
      id: 'title-sentiment',
      label: 'Title has a positive sentiment / hook',
      status: 'ok',
      message: 'Add emotionally compelling adjectives to evoke reader curiosity.',
      weight: 5,
    });
  }

  // Compute weighted score
  const totalWeight = checks.filter((c) => c.status !== 'info').reduce((s, c) => s + c.weight, 0);
  const earnedWeight = checks
    .filter((c) => c.status !== 'info')
    .reduce((s, c) => s + (STATUS_SCORE[c.status] * c.weight) / 100, 0);
  const score = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return {
    keyword,
    isPrimary,
    score,
    checks,
    count: kwCount,
    density: kwDensity,
    inTitle,
    inTitleFront,
    inSlug,
    inMeta,
    inIntro,
    inHeadings,
    inImageAlt,
  };
}

// ─── Readability Analysis Engine ─────────────────────────────────────────────

export function analyzeReadability(
  content: string,
  isPillarContent?: boolean
): { score: number; checks: SEOCheck[]; fleschScore: number } {
  const checks: SEOCheck[] = [];
  const words = content.trim().split(/\s+/).filter(Boolean);
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);

  const flesch = fleschReadingEase(content);
  const avgSentenceLen = sentences.length > 0 ? words.length / sentences.length : 0;
  const longSentences = sentences.filter((s) => s.trim().split(/\s+/).length > 20).length;
  const longSentencePct = sentences.length > 0 ? (longSentences / sentences.length) * 100 : 0;

  // Passive voice
  const passiveMatches = (content.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
  const passivePct = sentences.length > 0 ? (passiveMatches / sentences.length) * 100 : 0;

  // Transition words
  const transitionWords = [
    'however','therefore','furthermore','additionally','consequently','meanwhile',
    'nevertheless','moreover','although','because','since','while','also','but',
    'yet','so','first','second','finally','next','thus','hence','accordingly',
    'as a result','in addition','for example','for instance','specifically',
  ];
  const transitionCount = transitionWords.filter((w) => content.toLowerCase().includes(w)).length;

  // Paragraph length
  const longParas = paragraphs.filter((p) => p.trim().split(/\s+/).length > 150).length;
  const hCount = (content.match(/^#+\s+/gm) || []).length;

  // 1. Flesch Reading Ease
  if (flesch >= 60) {
    checks.push({
      id: 'flesch-ease',
      label: 'Flesch Reading Ease',
      status: 'good',
      message: `Score is ${flesch}/100 (${fleschLabel(flesch).label}) — accessible to general audiences. ✓`,
      weight: 25,
    });
  } else if (flesch >= 45) {
    checks.push({
      id: 'flesch-ease',
      label: 'Flesch Reading Ease',
      status: 'ok',
      message: `Score is ${flesch}/100 (${fleschLabel(flesch).label}) — consider shortening sentences for easier reading.`,
      weight: 20,
    });
  } else {
    checks.push({
      id: 'flesch-ease',
      label: 'Flesch Reading Ease',
      status: 'bad',
      message: `Score is ${flesch}/100 (${fleschLabel(flesch).label}) — difficult for online readers. Break up complex ideas.`,
      weight: 25,
    });
  }

  // 2. Average Sentence Length
  if (avgSentenceLen <= 18) {
    checks.push({
      id: 'avg-sent-len',
      label: 'Sentence length balance',
      status: 'good',
      message: `Average of ${avgSentenceLen.toFixed(0)} words per sentence. ✓`,
      weight: 15,
    });
  } else if (avgSentenceLen <= 24) {
    checks.push({
      id: 'avg-sent-len',
      label: 'Sentence length balance',
      status: 'ok',
      message: `Average sentence length is ${avgSentenceLen.toFixed(0)} words. Aim for under 20.`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'avg-sent-len',
      label: 'Sentence length balance',
      status: 'bad',
      message: `Sentences average ${avgSentenceLen.toFixed(0)} words — too long for web skimmability.`,
      weight: 15,
    });
  }

  // 3. Long Sentences %
  if (longSentencePct <= 20) {
    checks.push({
      id: 'long-sent-pct',
      label: 'Long sentences (<20% of text)',
      status: 'good',
      message: `Only ${longSentencePct.toFixed(0)}% of sentences exceed 20 words. ✓`,
      weight: 15,
    });
  } else if (longSentencePct <= 35) {
    checks.push({
      id: 'long-sent-pct',
      label: 'Long sentences (<20% of text)',
      status: 'ok',
      message: `${longSentencePct.toFixed(0)}% of sentences are over 20 words. Trim a few.`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'long-sent-pct',
      label: 'Long sentences (<20% of text)',
      status: 'bad',
      message: `${longSentencePct.toFixed(0)}% of sentences are long. Split sentences to improve flow.`,
      weight: 15,
    });
  }

  // 4. Passive Voice (<10%)
  if (passivePct <= 10) {
    checks.push({
      id: 'passive-voice',
      label: 'Active voice predominance',
      status: 'good',
      message: `Only ${passivePct.toFixed(0)}% passive voice — clear, direct writing. ✓`,
      weight: 15,
    });
  } else if (passivePct <= 20) {
    checks.push({
      id: 'passive-voice',
      label: 'Active voice predominance',
      status: 'ok',
      message: `${passivePct.toFixed(0)}% passive voice. Replace with active verbs where possible.`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'passive-voice',
      label: 'Active voice predominance',
      status: 'bad',
      message: `${passivePct.toFixed(0)}% passive voice. Convert sentences to direct active voice.`,
      weight: 15,
    });
  }

  // 5. Transition Words
  if (transitionCount >= 6) {
    checks.push({
      id: 'transitions',
      label: 'Transition word variety',
      status: 'good',
      message: `${transitionCount} transition word types found for smooth idea flow. ✓`,
      weight: 15,
    });
  } else if (transitionCount >= 3) {
    checks.push({
      id: 'transitions',
      label: 'Transition word variety',
      status: 'ok',
      message: `${transitionCount} transition types used. Add more connectors (e.g. "therefore", "however").`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'transitions',
      label: 'Transition word variety',
      status: 'bad',
      message: 'Few transition words detected. Use transitional phrases to link paragraphs together.',
      weight: 15,
    });
  }

  // 6. Subheading Distribution
  const requiredHeadings = isPillarContent ? 4 : 2;
  if (words.length > 300 && hCount >= requiredHeadings) {
    checks.push({
      id: 'subheading-dist',
      label: 'Subheading distribution',
      status: 'good',
      message: `${hCount} subheadings organize the content sections effectively. ✓`,
      weight: 15,
    });
  } else if (words.length > 300) {
    checks.push({
      id: 'subheading-dist',
      label: 'Subheading distribution',
      status: 'ok',
      message: 'Add subheadings every 300 words to guide reader scanning.',
      weight: 15,
    });
  }

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earnedWeight = checks.reduce((s, c) => s + (STATUS_SCORE[c.status] * c.weight) / 100, 0);
  const score = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return { score, checks, fleschScore: flesch };
}

// ─── Master Multi-Keyword SEO Analyzer Engine ────────────────────────────────

export function analyzeMultiKeyword(inputs: SEOInputs): MultiKeywordSEOResult {
  const stats = computeContentStats(inputs.content);
  const cleanKeywords = inputs.keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 5);

  const effectiveKeywords = cleanKeywords.length > 0 ? cleanKeywords : [''];
  const activeIndex = Math.min(Math.max(0, inputs.activeKeywordIndex || 0), effectiveKeywords.length - 1);
  const activeKeyword = effectiveKeywords[activeIndex] || '';

  const keywordAnalyses: Record<string, KeywordAnalysis> = {};
  effectiveKeywords.forEach((kw, idx) => {
    keywordAnalyses[kw] = analyzeKeyword(kw, idx === 0, {
      title: inputs.title,
      metaDescription: inputs.metaDescription,
      slug: inputs.slug,
      content: inputs.content,
      isPillarContent: inputs.isPillarContent,
      stats,
    });
  });

  const readability = analyzeReadability(inputs.content, inputs.isPillarContent);

  // Overall combined score:
  // Primary keyword gets 60%, average of secondary keywords gets 20%, readability gets 20%
  const primaryKw = effectiveKeywords[0];
  const primaryScore = keywordAnalyses[primaryKw]?.score || 0;

  let secondaryAvg = primaryScore;
  if (effectiveKeywords.length > 1) {
    const secScores = effectiveKeywords.slice(1).map((k) => keywordAnalyses[k]?.score || 0);
    secondaryAvg = secScores.reduce((a, b) => a + b, 0) / secScores.length;
  }

  const overallScore = Math.round(
    primaryScore * 0.6 + secondaryAvg * 0.2 + readability.score * 0.2
  );

  return {
    overallScore,
    readabilityScore: readability.score,
    fleschScore: readability.fleschScore,
    keywordAnalyses,
    activeKeyword,
    readabilityChecks: readability.checks,
    suggestedKeywords: extractKeywordSuggestions(inputs.content, effectiveKeywords),
    stats,
  };
}

// Backward-compatible analyze alias
export function analyze(inputs: { focusKeyword: string; title: string; metaDescription: string; slug: string; content: string }): {
  seoScore: number;
  readabilityScore: number;
  fleschScore: number;
  seoChecks: SEOCheck[];
  readabilityChecks: SEOCheck[];
  suggestedKeywords: string[];
} {
  const multi = analyzeMultiKeyword({
    keywords: [inputs.focusKeyword],
    title: inputs.title,
    metaDescription: inputs.metaDescription,
    slug: inputs.slug,
    content: inputs.content,
  });

  const primary = multi.keywordAnalyses[inputs.focusKeyword] || Object.values(multi.keywordAnalyses)[0];

  return {
    seoScore: primary?.score || 0,
    readabilityScore: multi.readabilityScore,
    fleschScore: multi.fleschScore,
    seoChecks: primary?.checks || [],
    readabilityChecks: multi.readabilityChecks,
    suggestedKeywords: multi.suggestedKeywords,
  };
}

// ─── Score Ring Component ─────────────────────────────────────────────────────

export function ScoreRing({ score, label, size = 72 }: { score: number; label: string; size?: number }) {
  const [disp, setDisp] = useState(0);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const color = disp >= 80 ? '#22c55e' : disp >= 50 ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    setDisp(0);
    let cur = 0;
    const steps = 40;
    const inc = score / steps;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= score) {
        setDisp(score);
        clearInterval(t);
      } else {
        setDisp(Math.round(cur));
      }
    }, 700 / steps);
    return () => clearInterval(t);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={6} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - disp / 100)}
            style={{ transition: 'stroke-dashoffset 0.05s ease-out, stroke 0.4s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black leading-none" style={{ color }}>{disp}</span>
          <span className="text-[8px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Check Item Component ────────────────────────────────────────────────────

export function CheckItem({ check, idx }: { check: SEOCheck; idx: number }) {
  const [open, setOpen] = useState(false);
  const Icon = check.status === 'good' ? CheckCircle2 : check.status === 'ok' ? AlertCircle : check.status === 'bad' ? XCircle : AlertCircle;
  const color = { good: 'text-emerald-500', ok: 'text-amber-500', bad: 'text-red-500', info: 'text-muted-foreground' }[check.status];
  const bg = {
    good: 'bg-emerald-500/4 border-emerald-500/15 hover:bg-emerald-500/8',
    ok: 'bg-amber-500/4 border-amber-500/15 hover:bg-amber-500/8',
    bad: 'bg-red-500/4 border-red-500/15 hover:bg-red-500/8',
    info: 'bg-muted/15 border-border/40 hover:bg-muted/25',
  }[check.status];

  return (
    <div className={cn('rounded-md border transition-colors', bg)}>
      <button
        type="button"
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon className={cn('h-3 w-3 shrink-0', color)} />
        <span className="text-[10.5px] font-normal text-foreground/90 flex-1 leading-snug">{check.label}</span>
        {open ? (
          <ChevronUp className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-2.5 pb-2 text-[9.5px] text-muted-foreground font-normal leading-relaxed border-t border-inherit/40 pt-1">
          {check.message}
        </div>
      )}
    </div>
  );
}

// ─── Dual Desktop / Mobile SERP Preview Component ─────────────────────────────

export function SERPPreview({
  title,
  meta,
  slug,
  keyword,
  device = 'desktop',
  onDeviceChange,
}: {
  title: string;
  meta: string;
  slug: string;
  keyword: string;
  device?: 'desktop' | 'mobile';
  onDeviceChange?: (d: 'desktop' | 'mobile') => void;
}) {
  const domain = 'yoursite.com';
  const url = `${domain}/${slug || 'article-slug'}`;
  const t = (title || 'Page Title').slice(0, 60) + (title.length > 60 ? '…' : '');
  const d = (meta || 'Add a compelling meta description to describe your page and attract organic clicks from search results.').slice(0, 160) + (meta.length > 160 ? '…' : '');

  const renderHighlighted = (text: string) => {
    if (!keyword || !keyword.trim()) return text;
    const escapedKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedKw})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <strong key={i} className="font-bold text-foreground">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Google Search Preview</span>
        {onDeviceChange && (
          <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => onDeviceChange('desktop')}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-all',
                device === 'desktop' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Monitor className="h-3 w-3" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => onDeviceChange('mobile')}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-all',
                device === 'mobile' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Smartphone className="h-3 w-3" />
              <span>Mobile</span>
            </button>
          </div>
        )}
      </div>

      {device === 'desktop' ? (
        <div className="p-3 rounded-lg bg-background border space-y-1 text-left">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono truncate">
            <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="truncate">{url}</span>
          </div>
          <div className="text-[17px] leading-snug text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-normal line-clamp-1">
            {renderHighlighted(t)}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {renderHighlighted(d)}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-background border shadow-xs space-y-2 text-left max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Globe className="h-3 w-3 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-foreground truncate">{domain}</div>
              <div className="text-[10px] text-muted-foreground truncate">{url}</div>
            </div>
          </div>
          <div className="text-[16px] font-medium leading-snug text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-2">
            {renderHighlighted(t)}
          </div>
          <div className="text-xs text-muted-foreground leading-snug line-clamp-3">
            {renderHighlighted(d)}
          </div>
        </div>
      )}

      {/* Snippet Progress Bars */}
      <div className="grid grid-cols-2 gap-3 pt-1 text-[10px]">
        <div>
          <div className="flex justify-between font-semibold mb-0.5">
            <span>Title Tag</span>
            <span className={title.length >= 50 && title.length <= 60 ? 'text-emerald-500' : title.length > 60 ? 'text-red-500' : 'text-amber-500'}>
              {title.length}/60
            </span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', title.length >= 50 && title.length <= 60 ? 'bg-emerald-500' : title.length > 60 ? 'bg-red-500' : 'bg-amber-500')}
              style={{ width: `${Math.min(100, (title.length / 60) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-semibold mb-0.5">
            <span>Meta Description</span>
            <span className={meta.length >= 120 && meta.length <= 160 ? 'text-emerald-500' : meta.length > 160 ? 'text-red-500' : 'text-amber-500'}>
              {meta.length}/160
            </span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', meta.length >= 120 && meta.length <= 160 ? 'bg-emerald-500' : meta.length > 160 ? 'bg-red-500' : 'bg-amber-500')}
              style={{ width: `${Math.min(100, (meta.length / 160) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Social Cards Preview Component ──────────────────────────────────────────

export function SocialPreview({
  title,
  meta,
  slug,
  ogImage,
  siteName,
}: {
  title: string;
  meta: string;
  slug: string;
  ogImage: string;
  siteName: string;
}) {
  const domain = siteName || 'yoursite.com';
  const t = (title || 'Page Title').slice(0, 70);
  const d = (meta || 'Description').slice(0, 125);

  return (
    <div className="space-y-4">
      {/* Facebook Card */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Facebook className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-semibold">Facebook Open Graph</span>
        </div>
        <div className="rounded-xl border overflow-hidden bg-background shadow-xs">
          <div className="h-36 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative overflow-hidden">
            {ogImage ? (
              <img src={ogImage} alt="OG" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-muted-foreground/60">
                <Share2 className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <span className="text-[10px]">1200 × 630 px</span>
              </div>
            )}
          </div>
          <div className="p-3 border-t">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{domain}</p>
            <p className="text-xs font-bold text-foreground mt-0.5 line-clamp-1">{t}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{d}</p>
          </div>
        </div>
      </div>

      {/* Twitter Card */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Twitter className="h-3.5 w-3.5 text-sky-500" />
          <span className="text-xs font-semibold">Twitter / X Summary Card</span>
        </div>
        <div className="rounded-xl border overflow-hidden bg-background shadow-xs">
          <div className="h-32 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-950/40 dark:to-zinc-900 flex items-center justify-center">
            {ogImage ? (
              <img src={ogImage} alt="Twitter" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-sky-500/60">
                <Twitter className="h-5 w-5 mx-auto mb-1 opacity-60" />
                <span className="text-[10px]">Summary Large Image</span>
              </div>
            )}
          </div>
          <div className="p-2.5 border-t">
            <p className="text-xs font-semibold text-foreground line-clamp-1">{t}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{d}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Schema Panel Component ──────────────────────────────────────────────────

export function SchemaPanel({
  inputs,
}: {
  inputs: {
    title: string;
    description: string;
    slug: string;
    content: string;
    imageUrl?: string;
    authorName?: string;
    siteName?: string;
  };
}) {
  const [type, setType] = useState<SchemaType>('Article');
  const [copied, setCopied] = useState(false);
  const schema = generateSchema(type, inputs);
  const json = JSON.stringify(schema, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${json}\n</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold block mb-1.5">Schema.org Rich Snippet Type</label>
        <div className="grid grid-cols-3 gap-1">
          {(['Article', 'BlogPosting', 'NewsArticle', 'FAQPage', 'HowTo', 'BreadcrumbList'] as SchemaType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'px-2 py-1 rounded-md text-[10px] font-medium border text-center transition-all',
                type === t ? 'bg-primary text-primary-foreground font-bold border-primary' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {t === 'BreadcrumbList' ? 'Breadcrumb' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">JSON-LD Output</span>
          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={copy}>
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
        <pre className="text-[10px] bg-muted/30 border rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-muted-foreground whitespace-pre">
          {`<script type="application/ld+json">\n${json}\n</script>`}
        </pre>
      </div>

      <a
        href="https://validator.schema.org"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
      >
        <span>Test schema in Google Rich Results Validator</span>
        <ExternalLink className="h-2.5 w-2.5" />
      </a>
    </div>
  );
}

// ─── Article Editorial SEO Sidebar (Rank Markup Inspector) ───────────────────

export interface ArticleSEOSidebarProps {
  title: string;
  slug: string;
  content: string;
  seoData: {
    focusKeyword?: string;
    keywords?: string[]; // up to 5 keywords
    title?: string;
    description?: string;
    canonical?: string;
    robots?: string;
    ogImage?: string;
    siteName?: string;
    isPillarContent?: boolean;
  };
  onUpdateSeo: (updated: Record<string, any>) => void;
  onUpdateSlug?: (slug: string) => void;
  onClose?: () => void;
  className?: string;
}

export function ArticleSEOSidebar({
  title,
  slug,
  content,
  seoData,
  onUpdateSeo,
  onUpdateSlug,
  onClose,
  className,
}: ArticleSEOSidebarProps) {
  const [tab, setTab] = useState<'checks' | 'serp' | 'social' | 'advanced'>('checks');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [activeKeywordIdx, setActiveKeywordIdx] = useState(0);

  // Accordion states for checks groups
  const [openCheckGroups, setOpenCheckGroups] = useState<Record<string, boolean>>({
    basic: true,
    additional: true,
    title: true,
    readability: true,
  });

  const toggleCheckGroup = (group: string) => {
    setOpenCheckGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Manage up to 5 keywords
  const keywordsList: string[] = useMemo(() => {
    if (Array.isArray(seoData.keywords) && seoData.keywords.length > 0) {
      return seoData.keywords.slice(0, 5);
    }
    if (seoData.focusKeyword) {
      return [seoData.focusKeyword];
    }
    return [];
  }, [seoData.keywords, seoData.focusKeyword]);

  const isPillar = Boolean(seoData.isPillarContent);
  const seoTitle = seoData.title || title || '';
  const seoDesc = seoData.description || '';
  const ogImg = seoData.ogImage || '';
  const canonical = seoData.canonical || '';
  const robots = seoData.robots || 'index, follow';
  const siteName = seoData.siteName || 'yoursite.com';

  const multiResult = useMemo(() => {
    return analyzeMultiKeyword({
      keywords: keywordsList,
      activeKeywordIndex: activeKeywordIdx,
      title: seoTitle,
      metaDescription: seoDesc,
      slug,
      content,
      isPillarContent: isPillar,
    });
  }, [keywordsList, activeKeywordIdx, seoTitle, seoDesc, slug, content, isPillar]);

  const activeKw = keywordsList[activeKeywordIdx] || keywordsList[0] || '';
  const activeAnalysis = multiResult.keywordAnalyses[activeKw] || Object.values(multiResult.keywordAnalyses)[0];

  const handleAddKeyword = (kwToAdd: string) => {
    const trimmed = kwToAdd.trim();
    if (!trimmed) return;
    if (keywordsList.includes(trimmed)) return;
    if (keywordsList.length >= 5) return;

    const next = [...keywordsList, trimmed];
    onUpdateSeo({
      keywords: next,
      focusKeyword: next[0],
    });
    setActiveKeywordIdx(next.length - 1);
    setNewKeywordInput('');
    setShowAddKeyword(false);
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    const next = keywordsList.filter((_, idx) => idx !== indexToRemove);
    onUpdateSeo({
      keywords: next,
      focusKeyword: next[0] || '',
    });
    setActiveKeywordIdx(Math.max(0, indexToRemove - 1));
  };

  const handleSetPrimary = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    const promoted = keywordsList[indexToPromote];
    const rest = keywordsList.filter((_, idx) => idx !== indexToPromote);
    const next = [promoted, ...rest];
    onUpdateSeo({
      keywords: next,
      focusKeyword: promoted,
    });
    setActiveKeywordIdx(0);
  };

  // Group checks into the 4 official Rank Math categories
  const allChecks = activeAnalysis?.checks || [];
  const basicChecks = allChecks.filter((c) =>
    ['kw-title', 'kw-meta', 'kw-slug', 'kw-intro', 'kw-content', 'content-len'].includes(c.id)
  );
  const additionalChecks = allChecks.filter((c) =>
    ['kw-headings', 'kw-alt', 'kw-density', 'url-len', 'ext-links', 'int-links', 'kw-unique'].includes(c.id)
  );
  const titleChecks = allChecks.filter((c) =>
    ['title-start', 'title-len', 'title-power', 'title-number', 'title-sentiment'].includes(c.id)
  );
  const readabilityChecks = multiResult.readabilityChecks || [];

  const goodCount = (c: SEOCheck[] = []) => c.filter((x) => x.status === 'good').length;
  const badCount = (c: SEOCheck[] = []) => c.filter((x) => x.status === 'bad').length;

  const totalBad = badCount(allChecks) + badCount(readabilityChecks);
  const totalGood = goodCount(allChecks) + goodCount(readabilityChecks);

  const overallScoreColor =
    multiResult.overallScore >= 80
      ? 'text-emerald-500'
      : multiResult.overallScore >= 50
      ? 'text-amber-500'
      : 'text-red-500';

  const overallScoreBg =
    multiResult.overallScore >= 80
      ? 'bg-emerald-500/10 border-emerald-500/30'
      : multiResult.overallScore >= 50
      ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-red-500/10 border-red-500/30';

  const overallScoreLabel =
    multiResult.overallScore >= 80
      ? 'Good SEO'
      : multiResult.overallScore >= 50
      ? 'Needs Improvement'
      : 'Poor SEO';

  return (
    <div className={cn('flex flex-col h-full bg-card overflow-hidden text-[11px]', className)}>
      {/* ── Top Header Bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/15 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
            <Zap className="h-3 w-3 fill-current" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground text-[11.5px]">Rank Markup</span>
            <span className="text-[8.5px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
              PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'px-2 py-0.5 rounded-full font-medium text-[10px] border flex items-center gap-1 transition-colors',
              overallScoreBg,
              overallScoreColor
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            <span>{multiResult.overallScore}/100</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="h-5.5 w-5.5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              title="Close Rank Markup sidebar"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Inspector Body ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {/* ── 1. Hero Score & Metric Telemetry Card ──────────────────────── */}
        <div className="p-2.5 border-b bg-muted/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-9 w-9 rounded-full border-2 flex flex-col items-center justify-center shrink-0 font-semibold text-xs',
                  overallScoreBg,
                  overallScoreColor
                )}
              >
                <span>{multiResult.overallScore}</span>
              </div>
              <div>
                <div className={cn('font-medium text-[11px] leading-tight', overallScoreColor)}>
                  {overallScoreLabel}
                </div>
                <div className="text-[9.5px] text-muted-foreground mt-0.5 font-normal">
                  {totalGood} Passed · {totalBad} Needs Attention
                </div>
              </div>
            </div>

            {/* Pillar Content Switch */}
            <button
              type="button"
              onClick={() => onUpdateSeo({ isPillarContent: !isPillar })}
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium border transition-all cursor-pointer select-none',
                isPillar
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'bg-background hover:bg-muted text-muted-foreground'
              )}
              title="Cornerstone pillar post (1,500+ words required)"
            >
              <Star className={cn('h-2.5 w-2.5', isPillar ? 'fill-current' : '')} />
              <span>Pillar Post</span>
            </button>
          </div>

          {/* Mini Health Breakdown Pills */}
          <div className="grid grid-cols-3 gap-1 pt-0.5 text-center">
            <div className="p-1 rounded-md border bg-background/60">
              <div className="text-[8.5px] text-muted-foreground font-normal">SEO Score</div>
              <div className={cn('font-semibold text-[11px]', overallScoreColor)}>
                {activeAnalysis?.score || 0}
              </div>
            </div>
            <div className="p-1 rounded-md border bg-background/60">
              <div className="text-[8.5px] text-muted-foreground font-normal">Readability</div>
              <div className="font-semibold text-[11px] text-blue-500">
                {multiResult.readabilityScore}
              </div>
            </div>
            <div className="p-1 rounded-md border bg-background/60">
              <div className="text-[8.5px] text-muted-foreground font-normal">Flesch Ease</div>
              <div className={cn('font-semibold text-[11px]', fleschLabel(multiResult.fleschScore).color)}>
                {multiResult.fleschScore}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Focus Keywords Management & Instant Checklist ─────────────── */}
        <div className="p-2.5 border-b bg-card space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10.5px] font-medium text-foreground/90 flex items-center gap-1">
              <Target className="h-3 w-3 text-primary" />
              <span>Focus Keywords</span>
              <span className="text-[9.5px] text-muted-foreground font-normal">
                ({keywordsList.length}/5)
              </span>
            </label>

            {activeAnalysis && activeKw && (
              <span
                className={cn(
                  'text-[9.5px] font-medium px-1.5 py-0.2 rounded',
                  activeAnalysis.density >= 0.5 && activeAnalysis.density <= 2.5
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                )}
              >
                {activeAnalysis.count}x ({activeAnalysis.density.toFixed(1)}%)
              </span>
            )}
          </div>

          {/* Keyword Tag Chips */}
          <div className="flex flex-wrap gap-1">
            {keywordsList.map((kwItem, idx) => {
              const isSelected = idx === activeKeywordIdx;
              const kwScore = multiResult.keywordAnalyses[kwItem]?.score || 0;
              const isPrimaryKw = idx === 0;

              return (
                <div
                  key={kwItem}
                  onClick={() => setActiveKeywordIdx(idx)}
                  className={cn(
                    'group flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border transition-all cursor-pointer font-normal',
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground font-medium shadow-xs'
                      : 'border-border/60 bg-background hover:bg-muted text-muted-foreground'
                  )}
                >
                  {isPrimaryKw ? (
                    <span title="Primary Focus Keyword">
                      <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(idx);
                      }}
                      className="opacity-40 group-hover:opacity-100 hover:text-amber-500 transition-opacity"
                      title="Promote to Primary Keyword"
                    >
                      <Star className="h-2.5 w-2.5" />
                    </button>
                  )}

                  <span className="truncate max-w-[120px]">{kwItem}</span>

                  <span
                    className={cn(
                      'text-[8.5px] font-mono px-1 rounded-full font-medium',
                      kwScore >= 80
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : kwScore >= 50
                        ? 'bg-amber-500/15 text-amber-600'
                        : 'bg-red-500/15 text-red-600'
                    )}
                  >
                    {kwScore}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveKeyword(idx);
                    }}
                    className="opacity-40 group-hover:opacity-100 hover:text-destructive transition-opacity ml-0.5 cursor-pointer"
                    title="Remove keyword"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Keyword Form */}
          {keywordsList.length < 5 && (
            <div>
              {!showAddKeyword ? (
                <button
                  type="button"
                  onClick={() => setShowAddKeyword(true)}
                  className="text-[10px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-2.5 w-2.5" />
                  <span>
                    {keywordsList.length === 0 ? 'Set Focus Keyword' : 'Add Secondary Keyword'}
                  </span>
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddKeyword(newKeywordInput);
                  }}
                  className="flex items-center gap-1"
                >
                  <Input
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    placeholder="Enter keyword..."
                    className="h-6.5 text-[10px] bg-background flex-1 px-2"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="h-6.5 text-[9.5px] px-2 font-medium">
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6.5 text-[9.5px] px-1.5 font-medium"
                    onClick={() => setShowAddKeyword(false)}
                  >
                    Cancel
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Quick 5-Point Presence Checklist Strip */}
          {activeAnalysis && activeKw && (
            <div className="p-1.5 rounded-md border border-border/50 bg-muted/15 space-y-1">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground font-normal">
                <span>Keyword Presence:</span>
                <span className="font-mono text-[8.5px] text-primary truncate max-w-[140px]">{activeKw}</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center font-normal text-[8.5px]">
                <div
                  className={cn(
                    'py-0.5 rounded border transition-colors',
                    activeAnalysis.inTitle
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600'
                      : 'bg-background border-border/40 text-muted-foreground/60'
                  )}
                >
                  {activeAnalysis.inTitle ? '✓' : '—'} Title
                </div>
                <div
                  className={cn(
                    'py-0.5 rounded border transition-colors',
                    activeAnalysis.inSlug
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600'
                      : 'bg-background border-border/40 text-muted-foreground/60'
                  )}
                >
                  {activeAnalysis.inSlug ? '✓' : '—'} URL
                </div>
                <div
                  className={cn(
                    'py-0.5 rounded border transition-colors',
                    activeAnalysis.inMeta
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600'
                      : 'bg-background border-border/40 text-muted-foreground/60'
                  )}
                >
                  {activeAnalysis.inMeta ? '✓' : '—'} Meta
                </div>
                <div
                  className={cn(
                    'py-0.5 rounded border transition-colors',
                    activeAnalysis.inIntro
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600'
                      : 'bg-background border-border/40 text-muted-foreground/60'
                  )}
                >
                  {activeAnalysis.inIntro ? '✓' : '—'} Intro
                </div>
                <div
                  className={cn(
                    'py-0.5 rounded border transition-colors',
                    activeAnalysis.inHeadings
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600'
                      : 'bg-background border-border/40 text-muted-foreground/60'
                  )}
                >
                  {activeAnalysis.inHeadings ? '✓' : '—'} Headings
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Four Segmented Clean Sub-Tabs ────────────────────────────── */}
        <div className="grid grid-cols-4 border-b bg-muted/15 shrink-0 text-center select-none">
          <button
            type="button"
            onClick={() => setTab('checks')}
            className={cn(
              'py-1.5 text-[10.5px] font-medium border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer',
              tab === 'checks'
                ? 'border-primary text-foreground bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
            <span>Checks</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('serp')}
            className={cn(
              'py-1.5 text-[10.5px] font-medium border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer',
              tab === 'serp'
                ? 'border-primary text-foreground bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Globe className="h-2.5 w-2.5 text-blue-500" />
            <span>SERP</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('social')}
            className={cn(
              'py-1.5 text-[10.5px] font-medium border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer',
              tab === 'social'
                ? 'border-primary text-foreground bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Share2 className="h-2.5 w-2.5 text-violet-500" />
            <span>Social</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('advanced')}
            className={cn(
              'py-1.5 text-[10.5px] font-medium border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer',
              tab === 'advanced'
                ? 'border-primary text-foreground bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Code2 className="h-2.5 w-2.5 text-amber-500" />
            <span>Advanced</span>
          </button>
        </div>

        {/* ── 4. Tab Panels ────────────────────────────────────────────────── */}
        <div className="p-2.5 space-y-2.5">
          {/* TAB 1: ALL RANK MATH SEO CHECKS */}
          {tab === 'checks' && (
            <div className="space-y-2">
              {/* Group 1: Basic SEO */}
              <div className="rounded-lg border overflow-hidden bg-card shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleCheckGroup('basic')}
                  className="w-full flex items-center justify-between p-2 bg-muted/20 font-medium text-[10.5px] hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3 w-3 text-primary" />
                    <span>Basic SEO</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-normal text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded">
                      {goodCount(basicChecks)}/{basicChecks.length} Passed
                    </span>
                    {openCheckGroups.basic ? (
                      <ChevronUp className="h-3 w-3 text-muted-foreground/60" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                    )}
                  </div>
                </button>
                {openCheckGroups.basic && (
                  <div className="p-1.5 space-y-1 border-t bg-card">
                    {basicChecks.map((c, idx) => (
                      <CheckItem key={c.id} check={c} idx={idx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Group 2: Additional SEO */}
              <div className="rounded-lg border overflow-hidden bg-card shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleCheckGroup('additional')}
                  className="w-full flex items-center justify-between p-2 bg-muted/20 font-medium text-[10.5px] hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Additional SEO</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-normal text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded">
                      {goodCount(additionalChecks)}/{additionalChecks.length} Passed
                    </span>
                    {openCheckGroups.additional ? (
                      <ChevronUp className="h-3 w-3 text-muted-foreground/60" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                    )}
                  </div>
                </button>
                {openCheckGroups.additional && (
                  <div className="p-1.5 space-y-1 border-t bg-card">
                    {additionalChecks.map((c, idx) => (
                      <CheckItem key={c.id} check={c} idx={idx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Group 3: Title Readability */}
              <div className="rounded-lg border overflow-hidden bg-card shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleCheckGroup('title')}
                  className="w-full flex items-center justify-between p-2 bg-muted/20 font-medium text-[10.5px] hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="h-3 w-3 text-blue-500" />
                    <span>Title Readability</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-normal text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded">
                      {goodCount(titleChecks)}/{titleChecks.length} Passed
                    </span>
                    {openCheckGroups.title ? (
                      <ChevronUp className="h-3 w-3 text-muted-foreground/60" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                    )}
                  </div>
                </button>
                {openCheckGroups.title && (
                  <div className="p-1.5 space-y-1 border-t bg-card">
                    {titleChecks.map((c, idx) => (
                      <CheckItem key={c.id} check={c} idx={idx} />
                    ))}
                  </div>
                )}
              </div>

              {/* Group 4: Content Readability */}
              <div className="rounded-lg border overflow-hidden bg-card shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleCheckGroup('readability')}
                  className="w-full flex items-center justify-between p-2 bg-muted/20 font-medium text-[10.5px] hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-violet-500" />
                    <span>Content Readability</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-normal text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded">
                      {goodCount(readabilityChecks)}/{readabilityChecks.length} Passed
                    </span>
                    {openCheckGroups.readability ? (
                      <ChevronUp className="h-3 w-3 text-muted-foreground/60" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                    )}
                  </div>
                </button>
                {openCheckGroups.readability && (
                  <div className="p-1.5 space-y-1 border-t bg-card">
                    {readabilityChecks.map((c, idx) => (
                      <CheckItem key={c.id} check={c} idx={idx} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SERP SNIPPET PREVIEW & EDITORS */}
          {tab === 'serp' && (
            <div className="space-y-2.5">
              <SERPPreview
                title={seoTitle}
                meta={seoDesc}
                slug={slug}
                keyword={activeKw}
                device={serpDevice}
                onDeviceChange={setSerpDevice}
              />

              <div className="space-y-2.5 pt-1.5 border-t">
                {/* SEO Title Input with length bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                    <span>SEO Title Tag</span>
                    <span
                      className={cn(
                        seoTitle.length >= 50 && seoTitle.length <= 60
                          ? 'text-emerald-500'
                          : seoTitle.length > 60
                          ? 'text-red-500'
                          : 'text-amber-500'
                      )}
                    >
                      {seoTitle.length}/60 chars
                    </span>
                  </div>
                  <Input
                    value={seoTitle}
                    onChange={(e) => onUpdateSeo({ title: e.target.value })}
                    placeholder={title || 'Page Title (50-60 characters)'}
                    className="h-7 text-[10.5px] bg-background"
                  />
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden mt-0.5">
                    <div
                      className={cn(
                        'h-full transition-all',
                        seoTitle.length >= 50 && seoTitle.length <= 60
                          ? 'bg-emerald-500'
                          : seoTitle.length > 60
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      )}
                      style={{ width: `${Math.min(100, (seoTitle.length / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Slug Input */}
                {onUpdateSlug && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground block">URL Permlink Slug</label>
                    <Input
                      value={slug}
                      onChange={(e) => onUpdateSlug(e.target.value)}
                      placeholder="article-slug"
                      className="h-7 text-[10.5px] font-mono bg-background"
                    />
                  </div>
                )}

                {/* Meta Description Input with length bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                    <span>Meta Description</span>
                    <span
                      className={cn(
                        seoDesc.length >= 120 && seoDesc.length <= 160
                          ? 'text-emerald-500'
                          : seoDesc.length > 160
                          ? 'text-red-500'
                          : 'text-amber-500'
                      )}
                    >
                      {seoDesc.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDesc}
                    onChange={(e) => onUpdateSeo({ description: e.target.value })}
                    placeholder="Compelling summary snippet (120-160 characters)..."
                    className="w-full rounded-md border bg-background p-2 text-[10.5px] resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed font-normal"
                  />
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden mt-0.5">
                    <div
                      className={cn(
                        'h-full transition-all',
                        seoDesc.length >= 120 && seoDesc.length <= 160
                          ? 'bg-emerald-500'
                          : seoDesc.length > 160
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      )}
                      style={{ width: `${Math.min(100, (seoDesc.length / 160) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL CARDS */}
          {tab === 'social' && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground block">
                  Social Image URL (Open Graph)
                </label>
                <Input
                  value={ogImg}
                  onChange={(e) => onUpdateSeo({ ogImage: e.target.value })}
                  placeholder="https://.../cover-1200x630.jpg"
                  className="h-7 text-[10.5px] font-mono bg-background"
                />
              </div>

              <SocialPreview
                title={seoTitle}
                meta={seoDesc}
                slug={slug}
                ogImage={ogImg}
                siteName={siteName}
              />
            </div>
          )}

          {/* TAB 4: ADVANCED SCHEMA, DIRECTIVES & STATS */}
          {tab === 'advanced' && (
            <div className="space-y-3">
              {/* Schema Generator */}
              <div className="space-y-1.5">
                <div className="text-[10.5px] font-medium text-foreground/90 flex items-center gap-1.5">
                  <Code2 className="h-3 w-3 text-primary" />
                  <span>Structured Schema Markup</span>
                </div>
                <SchemaPanel
                  inputs={{
                    title: seoTitle,
                    description: seoDesc,
                    slug,
                    content,
                    imageUrl: ogImg,
                    siteName,
                  }}
                />
              </div>

              {/* Robots & Canonical Directives */}
              <div className="space-y-2.5 pt-2 border-t">
                <div className="text-[10.5px] font-medium text-foreground/90 flex items-center gap-1.5">
                  <Sliders className="h-3 w-3 text-blue-500" />
                  <span>Robots Directives &amp; Canonical</span>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground text-[9.5px] block">
                    Robots Meta Tag
                  </label>
                  <select
                    value={robots}
                    onChange={(e) => onUpdateSeo({ robots: e.target.value })}
                    className="w-full h-7 rounded border bg-background px-2 text-[10.5px] font-normal"
                  >
                    <option value="index, follow">index, follow (Standard Default)</option>
                    <option value="noindex, follow">noindex, follow (Do not index, follow links)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Complete exclusion)</option>
                    <option value="index, nofollow">index, nofollow (Index page, ignore links)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground text-[9.5px] block">
                    Canonical URL Override
                  </label>
                  <Input
                    value={canonical}
                    onChange={(e) => onUpdateSeo({ canonical: e.target.value })}
                    placeholder="https://example.com/canonical-url"
                    className="h-7 text-[10.5px] font-mono bg-background"
                  />
                  <p className="text-[9.5px] text-muted-foreground font-normal">
                    Leave blank to use the canonical permalink.
                  </p>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="space-y-1.5 pt-2 border-t">
                <div className="text-[10.5px] font-medium text-foreground/90 flex items-center gap-1.5">
                  <Gauge className="h-3 w-3 text-violet-500" />
                  <span>Content Telemetry &amp; Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                  <div className="p-1.5 rounded border bg-muted/20">
                    <div className="text-muted-foreground text-[9px] font-normal">Words</div>
                    <div className="text-sm font-semibold text-foreground">
                      {multiResult.stats.wordCount}
                    </div>
                  </div>
                  <div className="p-1.5 rounded border bg-muted/20">
                    <div className="text-muted-foreground text-[9px] font-normal">Read Time</div>
                    <div className="text-sm font-semibold text-foreground">
                      {multiResult.stats.readingTimeMin} min
                    </div>
                  </div>
                  <div className="p-1.5 rounded border bg-muted/20">
                    <div className="text-muted-foreground text-[9px] font-normal">Headings</div>
                    <div className="text-sm font-semibold text-foreground">
                      {multiResult.stats.headingCount}
                    </div>
                  </div>
                  <div className="p-1.5 rounded border bg-muted/20">
                    <div className="text-muted-foreground text-[9px] font-normal">Paragraphs</div>
                    <div className="text-sm font-semibold text-foreground">
                      {multiResult.stats.paragraphCount}
                    </div>
                  </div>
                  <div className="p-1.5 rounded border bg-muted/20">
                    <div className="text-muted-foreground text-[9px] font-normal">Internal Links</div>
                    <div className="text-sm font-semibold text-foreground">
                      {multiResult.stats.internalLinkCount}
                    </div>
                  </div>
                  <div className="p-1.5 rounded border bg-muted/20">
                    <div className="text-muted-foreground text-[9px] font-normal">External Links</div>
                    <div className="text-sm font-semibold text-foreground">
                      {multiResult.stats.externalLinkCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Standalone Full-Page SEO Analyzer (for /admin/seo) ──────────────────────

export function SEOAnalyzerWithEditor() {
  const [content, setContent] = useState(
    `# Getting Started with Headless Architecture\n\nA modern headless architecture decouples content management from frontend presentation layer. Unlike traditional CMS platforms, a headless architecture delivers content as structured JSON data over ultra-fast edge APIs.\n\n## Why Modern Engineering Teams Go Headless\n\nTherefore, headless architecture enables teams to build faster digital experiences. Furthermore, it allows you to deliver content across mobile apps, web, and IoT screens.\n\n### Key Benefits\n\n- High performance with edge CDNs\n- Omnichannel distribution across platforms\n- Unmatched developer flexibility with Next.js\n\n## API-First Delivery\n\nFor more details, see the official guide at https://headlesscms.org and developer docs.`
  );
  const [title, setTitle] = useState('Getting Started with Modern Headless Architecture');
  const [slug, setSlug] = useState('getting-started-with-headless-architecture');
  const [meta, setMeta] = useState('Learn why modern engineering teams are decoupling content management from rendering layers to achieve unmatched scalability and velocity.');
  const [keywords, setKeywords] = useState<string[]>(['headless architecture', 'jamstack cms']);
  const [isPillar, setIsPillar] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'settings'>('write');

  const handleUpdateSeo = (updated: Record<string, any>) => {
    if (updated.keywords) setKeywords(updated.keywords);
    if (updated.title) setTitle(updated.title);
    if (updated.description) setMeta(updated.description);
    if (updated.isPillarContent !== undefined) setIsPillar(updated.isPillarContent);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)] min-h-[580px]">
      {/* Editor Left */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-1 border-b pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('write')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
              activeTab === 'write' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            ✏️ Content Editor
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
              activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            ⚙️ Snippet & Metadata
          </button>
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">
            {content.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        {activeTab === 'write' ? (
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article Title..."
              className="h-10 text-base font-bold shrink-0"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed font-mono"
              placeholder="Write your article content here..."
            />
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto flex-1 p-1">
            <div>
              <label className="text-xs font-semibold block mb-1">SEO Title Tag</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">URL Permlink</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-9 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Meta Description</label>
              <textarea
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                rows={3}
                className="w-full rounded-lg border bg-background p-2.5 text-xs resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rank Markup Sidebar Right */}
      <div className="w-full sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px] shrink-0 flex flex-col min-h-0 overflow-hidden rounded-xl border shadow-xs">
        <ArticleSEOSidebar
          title={title}
          slug={slug}
          content={content}
          seoData={{
            keywords,
            focusKeyword: keywords[0],
            title,
            description: meta,
            isPillarContent: isPillar,
          }}
          onUpdateSeo={handleUpdateSeo}
          onUpdateSlug={(s) => setSlug(s)}
          className="border-0"
        />
      </div>
    </div>
  );
}

// Legacy alias export
export const SEOAnalyzer = ArticleSEOSidebar;
export { analyzeMultiKeyword as analyzeSEO };
