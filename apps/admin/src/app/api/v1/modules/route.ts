import { NextRequest, NextResponse } from 'next/server';
import { resolveSiteContext } from '@/lib/site-context';
import {
  getAllModules,
  setModuleEnabled,
  bulkSetModules,
} from '@/lib/modules-service';
import { recordAuditLog } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    const modules = await getAllModules(siteId);

    const counts = {
      total: modules.length,
      active: modules.filter((m) => m.enabled).length,
      inactive: modules.filter((m) => !m.enabled).length,
      core: modules.filter((m) => m.isCore).length,
    };

    const categories = Array.from(new Set(modules.map((m) => m.category))).map((cat) => {
      const match = modules.find((m) => m.category === cat);
      return {
        id: cat,
        label: match?.categoryLabel || cat,
        count: modules.filter((m) => m.category === cat).length,
        activeCount: modules.filter((m) => m.category === cat && m.enabled).length,
      };
    });

    return NextResponse.json({
      success: true,
      data: modules,
      counts,
      categories,
    });
  } catch (err) {
    console.error('[ModulesGET] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const site = await resolveSiteContext(req);
    const siteId = site?.id || 'site_default_01';

    let adminSession: any = null;
    try {
      adminSession = await getAdminSession(req);
    } catch {
      adminSession = null;
    }

    const body = await req.json();

    // Single module toggle
    if (body.moduleId && typeof body.enabled === 'boolean') {
      const updated = await setModuleEnabled(body.moduleId, body.enabled, siteId);

      recordAuditLog({
        siteId,
        actorId: adminSession?.user?.id,
        action: body.enabled ? 'module.enable' : 'module.disable',
        entityType: 'Module',
        entityId: body.moduleId,
        metadata: {
          moduleName: updated.name,
          enabled: body.enabled,
        },
        req,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Module "${updated.name}" has been ${body.enabled ? 'activated' : 'deactivated'}.`,
      });
    }

    // Bulk modules update
    if (body.states && typeof body.states === 'object') {
      const updatedList = await bulkSetModules(body.states, siteId);

      recordAuditLog({
        siteId,
        actorId: adminSession?.user?.id,
        action: 'module.bulk_update',
        entityType: 'Module',
        entityId: 'all',
        metadata: {
          updatedCount: Object.keys(body.states).length,
        },
        req,
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        data: updatedList,
        message: 'Modules state updated successfully.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid payload. Provide { moduleId, enabled } or { states }.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('[ModulesPATCH] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update module state' },
      { status: 500 }
    );
  }
}
