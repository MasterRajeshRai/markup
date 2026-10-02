import { NextRequest, NextResponse } from 'next/server';
import { unsubscribePublic } from '@/lib/newsletter-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (email) {
    await unsubscribePublic(email);
  }

  // Return a friendly HTML confirmation page
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unsubscribed Successfully</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
    .card { background: #fff; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 440px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    h1 { font-size: 20px; margin: 0 0 12px; color: #0f172a; }
    p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 24px; }
    a { display: inline-block; background: #0f172a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 32px; margin-bottom: 12px;">👋</div>
    <h1>You have been unsubscribed</h1>
    <p>We have removed <strong>${email || 'your email'}</strong> from our newsletter mailing list. You won't receive future broadcast updates from us.</p>
    <a href="/">Return to Homepage</a>
  </div>
</body>
</html>`,
    {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }
    const success = await unsubscribePublic(body.email);
    return NextResponse.json({ success, message: 'You have been unsubscribed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
