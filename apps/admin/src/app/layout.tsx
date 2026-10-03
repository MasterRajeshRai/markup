import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Markup — Enterprise Headless CMS Platform',
  description: 'Enterprise decoupled headless content management platform powering modern digital experiences.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#09182d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden max-w-full">
      <body className="antialiased min-h-screen bg-background text-foreground font-sans overflow-x-hidden max-w-full w-full relative" suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" storageKey="cms-ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
