import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const fallbackMenus = [
  {
    id: 'menu_header',
    name: 'Main Header Navigation',
    slug: 'main-navigation',
    location: 'header',
    description: 'Primary navbar for desktop and mobile clients',
    items: [
      { id: 'mi_1', label: 'Home', url: '/', target: '_self', order: 0, children: [] },
      { id: 'mi_2', label: 'Articles', url: '/articles', target: '_self', order: 1, children: [] },
      { id: 'mi_3', label: 'Platform Features', url: '/#features', target: '_self', order: 2, children: [] },
      { id: 'mi_4', label: 'Documentation', url: '/api-docs', target: '_blank', order: 3, children: [] },
    ],
  },
  {
    id: 'menu_footer',
    name: 'Footer Navigation',
    slug: 'footer-navigation',
    location: 'footer',
    description: 'Bottom site links and legal mentions',
    items: [
      { id: 'mi_5', label: 'Privacy Policy', url: '/privacy', target: '_self', order: 0, children: [] },
      { id: 'mi_6', label: 'Terms of Service', url: '/terms', target: '_self', order: 1, children: [] },
      { id: 'mi_7', label: 'Security & Compliance', url: '/security', target: '_self', order: 2, children: [] },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);

    try {
      const dbPromise = prisma.menu.findMany({
        where: { siteId: site?.id || 'site_default_01' },
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1500));
      const menus = (await Promise.race([dbPromise, timeoutPromise])) as any[];

      return NextResponse.json({ data: menus.length > 0 ? menus : fallbackMenus });
    } catch {
      return NextResponse.json({ data: fallbackMenus });
    }
  } catch (err) {
    console.error('[NavigationGET] Error:', err);
    return NextResponse.json({ data: fallbackMenus });
  }
}

export async function POST(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const adminSession = await getAdminSession(req);
    if (adminSession) {
      const guard = requirePermission(adminSession, 'navigation.manage');
      if (!guard.authorized) return guard.response!;
    }

    const body = await req.json();
    const { name, slug, description, location } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const newMenu = {
      id: `menu_${Date.now()}`,
      siteId: site?.id || 'site_default_01',
      name,
      slug: cleanSlug,
      description,
      location,
      items: [],
    };

    try {
      const menu = await prisma.menu.create({
        data: {
          siteId: site?.id || 'site_default_01',
          name,
          slug: cleanSlug,
          description,
          location,
        },
      });
      return NextResponse.json({ success: true, menu }, { status: 201 });
    } catch {
      fallbackMenus.push(newMenu as any);
      return NextResponse.json({ success: true, menu: newMenu }, { status: 201 });
    }
  } catch (err) {
    console.error('[NavigationPOST] Error:', err);
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}
