import type {
  AiProvider,
  AiProviderType,
  AiGenerateOptions,
  AiRewriteOptions,
  AiSeoSuggestOptions,
  AiSeoSuggestion,
  AiAltTextOptions,
  AiAltTextResult,
  AiTranslateOptions,
} from './types';

export class MockAiProvider implements AiProvider {
  name = 'Mock AI Engine (Offline / Local)';
  type: AiProviderType = 'mock';

  async generateText(options: AiGenerateOptions): Promise<string> {
    const prompt = options.prompt.trim();
    if (options.type === 'outline') {
      return `## Comprehensive Guide: ${prompt}\n\n1. Introduction & Core Concept\n2. Key Architecture Principles\n3. Step-by-Step Implementation Strategy\n4. Real-World Case Studies & Benchmarks\n5. Best Practices & Optimization Checklist\n6. Conclusion & Next Steps`;
    }
    if (options.type === 'headline') {
      return `Transforming Digital Experiences: The Ultimate Guide to ${prompt}`;
    }
    if (options.type === 'summary') {
      return `This content explores ${prompt}, providing critical insights into architecture, execution, and industry best practices for modern web platforms.`;
    }
    return `# ${prompt}\n\nIn today's fast-moving software landscape, ${prompt} has become a foundational paradigm for scalable digital products. Modern engineering teams prioritize agility, security, and developer ergonomics to deliver exceptional user experiences.\n\n### Key Benefits\n- High availability and resilience\n- Modular component-driven architecture\n- Seamless cross-platform API distribution\n\nBy adopting these principles, organizations achieve greater operational velocity while maintaining enterprise-grade reliability.`;
  }

  async rewriteText(options: AiRewriteOptions): Promise<string> {
    const text = options.text.trim();
    switch (options.instruction) {
      case 'clarity':
        return text.replace(/\b(utilize|leverage)\b/gi, 'use').replace(/\s+/g, ' ');
      case 'shorten':
        return text.length > 100 ? `${text.slice(0, 100).trim()}... (concise summary)` : text;
      case 'expand':
        return `${text}\n\nFurthermore, this approach ensures long-term maintainability, facilitates seamless integrations across distributed systems, and empowers engineering teams to scale with confidence.`;
      case 'formal':
        return `It is imperative to note that: ${text}`;
      case 'casual':
        return `Here's the scoop: ${text}`;
      case 'fix_grammar':
        return text.charAt(0).toUpperCase() + text.slice(1);
      default:
        return text;
    }
  }

  async suggestSeo(options: AiSeoSuggestOptions): Promise<AiSeoSuggestion> {
    const rawTitle = options.title.trim();
    const cleanTitle = rawTitle.slice(0, 55);
    const keyword = options.focusKeyword || rawTitle.split(' ')[0] || 'Content';
    return {
      metaTitle: `${cleanTitle} | Enterprise Platform`,
      metaDescription: `Discover key insights on ${keyword}. Learn best practices, architectural patterns, and actionable strategies in our in-depth guide.`,
      focusKeywords: [keyword, `${keyword} guide`, 'enterprise architecture', 'best practices'],
      ogDescription: `Learn how ${cleanTitle} helps businesses build scalable, resilient digital experiences. Read the full guide here.`,
      suggestions: [
        'Ensure the primary keyword appears in the first 100 words of the body.',
        'Keep meta title under 60 characters for optimal Google search snippet visibility.',
        'Include high-quality alt tags on all embedded media elements.',
      ],
    };
  }

  async generateAltText(options: AiAltTextOptions): Promise<AiAltTextResult> {
    const cleanName = options.filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();

    return {
      altText: `High-resolution visual representation illustrating ${cleanName}`,
      caption: `Photograph showing ${cleanName} in enterprise context`,
      tags: [cleanName, 'media', 'digital asset', 'optimized'],
    };
  }

  async translateText(options: AiTranslateOptions): Promise<string> {
    const target = options.targetLocale.toLowerCase();
    const prefix = target.startsWith('es')
      ? '[ES] '
      : target.startsWith('fr')
      ? '[FR] '
      : target.startsWith('de')
      ? '[DE] '
      : `[${options.targetLocale.toUpperCase()}] `;
    return `${prefix}${options.text}`;
  }
}

export class GenericHttpAiProvider implements AiProvider {
  name: string;
  type: AiProviderType;
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor(name: string, type: AiProviderType, apiKey: string, endpoint: string, model: string) {
    this.name = name;
    this.type = type;
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.model = model;
  }

  async generateText(options: AiGenerateOptions): Promise<string> {
    if (!this.apiKey) {
      return new MockAiProvider().generateText(options);
    }
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert AI content writer for an enterprise CMS. Tone: ${options.tone || 'professional'}. Output in clean Markdown.`,
            },
            { role: 'user', content: options.prompt },
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
        }),
      });
      if (!res.ok) throw new Error(`AI API failed with status ${res.status}`);
      const data = await res.json() as any;
      return data?.choices?.[0]?.message?.content || new MockAiProvider().generateText(options);
    } catch {
      return new MockAiProvider().generateText(options);
    }
  }

  async rewriteText(options: AiRewriteOptions): Promise<string> {
    if (!this.apiKey) {
      return new MockAiProvider().rewriteText(options);
    }
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an editor for an enterprise CMS. Rewrite the text per instruction: ${options.instruction}. Preserve factual accuracy.`,
            },
            { role: 'user', content: options.text },
          ],
        }),
      });
      if (!res.ok) throw new Error(`AI API failed: ${res.status}`);
      const data = await res.json() as any;
      return data?.choices?.[0]?.message?.content || new MockAiProvider().rewriteText(options);
    } catch {
      return new MockAiProvider().rewriteText(options);
    }
  }

  async suggestSeo(options: AiSeoSuggestOptions): Promise<AiSeoSuggestion> {
    return new MockAiProvider().suggestSeo(options);
  }

  async generateAltText(options: AiAltTextOptions): Promise<AiAltTextResult> {
    return new MockAiProvider().generateAltText(options);
  }

  async translateText(options: AiTranslateOptions): Promise<string> {
    return new MockAiProvider().translateText(options);
  }
}

export function getAiProvider(
  type: AiProviderType = 'mock',
  apiKey?: string,
  model?: string
): AiProvider {
  switch (type) {
    case 'openai':
      return new GenericHttpAiProvider(
        'OpenAI (GPT-4o / GPT-4o-mini)',
        'openai',
        apiKey || process.env.OPENAI_API_KEY || '',
        'https://api.openai.com/v1/chat/completions',
        model || 'gpt-4o-mini'
      );
    case 'gemini':
      return new GenericHttpAiProvider(
        'Google Gemini 1.5 Pro / Flash',
        'gemini',
        apiKey || process.env.GEMINI_API_KEY || '',
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        model || 'gemini-1.5-flash'
      );
    case 'anthropic':
      return new GenericHttpAiProvider(
        'Anthropic Claude 3.5 Sonnet',
        'anthropic',
        apiKey || process.env.ANTHROPIC_API_KEY || '',
        'https://api.anthropic.com/v1/messages',
        model || 'claude-3-5-sonnet-20241022'
      );
    case 'mock':
    default:
      return new MockAiProvider();
  }
}
