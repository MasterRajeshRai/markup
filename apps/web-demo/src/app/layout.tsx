import type { Metadata } from 'next';
import './globals.css';
import { cmsClient } from '@/lib/cms-client';
import { TopBar } from '@/components/top-bar';
import { SchoolHeader } from '@/components/school-header';
import { SchoolFooter } from '@/components/school-footer';

export const metadata: Metadata = {
  title: 'Prince Public School, Mehrauli — CBSE Affiliated Secondary School (Class Pre-School to X)',
  description:
    'Prince Public School is a premier CBSE affiliated Secondary co-educational school (Pre-School to Class X) located at 2/108, Mehrauli, New Delhi (1.0 km from Qutub Minar). Renowned for 100% CBSE Class X results, value-based character building, day-boarding & hostel facilities.',
  keywords: [
    'Prince Public School',
    'Prince Public School Mehrauli',
    'CBSE School Mehrauli New Delhi',
    'School near Qutub Minar',
    'Admissions 2026-27',
    'Best CBSE School Mehrauli',
    'Secondary School Class 10',
    '100% CBSE Class X Result',
    'Day Scholar plus Boarding School',
  ],
  icons: {
    icon: '/images/pps-crest.svg',
    shortcut: '/images/pps-crest.svg',
    apple: '/images/pps-crest.svg',
  },
  openGraph: {
    title: 'Prince Public School, Mehrauli — Knowledge, Character & Excellence',
    description: 'Admissions Open 2026-27 for Pre-School to Class X. Premier CBSE Secondary Institution located near Qutub Minar, Mehrauli, New Delhi.',
    siteName: 'Prince Public School',
    locale: 'en_IN',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let navItems = [
    { title: 'Home', url: '/' },
    { title: 'About Us', url: '/about' },
    { title: 'Academics', url: '/academics' },
    { title: 'Admissions', url: '/admissions' },
    { title: 'Facilities', url: '/facilities' },
    { title: 'Student Life', url: '/student-life' },
    { title: 'Notices', url: '/notices' },
    { title: 'Gallery', url: '/gallery' },
    { title: 'Contact', url: '/contact' },
  ];
  let branding: { logoUrl?: string; faviconUrl?: string; primaryColor?: string } = {
    logoUrl: '/images/pps-crest.svg',
  };
  let siteTitle = 'Prince Public School';

  try {
    const [navRes, settingsRes] = await Promise.allSettled([
      cmsClient.getNavigation('main-navigation'),
      cmsClient.getSettings(),
    ]);

    if (navRes.status === 'fulfilled' && navRes.value?.data?.items && navRes.value.data.items.length > 0) {
      navItems = navRes.value.data.items.map((item: any) => ({
        title: item.title || item.label,
        url: item.url,
      }));
    }

    if (settingsRes.status === 'fulfilled') {
      const data = settingsRes.value as any;
      if (data?.site?.branding?.logoUrl) {
        branding = data.site.branding;
      } else if (data?.branding?.logoUrl) {
        branding = data.branding;
      }

      if (data?.site?.name) {
        siteTitle = data.site.name;
      }
    }
  } catch {
    // Graceful fallback to default Prince Public School state
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
        {/* Top Notification Bar */}
        <TopBar />

        {/* School Main Navigation Header */}
        <SchoolHeader
          navItems={navItems}
          siteTitle={siteTitle}
          logoUrl={branding.logoUrl || '/images/pps-crest.svg'}
        />

        {/* Main Page Content */}
        <main className="flex-1">{children}</main>

        {/* Comprehensive School Footer */}
        <SchoolFooter />
      </body>
    </html>
  );
}
