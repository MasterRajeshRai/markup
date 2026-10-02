'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { useSearchModal } from './search-modal';
import { useSidebar } from './sidebar-context';
import { NotificationsPopover } from './notifications-popover';
import {
  Sun,
  Moon,
  Search,
  Settings,
  PanelLeft,
  LineChart,
  Bell,
  Command,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { openSearch } = useSearchModal();
  const { toggleMobile } = useSidebar();
  const { user, hasPermission } = useAuth();
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)) {
      setIsMac(true);
    }
  }, []);

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Analytics';
    if (pathname.includes('/content-types')) return 'Content Types';
    if (pathname.includes('/content')) return 'Content Entries';
    if (pathname.includes('/pages')) return 'Pages';
    if (pathname.includes('/media')) return 'Media Library';
    if (pathname.includes('/users')) return 'Users & Roles';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/workflows')) return 'Workflows';
    if (pathname.includes('/navigation')) return 'Navigation';
    if (pathname.includes('/seo')) return 'SEO Rank Markup';
    if (pathname.includes('/calendar')) return 'Editorial Calendar';
    if (pathname.includes('/forms')) return 'Forms & Leads';
    if (pathname.includes('/comments')) return 'Comments & Moderation';
    if (pathname.includes('/graphql')) return 'GraphQL API Explorer';
    if (pathname.includes('/ads')) return 'AdSense & Advertising';
    return 'Analytics';
  };

  return (
    <header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b bg-card/95 px-3 sm:px-4 md:px-6 backdrop-blur-md transition-colors shadow-2xs">
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleMobile()}
          className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

        <div className="h-5 w-px bg-border/60 shrink-0" />

        <div className="flex items-center gap-2 text-[14px] sm:text-[15px] font-semibold text-foreground truncate">
          <LineChart className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-500 shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-none">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Search, Settings, Theme Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Icon Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openSearch()}
          className="h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden cursor-pointer rounded-lg"
          title="Search CMS (Ctrl+K)"
        >
          <Search className="h-4.5 w-4.5" />
        </Button>

        {/* Desktop Uncluttered Command Bar Trigger */}
        <button
          type="button"
          onClick={() => openSearch()}
          className="hidden sm:flex items-center justify-between w-48 md:w-60 lg:w-72 h-9 px-3 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted/70 hover:border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer group shadow-2xs"
          title="Quick search (Ctrl+K)"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors shrink-0" />
            <span className="text-[13px] font-normal text-muted-foreground/80 group-hover:text-foreground transition-colors truncate">
              Search CMS...
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {isMac ? (
              <>
                <kbd className="inline-flex items-center justify-center min-w-[19px] h-5 px-1 rounded border border-border/80 bg-background font-mono text-[10px] font-medium text-muted-foreground shadow-2xs group-hover:border-border">
                  ⌘
                </kbd>
                <kbd className="inline-flex items-center justify-center min-w-[19px] h-5 px-1 rounded border border-border/80 bg-background font-mono text-[10px] font-medium text-muted-foreground shadow-2xs group-hover:border-border">
                  K
                </kbd>
              </>
            ) : (
              <>
                <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded border border-border/80 bg-background font-mono text-[10px] font-medium text-muted-foreground shadow-2xs group-hover:border-border">
                  Ctrl
                </kbd>
                <kbd className="inline-flex items-center justify-center min-w-[19px] h-5 px-1 rounded border border-border/80 bg-background font-mono text-[10px] font-medium text-muted-foreground shadow-2xs group-hover:border-border">
                  K
                </kbd>
              </>
            )}
          </div>
        </button>

        {/* Activity & Notifications Popover */}
        <NotificationsPopover />

        {/* User Role Pill */}
        {user && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border bg-muted/40 border-border/70 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-foreground text-[12px]">
              {user.roleName || user.role}
            </span>
          </div>
        )}

        {/* Settings button - only if authorized */}
        {hasPermission('settings.manage') && (
          <Link href="/admin/settings">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              title="Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </Button>
          </Link>
        )}

        {/* Theme Toggle Button (Light / Dark) */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-neutral-600" />}
        </Button>
      </div>
    </header>
  );
}
