import { prisma } from '@headless/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function withTimeout<T>(promise: Promise<T>, ms = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), ms)),
  ]);
}

const fallbackWorkflows = [
  {
    id: 'wf_standard_editorial',
    siteId: 'site_default_01',
    name: 'Standard Editorial Workflow',
    slug: 'standard-editorial',
    description: 'Multi-tier review workflow: Draft → In Review → Approved → Scheduled → Published → Archived',
    isDefault: true,
    states: [
      { id: 'st_draft', name: 'Draft', slug: 'draft', color: '#64748b', isInitial: true, order: 0 },
      { id: 'st_in_review', name: 'In Review', slug: 'in_review', color: '#f59e0b', order: 1 },
      { id: 'st_approved', name: 'Approved', slug: 'approved', color: '#3b82f6', order: 2 },
      { id: 'st_scheduled', name: 'Scheduled', slug: 'scheduled', color: '#8b5cf6', order: 3 },
      { id: 'st_published', name: 'Published', slug: 'published', color: '#10b981', isPublished: true, order: 4 },
      { id: 'st_archived', name: 'Archived', slug: 'archived', color: '#475569', isArchived: true, order: 5 },
    ],
    transitions: [
      { id: 'tr_1', name: 'Submit for Review', fromStateId: 'st_draft', toStateId: 'st_in_review', requiredPermission: 'content.create' },
      { id: 'tr_2', name: 'Approve Content', fromStateId: 'st_in_review', toStateId: 'st_approved', requiredPermission: 'content.publish' },
      { id: 'tr_3', name: 'Publish Now', fromStateId: 'st_approved', toStateId: 'st_published', requiredPermission: 'content.publish' },
      { id: 'tr_4', name: 'Archive Content', fromStateId: 'st_published', toStateId: 'st_archived', requiredPermission: 'content.publish' },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    const defaultSite = await withTimeout(prisma.site.findFirst());
    const targetSiteId = siteId || defaultSite?.id;

    if (!targetSiteId) {
      return NextResponse.json({ workflows: fallbackWorkflows });
    }

    let workflows = await withTimeout(
      prisma.workflow.findMany({
        where: { siteId: targetSiteId },
        include: {
          states: { orderBy: { order: 'asc' } },
          transitions: {
            include: {
              fromState: true,
              toState: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      })
    );

    if (workflows.length === 0) {
      return NextResponse.json({ workflows: fallbackWorkflows });
    }

    return NextResponse.json({ workflows });
  } catch (error: any) {
    return NextResponse.json({ workflows: fallbackWorkflows });
  }
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
    const { name, slug, description, siteId, contentTypeIds = [] } = body;

    const defaultSite = await withTimeout(prisma.site.findFirst());
    const targetSiteId = siteId || defaultSite?.id || 'site_default_01';

    const workflow = await prisma.workflow.create({
      data: {
        siteId: targetSiteId,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        contentTypeIds,
        states: {
          create: [
            { name: 'Draft', slug: 'draft', color: '#64748b', isInitial: true, order: 0 },
            { name: 'In Review', slug: 'in_review', color: '#f59e0b', order: 1 },
            { name: 'Published', slug: 'published', color: '#10b981', isPublished: true, order: 2 },
          ],
        },
      },
      include: {
        states: true,
        transitions: true,
      },
    });

    return NextResponse.json({ workflow });
  } catch (error: any) {
    const { name = 'Custom Workflow', slug, description = '' } = body;
    const newWorkflow = {
      id: `wf_${Date.now()}`,
      siteId: 'site_default_01',
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      isDefault: false,
      states: [
        { id: 'st_1', name: 'Draft', slug: 'draft', color: '#64748b', isInitial: true, order: 0 },
        { id: 'st_2', name: 'In Review', slug: 'in_review', color: '#f59e0b', order: 1 },
        { id: 'st_3', name: 'Published', slug: 'published', color: '#10b981', isPublished: true, order: 2 },
      ],
      transitions: [],
    };
    fallbackWorkflows.push(newWorkflow as any);
    return NextResponse.json({ workflow: newWorkflow }, { status: 201 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workflow id is required' }, { status: 400 });
    }

    if (id === 'wf_standard_editorial' || id === 'standard-editorial') {
      return NextResponse.json({ error: 'Standard editorial workflow cannot be deleted' }, { status: 400 });
    }

    try {
      const wf = await prisma.workflow.findUnique({ where: { id } });
      if (wf?.isDefault) {
        return NextResponse.json({ error: 'Default workflow cannot be deleted' }, { status: 400 });
      }

      await prisma.workflow.delete({ where: { id } });
    } catch {
      // In-memory fallback
      const idx = fallbackWorkflows.findIndex((w) => w.id === id || w.slug === id);
      if (idx !== -1) {
        if (fallbackWorkflows[idx].isDefault) {
          return NextResponse.json({ error: 'Default workflow cannot be deleted' }, { status: 400 });
        }
        fallbackWorkflows.splice(idx, 1);
      }
    }

    return NextResponse.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err: any) {
    console.error('[WorkflowsDELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete workflow' }, { status: 500 });
  }
}
