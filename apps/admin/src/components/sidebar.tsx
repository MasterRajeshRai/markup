'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Image,
  Images,
  Users,
  Globe,
  GitBranch,
  ChevronRight,
  ChevronsUpDown,
  BarChart3,
  BookOpen,
  Newspaper,
  Send,
  History,
  Key,
  Webhook,
  Download,
  Puzzle,
  Menu,
  RotateCcw,
  Tags,
  Search as SearchIcon,
  Shield,
  Settings,
  Cpu,
  X,
  MessageSquare,
  Calendar,
  FileSpreadsheet,
  Code2,
  DollarSign,
  Mail,
  SlidersHorizontal,
  LogOut,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useSidebar } from '@/components/sidebar-context';
import { useModules } from '@/components/modules-context';
import { useAuth } from '@/components/auth-context';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  moduleId?: string; // If set, hidden when module is deactivated
  hasChevron?: boolean;
  badge?: string;
  requiredPermission?: string; // e.g. 'content.read', 'media.read'
  allowedRoles?: string[]; // Optional role whitelist
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        iconColor: 'text-blue-500',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        title: 'Content Entries',
        href: '/admin/content',
        icon: FileText,
        iconColor: 'text-blue-400',
        moduleId: 'content_core',
        requiredPermission: 'content.read',
      },
      {
        title: 'Articles',
        href: '/admin/content?type=articles',
        icon: BookOpen,
        iconColor: 'text-emerald-500',
        moduleId: 'content_core',
        requiredPermission: 'content.read',
      },
      {
        title: 'Pages',
        href: '/admin/pages',
        icon: Newspaper,
        iconColor: 'text-teal-500',
        moduleId: 'content_core',
        requiredPermission: 'content.read',
      },
      {
        title: 'Hero Sliders',
        href: '/admin/sliders',
        icon: SlidersHorizontal,
        iconColor: 'text-amber-400',
        moduleId: 'hero_slider',
        requiredPermission: 'sliders.read',
      },
      {
        title: 'Content Types',
        href: '/admin/content-types',
        icon: Layers,
        iconColor: 'text-purple-500',
        moduleId: 'content_core',
        requiredPermission: 'content_type.read',
      },
    ],
  },
  {
    title: 'Publishing & Editorial',
    items: [
      {
        title: 'Editorial Calendar',
        href: '/admin/calendar',
        icon: Calendar,
        iconColor: 'text-blue-500',
        moduleId: 'calendar',
        requiredPermission: 'calendar.read',
      },
      {
        title: 'Publishing Queue',
        href: '/admin/publishing',
        icon: Send,
        iconColor: 'text-emerald-500',
        moduleId: 'publishing_queue',
        requiredPermission: 'content.publish',
      },
      {
        title: 'Workflows & Approvals',
        href: '/admin/workflows',
        icon: GitBranch,
        iconColor: 'text-orange-500',
        moduleId: 'workflows',
        requiredPermission: 'workflows.read',
      },
      {
        title: 'Content Revisions',
        href: '/admin/revisions',
        icon: History,
        iconColor: 'text-cyan-500',
        moduleId: 'revisions',
        requiredPermission: 'revisions.read',
      },
    ],
  },
  {
    title: 'Media & Assets',
    items: [
      {
        title: 'Albums & Gallery',
        href: '/admin/gallery',
        icon: Images,
        iconColor: 'text-emerald-400',
        moduleId: 'gallery',
      },
      {
        title: 'Media Library',
        href: '/admin/media',
        icon: Image,
        iconColor: 'text-amber-500',
        moduleId: 'media',
        requiredPermission: 'media.read',
      },
    ],
  },
  {
    title: 'Audience & Community',
    items: [
      {
        title: 'Newsletter',
        href: '/admin/newsletter',
        icon: Mail,
        iconColor: 'text-emerald-400',
        moduleId: 'newsletter',
        requiredPermission: 'newsletter.read',
      },
      {
        title: 'Forms & Leads',
        href: '/admin/forms',
        icon: FileSpreadsheet,
        iconColor: 'text-emerald-500',
        moduleId: 'forms',
        requiredPermission: 'forms.read',
      },
      {
        title: 'Comments & Discussions',
        href: '/admin/comments',
        icon: MessageSquare,
        iconColor: 'text-amber-400',
        badge: '2',
        moduleId: 'comments',
        requiredPermission: 'comments.read',
      },
    ],
  },
  {
    title: 'Marketing & SEO',
    items: [
      {
        title: 'SEO & Rank Markup',
        href: '/admin/seo',
        icon: SearchIcon,
        iconColor: 'text-green-500',
        moduleId: 'seo',
        requiredPermission: 'seo.manage',
      },
      {
        title: 'AdSense & Monetization',
        href: '/admin/ads',
        icon: DollarSign,
        iconColor: 'text-amber-500',
        moduleId: 'adsense',
        requiredPermission: 'ads.manage',
      },
      {
        title: 'URL Redirects',
        href: '/admin/redirects',
        icon: RotateCcw,
        iconColor: 'text-slate-400',
        moduleId: 'redirects',
        requiredPermission: 'redirects.manage',
      },
    ],
  },
  {
    title: 'Site Structure',
    items: [
      {
        title: 'Navigation Menus',
        href: '/admin/navigation',
        icon: Menu,
        iconColor: 'text-indigo-400',
        moduleId: 'navigation',
        requiredPermission: 'navigation.manage',
      },
      {
        title: 'Taxonomies',
        href: '/admin/taxonomies',
        icon: Tags,
        iconColor: 'text-rose-500',
        moduleId: 'taxonomies',
        requiredPermission: 'taxonomy.manage',
      },
    ],
  },
  {
    title: 'Security & Access',
    items: [
      {
        title: 'Security Center',
        href: '/admin/security',
        icon: ShieldCheck,
        iconColor: 'text-emerald-400',
        requiredPermission: 'settings.manage',
      },
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
        iconColor: 'text-indigo-500',
        moduleId: 'users_roles',
        requiredPermission: 'users.read',
      },
      {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: Shield,
        iconColor: 'text-violet-500',
        moduleId: 'users_roles',
        requiredPermission: 'roles.manage',
      },
      {
        title: 'API Keys & Tokens',
        href: '/admin/api-keys',
        icon: Key,
        iconColor: 'text-amber-600',
        moduleId: 'api_keys',
        requiredPermission: 'api.manage',
      },
      {
        title: 'Governance Audit Logs',
        href: '/admin/audit-logs',
        icon: BarChart3,
        iconColor: 'text-slate-400',
        moduleId: 'audit_logs',
        requiredPermission: 'audit.read',
      },
    ],
  },
  {
    title: 'Developer & APIs',
    items: [
      {
        title: 'Email (Resend)',
        href: '/admin/emails',
        icon: Mail,
        iconColor: 'text-blue-400',
        moduleId: 'email',
        requiredPermission: 'email.manage',
      },
      {
        title: 'GraphQL Playground',
        href: '/admin/graphql',
        icon: Code2,
        iconColor: 'text-pink-500',
        moduleId: 'graphql',
        requiredPermission: 'api.manage',
      },
      {
        title: 'Webhooks Dispatcher',
        href: '/admin/webhooks',
        icon: Webhook,
        iconColor: 'text-pink-500',
        moduleId: 'webhooks',
        requiredPermission: 'webhooks.manage',
      },
      {
        title: 'Integrations Hub',
        href: '/admin/integrations',
        icon: Puzzle,
        iconColor: 'text-cyan-500',
        moduleId: 'integrations',
        requiredPermission: 'integrations.manage',
      },
      {
        title: 'Import / Export',
        href: '/admin/import-export',
        icon: Download,
        iconColor: 'text-blue-400',
        moduleId: 'import_export',
        requiredPermission: 'import_export.manage',
      },
    ],
  },
  {
    title: 'System & Multi-Site',
    items: [
      {
        title: 'Sites & Domains',
        href: '/admin/sites',
        icon: Globe,
        iconColor: 'text-cyan-600',
        moduleId: 'multisite',
        requiredPermission: 'sites.manage',
      },
      {
        title: 'Modules & Plugins',
        href: '/admin/modules',
        icon: Puzzle,
        iconColor: 'text-purple-500',
        moduleId: 'system_settings',
        requiredPermission: 'settings.manage',
      },
      {
        title: 'Site Settings',
        href: '/admin/settings',
        icon: Settings,
        iconColor: 'text-slate-400',
        moduleId: 'system_settings',
        requiredPermission: 'settings.manage',
      },
      {
        title: 'System Diagnostics',
        href: '/admin/system',
        icon: Cpu,
        iconColor: 'text-slate-400',
        moduleId: 'system_settings',
        requiredPermission: 'settings.manage',
      },
    ],
  },
];

