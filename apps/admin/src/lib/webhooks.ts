import { prisma, Prisma } from '@headless/database';
import { signWebhookPayload } from '@headless/core';

export interface DispatchWebhookParams {
  siteId: string;
  event: string;
  payload: Record<string, unknown>;
}

/**
 * Dispatches webhooks for matching event and site
 */
export async function dispatchWebhooks(params: DispatchWebhookParams): Promise<void> {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        siteId: params.siteId,
        isActive: true,
      },
    });

    for (const webhook of webhooks) {
      const subscribedEvents = (webhook.events as string[]) || [];
      if (!subscribedEvents.includes(params.event) && !subscribedEvents.includes('*')) {
        continue;
      }

      // Execute webhook attempt asynchronously
      executeWebhookDelivery(webhook.id, webhook.url, webhook.secret, params.event, params.payload, 1).catch(
        (err) => {
          console.error(`[Webhook] Error executing delivery for ${webhook.id}:`, err);
        }
      );
    }
  } catch (err) {
    console.error('[Webhook] Failed to query webhooks for dispatch:', err);
  }
}

/**
 * Executes a single delivery attempt and records the outcome
 */
export async function executeWebhookDelivery(
  webhookId: string,
  url: string,
  secret: string,
  event: string,
  payload: Record<string, unknown>,
  attempt = 1
): Promise<boolean> {
  const jsonString = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  const signature = signWebhookPayload(jsonString, secret);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-CMS-Event': event,
    'X-CMS-Delivery-Attempt': String(attempt),
    'X-CMS-Signature': signature,
    'User-Agent': 'Markup-CMS-Webhook/1.0',
  };

  const startTime = Date.now();
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let errorMsg: string | null = null;
  let success = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: jsonString,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    responseStatus = res.status;
    const text = await res.text();
    responseBody = text.slice(0, 1000); // truncate response for storage
    success = res.ok;
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  const durationMs = Date.now() - startTime;

  // Record delivery history
  await prisma.webhookDelivery.create({
    data: {
      webhookId,
      event,
      payload: payload as Prisma.InputJsonValue,
      requestHeaders: headers as Prisma.InputJsonValue,
      responseStatus,
      responseBody,
      durationMs,
      error: errorMsg,
      attempt,
      success,
    },
  });

  // Retry with exponential backoff if failed and attempts < 3
  if (!success && attempt < 3) {
    const backoffSeconds = Math.pow(2, attempt) * 5; // 10s, 20s
    setTimeout(() => {
      executeWebhookDelivery(webhookId, url, secret, event, payload, attempt + 1).catch(() => {});
    }, backoffSeconds * 1000);
  }

  return success;
}
