import { AffiliateProduct } from '@/types';

export const ADSENSE_CONFIG = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-5273119900162802',
  hostId: process.env.NEXT_PUBLIC_ADSENSE_HOST_ID || 'ca-host-pub-2644536267352236',
  fundingChoicesUrl: 'https://fundingchoicesmessages.google.com/i/pub-5273119900162802?ers=1',
  slots: {
    homeLeadAfter: '8102934101',
    articleInContent1: '8102934102',
    articleInContent2: '8102934103',
    articleSidebar: '8102934104',
    categoryInFeed: '8102934105',
    footerAbove: '8102934106',
  },
};

export const AFFILIATE_DISCLOSURE = 
  'Media Bird Magazine participates in selected affiliate marketing programs. When you click on links to merchants or products on our site and make a purchase, we may earn an affiliate commission at no additional cost to you. Our editorial evaluations and recommendations remain strictly independent and grounded in verified reporting.';

/**
 * Editorial recommended products for Culture, Leisure, Odyssey, and Tech topics.
 * Conforms to Google sponsored link standards (rel="sponsored noopener noreferrer").
 */
export const CURATED_AFFILIATE_PRODUCTS: Record<string, AffiliateProduct[]> = {
  culture: [
    {
      id: 'aff_book_1',
      name: 'The Art of Slow Reading in an Accelerated World',
      description: 'An essential editorial guide exploring deep focus, thoughtful literature analysis, and intentional cognitive habits.',
      category: 'Culture',
      merchant: 'Bookshop.org / Independent Booksellers',
      merchantUrl: 'https://bookshop.org/search?keywords=slow+reading',
      badge: 'Editor’s Recommendation',
      features: ['Deep reading strategies', 'Digital distraction countermeasures', 'Literary theory for modern readers'],
      pros: ['Thought-provoking research', 'Beautiful hardcover edition', 'Supports independent bookstores'],
      cons: ['Academic tone in early chapters'],
    },
    {
      id: 'aff_journal_1',
      name: 'Archival Heritage Hardbound Notebook',
      description: 'Acid-free 120gsm fountain-pen friendly journal crafted for long-form essays, daily reflection, and field reporting notes.',
      category: 'Culture',
      merchant: 'Paper & Ink Co.',
      merchantUrl: 'https://www.amazon.com/dp/B08XJ8W9Z1?tag=mediabirdmag-20',
      badge: 'Writing Essential',
      features: ['240 numbered archival pages', 'Durable linen cover', 'Ribbon marker and expandable inner pocket'],
      pros: ['Zero ghosting or feathering', 'Lay-flat 180° binding'],
      cons: ['Slightly heavier for travel'],
    },
  ],
  leisure: [
    {
      id: 'aff_coffee_1',
      name: 'Precision Manual Burr Grinder for Specialty Coffee',
      description: 'Aerospace-grade stainless steel conical burr grinder engineered for slow, mindful morning pour-overs and zero-sugar espresso brewing.',
      category: 'Leisure',
      merchant: 'Artisan Brew Works',
      merchantUrl: 'https://www.amazon.com/dp/B08927X7M5?tag=mediabirdmag-20',
      badge: 'Barista Choice',
      features: ['48mm stainless steel burrs', 'Stepless micro-click dial', 'Dual ball bearing stabilization'],
      pros: ['Unmatched grind uniformity', 'Whisper-quiet manual operation'],
      cons: ['Requires manual cranking effort'],
    },
    {
      id: 'aff_headphones_1',
      name: 'Acoustic Noise-Cancelling Over-Ear Studio Headphones',
      description: 'High-resolution wireless audio headphones designed for immersive podcasts, acoustic playlists, and peaceful reading sessions.',
      category: 'Leisure',
      merchant: 'Hi-Fi Audio Direct',
      merchantUrl: 'https://www.amazon.com/dp/B09XS7M9B1?tag=mediabirdmag-20',
      badge: 'Acoustic Pick',
      features: ['40-hour battery life', 'Multi-point Bluetooth 5.3', 'Customizable EQ sound curve'],
      pros: ['Exceptional sound clarity', 'Plush memory foam earcups'],
      cons: ['Premium investment tier'],
    },
  ],
  odyssey: [
    {
      id: 'aff_power_1',
      name: 'Eco-Flow Ultra-Portable Solar Power Bank (24,000mAh)',
      description: 'Rugged USB-C 100W PD outdoor power station equipped with bi-directional rapid charging for fieldwork, expedition journalism, and remote travel.',
      category: 'Odyssey',
      merchant: 'Expedition Outfitter',
      merchantUrl: 'https://www.amazon.com/dp/B09V7L7M32?tag=mediabirdmag-20',
      badge: 'Expedition Tested',
      features: ['Aircraft-approved capacity', 'Real-time OLED display', 'IP67 water and dust resistance'],
      pros: ['Charges laptops and cameras simultaneously', 'Rapid 45-minute recharge'],
      cons: ['Bulkier than slim pocket chargers'],
    },
  ],
};
