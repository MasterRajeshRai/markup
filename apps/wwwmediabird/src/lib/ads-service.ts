export interface AdUnitItem {
  id: string;
  name: string;
  slotId: string;
  placement: 'header_leaderboard' | 'in_article' | 'sidebar_rectangle' | 'in_feed' | 'mobile_sticky_footer' | 'custom';
  format: 'responsive' | 'fixed_728x90' | 'fixed_300x250' | 'fixed_300x600' | 'fixed_320x50' | 'multiplex';
  deviceTargeting: 'all' | 'desktop_only' | 'mobile_only';
  isActive: boolean;
  priority: number;
  customFallbackHtml?: string;
  impressions30d: number;
  clicks30d: number;
  ctr: number;
  earnings30d: number;
}

export interface AdSenseSettings {
  publisherId: string; // e.g. "ca-pub-7182938491029384"
  autoAdsEnabled: boolean;
  lazyLoadEnabled: boolean;
  consentModeV2: boolean;
  testMode: boolean;
  adBlockerNoticeEnabled: boolean;
  minWordCountForAds: number;
  autoInjectParagraphs: number[]; // e.g. [2, 5, 8]
  excludedCategories: string[];
}

let MOCK_ADSENSE_SETTINGS: AdSenseSettings = {
  publisherId: 'ca-pub-7489201948271049',
  autoAdsEnabled: true,
  lazyLoadEnabled: true,
  consentModeV2: true,
  testMode: false,
  adBlockerNoticeEnabled: true,
  minWordCountForAds: 450,
  autoInjectParagraphs: [2, 5, 9],
  excludedCategories: ['privacy-policy', 'terms-of-service'],
};

let MOCK_ADS_TXT = `google.com, pub-7489201948271049, DIRECT, f08c47fec0942fa0
# Authorized Resellers & Header Bidding Partners
rubiconproject.com, 10293, RESELLER, 0bfd66d529a55803
appnexus.com, 4920, RESELLER, f5ab79cb980f86d1
openx.com, 539201, RESELLER, 6a698e2ec38604c6
`;

let MOCK_AD_UNITS: AdUnitItem[] = [
  {
    id: 'ad_header_leaderboard',
    name: 'Top Header Leaderboard (728x90)',
    slotId: '1092837461',
    placement: 'header_leaderboard',
    format: 'responsive',
    deviceTargeting: 'desktop_only',
    isActive: true,
    priority: 1,
    impressions30d: 142800,
    clicks30d: 2140,
    ctr: 1.5,
    earnings30d: 428.5,
  },
  {
    id: 'ad_in_article_p2',
    name: 'In-Article Native Unit (Post Paragraph 2)',
    slotId: '4920194820',
    placement: 'in_article',
    format: 'responsive',
    deviceTargeting: 'all',
    isActive: true,
    priority: 2,
    impressions30d: 285400,
    clicks30d: 5420,
    ctr: 1.9,
    earnings30d: 894.2,
  },
  {
    id: 'ad_in_article_p5',
    name: 'In-Article Mid-Content Unit (Post Paragraph 5)',
    slotId: '8392019481',
    placement: 'in_article',
    format: 'responsive',
    deviceTargeting: 'all',
    isActive: true,
    priority: 3,
    impressions30d: 198200,
    clicks30d: 3180,
    ctr: 1.6,
    earnings30d: 594.6,
  },
  {
    id: 'ad_sidebar_sticky',
    name: 'Sidebar Sticky Half-Page (300x600)',
    slotId: '6192840192',
    placement: 'sidebar_rectangle',
    format: 'fixed_300x600',
    deviceTargeting: 'desktop_only',
    isActive: true,
    priority: 4,
    impressions30d: 94100,
    clicks30d: 1220,
    ctr: 1.3,
    earnings30d: 312.8,
  },
  {
    id: 'ad_mobile_anchor',
    name: 'Mobile Sticky Bottom Anchor (320x50)',
    slotId: '3829104928',
    placement: 'mobile_sticky_footer',
    format: 'fixed_320x50',
    deviceTargeting: 'mobile_only',
    isActive: true,
    priority: 5,
    impressions30d: 310500,
    clicks30d: 6830,
    ctr: 2.2,
    earnings30d: 1042.4,
  },
];

