import { prisma } from '@headless/database';

export interface EmailSettings {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  sandboxMode: boolean;
  webhookSecret?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  previewText: string;
  category: 'newsletter' | 'auth' | 'editorial' | 'system' | 'lead';
  htmlBody: string;
  textBody?: string;
  variables: string[]; // e.g. ["recipientName", "siteName", "actionUrl"]
}

export interface EmailDeliveryLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'SIMULATED';
  templateSlug?: string;
  resendId?: string;
  error?: string;
  sentAt: string;
  metadata?: Record<string, any>;
}

// In-memory fallback stores for offline database resilience
let MOCK_EMAIL_SETTINGS: EmailSettings = {
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'notifications@updates.headless-cms.io',
  fromName: 'Headless CMS Platform',
  replyTo: 'support@headless-cms.io',
  sandboxMode: !process.env.RESEND_API_KEY,
  webhookSecret: '',
};

let MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_welcome_newsletter',
    name: 'Newsletter Welcome & Confirmation',
    slug: 'newsletter-welcome',
    subject: 'Welcome to the {{siteName}} Newsletter!',
    previewText: 'Thank you for joining our community. Here is what to expect.',
    category: 'newsletter',
    variables: ['subscriberName', 'siteName', 'unsubscribeUrl', 'currentYear'],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
    .button-wrap { text-align: center; margin: 28px 0; }
    .button { background: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; }
    .footer { padding: 20px 28px; background: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{siteName}}</h1>
    </div>
    <div class="body">
      <h2>Welcome aboard, {{subscriberName}}! 👋</h2>
      <p>Thank you for subscribing to our official newsletter. You are now first in line to receive our deep-dive engineering articles, product updates, and industry analysis.</p>
      <div class="button-wrap">
        <a href="https://headless-cms.io" class="button">Explore Recent Articles</a>
      </div>
      <p>If you have any questions or feedback, simply reply directly to this email—we read and respond to every note.</p>
      <p>Cheers,<br><strong>The {{siteName}} Editorial Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{siteName}}. All rights reserved.</p>
      <p>You received this email because you subscribed on our website. <a href="{{unsubscribeUrl}}">Unsubscribe anytime</a>.</p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'tpl_content_published',
    name: 'New Article Published Alert',
    slug: 'content-published',
    subject: 'New Post: {{articleTitle}}',
    previewText: '{{articleSummary}}',
    category: 'editorial',
    variables: ['articleTitle', 'articleSummary', 'articleUrl', 'authorName', 'siteName', 'unsubscribeUrl'],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; }
    .tag { display: inline-block; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; }
    h1 { font-size: 24px; margin: 16px 0 8px; line-height: 1.3; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
    .summary { font-size: 15px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="tag">New Publication</span>
    <h1>{{articleTitle}}</h1>
    <div class="meta">By {{authorName}} &bull; Published on {{siteName}}</div>
    <p class="summary">{{articleSummary}}</p>
    <a href="{{articleUrl}}" class="btn">Read Full Article &rarr;</a>
  </div>
</body>
</html>`,
  },
  {
    id: 'tpl_inbound_lead',
    name: 'Inbound Form Submission Notification',
    slug: 'form-lead-notification',
    subject: 'New Lead Submission: {{formName}} ({{senderName}})',
    previewText: 'A new submission was received on {{formName}}.',
    category: 'lead',
    variables: ['formName', 'senderName', 'senderEmail', 'submittedFields', 'adminInboxUrl'],
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; }
    .badge { background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
    h2 { font-size: 20px; margin: 12px 0; }
    .info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 13px; line-height: 1.7; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Inbound Form Lead</span>
    <h2>New Lead Captured on {{formName}}</h2>
    <p>A new visitor inquiry has been captured and validated by anti-spam honeypot guards:</p>
    <div class="info">
      <div><strong>Sender:</strong> {{senderName}} &lt;{{senderEmail}}&gt;</div>
      <div style="margin-top: 8px;"><strong>Submitted Data:</strong><br>{{submittedFields}}</div>
    </div>
    <a href="{{adminInboxUrl}}" class="btn">View in Submissions Inbox &rarr;</a>
  </div>
</body>
</html>`,
  },
  {
    id: 'tpl_test_ping',
    name: 'Resend Connection & Domain Test',
    slug: 'system-test-ping',
    subject: 'Resend Email Gateway Verification Ping',
    previewText: 'Your Headless CMS email infrastructure is fully operational.',
    category: 'system',
    variables: ['timestamp', 'senderDomain', 'resendEnvironment'],
    htmlBody: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background: #f8fafc; padding: 30px; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; text-align: center;">
    <div style="width: 48px; height: 48px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 24px; line-height: 48px; margin: 0 auto 16px;">✓</div>
    <h2 style="margin: 0 0 8px;">Email Gateway Verified</h2>
    <p style="font-size: 14px; color: #64748b; line-height: 1.5;">This message confirms that your Headless CMS Resend API integration and sender domain credentials are authenticated and active.</p>
    <div style="background: #f1f5f9; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; color: #334155; margin-top: 20px; text-align: left;">
      <div><strong>Dispatched:</strong> {{timestamp}}</div>
      <div><strong>Domain:</strong> {{senderDomain}}</div>
      <div><strong>Mode:</strong> {{resendEnvironment}}</div>
    </div>
  </div>
</body>
</html>`,
  },
];

let MOCK_DELIVERY_LOGS: EmailDeliveryLog[] = [
  {
    id: 'log_901',
    to: 'alex.dev@enterprise-example.com',
    from: 'Headless CMS <notifications@updates.headless-cms.io>',
    subject: 'Welcome to the Headless CMS Newsletter!',
    status: 'DELIVERED',
    templateSlug: 'newsletter-welcome',
    resendId: 'msg_01JB37X8QZ9K24H93M01',
    sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    metadata: { subscriberId: 'sub_1' },
  },
  {
    id: 'log_902',
    to: 'lead.sarah@acme-corp.com',
    from: 'Headless CMS <notifications@updates.headless-cms.io>',
    subject: 'New Lead Submission: Enterprise Inquiries (Sarah Jenkins)',
    status: 'DELIVERED',
    templateSlug: 'form-lead-notification',
    resendId: 'msg_01JB36Y1PL7M48N19Q02',
    sentAt: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
    metadata: { formId: 'form_enterprise' },
  },
  {
    id: 'log_903',
    to: 'editorial-team@company.internal',
    from: 'Headless CMS <notifications@updates.headless-cms.io>',
    subject: 'New Post: Getting Started with Headless Architecture',
    status: 'SENT',
    templateSlug: 'content-published',
    resendId: 'msg_01JB35Z9RK3A12T88P03',
    sentAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    metadata: { articleId: 'art_1' },
  },
];

/**
 * Retrieves the current Resend email configuration.
 */
export async function getEmailSettings(siteId?: string): Promise<EmailSettings> {
  try {
    if (siteId) {
      const setting = await prisma.setting.findFirst({
        where: { siteId, key: 'resend_email_settings' },
      });
      if (setting && setting.value && typeof setting.value === 'object') {
        MOCK_EMAIL_SETTINGS = {
          ...MOCK_EMAIL_SETTINGS,
          ...(setting.value as Partial<EmailSettings>),
        };
      }
    }
  } catch {
    // Database offline resilience fallback
  }

  return { ...MOCK_EMAIL_SETTINGS };
}

/**
 * Updates the Resend email configuration.
 */
export async function updateEmailSettings(
  settings: Partial<EmailSettings>,
  siteId?: string
): Promise<EmailSettings> {
  MOCK_EMAIL_SETTINGS = {
    ...MOCK_EMAIL_SETTINGS,
    ...settings,
  };

  try {
    if (siteId) {
      await prisma.setting.upsert({
        where: { siteId_key: { siteId, key: 'resend_email_settings' } },
        create: {
          siteId,
          key: 'resend_email_settings',
          value: MOCK_EMAIL_SETTINGS as any,
          category: 'EMAIL',
          isPublic: false,
        },
        update: {
          value: MOCK_EMAIL_SETTINGS as any,
        },
      });
    }
  } catch {
    // Offline resilience
  }

  return { ...MOCK_EMAIL_SETTINGS };
}

/**
 * Returns all configured email templates.
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return [...MOCK_TEMPLATES];
}

/**
 * Returns outbound email delivery logs.
 */
export async function getEmailDeliveryLogs(): Promise<EmailDeliveryLog[]> {
  return [...MOCK_DELIVERY_LOGS];
}

/**
 * Dispatches an email via Resend API (or records to simulator if sandbox/no key).
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  templateSlug?: string;
  variables?: Record<string, string>;
  siteId?: string;
}): Promise<{ success: boolean; id?: string; simulated: boolean; error?: string }> {
  const settings = await getEmailSettings(options.siteId);
  const toList = Array.isArray(options.to) ? options.to : [options.to];
  const toRecipient = toList.join(', ');

  let finalHtml = options.html || '';
  let finalSubject = options.subject;

  // If a templateSlug is provided, interpolate variables
  if (options.templateSlug) {
    const tpl = MOCK_TEMPLATES.find((t) => t.slug === options.templateSlug);
    if (tpl) {
      finalHtml = tpl.htmlBody;
      finalSubject = tpl.subject;
      if (options.variables) {
        for (const [key, val] of Object.entries(options.variables)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          finalHtml = finalHtml.replace(regex, val);
          finalSubject = finalSubject.replace(regex, val);
        }
      }
    }
  } else if (options.variables) {
    for (const [key, val] of Object.entries(options.variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      finalHtml = finalHtml.replace(regex, val);
      finalSubject = finalSubject.replace(regex, val);
    }
  }

  const sender = options.from || `${settings.fromName} <${settings.fromEmail}>`;
  const replyTo = options.replyTo || settings.replyTo;

  // If no Resend API key is provided or sandbox mode is enabled, record simulated delivery
  if (!settings.apiKey || settings.sandboxMode) {
    const simLog: EmailDeliveryLog = {
      id: `log_sim_${Date.now()}`,
      to: toRecipient,
      from: sender,
      subject: finalSubject,
      status: 'SIMULATED',
      templateSlug: options.templateSlug,
      resendId: `sim_${Math.random().toString(36).substring(2, 11)}`,
      sentAt: new Date().toISOString(),
    };
    MOCK_DELIVERY_LOGS.unshift(simLog);
    if (MOCK_DELIVERY_LOGS.length > 100) MOCK_DELIVERY_LOGS.pop();

    return {
      success: true,
      id: simLog.resendId,
      simulated: true,
    };
  }

  // Live Resend API Call
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey.trim()}`,
      },
      body: JSON.stringify({
        from: sender,
        to: toList,
        subject: finalSubject,
        html: finalHtml,
        text: options.text,
        reply_to: replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `Resend HTTP ${response.status}`;
      const failLog: EmailDeliveryLog = {
        id: `log_err_${Date.now()}`,
        to: toRecipient,
        from: sender,
        subject: finalSubject,
        status: 'FAILED',
        error: errorMsg,
        templateSlug: options.templateSlug,
        sentAt: new Date().toISOString(),
      };
      MOCK_DELIVERY_LOGS.unshift(failLog);
      return { success: false, simulated: false, error: errorMsg };
    }

    const successLog: EmailDeliveryLog = {
      id: `log_${Date.now()}`,
      to: toRecipient,
      from: sender,
      subject: finalSubject,
      status: 'DELIVERED',
      resendId: data.id,
      templateSlug: options.templateSlug,
      sentAt: new Date().toISOString(),
    };
    MOCK_DELIVERY_LOGS.unshift(successLog);
    if (MOCK_DELIVERY_LOGS.length > 100) MOCK_DELIVERY_LOGS.pop();

    return {
      success: true,
      id: data.id,
      simulated: false,
    };
  } catch (err: any) {
    const failLog: EmailDeliveryLog = {
      id: `log_net_${Date.now()}`,
      to: toRecipient,
      from: sender,
      subject: finalSubject,
      status: 'FAILED',
      error: err.message || 'Network error communicating with Resend',
      templateSlug: options.templateSlug,
      sentAt: new Date().toISOString(),
    };
    MOCK_DELIVERY_LOGS.unshift(failLog);
    return { success: false, simulated: false, error: err.message };
  }
}
