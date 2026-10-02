import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Markup — Enterprise Headless CMS Platform',
  description: 'Enterprise decoupled headless content management platform powering modern digital experiences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans" suppressHydrationWarning>
        <ThemeProvider defaultTheme="system" storageKey="cms-ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
