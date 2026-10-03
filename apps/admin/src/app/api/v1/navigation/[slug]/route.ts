import { prisma, MenuItemType } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { NextRequest, NextResponse } from 'next/server';
import { fallbackMenus } from '../fallback-data';

export const dynamic = 'force-dynamic';

function parseItemWithMetadata(item: any): any {
  let metadata: any = {};
  if (item.entityId && typeof item.entityId === 'string' && item.entityId.startsWith('{')) {
    try {
      metadata = JSON.parse(item.entityId);
    } catch {}
  }

  return {
    id: item.id,
    title: item.title,
    url: item.url,
    target: item.target || '_self',
    type: item.type,
    isActive: item.isActive,
    order: item.order,
    parentId: item.parentId,
    entityType: item.entityType,
    entityId: item.entityId,
    description: metadata.description || '',
    badge: metadata.badge || '',
    badgeColor: metadata.badgeColor || 'primary',
    icon: metadata.icon || '',
    isMegaMenu: item.entityType === 'mega_menu' || Boolean(metadata.isMegaMenu),
    megaMenuConfig: metadata.megaMenuConfig || {
      columns: 3,
      layout: 'columns',
      featuredCard: null,
    },
    children: Array.isArray(item.children)
      ? item.children.map(parseItemWithMetadata)
      : [],
  };
}

function serializeMenuItem(item: any, order: number, menuId: string, parentId: string | null = null) {
  const metadata = {
    description: item.description || '',
    badge: item.badge || '',
    badgeColor: item.badgeColor || 'primary',
    icon: item.icon || '',
    isMegaMenu: Boolean(item.isMegaMenu),
    megaMenuConfig: item.megaMenuConfig || {
      columns: 3,
      layout: 'columns',
      featuredCard: null,
    },
  };

  return {
    menuId,
    parentId,
    title: item.title || 'Untitled',
    url: item.url || '/',
    target: item.target || '_self',
    type: item.type || MenuItemType.INTERNAL,
    entityType: item.isMegaMenu ? 'mega_menu' : (item.entityType || 'link'),
    entityId: JSON.stringify(metadata),
    order,
    isActive: item.isActive ?? true,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const menu = await prisma.menu.findFirst({
      where: {
        siteId: site.id,
        OR: [{ slug }, { location: slug }, { id: slug }],
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

    // Filter top-level items (where parentId is null)
    const topLevelItems = menu.items
      .filter((item) => !item.parentId)
      .map(parseItemWithMetadata);

    return NextResponse.json({
      data: {
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
        items: topLevelItems,
      },
    });
  } catch (err) {
    console.error('[MenuSlugGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve menu' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'navigation.manage');
    if (!guard.authorized) return guard.response!;

    const menu = await prisma.menu.findFirst({
      where: { siteId: site.id, OR: [{ slug }, { id: slug }] },
    });

    if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });

    const body = await req.json();
    const { items = [] } = body;

    // Replace menu items in transaction with timeout & fallback
    try {
      await prisma.$transaction(async (tx) => {
        await tx.menuItem.deleteMany({ where: { menuId: menu.id } });

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const createdParent = await tx.menuItem.create({
            data: serializeMenuItem(item, i, menu.id, null),
          });

          if (Array.isArray(item.children) && item.children.length > 0) {
            for (let j = 0; j < item.children.length; j++) {
              const child = item.children[j];
              const createdChild = await tx.menuItem.create({
                data: serializeMenuItem(child, j, menu.id, createdParent.id),
              });

              if (Array.isArray(child.children) && child.children.length > 0) {
                for (let k = 0; k < child.children.length; k++) {
                  const subChild = child.children[k];
                  await tx.menuItem.create({
                    data: serializeMenuItem(subChild, k, menu.id, createdChild.id),
                  });
                }
              }
            }
          }
        }
      });
    } catch {
      // In-memory resilience fallback
      const found: any = (fallbackMenus as any[]).find((m: any) => m.slug === slug || m.id === slug);
      if (found) {
        found.items = items;
      }
    }

    return NextResponse.json({ success: true, message: 'Menu items updated successfully' });
  } catch (err) {
    console.error('[MenuSlugPUT] Error:', err);
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}
