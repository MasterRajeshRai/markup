import { SettingCategory } from '@headless/database';

export interface SiteBranding {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface SiteSettingsData {
  site_title: string;
  site_tagline: string;
  site_logo?: string;
  site_favicon?: string;
  meta_description: string;
  analytics_id: string;
  robots: string;
  email_notifications: boolean;
  publish_alerts: boolean;
  notification_email: string;
  webhook_url: string;
  two_factor_required: boolean;
  session_timeout: string;
  allowed_ips: string;
}

interface InMemoSiteState {
  id: string;
  name: string;
  slug: string;
  domain: string;
  defaultLocale: string;
  isDefault: boolean;
  branding: SiteBranding;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Global in-memory singleton to persist settings across dev requests
const globalSiteStore: InMemoSiteState = {
  id: 'site_default_01',
  name: 'Prince Public School',
  slug: 'prince-public-school',
  domain: 'http://localhost:3000',
  defaultLocale: 'en-US',
  isDefault: true,
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
    meta_description: 'Prince Public School is a premier CBSE affiliated Senior Secondary institution delivering holistic, future-ready education since 1995.',
    analytics_id: 'G-PPS2026',
    robots: 'index, follow',
    email_notifications: true,
    publish_alerts: true,
    notification_email: 'admissions@princepublicschool.edu.in',
    webhook_url: 'http://localhost:3000/api/v1/webhooks/mock-consumer',
    two_factor_required: false,
    session_timeout: '60',
    allowed_ips: '',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

export function getMockSiteState(): InMemoSiteState {
  return globalSiteStore;
}

export function updateMockSiteState(updates: {
  name?: string;
  domain?: string;
  branding?: Partial<SiteBranding>;
  settings?: Record<string, unknown>;
}): InMemoSiteState {
  if (updates.name !== undefined) globalSiteStore.name = updates.name;
  if (updates.domain !== undefined) globalSiteStore.domain = updates.domain;
  if (updates.branding) {
    globalSiteStore.branding = {
      ...globalSiteStore.branding,
      ...updates.branding,
    };
    // Sync top-level settings mirror
    if (updates.branding.logoUrl !== undefined) {
      globalSiteStore.settings.site_logo = updates.branding.logoUrl;
    }
    if (updates.branding.faviconUrl !== undefined) {
      globalSiteStore.settings.site_favicon = updates.branding.faviconUrl;
    }
  }
  if (updates.settings) {
    globalSiteStore.settings = {
      ...globalSiteStore.settings,
      ...updates.settings,
    };
    // Sync branding mirror
    if (typeof updates.settings.site_logo === 'string') {
      globalSiteStore.branding.logoUrl = updates.settings.site_logo;
    }
    if (typeof updates.settings.site_favicon === 'string') {
      globalSiteStore.branding.faviconUrl = updates.settings.site_favicon;
    }
  }
  globalSiteStore.updatedAt = new Date().toISOString();
  return globalSiteStore;
}
