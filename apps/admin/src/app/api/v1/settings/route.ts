import { prisma, SettingCategory, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);

    const where: Prisma.SettingWhereInput = {
      siteId: site.id,
    };

    // If not authenticated admin, return only public settings
    if (!adminSession) {
      where.isPublic = true;
    }

    const settings = await prisma.setting.findMany({ where });

    const formatted: Record<string, unknown> = {};
    for (const s of settings) {
      formatted[s.key] = s.value;
    }

    return NextResponse.json({
      site: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        domain: site.domain,
        defaultLocale: site.defaultLocale,
        branding: site.branding,
      },
      settings: formatted,
    });
  } catch (err) {
    console.error('[SettingsGET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const adminSession = await getAdminSession(req);
    const guard = requirePermission(adminSession, 'settings.manage');
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { settings = {}, branding, name, domain } = body;

    // Update site core fields if present
    if (name || domain !== undefined || branding) {
      await prisma.site.update({
        where: { id: site.id },
        data: {
          name: name || site.name,
          domain: domain !== undefined ? domain : site.domain,
          branding: branding ? (branding as Prisma.InputJsonValue) : site.branding || undefined,
        },
      });
    }

    // Upsert individual settings
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { siteId_key: { siteId: site.id, key } },
        update: { value: value as Prisma.InputJsonValue },
        create: {
          siteId: site.id,
          key,
          value: value as Prisma.InputJsonValue,
          category: SettingCategory.GENERAL,
          isPublic: true,
        },
      });
    }

    await recordAuditLog({
      siteId: site.id,
      actorId: adminSession?.user.id,
      action: 'settings.update',
      entityType: 'Setting',
      metadata: { updatedKeys: Object.keys(settings) },
      req,
    });

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('[SettingsPATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
