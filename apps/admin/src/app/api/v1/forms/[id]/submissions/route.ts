import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/security/guard';
import { RATE_LIMITS } from '@/lib/security/rate-limit';

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  status: 'NEW' | 'REVIEWED' | 'SPAM' | 'ARCHIVED';
  ipAddress: string;
  userAgent: string;
  referrer: string;
  createdAt: string;
}

let MOCK_SUBMISSIONS: Record<string, FormSubmission[]> = {
  form_contact: [
    {
      id: 'sub_1',
      formId: 'form_contact',
      data: {
        fullName: 'David K. Vance',
        workEmail: 'dvance@cloudscale.net',
        company: 'CloudScale Infrastructure',
        planInterest: 'Self-Hosted Enterprise',
        message: 'Looking to migrate 45,000 articles from WordPress to Headless CMS with custom block components and Cloudflare R2 image pipeline.',
      },
      status: 'NEW',
      ipAddress: '192.0.2.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      referrer: 'https://google.com/search?q=best+headless+cms',
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    },
    {
      id: 'sub_2',
      formId: 'form_contact',
      data: {
        fullName: 'Evelyn Reed',
        workEmail: 'ereed@fintechventures.io',
        company: 'Fintech Ventures Global',
        planInterest: 'Cloud Multi-Region',
        message: 'Need high-throughput multi-language i18n support and automated SEO scoring for financial compliance articles.',
      },
      status: 'NEW',
      ipAddress: '198.51.100.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      referrer: 'https://news.ycombinator.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'sub_3',
      formId: 'form_contact',
      data: {
        fullName: 'Tyler Henderson',
        workEmail: 'tyler@growthflow.co',
        company: 'GrowthFlow Marketing',
        planInterest: 'Dedicated Cluster',
        message: 'We require webhooks on comment approval and form submission to sync with our HubSpot CRM.',
      },
      status: 'REVIEWED',
      ipAddress: '203.0.113.88',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1)',
      referrer: 'https://twitter.com/dev/status/1789',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  ],
  form_newsletter: [
    {
      id: 'sub_nl_1',
      formId: 'form_newsletter',
      data: {
        email: 'dev_alex@github.com',
        primaryRole: 'Frontend Architect',
      },
      status: 'REVIEWED',
      ipAddress: '192.0.2.100',
      userAgent: 'Mozilla/5.0',
      referrer: 'https://acmecms.io/blog',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
  form_demo: [
    {
      id: 'sub_demo_1',
      formId: 'form_demo',
      data: {
        name: 'Rachel Sterling',
        email: 'rachel@sterlingtech.de',
        phone: '+49 89 123456',
        notes: 'Interested in evaluating DAM auto-cropping and Rank Markup SEO features for our publishing portal.',
      },
      status: 'NEW',
      ipAddress: '198.51.100.99',
      userAgent: 'Mozilla/5.0',
      referrer: 'https://linkedin.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'forms.read' });
  if (!sec.ok) return sec.response;
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') || 'ALL';
  const query = (searchParams.get('q') || '').toLowerCase();

  const list = MOCK_SUBMISSIONS[id] || [];

  const filtered = list.filter((sub) => {
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (query) {
      const serialized = JSON.stringify(sub.data).toLowerCase();
      if (!serialized.includes(query)) return false;
    }
    return true;
  });

  return NextResponse.json({
    success: true,
    submissions: filtered,
    total: list.length,
    unreadCount: list.filter((s) => s.status === 'NEW').length,
  });
}

// Public Submission Endpoint
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { public: true, rate: RATE_LIMITS.publicWrite });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const body = await req.json();

    // Anti-spam Honeypot Check: if invisible honeypot field is filled, silently mark as SPAM
    const isSpam = Boolean(body._honeypot || body.website_url_hp);
    delete body._honeypot;
    delete body.website_url_hp;

    const newSub: FormSubmission = {
      id: `sub_${Date.now()}`,
      formId: id,
      data: body,
      status: isSpam ? 'SPAM' : 'NEW',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Unknown',
      referrer: req.headers.get('referer') || '',
      createdAt: new Date().toISOString(),
    };

    if (!MOCK_SUBMISSIONS[id]) {
      MOCK_SUBMISSIONS[id] = [];
    }
    MOCK_SUBMISSIONS[id].unshift(newSub);

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully.',
      submissionId: newSub.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit form' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sec = await guard(req, { permission: 'forms.manage' });
  if (!sec.ok) return sec.response;
  try {
    const { id } = await params;
    const body = await req.json();
    const { submissionId, status } = body;

    const list = MOCK_SUBMISSIONS[id] || [];
    const target = list.find((s) => s.id === submissionId);
    if (!target) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    target.status = status;

    return NextResponse.json({ success: true, submission: target });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update submission' }, { status: 500 });
  }
}
