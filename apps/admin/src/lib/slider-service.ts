import { prisma } from '@headless/database';

export interface SlideCta {
  label: string;
  url: string;
  target?: '_self' | '_blank';
  variant?: 'solid' | 'glow' | 'outline' | 'white';
}

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'glow' | 'outline' | 'amber' | 'emerald' | 'blue' | 'purple';
  imageUrl: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  mediaType: 'image' | 'video' | 'gradient';
  primaryCta?: SlideCta;
  secondaryCta?: SlideCta;
  contentAlignment: 'left' | 'center' | 'right';
  verticalAlignment: 'center' | 'top' | 'bottom';
  overlayOpacity: number; // 0 to 100
  overlayGradient?: string;
  textColor: string;
  accentColor: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  customCssClass?: string;
  customData?: Record<string, any>;
}

export interface Slider {
  id: string;
  name: string;
  slug: string;
  description?: string;
  placement: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  aspectRatio: '16:9' | '21:9' | '4:3' | 'fullscreen' | 'auto';
  heightDesktop: string; // e.g. "650px", "85vh", "100vh"
  heightMobile: string;  // e.g. "480px", "65vh"
  autoplay: boolean;
  autoplayInterval: number; // milliseconds, e.g. 5000
  pauseOnHover: boolean;
  transitionEffect: 'slide' | 'fade' | 'zoom' | 'parallax';
  transitionSpeed: number; // ms, e.g. 600
  showArrows: boolean;
  showDots: boolean;
  showThumbnails: boolean;
  showProgressBar: boolean;
  loop: boolean;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback dataset for offline resilience and immediate use
let MOCK_SLIDERS: Slider[] = [
  {
    id: 'slider_homepage_hero',
    name: 'Markup CMS — Flagship Hero Showcase',
    slug: 'homepage-hero',
    description: 'Primary showcase slider for digital marketing, platform features, and flagship announcements.',
    placement: 'home_header_hero',
    status: 'PUBLISHED',
    aspectRatio: '21:9',
    heightDesktop: '680px',
    heightMobile: '520px',
    autoplay: true,
    autoplayInterval: 5500,
    pauseOnHover: false,
    transitionEffect: 'slide',
    transitionSpeed: 600,
    showArrows: true,
    showDots: true,
    showThumbnails: false,
    showProgressBar: true,
    loop: true,
    createdAt: '2026-09-20T08:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
    slides: [
      {
        id: 'slide_1',
        title: 'Building Modern Digital Experiences',
        subtitle: 'WELCOME TO MARKUP CMS',
        description: 'Deliver omnichannel content velocity with headless architecture, real-time collaboration, and global edge publishing.',
        badgeText: 'Next-Gen Platform',
        badgeVariant: 'amber',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=80',
        mobileImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        primaryCta: {
          label: 'Explore Platform',
          url: '/admin',
          target: '_self',
          variant: 'glow',
        },
        secondaryCta: {
          label: 'API Documentation',
          url: '/api-docs',
          target: '_self',
          variant: 'outline',
        },
        contentAlignment: 'left',
        verticalAlignment: 'center',
        overlayOpacity: 65,
        textColor: '#ffffff',
        accentColor: '#e2a02b',
        order: 1,
        isActive: true,
        customCssClass: 'hero-slide-cms-core',
        customData: {
          scriptText: 'Agile & Scalable',
          tabLabel: 'Architecture',
          highlightStat: '99.99% Uptime',
        },
      },
      {
        id: 'slide_2',
        title: 'Schema-Driven Content Engine & Instant APIs',
        subtitle: 'UNIVERSAL GRAPHQL & REST DELIVERY',
        description: 'Empower developers and editors with structured content modeling, automated media processing, and instant delivery.',
        badgeText: 'GraphQL & REST Ready',
        badgeVariant: 'blue',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
        mobileImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        primaryCta: {
          label: 'Documentation',
          url: '/api-docs',
          target: '_self',
          variant: 'solid',
        },
        secondaryCta: {
          label: 'Admin Console',
          url: '/admin',
          target: '_self',
          variant: 'outline',
        },
        contentAlignment: 'left',
        verticalAlignment: 'center',
        overlayOpacity: 70,
        textColor: '#ffffff',
        accentColor: '#38bdf8',
        order: 2,
        isActive: true,
        customCssClass: 'hero-slide-cms-apis',
        customData: {
          scriptText: 'Developer First',
          tabLabel: 'APIs & Integration',
          highlightStat: '< 50ms Edge Latency',
        },
      },
    ],
  },
  {
    id: 'slider_showcase_promo',
    name: 'Seasonal Promotions & Product Showcase',
    slug: 'promo-showcase',
    description: 'Rotating banner for limited-time offers, events, and featured client campaigns.',
    placement: 'campaign_banner',
    status: 'PUBLISHED',
    aspectRatio: '16:9',
    heightDesktop: '540px',
    heightMobile: '440px',
    autoplay: true,
    autoplayInterval: 4800,
    pauseOnHover: false,
    transitionEffect: 'fade',
    transitionSpeed: 500,
    showArrows: true,
    showDots: true,
    showThumbnails: false,
    showProgressBar: false,
    loop: true,
    createdAt: '2026-09-25T10:00:00Z',
    updatedAt: '2026-09-30T16:30:00Z',
    slides: [
      {
        id: 'slide_promo_1',
        title: 'Spring Innovation Summit 2026',
        subtitle: 'Keynote & Hands-On Workshops',
        description: 'Join thousands of technical leaders discussing headless web architecture, AI-driven content pipelines, and edge compute.',
        badgeText: 'Registration Open',
        badgeVariant: 'purple',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80',
        mediaType: 'image',
        primaryCta: {
          label: 'Reserve Free Ticket',
          url: '/events/summit-2026',
          target: '_self',
          variant: 'solid',
        },
        contentAlignment: 'left',
        verticalAlignment: 'center',
        overlayOpacity: 60,
        overlayGradient: 'linear-gradient(135deg, rgba(88, 28, 135, 0.85) 0%, rgba(15, 23, 42, 0.75) 100%)',
        textColor: '#ffffff',
        accentColor: '#a855f7',
        order: 1,
        isActive: true,
      },
      {
        id: 'slide_promo_2',
        title: 'Bespoke Client Portals with Custom UX',
        subtitle: 'Crafted to Exact Specifications',
        description: 'Tailor every transition, color scheme, typography style, and button micro-interaction to match your brand identity.',
        badgeText: 'Design Freedom',
        badgeVariant: 'emerald',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80',
        mediaType: 'image',
        primaryCta: {
          label: 'See Case Studies',
          url: '/work',
          target: '_self',
          variant: 'outline',
        },
        contentAlignment: 'right',
        verticalAlignment: 'center',
        overlayOpacity: 65,
        overlayGradient: 'linear-gradient(to left, rgba(6, 78, 59, 0.85) 0%, rgba(15, 23, 42, 0.7) 100%)',
        textColor: '#ffffff',
        accentColor: '#10b981',
        order: 2,
        isActive: true,
      },
    ],
  },
];

const SETTING_KEY = 'content_hero_sliders_v1';

async function resolveSiteId(): Promise<string | null> {
  try {
    const site = await prisma.site.findFirst({
      select: { id: true },
    });
    return site?.id || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves all registered sliders.
 */
export async function getSliders(): Promise<Slider[]> {
  try {
    const siteId = await resolveSiteId();
    if (siteId) {
      const setting = await prisma.setting.findUnique({
        where: {
          siteId_key: {
            siteId,
            key: SETTING_KEY,
          },
        },
      });

      if (setting && Array.isArray(setting.value)) {
        return (setting.value as unknown) as Slider[];
      }
    }
  } catch {
    // Database unreachable fallback
  }

  return MOCK_SLIDERS;
}

/**
 * Retrieves a single slider by unique slug.
 */
export async function getSliderBySlug(slug: string): Promise<Slider | null> {
  const sliders = await getSliders();
  const slider = sliders.find((s) => s.slug === slug || s.id === slug);
  return slider || null;
}

/**
 * Public client-facing delivery function:
 * Filters only published sliders and active slides within valid date ranges.
 */
export async function getPublicSlider(slug: string): Promise<{
  slider: Omit<Slider, 'slides'>;
  slides: Slide[];
} | null> {
  const slider = await getSliderBySlug(slug);
  if (!slider || slider.status !== 'PUBLISHED') {
    return null;
  }

  const now = new Date().toISOString();

  // Filter active slides and valid date schedules
  const activeSlides = slider.slides
    .filter((slide) => {
      if (!slide.isActive) return false;
      if (slide.startDate && slide.startDate > now) return false;
      if (slide.endDate && slide.endDate < now) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const { slides, ...sliderMeta } = slider;

  return {
    slider: sliderMeta,
    slides: activeSlides,
  };
}

/**
 * Saves (creates or updates) a slider.
 */
export async function saveSlider(input: Partial<Slider> & { name: string; slug: string }): Promise<Slider> {
  const sliders = await getSliders();
  const existingIndex = sliders.findIndex((s) => s.slug === input.slug || (input.id && s.id === input.id));

  const now = new Date().toISOString();

  let targetSlider: Slider;

  if (existingIndex >= 0) {
    targetSlider = {
      ...sliders[existingIndex],
      ...input,
      updatedAt: now,
    };
    sliders[existingIndex] = targetSlider;
  } else {
    targetSlider = {
      id: input.id || `slider_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: input.name,
      slug: input.slug,
      description: input.description || '',
      placement: input.placement || 'home_header_hero',
      status: input.status || 'PUBLISHED',
      aspectRatio: input.aspectRatio || '21:9',
      heightDesktop: input.heightDesktop || '650px',
      heightMobile: input.heightMobile || '500px',
      autoplay: input.autoplay ?? true,
      autoplayInterval: input.autoplayInterval || 5000,
      pauseOnHover: input.pauseOnHover ?? false,
      transitionEffect: input.transitionEffect || 'slide',
      transitionSpeed: input.transitionSpeed || 600,
      showArrows: input.showArrows ?? true,
      showDots: input.showDots ?? true,
      showThumbnails: input.showThumbnails ?? false,
      showProgressBar: input.showProgressBar ?? true,
      loop: input.loop ?? true,
      slides: input.slides || [],
      createdAt: now,
      updatedAt: now,
    };
    sliders.push(targetSlider);
  }

  // Update in-memory fallback
  MOCK_SLIDERS = [...sliders];

  // Persist to database if available
  try {
    const siteId = await resolveSiteId();
    if (siteId) {
      await prisma.setting.upsert({
        where: {
          siteId_key: {
            siteId,
            key: SETTING_KEY,
          },
        },
        create: {
          siteId,
          key: SETTING_KEY,
          category: 'GENERAL',
          isPublic: true,
          value: sliders as any,
        },
        update: {
          value: sliders as any,
        },
      });
    }
  } catch {
    // In-memory fallback retained
  }

  return targetSlider;
}

/**
 * Deletes a slider by slug or ID.
 */
export async function deleteSlider(slugOrId: string): Promise<boolean> {
  const sliders = await getSliders();
  const filtered = sliders.filter((s) => s.slug !== slugOrId && s.id !== slugOrId);

  if (filtered.length === sliders.length) {
    return false;
  }

  MOCK_SLIDERS = [...filtered];

  try {
    const siteId = await resolveSiteId();
    if (siteId) {
      await prisma.setting.upsert({
        where: {
          siteId_key: {
            siteId,
            key: SETTING_KEY,
          },
        },
        create: {
          siteId,
          key: SETTING_KEY,
          category: 'GENERAL',
          isPublic: true,
          value: filtered as any,
        },
        update: {
          value: filtered as any,
        },
      });
    }
  } catch {
    // Fallback retained
  }

  return true;
}

/**
 * Duplicates an existing slider as a clone.
 */
export async function duplicateSlider(sourceSlug: string, newName?: string, newSlug?: string): Promise<Slider | null> {
  const source = await getSliderBySlug(sourceSlug);
  if (!source) return null;

  const cloneSlug = newSlug || `${source.slug}-copy-${Date.now().toString().slice(-4)}`;
  const cloneName = newName || `${source.name} (Copy)`;

  const clonedSlides: Slide[] = source.slides.map((s, idx) => ({
    ...s,
    id: `slide_clone_${Date.now()}_${idx}`,
    order: idx + 1,
  }));

  const created = await saveSlider({
    ...source,
    id: `slider_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cloneName,
    slug: cloneSlug,
    slides: clonedSlides,
  });

  return created;
}
