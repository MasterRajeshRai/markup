import { prisma, ActorType, Prisma } from '@headless/database';
import { NextRequest } from 'next/server';

export interface RecordAuditParams {
  siteId?: string;
  actorId?: string;
  actorType?: ActorType;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  req?: NextRequest | Request;
}

/**
 * Creates an immutable audit log entry
 */
export async function recordAuditLog(params: RecordAuditParams): Promise<void> {
  try {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (params.req) {
      if (params.req.headers instanceof Headers) {
        ipAddress =
          params.req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          params.req.headers.get('x-real-ip') ||
          undefined;
        userAgent = params.req.headers.get('user-agent') || undefined;
      }
    }

    await prisma.auditLog.create({
      data: {
        siteId: params.siteId,
        actorId: params.actorId,
        actorType: params.actorType || ActorType.USER,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        ipAddress,
        userAgent,
        metadata: (params.metadata || {}) as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}
