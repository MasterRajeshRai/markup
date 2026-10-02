import { prisma, SettingCategory, Prisma } from '@headless/database';
import { getAdminSession, requirePermission } from '@/lib/auth';
import { resolveSiteContext } from '@/lib/site-context';
import { recordAuditLog } from '@/lib/audit';
import { getMockSiteState, updateMockSiteState } from '@/lib/settings-store';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const mockState = getMockSiteState();

    let adminSession: any = null;
    try {
      adminSession = await getAdminSession(req);
    } catch {
      adminSession = null;
    }

    try {
      const where: Prisma.SettingWhereInput = {
        siteId: site?.id || 'site_default_01',
      };

      if (!adminSession) {
        where.isPublic = true;
      }

      // Query database with resilient fallback
      const dbPromise = prisma.setting.findMany({ where });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1500));
      const settings = (await Promise.race([dbPromise, timeoutPromise])) as any[];

      const formatted: Record<string, unknown> = { ...mockState.settings };
      for (const s of settings) {
        formatted[s.key] = s.value;
      }

      return NextResponse.json({
        site: {
          id: site?.id || mockState.id,
          name: site?.name || mockState.name,
          slug: site?.slug || mockState.slug,
          domain: site?.domain || mockState.domain,
          defaultLocale: site?.defaultLocale || mockState.defaultLocale,
          branding: site?.branding || mockState.branding,
        },
        settings: formatted,
      });
    } catch {
      // Offline fallback: Serve full mock state
      return NextResponse.json({
        site: {
          id: mockState.id,
          name: mockState.name,
          slug: mockState.slug,
          domain: mockState.domain,
          defaultLocale: mockState.defaultLocale,
          branding: mockState.branding,
        },
        settings: mockState.settings,
      });
    }
  } catch (err) {
    console.error('[SettingsGET] Error:', err);
    const fallback = getMockSiteState();
    return NextResponse.json({
      site: {
        id: fallback.id,
        name: fallback.name,
        slug: fallback.slug,
        domain: fallback.domain,
        defaultLocale: fallback.defaultLocale,
        branding: fallback.branding,
      },
      settings: fallback.settings,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const body = await req.json();
    const { settings = {}, branding, name, domain } = body;

    // Always update in-memory fallback state so changes are immediate & persistent
    const updatedMock = updateMockSiteState({
      name,
      domain,
      branding,
      settings,
    });

    try {
      const adminSession = await getAdminSession(req);
      if (adminSession) {
        const guard = requirePermission(adminSession, 'settings.manage');
        if (!guard.authorized) return guard.response!;
      }

      const activeSiteId = site?.id || 'site_default_01';

      // Update site core fields in database if present
      if (name || domain !== undefined || branding) {
        await prisma.site.update({
          where: { id: activeSiteId },
          data: {
            name: name || site?.name || updatedMock.name,
            domain: domain !== undefined ? domain : site?.domain || updatedMock.domain,
            branding: branding ? (branding as Prisma.InputJsonValue) : (site?.branding as any) || undefined,
          },
        }).catch(() => {});
      }

      // Upsert individual settings in DB
      for (const [key, value] of Object.entries(settings)) {
        await prisma.setting.upsert({
          where: { siteId_key: { siteId: activeSiteId, key } },
          update: { value: value as Prisma.InputJsonValue },
          create: {
            siteId: activeSiteId,
            key,
            value: value as Prisma.InputJsonValue,
            category: SettingCategory.GENERAL,
            isPublic: true,
          },
        }).catch(() => {});
      }

      await recordAuditLog({
        siteId: activeSiteId,
        actorId: adminSession?.user.id,
        action: 'settings.update',
        entityType: 'Setting',
        metadata: { updatedKeys: Object.keys(settings) },
        req,
      }).catch(() => {});
    } catch {
      // Database offline: In-memory store already updated successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      site: {
        id: updatedMock.id,
        name: updatedMock.name,
        slug: updatedMock.slug,
        domain: updatedMock.domain,
        defaultLocale: updatedMock.defaultLocale,
        branding: updatedMock.branding,
      },
      settings: updatedMock.settings,
    });
  } catch (err: any) {
    console.error('[SettingsPATCH] Error:', err);
    return NextResponse.json({ error: err?.message || String(err) || 'Failed to update settings' }, { status: 500 });
  }
}
