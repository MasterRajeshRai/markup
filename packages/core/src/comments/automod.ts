import { CommentSettings, ModerationResult, CommentSentiment, CommentStatus } from './types';

// Built-in high-confidence spam and malicious trigger terms
const DEFAULT_SPAM_SIGNALS = [
  'viagra',
  'cialis',
  'crypto pump',
  'telegram.me',
  't.me/',
  'whatsapp group',
  'casino bonus',
  'free spins',
  'loan offer',
  'replica watches',
  'buy backlinks',
  'seo rank booster',
  'make money fast',
  'poker online',
  'bet365',
];

// Sentiment heuristic words
const POSITIVE_SIGNALS = [
  'great',
  'awesome',
  'excellent',
  'helpful',
  'love',
  'thank',
  'thanks',
  'fantastic',
  'clear',
  'kudos',
  'brilliant',
  'insightful',
  'well written',
];

const NEGATIVE_SIGNALS = [
  'terrible',
  'awful',
  'horrible',
  'useless',
  'waste of time',
  'trash',
  'stupid',
  'garbage',
  'broken',
  'fake',
];

/**
 * Counts links (URLs and markdown links) in text
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  const matches = text.match(urlRegex);
  return matches ? matches : [];
}

/**
 * Analyzes basic sentiment heuristic
 */
export function analyzeSentiment(text: string, isSpam: boolean): CommentSentiment {
  if (isSpam) return 'SPAM';
  const lower = text.toLowerCase();
  
  let posCount = 0;
  let negCount = 0;

  for (const word of POSITIVE_SIGNALS) {
    if (lower.includes(word)) posCount++;
  }
  for (const word of NEGATIVE_SIGNALS) {
    if (lower.includes(word)) negCount++;
  }

  if (negCount > posCount && negCount >= 2) return 'NEGATIVE';
  if (posCount > negCount && posCount >= 1) return 'POSITIVE';
  return 'NEUTRAL';
}

/**
 * Automod engine: Scores content for spam, toxicity, and sets initial status
 */
export function runAutomod(
  content: string,
  authorEmail: string,
  settings: CommentSettings,
  isPreviousApprovedAuthor: boolean = false
): ModerationResult {
  const lowerContent = content.toLowerCase();
  const flaggedReasons: string[] = [];
  let spamScore = 0;

  // 1. Link density check
  const urls = extractUrls(content);
  if (urls.length > settings.maxLinksAllowed) {
    spamScore += 45;
    flaggedReasons.push(`Excessive link count (${urls.length} links found, max is ${settings.maxLinksAllowed})`);
  } else if (urls.length > 0) {
    spamScore += 15;
  }

  // 2. Built-in spam signals check
  for (const signal of DEFAULT_SPAM_SIGNALS) {
    if (lowerContent.includes(signal)) {
      spamScore += 60;
      flaggedReasons.push(`Triggered high-risk spam term: "${signal}"`);
      break;
    }
  }

  // 3. User configured blocklist keywords
  if (settings.blocklistKeywords && settings.blocklistKeywords.length > 0) {
    for (const kw of settings.blocklistKeywords) {
      const cleanKw = kw.trim().toLowerCase();
      if (cleanKw && lowerContent.includes(cleanKw)) {
        spamScore += 50;
        flaggedReasons.push(`Matched custom blocked keyword: "${cleanKw}"`);
      }
    }
  }

  // 4. Repeated character flood / caps lock shouting
  if (content.length > 20 && content === content.toUpperCase() && /[A-Z]/.test(content)) {
    spamScore += 25;
    flaggedReasons.push('Excessive uppercase text (caps shouting)');
  }

  // Normalize spam score 0-100
  spamScore = Math.min(100, Math.max(0, spamScore));

  const isSpam = spamScore >= 50;
  const sentiment = analyzeSentiment(content, isSpam);

  let initialStatus: CommentStatus = 'PENDING';

  if (isSpam) {
    initialStatus = 'SPAM';
  } else {
    switch (settings.moderationMode) {
      case 'AUTO_APPROVE':
        initialStatus = 'APPROVED';
        break;
      case 'FIRST_TIME_ONLY':
        initialStatus = isPreviousApprovedAuthor ? 'APPROVED' : 'PENDING';
        if (!isPreviousApprovedAuthor) {
          flaggedReasons.push('Held for initial review (first-time commenter)');
        }
        break;
      case 'MANUAL_ALL':
      default:
        initialStatus = 'PENDING';
        flaggedReasons.push('Held by manual moderation policy');
        break;
    }
  }

  return {
    status: initialStatus,
    spamScore,
    sentiment,
    flaggedReasons,
  };
}

/**
 * Basic HTML sanitizer to strip dangerous scripts or injections from markdown
 */
export function sanitizeCommentHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '');
}
