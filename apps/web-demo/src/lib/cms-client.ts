const CMS_BASE_URL = process.env.CMS_BASE_URL || 'http://localhost:3000/api/v1';
const CMS_API_KEY = process.env.CMS_API_KEY || 'cms_live_caadf19cfe32247af2e4bf793e445c135990f319b9398a99';

export async function fetchCmsApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${CMS_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set('X-API-Key', CMS_API_KEY);
  headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store', // Always fetch fresh in demo
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CMS API Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

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
  overlayOpacity: number;
  textColor: string;
  accentColor: string;
  order: number;
  isActive: boolean;
  customData?: Record<string, any>;
}

export interface SliderData {
  id: string;
  name: string;
  slug: string;
  aspectRatio: string;
  heightDesktop: string;
  heightMobile: string;
  autoplay: boolean;
  autoplayInterval: number;
  pauseOnHover: boolean;
  transitionEffect: string;
  transitionSpeed: number;
  showArrows: boolean;
  showDots: boolean;
  showProgressBar: boolean;
  loop: boolean;
  slides: Slide[];
}

export const FALLBACK_SLIDER: { slider: Omit<SliderData, 'slides'>; slides: Slide[] } = {
  slider: {
    id: 'slider_homepage_hero',
    name: 'Prince Public School — Flagship Hero Slider',
    slug: 'homepage-hero',
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
    showProgressBar: true,
    loop: true,
  },
  slides: [
    {
      id: 'slide_1',
      title: 'Building Bright Futures Together',
      subtitle: 'WELCOME TO PRINCE PUBLIC SCHOOL',
      description: 'Nurturing curious minds, building strong character, and empowering every student to excel academically, socially, and emotionally in a world of limitless possibilities.',
      badgeText: 'Admissions Open 2026-27',
      badgeVariant: 'amber',
      imageUrl: '/images/hero/slide-1-ethos.jpg',
      mobileImageUrl: '/images/hero/slide-1-ethos.jpg',
      mediaType: 'image',
      primaryCta: {
        label: 'Explore Our School',
        url: '/about',
        target: '_self',
        variant: 'glow',
      },
      secondaryCta: {
        label: 'Watch Our Video',
        url: '#video-tour',
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
      customData: {
        scriptText: 'Small Steps Big Dreams',
        tabLabel: 'School Ethos',
        highlightStat: '30+ Years of Excellence',
      },
    },
    {
      id: 'slide_2',
      title: 'Inspiring Discovery, Fostering Innovation',
      subtitle: 'STATE-OF-THE-ART LABORATORIES & STEM',
      description: 'Equipped with composite Physics, Chemistry, Biology labs, Atal Tinkering workshops, and interactive digital smart classrooms where curiosity transforms into real knowledge.',
      badgeText: 'NEP 2020 Experiential Learning',
      badgeVariant: 'blue',
      imageUrl: '/images/hero/slide-2-stem.jpg',
      mobileImageUrl: '/images/hero/slide-2-stem.jpg',
      mediaType: 'image',
      primaryCta: {
        label: 'Explore Our Labs',
        url: '/facilities#learning-spaces',
        target: '_self',
        variant: 'solid',
      },
      secondaryCta: {
        label: 'Academic Programs',
        url: '/academics',
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
      customData: {
        scriptText: 'Curiosity Inspires Excellence',
        tabLabel: 'STEM & Labs',
        highlightStat: '6 Advanced Labs',
      },
    },
    {
      id: 'slide_3',
      title: '"A Healthy Mind Dwells in a Healthy Body"',
      subtitle: 'COMPREHENSIVE SPORTS & ATHLETICS',
      description: 'Teaching sportsmanship and leadership to ensure the winner never loses his sense of achievement and the loser never loses his spirit. Age-appropriate grounds, football, cricket & basketball.',
      badgeText: 'Compulsory Physical Education',
      badgeVariant: 'emerald',
      imageUrl: '/images/hero/slide-3-sports.jpg',
      mobileImageUrl: '/images/hero/slide-3-sports.jpg',
      mediaType: 'image',
      primaryCta: {
        label: 'Sports Infrastructure',
        url: '/facilities#sports-infrastructure',
        target: '_self',
        variant: 'glow',
      },
      secondaryCta: {
        label: 'Co-Curriculars',
        url: '/beyond-academics',
        target: '_self',
        variant: 'outline',
      },
      contentAlignment: 'left',
      verticalAlignment: 'center',
      overlayOpacity: 65,
      textColor: '#ffffff',
      accentColor: '#10b981',
      order: 3,
      isActive: true,
      customData: {
        scriptText: 'Champions in the Field of Life',
        tabLabel: 'Sports & Athletics',
        highlightStat: '15+ Acres Sports Arena',
      },
    },
    {
      id: 'slide_4',
      title: 'Day Scholar + Boarding: A Home Away From Home',
      subtitle: 'Modern Dormitories & Multi-Cuisine Cafeteria',
      description: 'Modern 2, 3 & 4-seater dormitories with attached toilets, 24-hr hot water, separate independent girls wing, supervised evening prep, and hygienic multi-cuisine cafeteria.',
      badgeText: 'Home Away From Home',
      badgeVariant: 'amber',
      imageUrl: '/images/hero/slide-4-boarding.jpg',
      mobileImageUrl: '/images/hero/slide-4-boarding.jpg',
      mediaType: 'image',
      primaryCta: {
        label: 'Hostel & Boarding Tour',
        url: '/facilities#hostel-boarding',
        target: '_self',
        variant: 'solid',
      },
      secondaryCta: {
        label: 'Admission Guidelines',
        url: '/admissions',
        target: '_self',
        variant: 'outline',
      },
      contentAlignment: 'left',
      verticalAlignment: 'center',
      overlayOpacity: 68,
      textColor: '#ffffff',
      accentColor: '#f59e0b',
      order: 4,
      isActive: true,
      customData: {
        scriptText: 'Care, Comfort & Character',
        tabLabel: 'Boarding Life',
        highlightStat: '24/7 Security & Wardens',
      },
    },
    {
      id: 'slide_5',
      title: '100% C.B.S.E. Class X Board Results',
      subtitle: 'Only School in Mehrauli Area with 100% Pass Record',
      description: 'Exceptional board distinctions in Mathematics, Integrated Science, Social Studies, French and Sanskrit with personalized faculty mentorship.',
      badgeText: 'CBSE Affiliated Secondary (Class X)',
      badgeVariant: 'purple',
      imageUrl: '/images/hero/slide-5-scholars.jpg',
      mobileImageUrl: '/images/hero/slide-5-scholars.jpg',
      mediaType: 'image',
      primaryCta: {
        label: 'Admission Guidelines',
        url: '/admissions',
        target: '_self',
        variant: 'solid',
      },
      secondaryCta: {
        label: 'Contact School Office',
        url: '/contact',
        target: '_self',
        variant: 'outline',
      },
      contentAlignment: 'left',
      verticalAlignment: 'center',
      overlayOpacity: 72,
      textColor: '#ffffff',
      accentColor: '#c084fc',
      order: 5,
      isActive: true,
      customData: {
        scriptText: 'Excellence in Action',
        tabLabel: '100% Class X Results',
        highlightStat: '100% Board Pass Rate',
      },
    },
  ],
};

export const FALLBACK_HOME = {
  id: 'home_page_entry',
  slug: 'home',
  title: 'Prince Public School — Knowledge, Character & Excellence',
  seo: {
    description: 'Prince Public School is a premier CBSE affiliated Secondary institution (Pre-School to Class X) in Mehrauli, New Delhi delivering holistic education since 1995.',
  },
  blocks: [
    {
      id: 'blk_hero_1',
      type: 'hero',
      data: {
        badge: 'Admissions Open 2026-27 • CBSE Affiliation No. 2130842',
        title: 'Nurturing Minds, Inspiring Excellence, Building Character',
        subtitle: 'At Prince Public School, we blend rigorous CBSE academics with experiential STEM innovation, state-of-the-art sports, and enduring moral values.',
        primaryCta: { label: 'Apply for Admission', url: '/admissions' },
        secondaryCta: { label: 'Explore Campus', url: '/facilities' },
      },
    },
    {
      id: 'blk_cards_1',
      type: 'cards',
      data: {
        columns: 3,
        items: [
          {
            title: 'Scholastic Brilliance',
            description: 'CBSE curriculum from Nursery to Grade XII across Science, Commerce, and Humanities with 100% first-division board results.',
            icon: 'GraduationCap',
          },
          {
            title: 'STEM & Robotics Hub',
            description: 'Hands-on Atal Tinkering Lab, AI coding clubs, and advanced composite science laboratories cultivating creative problem-solvers.',
            icon: 'Cpu',
          },
          {
            title: 'Sports & Athletic Arena',
            description: '15+ athletic disciplines, 400m synthetic running track, skating rink, indoor badminton, and accredited football academy.',
            icon: 'Trophy',
          },
        ],
      },
    },
    {
      id: 'blk_quote_1',
      type: 'quote',
      data: {
        quote: 'Education at Prince Public School is a journey of self-discovery where knowledge is sprouted and in due course takes the shape of a very big tree.',
        author: 'Shailendra Upadhyay',
        role: 'Principal, Prince Public School',
      },
    },
    {
      id: 'blk_accordion_1',
      type: 'accordion',
      data: {
        items: [
          {
            title: 'What is the admission procedure for the session 2026-27?',
            content: 'Admissions open for Pre-School (3+), Pre-Primary (4+), Class I (5+ on 30th March) through Class IX. Parents can submit an online registration inquiry or visit the Mehrauli admissions office with required transfer certificates.',
          },
          {
            title: 'Which board is Prince Public School affiliated with?',
            content: 'Prince Public School is affiliated with the Central Board of Secondary Education (CBSE), New Delhi, up to Secondary Level (Class X) under Affiliation No. 2130842.',
          },
          {
            title: 'What is the academic structure and curriculum?',
            content: 'The school session extends from April to March in two terms following the CBSE curriculum across four sections: Pre-School & Pre-Primary, Classes I to III, Classes IV & V, and Classes VI to X with French, Sanskrit, and computer education.',
          },
          {
            title: 'Is GPS-enabled school transport available?',
            content: 'Yes, the school operates a comprehensive fleet of air-conditioned, GPS-tracked buses with CCTV cameras, first-aid equipment, and trained female attendants covering all major city routes.',
          },
        ],
      },
    },
    {
      id: 'blk_cta_1',
      type: 'cta',
      data: {
        title: 'Join the Prince Public School Family',
        description: 'Give your child the foundation of excellence, values, and 21st-century leadership. Registration is now open.',
        buttonText: 'Register for Admission 2026-27',
        buttonUrl: '/admissions',
      },
    },
  ],
};

export const FALLBACK_ARTICLES = [
  {
    id: 'art-1',
    slug: 'admissions-open-academic-session-2026-27',
    title: 'Admissions Open for Academic Session 2026-27: Pre-School to Class IX',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    data: {
      summary: 'Prince Public School invites applications for registration for the upcoming academic year 2026-27. Explore eligibility criteria, fee guidelines, and campus visit schedules.',
      byline: 'Admissions Directorate',
      read_time: 4,
    },
    taxonomies: [
      { id: 't1', name: 'Admissions', slug: 'admissions' },
      { id: 't2', name: 'Circulars', slug: 'circulars' },
    ],
    blocks: [
      {
        id: 'b1',
        type: 'hero',
        data: {
          badge: 'Official Notification',
          title: 'Admissions Open for 2026-27',
          subtitle: 'Step into a world of boundless learning, experiential labs, and Olympic-grade sports.',
        },
      },
      {
        id: 'b2',
        type: 'paragraph',
        data: {
          text: 'We are pleased to announce the commencement of admissions for Pre-School (Nursery), Pre-Primary (KG), and Classes I through IX for the Academic Session 2026-27. Application forms are available online on the school portal and offline at the Administrative Office (2/108, Mehrauli, 1.0 km from Qutub Minar) between 8:00 AM and 2:00 PM on all working days.',
        },
      },
    ],
  },
  {
    id: 'art-2',
    slug: 'prince-public-school-shines-at-national-stem-olympiad-2026',
    title: 'Prince Public School Students Clinch Gold at National STEM & Robotics Olympiad',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    data: {
      summary: 'Our innovation team designed an autonomous agricultural monitoring drone, winning First Prize among participating schools.',
      byline: 'Science & Innovation Cell',
      read_time: 3,
    },
    taxonomies: [
      { id: 't3', name: 'Achievements', slug: 'achievements' },
      { id: 't4', name: 'STEM', slug: 'stem' },
    ],
    blocks: [
      {
        id: 'b21',
        type: 'paragraph',
        data: {
          text: 'In a proud moment for Prince Public School, our Class X STEM cohort bagged the Gold Trophy at the National Youth Robotics Conclave 2026. Mentored by our computer science and science faculty, the team constructed a cost-effective, AI-driven drone for precision soil hydration monitoring.',
        },
      },
    ],
  },
  {
    id: 'art-3',
    slug: 'annual-sports-carnival-2026-celebrates-athletic-excellence',
    title: 'Annual Sports Carnival 2026 "SPARDHA" Concludes with Grand Fanfare',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    data: {
      summary: 'Over 1,200 students participated in 22 track and field events. Ashoka House lifted the coveted Overall Champions Rolling Trophy.',
      byline: 'Physical Education Department',
      read_time: 5,
    },
    taxonomies: [
      { id: 't5', name: 'Sports', slug: 'sports' },
      { id: 't6', name: 'Campus Life', slug: 'campus-life' },
    ],
    blocks: [
      {
        id: 'b31',
        type: 'paragraph',
        data: {
          text: 'The 30th Annual Sports Carnival witnessed vibrant march pasts, high-energy sprint finals, martial arts demonstrations, and gymnastic displays before a cheering audience of over 2,000 parents and guests.',
        },
      },
    ],
  },
  {
    id: 'art-legacy-1',
    slug: 'building-enterprise-headless-cms-with-nextjs',
    title: 'Architecting Enterprise Headless Infrastructure for High Performance',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    data: {
      summary: 'Explore how decoupled content architecture eliminates hotspots and delivers sub-second load times.',
      byline: 'Technical Directorate',
      read_time: 5,
    },
    taxonomies: [
      { id: 't9', name: 'Architecture', slug: 'architecture' },
    ],
    blocks: [
      {
        id: 'b-leg-1',
        type: 'paragraph',
        data: {
          text: 'Modern decoupled architectures provide resilience, security, and exceptional performance for enterprise websites.',
        },
      },
    ],
  },
];

export const cmsClient = {
  async getEntries(type?: string, q?: string) {
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (q) params.set('q', q);
      const res = await fetchCmsApi<{ data: any[]; meta: any }>(`/content?${params.toString()}`);
      if (res.data && res.data.length > 0) return res;
      return { data: FALLBACK_ARTICLES, meta: { total: FALLBACK_ARTICLES.length } };
    } catch {
      return { data: FALLBACK_ARTICLES, meta: { total: FALLBACK_ARTICLES.length } };
    }
  },

  async getEntry(idOrSlug: string, previewToken?: string) {
    try {
      const params = new URLSearchParams();
      if (previewToken) params.set('previewToken', previewToken);
      const res = await fetchCmsApi<{ data: any }>(`/content/${idOrSlug}?${params.toString()}`);
      if (res.data) return res;
      throw new Error('Not found');
    } catch {
      if (idOrSlug === 'home') return { data: FALLBACK_HOME };
      const found = FALLBACK_ARTICLES.find((a) => a.slug === idOrSlug || a.id === idOrSlug);
      if (found) return { data: found };
      throw new Error('Entry not found');
    }
  },

  async getSlider(slug = 'homepage-hero') {
    try {
      const res = await fetchCmsApi<{
        success: boolean;
        slider: Omit<SliderData, 'slides'>;
        slides: Slide[];
      }>(`/sliders/public/${slug}`);
      if (res && res.success && res.slides && res.slides.length > 0) {
        return {
          slider: res.slider,
          slides: res.slides,
        };
      }
      return FALLBACK_SLIDER;
    } catch {
      return FALLBACK_SLIDER;
    }
  },

  async getNavigation(slug = 'main-navigation') {
    try {
      const res = await fetchCmsApi<{ data: any }>(`/navigation/${slug}`);
      if (res.data?.items && res.data.items.length > 0) return res;
      return {
        data: {
          items: slug === 'main-navigation' ? [
            { title: 'Home', url: '/' },
            { title: 'About Us', url: '/about' },
            { title: 'Academics', url: '/academics' },
            { title: 'Admissions', url: '/admissions' },
            { title: 'Facilities', url: '/facilities' },
            { title: 'Student Life', url: '/student-life' },
            { title: 'Notices', url: '/notices' },
            { title: 'Gallery', url: '/gallery' },
            { title: 'Contact', url: '/contact' },
          ] : [
            { title: 'CBSE Mandatory Disclosure', url: '/about#cbse-disclosure' },
            { title: 'Fee Structure', url: '/admissions#fees' },
            { title: 'Transfer Certificate (TC)', url: '/admissions#tc' },
            { title: 'Safety & POCSO Policy', url: '/about#safety' },
            { title: 'Privacy Policy', url: '/privacy' },
            { title: 'Terms of Use', url: '/terms' },
          ],
        },
      };
    } catch {
      return {
        data: {
          items: slug === 'main-navigation' ? [
            { title: 'Home', url: '/' },
            { title: 'About Us', url: '/about' },
            { title: 'Academics', url: '/academics' },
            { title: 'Admissions', url: '/admissions' },
            { title: 'Facilities', url: '/facilities' },
            { title: 'Student Life', url: '/student-life' },
            { title: 'Notices', url: '/notices' },
            { title: 'Gallery', url: '/gallery' },
            { title: 'Contact', url: '/contact' },
          ] : [
            { title: 'CBSE Mandatory Disclosure', url: '/about#cbse-disclosure' },
            { title: 'Fee Structure', url: '/admissions#fees' },
            { title: 'Transfer Certificate (TC)', url: '/admissions#tc' },
            { title: 'Safety & POCSO Policy', url: '/about#safety' },
            { title: 'Privacy Policy', url: '/privacy' },
            { title: 'Terms of Use', url: '/terms' },
          ],
        },
      };
    }
  },

  async getSettings() {
    try {
      const res = await fetchCmsApi<{
        site?: { name?: string; domain?: string; branding?: { logoUrl?: string; faviconUrl?: string; primaryColor?: string } };
        branding?: { logoUrl?: string; faviconUrl?: string; primaryColor?: string };
        settings?: Record<string, any>;
      }>('/settings');
      return res;
    } catch {
      return {
        site: {
          name: 'Prince Public School',
          domain: 'https://princepublicschool.edu.in',
          branding: {
            logoUrl: '/images/pps-crest.svg',
            faviconUrl: '/favicon.ico',
            primaryColor: '#1e3a8a',
          },
        },
        branding: {
          logoUrl: '/images/pps-crest.svg',
          faviconUrl: '/favicon.ico',
          primaryColor: '#1e3a8a',
        },
        settings: {
          site_title: 'Prince Public School',
          site_tagline: 'Excellence in Education, Character in Leadership',
          site_logo: '/images/pps-crest.svg',
          site_favicon: '/favicon.ico',
        },
      };
    }
  },

  async getGalleryAlbums(params?: { category?: string; search?: string }): Promise<GalleryAlbum[]> {
    try {
      let query = '';
      const qs = new URLSearchParams();
      if (params?.category && params.category !== 'all') qs.set('category', params.category);
      if (params?.search) qs.set('search', params.search);
      if (qs.toString()) query = `?${qs.toString()}`;

      const res = await fetchCmsApi<{
        success: boolean;
        albums: GalleryAlbum[];
      }>(`/gallery${query}`);

      if (res && res.success && res.albums && res.albums.length > 0) {
        return res.albums;
      }
      return FALLBACK_ALBUMS;
    } catch {
      return FALLBACK_ALBUMS;
    }
  },

  async getGalleryAlbum(slug: string): Promise<GalleryAlbum | null> {
    try {
      const res = await fetchCmsApi<{
        success: boolean;
        album: GalleryAlbum;
      }>(`/gallery?slug=${encodeURIComponent(slug)}`);

      if (res && res.success && res.album) {
        return res.album;
      }
      const fallback = FALLBACK_ALBUMS.find((a) => a.slug === slug);
      return fallback || null;
    } catch {
      const fallback = FALLBACK_ALBUMS.find((a) => a.slug === slug);
      return fallback || null;
    }
  },
};

export interface GalleryPhoto {
  id: string;
  title: string;
  caption?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  width?: number;
  height?: number;
  order: number;
  isCover?: boolean;
  r2Key?: string;
  r2Url?: string;
  syncStatus: 'local' | 'synced' | 'pending';
  dateAdded: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  slug: string;
  category: string;
  subtitle?: string;
  description: string;
  coverImage: string;
  eventDate: string;
  isFeatured?: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  photoCount: number;
  photos: GalleryPhoto[];
  r2Bucket?: string;
  r2Prefix?: string;
  syncStatus: 'local' | 'synced' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export const FALLBACK_ALBUMS: GalleryAlbum[] = [
  {
    id: 'alb_ek_ped_maa_ke_naam',
    name: 'Ek Ped Maa Ke Naam',
    slug: 'ek-ped-maa-ke-naam',
    category: 'Ek Ped Maa Ke Naam',
    subtitle: 'Planting Trees, Honoring Mothers & Fostering Green Stewardship',
    description:
      'Prince Public School students, respected teachers, and administrative leaders assembled on stage in front of the Saraswati auditorium for the nationwide "Ek Ped Maa Ke Naam" campaign. A cherished initiative celebrating maternal love while creating lasting environmental awareness.',
    coverImage: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-1.webp',
    eventDate: '2026-09-15',
    isFeatured: true,
    status: 'PUBLISHED',
    photoCount: 4,
    r2Bucket: 'pps-media-production',
    r2Prefix: 'gallery/ek-ped-maa-ke-naam/',
    syncStatus: 'local',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-10-03T02:00:00Z',
    photos: [
      {
        id: 'photo_epmkn_1',
        title: 'Leadership, Teachers & Young Scholars Assemble on Stage',
        caption:
          'Director Gaurav Sharma, Principal Shailendra Upadhyay, senior faculty, and students gathered in school uniform before the Saraswati mural for "Ek Ped Maa Ke Naam".',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-1.webp',
        altText: 'Prince Public School faculty and students on stage for Ek Ped Maa Ke Naam',
        order: 1,
        isCover: true,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-1.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
      {
        id: 'photo_epmkn_2',
        title: 'Primary & Pre-School Participants with School Mentors',
        caption:
          'Young learners from foundational classes proudly taking part in the environmental reverence drive alongside their class mentors.',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-2.webp',
        altText: 'Students and teachers pledging for green living',
        order: 2,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-2.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
      {
        id: 'photo_epmkn_3',
        title: 'Commitment to Nature and Motherly Dedication',
        caption:
          'Secondary faculty members and student leaders commending the tree plantation saplings dedicated to mothers across India.',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-3.webp',
        altText: 'Secondary wing faculty and students during commemorative tree drive',
        order: 3,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-3.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
      {
        id: 'photo_epmkn_4',
        title: 'School Community United for Environmental Responsibility',
        caption:
          'A complete panoramic gathering celebrating green campus life and value-based education at Prince Public School, Mehrauli.',
        imageUrl: '/images/gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-4.webp',
        altText: 'Complete group photo of Prince Public School community for Ek Ped Maa Ke Naam',
        order: 4,
        r2Key: 'gallery/ek-ped-maa-ke-naam/ek-ped-maa-ke-naam-4.webp',
        syncStatus: 'local',
        dateAdded: '2026-09-15',
      },
    ],
  },
];
