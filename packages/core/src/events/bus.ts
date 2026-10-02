export type CmsEventName =
  | 'content.created'
  | 'content.updated'
  | 'content.deleted'
  | 'content.published'
  | 'content.unpublished'
  | 'content.scheduled'
  | 'media.uploaded'
  | 'media.deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'role.updated'
  | 'settings.updated';

export interface CmsEventPayload<T = unknown> {
  event: CmsEventName;
  timestamp: string;
  siteId?: string;
  actorId?: string;
  actorType?: 'USER' | 'API_KEY' | 'SYSTEM';
  data: T;
}

export type CmsEventListener<T = unknown> = (payload: CmsEventPayload<T>) => Promise<void> | void;

class CmsEventBus {
  private listeners = new Map<string, Set<CmsEventListener>>();

  /**
   * Subscribe to an event, or '*' for all events
   */
  public subscribe<T = unknown>(event: CmsEventName | '*', listener: CmsEventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as CmsEventListener);

    return () => {
      set.delete(listener as CmsEventListener);
    };
  }

  /**
   * Publish an event to all subscribers asynchronously with error isolation
   */
  public async publish<T = unknown>(
    event: CmsEventName,
    data: T,
    metadata?: { siteId?: string; actorId?: string; actorType?: 'USER' | 'API_KEY' | 'SYSTEM' }
  ): Promise<void> {
    const payload: CmsEventPayload<T> = {
      event,
      timestamp: new Date().toISOString(),
      siteId: metadata?.siteId,
      actorId: metadata?.actorId,
      actorType: metadata?.actorType || 'SYSTEM',
      data,
    };

    const specificListeners = this.listeners.get(event) || new Set();
    const wildcardListeners = this.listeners.get('*') || new Set();
    const allListeners = [...specificListeners, ...wildcardListeners];

    // Execute concurrently without crashing caller
    await Promise.allSettled(
      allListeners.map(async (listener) => {
        try {
          await listener(payload);
        } catch (err) {
          console.error(`[CmsEventBus] Error in listener for event ${event}:`, err);
        }
      })
    );
  }
}

export const eventBus = new CmsEventBus();