export function getAdsConfig(): AdSenseSettings {
  return MOCK_ADSENSE_SETTINGS;
}

export function updateAdsConfig(newSettings: Partial<AdSenseSettings>): AdSenseSettings {
  MOCK_ADSENSE_SETTINGS = { ...MOCK_ADSENSE_SETTINGS, ...newSettings };
  return MOCK_ADSENSE_SETTINGS;
}

export function getAdUnits(): AdUnitItem[] {
  return MOCK_AD_UNITS;
}

export function setAdUnitsList(units: AdUnitItem[]): AdUnitItem[] {
  MOCK_AD_UNITS = units;
  return MOCK_AD_UNITS;
}

export function addAdUnit(unit: AdUnitItem): AdUnitItem {
  MOCK_AD_UNITS.push(unit);
  return unit;
}

export function deleteAdUnit(id: string): boolean {
  const initial = MOCK_AD_UNITS.length;
  MOCK_AD_UNITS = MOCK_AD_UNITS.filter((u) => u.id !== id);
  return MOCK_AD_UNITS.length < initial;
}

export function getAdsTxt(): string {
  return MOCK_ADS_TXT;
}

export function setAdsTxtContent(content: string): string {
  MOCK_ADS_TXT = content;
  return MOCK_ADS_TXT;
}

export function getAdsAnalytics() {
  const totalImpressions = MOCK_AD_UNITS.reduce((acc, u) => acc + u.impressions30d, 0);
  const totalClicks = MOCK_AD_UNITS.reduce((acc, u) => acc + u.clicks30d, 0);
  const totalEarnings = MOCK_AD_UNITS.reduce((acc, u) => acc + u.earnings30d, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgEcpm = totalImpressions > 0 ? totalEarnings / (totalImpressions / 1000) : 0;

  return {
    totalImpressions,
    totalClicks,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    avgCtr: Math.round(avgCtr * 100) / 100,
    avgEcpm: Math.round(avgEcpm * 100) / 100,
  };
}

/**
 * Injects AdSense ad slots into raw HTML or article content blocks
 * according to configured paragraph frequencies and word count thresholds.
 */
export function injectAdSenseIntoHtml(
  contentHtml: string,
  options?: {
    categorySlug?: string;
    adsDisabled?: boolean;
  }
): string {
  if (options?.adsDisabled) {
    return contentHtml;
  }

  const settings = getAdsConfig();

  // Check category exclusions
  if (
    options?.categorySlug &&
    settings.excludedCategories.map((c) => c.toLowerCase()).includes(options.categorySlug.toLowerCase())
  ) {
    return contentHtml;
  }

  // Count words
  const textOnly = contentHtml.replace(/<[^>]*>/g, ' ');
  const wordCount = textOnly.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < settings.minWordCountForAds) {
    return contentHtml;
  }

  const inArticleUnits = getAdUnits().filter(
    (u) => u.isActive && (u.placement === 'in_article' || u.placement === 'custom')
  );
  if (inArticleUnits.length === 0) {
    return contentHtml;
  }

  // Split paragraphs
  const paragraphs = contentHtml.split(/(<\/p>)/i);
  let pCount = 0;
  let unitIndex = 0;
  const result: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const chunk = paragraphs[i];
    result.push(chunk);

    if (chunk.toLowerCase() === '</p>') {
      pCount++;
      if (settings.autoInjectParagraphs.includes(pCount)) {
        const unit = inArticleUnits[unitIndex % inArticleUnits.length];
        unitIndex++;

        const adMarkup = `
<!-- Google AdSense In-Article Slot (${unit.name}) -->
<div class="cms-ad-slot cms-ad-in-article" data-slot="${unit.slotId}" style="margin: 28px 0; text-align: center; min-height: 90px; clear: both;">
  <ins class="adsbygoogle"
       style="display:block; text-align:center;"
       data-ad-layout="in-article"
       data-ad-format="fluid"
       data-ad-client="${settings.publisherId}"
       data-ad-slot="${unit.slotId}"
       ${settings.testMode ? 'data-adtest="on"' : ''}></ins>
</div>
`;
        result.push(adMarkup);
      }
    }
  }

  return result.join('');
}