const DEMO_ACCOUNTS = [
  { role: 'Administrator', email: 'admin@headless.io', pass: 'AdminPass123!', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { role: 'Lead Editor', email: 'editor@headless.io', pass: 'EditorPass123!', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { role: 'Staff Author', email: 'author@headless.io', pass: 'AuthorPass123!', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { role: 'Reviewer', email: 'reviewer@headless.io', pass: 'ReviewerPass123!', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { role: 'Developer', email: 'developer@headless.io', pass: 'DeveloperPass123!', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen, isCollapsed } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isMobileOpen || !isCollapsed || isHovered;
  const { isModuleEnabled, counts } = useModules();
  const { user, hasPermission, logout, refreshUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [siteBranding, setSiteBranding] = useState<{ name: string; logoUrl: string }>({
    name: 'Markup',
    logoUrl: '',
  });

  useEffect(() => {
    // 1. Initial fetch from API
    fetch('/api/v1/settings')
      .then((r) => r.json())
      .then((data) => {
        const name = data.site?.name || 'Markup';
        const logoUrl = data.site?.branding?.logoUrl || data.settings?.site_logo || '';
        setSiteBranding({ name, logoUrl });
      })
      .catch(() => {});

    // 2. Listen for live updates dispatched from Settings page
    const handleBrandingUpdate = (e: any) => {
      if (e?.detail) {
        setSiteBranding({
          name: e.detail.name || 'Markup',
          logoUrl: e.detail.logoUrl || '',
        });
      }
    };

    window.addEventListener('cms-settings-updated', handleBrandingUpdate);
    return () => {
      window.removeEventListener('cms-settings-updated', handleBrandingUpdate);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route changes
  useEffect(() => {
    setIsMobileOpen(false);
    setProfileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const handleQuickSwitch = async (email: string, pass: string) => {
    setSwitchingRole(email);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        await refreshUser();
        setProfileOpen(false);
        window.location.href = '/admin';
      }
    } catch (e) {
      console.error('Role switch failed:', e);
    } finally {
      setSwitchingRole(null);
    }
  };

  // Filter items by module toggle AND role permissions
  const isItemVisible = (item: NavItem): boolean => {
    // 1. Module active check
    if (item.moduleId && !isModuleEnabled(item.moduleId)) {
      return false;
    }
    // 2. Role whitelist check
    if (item.allowedRoles && user && !item.allowedRoles.includes(user.role)) {
      return false;
    }
    // 3. Granular permission check
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false;
    }
    return true;
  };

  const visibleSections = SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items
      .filter(isItemVisible)
      .map((item) => {
        if (item.href === '/admin/modules') {
          return {
            ...item,
            badge: `${counts.active}/${counts.total}`,
          };
        }
        return item;
      }),
  })).filter((sec) => sec.items.length > 0);

  // Determine user role badge color
  const getRoleBadgeStyle = (role: string = '') => {
    switch (role.toLowerCase()) {
      case 'super_admin':
      case 'admin':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'editor':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'author':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'reviewer':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'developer':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[70] lg:hidden animate-in fade-in-50 duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop placeholder spacer to keep page content aligned next to fixed sidebar */}
      <div
        className={cn(
          'hidden lg:block shrink-0 pointer-events-none transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-72'
        )}
        aria-hidden="true"
      />

      <aside
        suppressHydrationWarning
        onMouseEnter={() => {
          if (isCollapsed) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (isCollapsed) setIsHovered(false);
        }}
        className={cn(
          'border-r bg-card flex flex-col h-screen max-h-screen select-none overflow-hidden shrink-0 transition-all duration-300 ease-in-out',
          'fixed inset-y-0 left-0',
          isMobileOpen
            ? 'w-72 max-w-[85vw] translate-x-0 shadow-2xl z-[80]'
            : '-translate-x-full lg:translate-x-0 z-40',
          isExpanded ? 'w-72' : 'w-20',
          isCollapsed && isHovered && 'shadow-2xl z-50 border-r-border/80'
        )}
      >
        {/* Top Brand Header */}
        <div
          className={cn(
            'h-16 flex items-center border-b shrink-0 transition-all duration-300',
            isExpanded ? 'justify-between px-4' : 'justify-center px-2'
          )}
        >
          <Link
            href="/admin"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 min-w-0 group cursor-pointer"
            title="Markup Headless CMS"
          >
            <div className="h-8.5 w-8.5 rounded-lg bg-foreground/5 border border-border flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
              {siteBranding.logoUrl ? (
                <img
                  src={siteBranding.logoUrl}
                  alt={siteBranding.name}
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <div className="h-full w-full bg-foreground flex items-center justify-center text-background font-bold text-sm">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current">
                    <path d="M4 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 8a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4zM6 14a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm10-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
              )}
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200 animate-in fade-in">
                <span className="font-semibold text-[15px] tracking-tight text-foreground leading-tight truncate">
                  {siteBranding.name}
                </span>
                <span className="text-[12px] text-muted-foreground/80 font-normal leading-tight truncate mt-0.5">
                  Headless CMS
                </span>
              </div>
            )}
          </Link>

          {isExpanded && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden cursor-pointer"
                title="Close Menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Body */}
        <div
          className={cn(
            'flex-1 min-h-0 overflow-y-auto thin-scrollbar space-y-4 py-3 transition-all duration-300',
            isExpanded ? 'px-3' : 'px-2'
          )}
        >
          {visibleSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              {isExpanded ? (
                <div className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 transition-opacity duration-200">
                  {sec.title}
                </div>
              ) : (
                <div className="my-2 mx-auto w-5 h-px bg-border/50" />
              )}
              <div className="space-y-0.5 pt-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      title={!isExpanded ? item.title : undefined}
                      className={cn(
                        'flex items-center rounded-lg text-[15px] transition-all relative group',
                        isExpanded
                          ? 'justify-between px-3 py-2 h-9.5'
                          : 'justify-center h-10 w-10 mx-auto',
                        isActive
                          ? 'bg-accent/90 text-foreground font-medium shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 font-normal'
                      )}
                    >
                      <div className={cn('flex items-center min-w-0', isExpanded ? 'gap-2.5' : 'justify-center')}>
                        <Icon className={cn('h-4.5 w-4.5 shrink-0', item.iconColor)} />
                        {isExpanded && (
                          <span className="truncate text-[15px] transition-opacity duration-200">{item.title}</span>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              {item.badge}
                            </span>
                          )}
                          {item.hasChevron && (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                          )}
                        </div>
                      )}
                      {!isExpanded && isActive && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Pinned User Profile with Role Badging and Account Menu */}
        <div
          className={cn(
            'border-t bg-card shrink-0 relative transition-all duration-300',
            isExpanded ? 'p-3' : 'p-2'
          )}
          ref={profileMenuRef}
        >
          {profileOpen && (
            <div
              className={cn(
                'absolute bottom-full mb-2 rounded-xl border border-border bg-card shadow-2xl p-3 z-50 animate-in fade-in-50 slide-in-from-bottom-2 duration-150',
                isExpanded ? 'left-3 right-3' : 'left-2 w-72'
              )}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-border/70">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-semibold text-foreground truncate">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[12px] text-muted-foreground truncate">
                    {user?.email || 'user@headless.io'}
                  </span>
                  <span
                    className={cn(
                      'inline-block mt-1 self-start px-2 py-0.5 rounded-full text-[10.5px] font-semibold border',
                      getRoleBadgeStyle(user?.role)
                    )}
                  >
                    {user?.roleName || user?.role || 'Guest'}
                  </span>
                </div>
              </div>

              {/* Role Emulation Switcher */}
              <div className="pt-2.5 pb-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5 px-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  Switch Role (Test View)
                </div>
                <div className="space-y-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={switchingRole !== null || user?.email === acc.email}
                      onClick={() => handleQuickSwitch(acc.email, acc.pass)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[12.5px] transition-colors text-left cursor-pointer',
                        user?.email === acc.email
                          ? 'bg-accent/80 font-medium text-foreground'
                          : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <UserCheck className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{acc.role}</span>
                      </div>
                      {user?.email === acc.email ? (
                        <span className="text-[10px] font-semibold text-emerald-400">Current</span>
                      ) : (
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', acc.color)}>
                          Test
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors font-medium cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Trigger button */}
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              'flex items-center rounded-lg hover:bg-accent/60 transition-colors cursor-pointer group',
              isExpanded ? 'justify-between px-2.5 py-2' : 'justify-center p-1.5 mx-auto'
            )}
            title={!isExpanded ? (user?.name || 'Administrator') : undefined}
          >
            <div className={cn('flex items-center min-w-0', isExpanded ? 'gap-3' : 'justify-center')}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              {isExpanded && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-medium text-foreground truncate leading-tight group-hover:text-foreground">
                    {user?.name || 'Administrator'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded text-[10.5px] font-semibold border leading-tight truncate',
                        getRoleBadgeStyle(user?.role)
                      )}
                    >
                      {user?.roleName || user?.role || 'Admin'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {isExpanded && (
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export { ScrollArea };
