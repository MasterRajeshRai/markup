import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscribers,
  saveSubscriber,
  deleteSubscriber,
} from '@/lib/newsletter-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('q') || undefined;

    const subscribers = await getSubscribers({ status, tag, search });
    return NextResponse.json({ success: true, data: subscribers, total: subscribers.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subscriber = await saveSubscriber(body);
    return NextResponse.json({ success: true, data: subscriber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Subscriber ID is required.' }, { status: 400 });

    const deleted = await deleteSubscriber(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
