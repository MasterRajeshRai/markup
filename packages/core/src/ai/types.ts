export type AiProviderType = 'mock' | 'openai' | 'gemini' | 'anthropic';

export interface AiGenerateOptions {
  prompt: string;
  type?: 'article' | 'outline' | 'summary' | 'paragraph' | 'headline';
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'authoritative' | 'technical';
  maxTokens?: number;
  temperature?: number;
}

export interface AiRewriteOptions {
  text: string;
  instruction: 'clarity' | 'expand' | 'shorten' | 'formal' | 'casual' | 'fix_grammar';
  tone?: string;
}

export interface AiSeoSuggestOptions {
  title: string;
  content: string;
  focusKeyword?: string;
}

export interface AiSeoSuggestion {
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  ogDescription: string;
  suggestions: string[];
}

export interface AiAltTextOptions {
  filename: string;
  context?: string;
  tags?: string[];
}

export interface AiAltTextResult {
  altText: string;
  caption: string;
  tags: string[];
}

export interface AiTranslateOptions {
  text: string;
  sourceLocale?: string;
  targetLocale: string;
}

export interface AiProvider {
  name: string;
  type: AiProviderType;
  generateText(options: AiGenerateOptions): Promise<string>;
  rewriteText(options: AiRewriteOptions): Promise<string>;
  suggestSeo(options: AiSeoSuggestOptions): Promise<AiSeoSuggestion>;
  generateAltText(options: AiAltTextOptions): Promise<AiAltTextResult>;
  translateText(options: AiTranslateOptions): Promise<string>;
}
