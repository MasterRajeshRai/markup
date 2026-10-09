import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailSettings,
  updateEmailSettings,
  getEmailTemplates,
  getEmailDeliveryLogs,
  sendEmail,
} from '@/lib/email-service';
import { guard } from '@/lib/security/guard';

export async function GET(request: NextRequest) {
  const sec = await guard(request, { permission: 'email.manage' });
  if (!sec.ok) return sec.response;
  try {
    const settings = await getEmailSettings();
    const templates = await getEmailTemplates();
    const logs = await getEmailDeliveryLogs();

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 6)}...${settings.apiKey.slice(-4)}` : '',
        hasApiKey: Boolean(settings.apiKey),
      },
      templates,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const sec = await guard(request, { permission: 'email.manage' });
  if (!sec.ok) return sec.response;
  try {
    const body = await request.json();
    const updated = await updateEmailSettings(body);

    return NextResponse.json({
      success: true,
      settings: {
        ...updated,
        apiKey: updated.apiKey ? `${updated.apiKey.substring(0, 6)}...${updated.apiKey.slice(-4)}` : '',
        hasApiKey: Boolean(updated.apiKey),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sec = await guard(request, { permission: 'email.manage' });
  if (!sec.ok) return sec.response;
  try {
    const body = await request.json();
    if (!body.to || !body.subject) {
      return NextResponse.json({ success: false, error: 'Recipient and subject are required.' }, { status: 400 });
    }

    const res = await sendEmail(body);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const PATCH = PUT;
