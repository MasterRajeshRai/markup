import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ADSENSE_CONFIG } from '@/lib/monetization';

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mediabirdmag.com'),
  title: {
    default: 'Media Bird Magazine — Telling It Slow, Saying It Right!',
    template: '%s | Media Bird Magazine',
  },
  description:
    'An independent editorial digital publication committed to slow journalism, cultural inquiry, arts, and intellectual depth across Culture, Leisure, Newscast, Odyssey, and Rendezvous.',
  keywords: [
    'Media Bird Magazine',
    'slow journalism',
    'culture magazine',
    'independent journalism',
    'arts and literature',
    'leisure',
    'newscast',
    'odyssey',
    'rendezvous',
  ],
  authors: [{ name: 'Team Mediabird Magazine', url: 'https://www.mediabirdmag.com' }],
  creator: 'Media Bird Magazine',
  publisher: 'Media Bird Magazine',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mediabirdmag.com',
    siteName: 'Media Bird Magazine',
    title: 'Media Bird Magazine — Telling It Slow, Saying It Right!',
    description:
      'An independent editorial digital publication committed to slow journalism, cultural inquiry, arts, and intellectual depth.',
    images: [
      {
        url: 'https://www.mediabirdmag.com/wp-content/uploads/2024/04/cropped-500x500-NEW-LOGO-1-192x192.png',
        width: 192,
        height: 192,
        alt: 'Media Bird Magazine Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media Bird Magazine — Telling It Slow, Saying It Right!',
    description:
      'Telling It Slow, Saying It Right! Independent long-form journalism, cultural commentary, and investigative inquiry.',
    creator: '@mediabirdmag',
    site: '@mediabirdmag',
    images: ['https://www.mediabirdmag.com/wp-content/uploads/2024/04/cropped-500x500-NEW-LOGO-1-192x192.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: 'https://www.mediabirdmag.com/wp-content/uploads/2024/04/cropped-500x500-NEW-LOGO-1-32x32.png', sizes: '32x32' },
      { url: 'https://www.mediabirdmag.com/wp-content/uploads/2024/04/cropped-500x500-NEW-LOGO-1-192x192.png', sizes: '192x192' },
    ],
    apple: [
      { url: 'https://www.mediabirdmag.com/wp-content/uploads/2024/04/cropped-500x500-NEW-LOGO-1-180x180.png' },
    ],
  },
  other: {
    'google-adsense-platform-account': ADSENSE_CONFIG.hostId,
    'google-adsense-platform-domain': 'sitekit.withgoogle.com',
    'facebook-domain-verification': 'oeeogphygbasb6bsxhri29580ycm57',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['NewsMediaOrganization', 'Organization'],
        '@id': 'https://www.mediabirdmag.com/#organization',
        name: 'Media Bird Magazine',
        url: 'https://www.mediabirdmag.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.mediabirdmag.com/wp-content/uploads/2022/09/logo.png',
        },
        sameAs: [
          'https://www.facebook.com/mediabirdmag',
          'https://x.com/mediabirdmag',
          'https://www.instagram.com/mediabirdmag',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.mediabirdmag.com/#website',
        url: 'https://www.mediabirdmag.com',
        name: 'Media Bird Magazine',
        publisher: { '@id': 'https://www.mediabirdmag.com/#organization' },
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.mediabirdmag.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en-US" className={`${sourceSans3.variable} ${sourceSans3.className}`}>
      <head>
        {/* Google Fonts direct link for Source Sans 3 fallback insurance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300..900;1,300..900&display=swap"
        />

        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SBLJQNLZVE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SBLJQNLZVE');
            gtag('config', 'AW-16609865870');
          `}
        </Script>

        {/* Google AdSense Script */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}&host=${ADSENSE_CONFIG.hostId}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />

        {/* Google Funding Choices / Consent Framework */}
        <Script
          async
          src={ADSENSE_CONFIG.fundingChoicesUrl}
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-stone-900 antialiased selection:bg-editorial-crimson selection:text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
