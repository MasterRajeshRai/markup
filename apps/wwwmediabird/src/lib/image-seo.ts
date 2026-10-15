/**
 * Image SEO & Accessibility Analysis Engine.
 * Evaluates images against Google Image Search, Core Web Vitals, and WCAG accessibility standards.
 */

export interface ImageSeoInput {
  filename: string;
  originalName?: string;
  altText?: string | null;
  title?: string | null;
  caption?: string | null;
  description?: string | null;
  focusKeyword?: string | null;
  size: number; // in bytes
  mimeType: string;
  width?: number;
  height?: number;
}

export interface ImageSeoCheck {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  scoreImpact: number;
  message: string;
  recommendation?: string;
}

export interface ImageSeoResult {
  score: number; // 0 to 100
  grade: 'Good' | 'Needs Improvement' | 'Poor';
  gradeColor: 'emerald' | 'amber' | 'rose';
  checks: ImageSeoCheck[];
  suggestedAltText?: string;
  suggestedTitle?: string;
}

/**
 * Derives a human-friendly alt text or title from a file name.
 */
export function generateSmartAltFromFilename(rawFilename: string): string {
  if (!rawFilename) return '';
  // Strip extension
  let base = rawFilename.replace(/\.[a-zA-Z0-9]+$/, '');
  // Remove common camera/timestamp prefixes e.g. IMG_2026_, DSC_001_, Screenshot_
  base = base.replace(/^(IMG|DSC|Screenshot|photo|image|pic)[-_]?\d*[-_]?/i, '');
  base = base.replace(/^\d{4,8}[-_]?/i, '');
  // Replace hyphens and underscores with spaces
  base = base.replace(/[-_]+/g, ' ').trim();
  // Capitalize first letter
  if (base.length === 0) return 'Descriptive image';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Computes live SEO checklist and score for any image asset.
 */
export function evaluateImageSeo(input: ImageSeoInput): ImageSeoResult {
  const checks: ImageSeoCheck[] = [];
  let score = 0;

  const alt = (input.altText || '').trim();
  const title = (input.title || '').trim();
  const keyword = (input.focusKeyword || '').trim().toLowerCase();
  const filename = input.filename || input.originalName || '';
  const sizeKb = Math.round(input.size / 1024);

  // 1. Alt Text Presence (30 pts)
  if (alt.length >= 5) {
    checks.push({
      id: 'alt_presence',
      title: 'Alternative Text (Alt Text)',
      status: 'passed',
      scoreImpact: 30,
      message: 'Alt text is provided, ensuring screen reader accessibility and Google Image indexing.',
    });
    score += 30;
  } else if (alt.length > 0) {
    checks.push({
      id: 'alt_presence',
      title: 'Alternative Text (Alt Text)',
      status: 'warning',
      scoreImpact: 15,
      message: 'Alt text is very brief (less than 5 characters).',
      recommendation: 'Provide a clearer description of what the image depicts.',
    });
    score += 15;
  } else {
    checks.push({
      id: 'alt_presence',
      title: 'Alternative Text (Alt Text)',
      status: 'failed',
      scoreImpact: 0,
      message: 'Missing alternative text. Google Images and screen readers cannot understand this image.',
      recommendation: 'Add a concise description explaining what appears in this image.',
    });
  }

  // 2. Alt Text Length (15 pts)
  if (alt.length >= 10 && alt.length <= 125) {
    checks.push({
      id: 'alt_length',
      title: 'Alt Text Length',
      status: 'passed',
      scoreImpact: 15,
      message: `Optimal length (${alt.length} characters). Within the recommended 10–125 character range.`,
    });
    score += 15;
  } else if (alt.length > 125) {
    checks.push({
      id: 'alt_length',
      title: 'Alt Text Length',
      status: 'warning',
      scoreImpact: 10,
      message: `Alt text is quite long (${alt.length} characters). Screen readers may truncate overly long alt descriptions.`,
      recommendation: 'Keep alt text under 125 characters; move extended context into Caption or Description.',
    });
    score += 10;
  } else if (alt.length > 0) {
    checks.push({
      id: 'alt_length',
      title: 'Alt Text Length',
      status: 'warning',
      scoreImpact: 8,
      message: `Alt text is somewhat short (${alt.length} characters).`,
      recommendation: 'Aim for at least 10–15 characters to give search engines enough context.',
    });
    score += 8;
  }

  // 3. Focus Keyword Matching (15 pts)
  if (keyword.length > 0) {
    const inAlt = alt.toLowerCase().includes(keyword);
    const inTitle = title.toLowerCase().includes(keyword);

    if (inAlt) {
      checks.push({
        id: 'keyword_match',
        title: 'Focus Keyword in Alt Text',
        status: 'passed',
        scoreImpact: 15,
        message: `Focus keyword "${keyword}" is present in the Alt Text.`,
      });
      score += 15;
    } else if (inTitle) {
      checks.push({
        id: 'keyword_match',
        title: 'Focus Keyword in Title',
        status: 'warning',
        scoreImpact: 10,
        message: `Focus keyword "${keyword}" is found in Title but not in Alt Text.`,
        recommendation: `Incorporate "${keyword}" naturally into the alternative text description.`,
      });
      score += 10;
    } else {
      checks.push({
        id: 'keyword_match',
        title: 'Focus Keyword Missing',
        status: 'failed',
        scoreImpact: 0,
        message: `Focus keyword "${keyword}" was not found in Alt Text or Title.`,
        recommendation: `Include "${keyword}" in your Alt Text for targeted image SEO ranking.`,
      });
    }
  } else {
    // If no keyword specified, give partial baseline
    score += 10;
  }

  // 4. Modern Format (WebP / AVIF) (15 pts)
  const isModernFormat =
    input.mimeType === 'image/webp' ||
    input.mimeType === 'image/avif' ||
    filename.endsWith('.webp') ||
    filename.endsWith('.avif');

  if (isModernFormat) {
    checks.push({
      id: 'modern_format',
      title: 'Next-Gen Format (WebP/AVIF)',
      status: 'passed',
      scoreImpact: 15,
      message: 'Image is in next-gen WebP format, fulfilling Google Core Web Vitals recommendations.',
    });
    score += 15;
  } else {
    checks.push({
      id: 'modern_format',
      title: 'Next-Gen Format (WebP/AVIF)',
      status: 'warning',
      scoreImpact: 5,
      message: `Image is in legacy format (${input.mimeType || 'unknown'}). WebP is 30% lighter.`,
      recommendation: 'Use the built-in WebP conversion pipeline for faster Largest Contentful Paint (LCP).',
    });
    score += 5;
  }

  // 5. File Size & Page Speed (15 pts)
  if (sizeKb <= 250) {
    checks.push({
      id: 'file_size',
      title: 'File Size Optimization',
      status: 'passed',
      scoreImpact: 15,
      message: `Optimized file size (${sizeKb} KB). Fast loading on all mobile networks.`,
    });
    score += 15;
  } else if (sizeKb <= 600) {
    checks.push({
      id: 'file_size',
      title: 'File Size Optimization',
      status: 'warning',
      scoreImpact: 8,
      message: `Moderate file size (${sizeKb} KB). May slow down mobile LCP.`,
      recommendation: 'Target under 250 KB for editorial photos by using preset WebP variants.',
    });
    score += 8;
  } else {
    checks.push({
      id: 'file_size',
      title: 'File Size Optimization',
      status: 'failed',
      scoreImpact: 0,
      message: `Heavy file size (${sizeKb} KB / ${(sizeKb / 1024).toFixed(1)} MB). Degrades Core Web Vitals.`,
      recommendation: 'Compress or generate optimized WebP variants to keep file size under 300 KB.',
    });
  }

  // 6. Filename Descriptiveness (10 pts)
  const isGeneric = /^(img|dsc|screenshot|photo|image|picture|untitled|asset|\d+)[-_]?\d*$/i.test(
    filename.replace(/\.[a-zA-Z0-9]+$/, '')
  );

  if (!isGeneric && filename.length >= 5) {
    checks.push({
      id: 'filename_seo',
      title: 'SEO Friendly Filename',
      status: 'passed',
      scoreImpact: 10,
      message: `Descriptive filename ("${filename}"). Search engines use filename slugs as early ranking signals.`,
    });
    score += 10;
  } else {
    checks.push({
      id: 'filename_seo',
      title: 'SEO Friendly Filename',
      status: 'warning',
      scoreImpact: 4,
      message: `Generic or auto-generated filename ("${filename}").`,
      recommendation: 'Use descriptive, hyphenated words (e.g. "delhi-school-campus-library.webp").',
    });
    score += 4;
  }

  const finalScore = Math.min(100, Math.max(0, score));

  let grade: 'Good' | 'Needs Improvement' | 'Poor' = 'Good';
  let gradeColor: 'emerald' | 'amber' | 'rose' = 'emerald';

  if (finalScore < 50) {
    grade = 'Poor';
    gradeColor = 'rose';
  } else if (finalScore < 80) {
    grade = 'Needs Improvement';
    gradeColor = 'amber';
  }

  return {
    score: finalScore,
    grade,
    gradeColor,
    checks,
    suggestedAltText: alt ? undefined : generateSmartAltFromFilename(filename),
    suggestedTitle: title ? undefined : generateSmartAltFromFilename(filename),
  };
}
