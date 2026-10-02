import { NextRequest, NextResponse } from 'next/server';
import { getAiProvider } from '@headless/core';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    providers: ['mock', 'gemini', 'openai'],
    defaultProvider: process.env.GEMINI_API_KEY ? 'gemini' : 'mock',
    features: ['generate', 'rewrite', 'seo-suggest', 'alt-text', 'translate'],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, provider = 'mock', apiKey, model, ...options } = body;

    const ai = getAiProvider(provider, apiKey, model);

    switch (action) {
      case 'generate': {
        const text = await ai.generateText(options);
        return NextResponse.json({ success: true, text });
      }
      case 'rewrite': {
        const text = await ai.rewriteText(options);
        return NextResponse.json({ success: true, text });
      }
      case 'seo-suggest': {
        const suggestion = await ai.suggestSeo(options);
        return NextResponse.json({ success: true, suggestion });
      }
      case 'alt-text': {
        const result = await ai.generateAltText(options);
        return NextResponse.json({ success: true, result });
      }
      case 'translate': {
        const text = await ai.translateText(options);
        return NextResponse.json({ success: true, text });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 });
  }
}
