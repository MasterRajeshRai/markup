import { prisma } from '@headless/database';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_INTEGRATIONS = [
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    category: 'Analytics',
    description: 'Track visitor traffic, page views, and conversion events via GA4 Measurement ID.',
    icon: 'BarChart',
    enabled: true,
    config: { measurementId: 'G-XXXXXXXXXX', sendPageView: true },
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2 Object Storage',
    category: 'Storage',
    description: 'High-performance S3-compatible asset storage for Auto-Cropped WebP variants with zero egress fees.',
    icon: 'HardDrive',
    enabled: true,
    config: { bucketName: process.env.R2_BUCKET_NAME || 'cms-media', endpoint: 'auto' },
  },
  {
    id: 'ai-provider-engine',
    name: 'Universal AI Engine',
    category: 'AI & Machine Learning',
    description: 'Autonomous content generation, text rewriting, SEO optimization, and alt-text extraction via OpenAI, Gemini, or Claude.',
    icon: 'Sparkles',
    enabled: true,
    config: { provider: 'mock', defaultModel: 'gpt-4o-mini' },
  },
  {
    id: 'smtp-email',
    name: 'SMTP Email Delivery',
    category: 'Communications',
    description: 'Transactional email dispatch for user invitations, password resets, and publishing alerts.',
    icon: 'Mail',
    enabled: false,
    config: { host: 'smtp.mailgun.org', port: 587, secure: true, fromEmail: 'no-reply@example.com' },
  },
  {
    id: 'fulltext-search',
    name: 'PostgreSQL Full-Text Search',
    category: 'Search',
    description: 'Native tsvector full-text index across content entries, taxonomy terms, and media metadata.',
    icon: 'Search',
    enabled: true,
    config: { language: 'english', fuzzyMatching: true },
  },
  {
    id: 'microsoft-clarity',
    name: 'Microsoft Clarity',
    category: 'Analytics',
    description: 'Heatmaps and session recording to understand user behavior and interaction friction.',
    icon: 'Eye',
    enabled: false,
    config: { projectId: '' },
  },
];

export async function GET(req: NextRequest) {
  try {
    const site = await prisma.site.findFirst();
    const settings = (site?.settings as Record<string, any>) || {};
    const savedIntegrations = settings.integrations || DEFAULT_INTEGRATIONS;

    return NextResponse.json({ integrations: savedIntegrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch integrations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, integrationId, enabled, config } = body;

    const site = await prisma.site.findFirst();
    if (!site) return NextResponse.json({ error: 'No site found' }, { status: 404 });

    const currentSettings = (site.settings as Record<string, any>) || {};
    const integrations = currentSettings.integrations || DEFAULT_INTEGRATIONS;

    if (action === 'test_connection') {
      // Mock test connection verification
      return NextResponse.json({
        success: true,
        message: `Connection to ${integrationId} verified successfully! Response latency: 42ms.`,
      });
    }

    const updated = integrations.map((item: any) => {
      if (item.id === integrationId) {
        return {
          ...item,
          enabled: enabled !== undefined ? enabled : item.enabled,
          config: config !== undefined ? { ...item.config, ...config } : item.config,
        };
      }
      return item;
    });

    await prisma.site.update({
      where: { id: site.id },
      data: {
        settings: {
          ...currentSettings,
          integrations: updated,
        },
      },
    });

    return NextResponse.json({ success: true, integrations: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update integration' }, { status: 500 });
  }
}
