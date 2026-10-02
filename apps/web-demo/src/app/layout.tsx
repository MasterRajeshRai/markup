import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { cmsClient } from '@/lib/cms-client';

export const metadata: Metadata = {
  title: 'Markup Digital Experience — Reference Frontend',
  description: 'Pure decoupled Next.js frontend consuming the Markup Headless CMS API.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let navItems = [
    { title: 'Home', url: '/' },
    { title: 'Articles', url: '/articles' },
  ];
  let branding: { logoUrl?: string; faviconUrl?: string; primaryColor?: string } = {};
  let siteTitle = 'MARKUP DIGITAL';

  try {
    const [nav, settingsRes] = await Promise.allSettled([
      cmsClient.getNavigation('main-navigation'),
      cmsClient.getSettings(),
    ]);

    if (nav.status === 'fulfilled' && nav.value?.data?.items) {
      navItems = nav.value.data.items;
    }

    if (settingsRes.status === 'fulfilled') {
      if (settingsRes.value?.branding) branding = settingsRes.value.branding;
      if (settingsRes.value?.settings?.site_title) siteTitle = settingsRes.value.settings.site_title;
    }
  } catch {
    // Fallback if CMS API is not active yet
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              {branding.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={branding.logoUrl}
                  alt={siteTitle}
                  className="h-8 max-w-[140px] object-contain rounded"
                />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  M
                </div>
              )}
              <span className="font-bold text-sm tracking-tight text-white uppercase">{siteTitle}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Headless Client
              </span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {item.title}
                </Link>
              ))}
              <a
                href="http://localhost:3000/admin"
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-md border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors"
              >
                CMS Admin ↗
              </a>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Markup Enterprise. Content managed with Markup CMS.</p>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                REST Delivery API Active
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
