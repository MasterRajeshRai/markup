import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';

interface LockRecord {
  entryId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lockedAt: number;
  lastHeartbeat: number;
}

interface ViewerRecord {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastSeen: number;
}

// In-memory locks map: entryId -> LockRecord
const LOCKS = new Map<string, LockRecord>();
// In-memory viewers map: entryId -> Map<userId, ViewerRecord>
const VIEWERS = new Map<string, Map<string, ViewerRecord>>();

const LOCK_TIMEOUT_MS = 45000; // 45s heartbeat timeout
const VIEWER_TIMEOUT_MS = 30000; // 30s viewer timeout

function cleanExpired(entryId: string) {
  const now = Date.now();
  const lock = LOCKS.get(entryId);
  if (lock && now - lock.lastHeartbeat > LOCK_TIMEOUT_MS) {
    LOCKS.delete(entryId);
  }

  const viewers = VIEWERS.get(entryId);
  if (viewers) {
    for (const [uid, v] of viewers.entries()) {
      if (now - v.lastSeen > VIEWER_TIMEOUT_MS) {
        viewers.delete(uid);
      }
    }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'content.update' });
  if (!sec.ok) return sec.response;
  const { id } = await params;
  cleanExpired(id);

  const lock = LOCKS.get(id) || null;
  const viewersMap = VIEWERS.get(id);
  const activeCollaborators = viewersMap ? Array.from(viewersMap.values()) : [];

  return NextResponse.json({
    success: true,
    isLocked: !!lock,
    lockHolder: lock
      ? {
          userId: lock.userId,
          userName: lock.userName,
          userAvatar: lock.userAvatar,
          lockedAt: new Date(lock.lockedAt).toISOString(),
          secondsRemaining: Math.max(0, Math.round((LOCK_TIMEOUT_MS - (Date.now() - lock.lastHeartbeat)) / 1000)),
        }
      : null,
    activeCollaborators,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'content.update' });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const body = await req.json();
    const { userId = 'user_current', userName = 'Alex Morgan', userAvatar, forceTakeover = false } = body;

    cleanExpired(id);

    const now = Date.now();
    const currentLock = LOCKS.get(id);

    // Register as active viewer
    if (!VIEWERS.has(id)) {
      VIEWERS.set(id, new Map());
    }
    VIEWERS.get(id)!.set(userId, { userId, userName, userAvatar, lastSeen: now });

    // Check conflict
    if (currentLock && currentLock.userId !== userId && !forceTakeover) {
      return NextResponse.json(
        {
          success: false,
          hasConflict: true,
          message: `${currentLock.userName} is currently editing this document.`,
          lockHolder: {
            userId: currentLock.userId,
            userName: currentLock.userName,
            userAvatar: currentLock.userAvatar,
            lockedAt: new Date(currentLock.lockedAt).toISOString(),
          },
        },
        { status: 423 } // Locked
      );
    }

    // Acquire or refresh lock
    const updatedLock: LockRecord = {
      entryId: id,
      userId,
      userName,
      userAvatar,
      lockedAt: currentLock && currentLock.userId === userId ? currentLock.lockedAt : now,
      lastHeartbeat: now,
    };

    LOCKS.set(id, updatedLock);

    const viewersMap = VIEWERS.get(id);
    const activeCollaborators = viewersMap ? Array.from(viewersMap.values()) : [];

    return NextResponse.json({
      success: true,
      hasConflict: false,
      lock: {
        userId: updatedLock.userId,
        userName: updatedLock.userName,
        lockedAt: new Date(updatedLock.lockedAt).toISOString(),
      },
      activeCollaborators,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update lock' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'content.update' });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'user_current';

    const currentLock = LOCKS.get(id);
    if (currentLock && currentLock.userId === userId) {
      LOCKS.delete(id);
    }

    const viewers = VIEWERS.get(id);
    if (viewers) {
      viewers.delete(userId);
    }

    return NextResponse.json({ success: true, released: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to release lock' }, { status: 500 });
  }
}
