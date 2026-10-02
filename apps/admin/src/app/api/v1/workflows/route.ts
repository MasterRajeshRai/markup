import { prisma } from '@headless/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    const defaultSite = await prisma.site.findFirst();
    const targetSiteId = siteId || defaultSite?.id;

    if (!targetSiteId) {
      return NextResponse.json({ workflows: [] });
    }

    let workflows = await prisma.workflow.findMany({
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
    });

    // If no workflow exists yet, seed the default enterprise editorial workflow
    if (workflows.length === 0) {
      const defaultWorkflow = await prisma.workflow.create({
        data: {
          siteId: targetSiteId,
          name: 'Standard Editorial Workflow',
          slug: 'standard-editorial',
          description: 'Multi-tier review workflow: Draft → In Review → Approved → Scheduled → Published → Archived',
          isDefault: true,
          states: {
            create: [
              { name: 'Draft', slug: 'draft', color: '#64748b', isInitial: true, order: 0 },
              { name: 'In Review', slug: 'in_review', color: '#f59e0b', order: 1 },
              { name: 'Approved', slug: 'approved', color: '#3b82f6', order: 2 },
              { name: 'Scheduled', slug: 'scheduled', color: '#8b5cf6', order: 3 },
              { name: 'Published', slug: 'published', color: '#10b981', isPublished: true, order: 4 },
              { name: 'Archived', slug: 'archived', color: '#475569', isArchived: true, order: 5 },
            ],
          },
        },
        include: {
          states: true,
        },
      });

      // Create transitions
      const stateMap = new Map(defaultWorkflow.states.map((s) => [s.slug, s.id]));

      if (stateMap.has('draft') && stateMap.has('in_review')) {
        await prisma.workflowTransition.create({
          data: {
            workflowId: defaultWorkflow.id,
            fromStateId: stateMap.get('draft')!,
            toStateId: stateMap.get('in_review')!,
            name: 'Submit for Review',
            requiredPermission: 'content.create',
          },
        });
      }

      if (stateMap.has('in_review') && stateMap.has('approved')) {
        await prisma.workflowTransition.create({
          data: {
            workflowId: defaultWorkflow.id,
            fromStateId: stateMap.get('in_review')!,
            toStateId: stateMap.get('approved')!,
            name: 'Approve Content',
            requiredPermission: 'content.publish',
          },
        });
      }

      if (stateMap.has('approved') && stateMap.has('published')) {
        await prisma.workflowTransition.create({
          data: {
            workflowId: defaultWorkflow.id,
            fromStateId: stateMap.get('approved')!,
            toStateId: stateMap.get('published')!,
            name: 'Publish Now',
            requiredPermission: 'content.publish',
          },
        });
      }

      if (stateMap.has('published') && stateMap.has('archived')) {
        await prisma.workflowTransition.create({
          data: {
            workflowId: defaultWorkflow.id,
            fromStateId: stateMap.get('published')!,
            toStateId: stateMap.get('archived')!,
            name: 'Archive Content',
            requiredPermission: 'content.publish',
          },
        });
      }

      // Re-fetch
      workflows = await prisma.workflow.findMany({
        where: { id: defaultWorkflow.id },
        include: {
          states: { orderBy: { order: 'asc' } },
          transitions: {
            include: {
              fromState: true,
              toState: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ workflows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, siteId, contentTypeIds = [] } = body;

    const defaultSite = await prisma.site.findFirst();
    const targetSiteId = siteId || defaultSite?.id;

    if (!targetSiteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

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
    return NextResponse.json({ error: error.message || 'Failed to create workflow' }, { status: 500 });
  }
}
