import { prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const fallbackMenus = [
  {
    id: 'menu_header',
    name: 'Prince Public School Main Navigation',
    slug: 'main-navigation',
    location: 'header',
    description: 'Primary navbar for Prince Public School website',
    items: [
      { id: 'mi_1', label: 'Home', url: '/', target: '_self', order: 0, children: [] },
      { id: 'mi_2', label: 'About Us', url: '/about', target: '_self', order: 1, children: [] },
      { id: 'mi_3', label: 'Academics', url: '/academics', target: '_self', order: 2, children: [] },
      { id: 'mi_4', label: 'Admissions', url: '/admissions', target: '_self', order: 3, children: [] },
      { id: 'mi_5', label: 'Facilities', url: '/facilities', target: '_self', order: 4, children: [] },
      { id: 'mi_6', label: 'Student Life', url: '/student-life', target: '_self', order: 5, children: [] },
      { id: 'mi_7', label: 'Notices', url: '/notices', target: '_self', order: 6, children: [] },
      { id: 'mi_8', label: 'Gallery', url: '/gallery', target: '_self', order: 7, children: [] },
      { id: 'mi_9', label: 'Contact', url: '/contact', target: '_self', order: 8, children: [] },
    ],
  },
  {
    id: 'menu_footer',
    name: 'Footer Navigation',
    slug: 'footer-navigation',
    location: 'footer',
    description: 'School disclosures, policies, and links',
    items: [
      { id: 'mi_10', label: 'CBSE Mandatory Disclosure', url: '/about#cbse-disclosure', target: '_self', order: 0, children: [] },
      { id: 'mi_11', label: 'Fee Structure', url: '/admissions#fees', target: '_self', order: 1, children: [] },
      { id: 'mi_12', label: 'Transfer Certificate (TC)', url: '/admissions#tc', target: '_self', order: 2, children: [] },
      { id: 'mi_13', label: 'Safety & POCSO Policy', url: '/about#safety', target: '_self', order: 3, children: [] },
      { id: 'mi_14', label: 'Privacy Policy', url: '/privacy', target: '_self', order: 4, children: [] },
      { id: 'mi_15', label: 'Terms of Use', url: '/terms', target: '_self', order: 5, children: [] },
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
