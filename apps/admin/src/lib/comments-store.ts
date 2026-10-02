import fs from 'fs';
import path from 'path';
import {
  CommentItem,
  CommentStatus,
  CommentSettings,
  CommentStats,
  runAutomod,
} from '@headless/core';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'comment-settings.json');

const DEFAULT_SETTINGS: CommentSettings = {
  moderationMode: 'FIRST_TIME_ONLY',
  allowGuestComments: true,
  requireEmailVerification: false,
  maxLinksAllowed: 2,
  closeCommentsAfterDays: 0,
  maxThreadDepth: 3,
  enableMarkdown: true,
  enableUpvotes: true,
  enableAvatars: true,
  blocklistKeywords: ['viagra', 'crypto pump', 'free spins', 'buy backlinks', 'whatsapp group'],
  notifyAdminOnNew: true,
  notifyAuthorOnReply: true,
  akismetEnabled: false,
  turnstileEnabled: false,
};

const INITIAL_SEED_COMMENTS: CommentItem[] = [
  {
    id: 'comm-1',
    siteId: 'site-default',
    contentEntryId: 'entry-article-1',
    contentEntryTitle: 'Building Ultra-Fast Next.js 16 Web Applications',
    contentEntrySlug: 'building-ultra-fast-nextjs-16',
    parentId: null,
    author: {
      name: 'Elena Rostova',
      email: 'elena@enterprise-cms.io',
      role: 'author',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      website: 'https://rostova.dev',
      isVerified: true,
    },
    content: "Thanks everyone for reading! I've updated the companion GitHub repository with the new streaming suspense benchmarks and Turbopack profiles referenced in section 3.",
    status: 'APPROVED',
    isPinned: true,
    votesCount: 28,
    sentiment: 'POSITIVE',
    spamScore: 0,
    clientIp: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
    location: 'Berlin, Germany',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'comm-2',
    siteId: 'site-default',
    contentEntryId: 'entry-article-1',
    contentEntryTitle: 'Building Ultra-Fast Next.js 16 Web Applications',
    contentEntrySlug: 'building-ultra-fast-nextjs-16',
    parentId: 'comm-1',
    author: {
      name: 'Marcus Vance',
      email: 'marcus.vance@techcorp.com',
      role: 'member',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      website: 'https://github.com/mvance',
      isVerified: true,
    },
    content: "The server action caching benchmarks are phenomenal. We rolled this out yesterday in production and saw an immediate 42% decrease in TTFB across regional POPs.",
    status: 'APPROVED',
    isPinned: false,
    votesCount: 14,
    sentiment: 'POSITIVE',
    spamScore: 5,
    clientIp: '104.28.142.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36',
    location: 'Austin, US',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'comm-3',
    siteId: 'site-default',
    contentEntryId: 'entry-article-1',
    contentEntryTitle: 'Building Ultra-Fast Next.js 16 Web Applications',
    contentEntrySlug: 'building-ultra-fast-nextjs-16',
    parentId: 'comm-2',
    author: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@codecraft.io',
      role: 'guest',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
      isGuest: true,
    },
    content: "Did you need custom revalidation tags or did the built-in time-based `staleTime` suffice for your data requirements?",
    status: 'APPROVED',
    isPinned: false,
    votesCount: 5,
    sentiment: 'NEUTRAL',
    spamScore: 10,
    clientIp: '78.46.12.90',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0',
    location: 'London, UK',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: 'comm-4',
    siteId: 'site-default',
    contentEntryId: 'entry-article-1',
    contentEntryTitle: 'Building Ultra-Fast Next.js 16 Web Applications',
    contentEntrySlug: 'building-ultra-fast-nextjs-16',
    parentId: null,
    author: {
      name: 'Devon Miles',
      email: 'devon.miles@startuply.co',
      role: 'guest',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
      isGuest: true,
    },
    content: "Excellent write-up! One question regarding Partial Prerendering: how does this play along with multi-tenant custom domain routing handled via Edge middleware?",
    status: 'PENDING',
    isPinned: false,
    votesCount: 2,
    sentiment: 'POSITIVE',
    spamScore: 12,
    flaggedReasons: ['First-time commenter: awaiting moderation review'],
    clientIp: '185.199.108.153',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
    location: 'Toronto, Canada',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'comm-5',
    siteId: 'site-default',
    contentEntryId: 'entry-article-1',
    contentEntryTitle: 'Building Ultra-Fast Next.js 16 Web Applications',
    contentEntrySlug: 'building-ultra-fast-nextjs-16',
    parentId: null,
    author: {
      name: 'Crypto Whale 2026',
      email: 'pumper99@telegram-crypto.xyz',
      role: 'guest',
      avatarUrl: '',
      isGuest: true,
    },
    content: "JOIN OUR 100x CRYPTO PUMP TELEGRAM GROUP telegram.me/cryptopump FREE SPINS CASINO BONUS guaranteed profits fast loan offer visit https://crypto-pump-casino.xyz now!",
    status: 'SPAM',
    isPinned: false,
    votesCount: 0,
    sentiment: 'SPAM',
    spamScore: 98,
    flaggedReasons: [
      'Triggered high-risk spam term: "crypto pump"',
      'Triggered high-risk spam term: "free spins"',
      'Triggered high-risk spam term: "telegram.me"',
      'Excessive uppercase text (caps shouting)',
      'Excessive link count (2 links found)',
    ],
    clientIp: '45.154.255.8',
    userAgent: 'Python-urllib/3.10',
    location: 'Unknown Proxy / VPN',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'comm-6',
    siteId: 'site-default',
    contentEntryId: 'entry-article-2',
    contentEntryTitle: 'Modern Headless CMS Architecture & Edge Caching',
    contentEntrySlug: 'modern-headless-cms-architecture',
    parentId: null,
    author: {
      name: 'Karthik Subramanian',
      email: 'karthik@cloudscale.net',
      role: 'member',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces',
      website: 'https://karthiksubramanian.dev',
      isVerified: true,
    },
    content: "Implementing surrogate keys and automated cache invalidation via webhooks has solved our stale content dilemmas entirely. Great breakdown of stale-while-revalidate headers!",
    status: 'APPROVED',
    isPinned: true,
    votesCount: 19,
    sentiment: 'POSITIVE',
    spamScore: 0,
    clientIp: '13.232.11.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/131.0.0.0',
    location: 'Bangalore, India',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'comm-7',
    siteId: 'site-default',
    contentEntryId: 'entry-article-2',
    contentEntryTitle: 'Modern Headless CMS Architecture & Edge Caching',
    contentEntrySlug: 'modern-headless-cms-architecture',
    parentId: null,
    author: {
      name: 'Amara Okafor',
      email: 'amara.okafor@lagos-devs.org',
      role: 'guest',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=faces',
      isGuest: true,
    },
    content: "Could you share insights on managing cache invalidation during blue-green deployment switches?",
    status: 'PENDING',
    isPinned: false,
    votesCount: 3,
    sentiment: 'NEUTRAL',
    spamScore: 15,
    flaggedReasons: ['Held for initial review (first-time commenter)'],
    clientIp: '102.89.23.114',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/131.0.0.0 Safari/537.36',
    location: 'Lagos, Nigeria',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'comm-8',
    siteId: 'site-default',
    contentEntryId: 'entry-article-3',
    contentEntryTitle: 'Mastering Tailwind CSS v4 & Dynamic UI Systems',
    contentEntrySlug: 'mastering-tailwind-v4',
    parentId: null,
    author: {
      name: 'Sophie Laurent',
      email: 'sophie.laurent@designhub.fr',
      role: 'member',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
      website: 'https://sophielaurent.fr',
      isVerified: true,
    },
    content: "The unified theme variables and native CSS `@theme` directive make design token synchronization between Figma and code virtually zero-maintenance. Truly loving v4!",
    status: 'APPROVED',
    isPinned: false,
    votesCount: 22,
    sentiment: 'POSITIVE',
    spamScore: 0,
    clientIp: '82.64.120.14',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
    location: 'Paris, France',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'comm-9',
    siteId: 'site-default',
    contentEntryId: 'entry-article-3',
    contentEntryTitle: 'Mastering Tailwind CSS v4 & Dynamic UI Systems',
    contentEntrySlug: 'mastering-tailwind-v4',
    parentId: null,
    author: {
      name: 'Anonymous Troll',
      email: 'throwaway9821@tempmail.ninja',
      role: 'guest',
      avatarUrl: '',
      isGuest: true,
    },
    content: "This framework is complete and utter garbage. Pure rubbish and useless garbage.",
    status: 'TRASH',
    isPinned: false,
    votesCount: -4,
    sentiment: 'NEGATIVE',
    spamScore: 40,
    flaggedReasons: ['High negativity ratio detected', 'Soft deleted by moderator'],
    clientIp: '194.26.29.112',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'Warsaw, Poland',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

// Helper to ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// In-memory cache synced to JSON file
let memoryComments: CommentItem[] | null = null;
let memorySettings: CommentSettings | null = null;

export function loadComments(): CommentItem[] {
  if (memoryComments) return memoryComments;

  ensureDataDir();
  if (fs.existsSync(COMMENTS_FILE)) {
    try {
      const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
      memoryComments = JSON.parse(data);
      return memoryComments!;
    } catch {
      // fallback to initial
    }
  }

  memoryComments = [...INITIAL_SEED_COMMENTS];
  saveComments(memoryComments);
  return memoryComments;
}

export function saveComments(comments: CommentItem[]) {
  memoryComments = comments;
  try {
    ensureDataDir();
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CommentsStore] Error saving comments file:', err);
  }
}

export function loadSettings(): CommentSettings {
  if (memorySettings) return memorySettings;

  ensureDataDir();
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      memorySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      return memorySettings!;
    } catch {
      // fallback to default
    }
  }

  memorySettings = { ...DEFAULT_SETTINGS };
  saveSettings(memorySettings);
  return memorySettings;
}

export function saveSettings(settings: CommentSettings) {
  memorySettings = settings;
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CommentsStore] Error saving settings file:', err);
  }
}

export interface GetCommentsOptions {
  siteId?: string;
  contentEntryId?: string;
  status?: CommentStatus | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'votesCount' | 'spamScore';
  sortOrder?: 'asc' | 'desc';
  threaded?: boolean;
}

export function getComments(options: GetCommentsOptions = {}) {
  const all = loadComments();
  const {
    siteId,
    contentEntryId,
    status = 'ALL',
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    threaded = false,
  } = options;

  let filtered = all.filter((c) => {
    if (siteId && c.siteId !== siteId) return false;
    if (contentEntryId && c.contentEntryId !== contentEntryId) return false;
    if (status !== 'ALL' && c.status !== status) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchContent = c.content.toLowerCase().includes(q);
      const matchAuthor = c.author.name.toLowerCase().includes(q) || c.author.email.toLowerCase().includes(q);
      const matchArticle = (c.contentEntryTitle || '').toLowerCase().includes(q);
      const matchIp = (c.clientIp || '').toLowerCase().includes(q);
      if (!matchContent && !matchAuthor && !matchArticle && !matchIp) return false;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    // Always prioritize pinned items first if sorting by createdAt or votes
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    let valA: any = a[sortBy] ?? a.createdAt;
    let valB: any = b[sortBy] ?? b.createdAt;

    if (sortBy === 'createdAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Compute stats across all comments in this scope
  const stats = calculateStats(all, contentEntryId);

  // If threaded view requested (useful for public widgets)
  if (threaded) {
    const rootComments: CommentItem[] = [];
    const commentMap = new Map<string, CommentItem>();

    filtered.forEach((c) => {
      commentMap.set(c.id, { ...c, replies: [] });
    });

    filtered.forEach((c) => {
      const item = commentMap.get(c.id)!;
      if (c.parentId && commentMap.has(c.parentId)) {
        const parent = commentMap.get(c.parentId)!;
        parent.replies = parent.replies || [];
        parent.replies.push(item);
      } else {
        rootComments.push(item);
      }
    });

    const total = rootComments.length;
    const startIndex = (page - 1) * limit;
    const paginated = rootComments.slice(startIndex, startIndex + limit);

    return {
      comments: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats,
    };
  }

  // Flat list view
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    comments: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats,
  };
}

export function calculateStats(comments: CommentItem[], contentEntryId?: string): CommentStats {
  const scoped = contentEntryId ? comments.filter((c) => c.contentEntryId === contentEntryId) : comments;

  let pending = 0;
  let approved = 0;
  let spam = 0;
  let trash = 0;
  let totalVotes = 0;

  const sentiment = {
    positive: 0,
    neutral: 0,
    negative: 0,
    spam: 0,
  };

  scoped.forEach((c) => {
    if (c.status === 'PENDING') pending++;
    else if (c.status === 'APPROVED') approved++;
    else if (c.status === 'SPAM') spam++;
    else if (c.status === 'TRASH') trash++;

    totalVotes += c.votesCount || 0;

    if (c.sentiment === 'POSITIVE') sentiment.positive++;
    else if (c.sentiment === 'NEUTRAL') sentiment.neutral++;
    else if (c.sentiment === 'NEGATIVE') sentiment.negative++;
    else if (c.sentiment === 'SPAM') sentiment.spam++;
  });

  const total = scoped.length;
  const spamRate = total > 0 ? Math.round((spam / total) * 100) : 0;

  return {
    total,
    pending,
    approved,
    spam,
    trash,
    totalVotes,
    spamRate,
    sentimentBreakdown: sentiment,
  };
}

export function addComment(params: {
  siteId?: string;
  contentEntryId: string;
  contentEntryTitle?: string;
  contentEntrySlug?: string;
  parentId?: string | null;
  author: {
    name: string;
    email: string;
    avatarUrl?: string;
    website?: string;
    role?: 'admin' | 'editor' | 'author' | 'member' | 'guest';
    isGuest?: boolean;
    isVerified?: boolean;
  };
  content: string;
  clientIp?: string;
  userAgent?: string;
  location?: string;
}): CommentItem {
  const comments = loadComments();
  const settings = loadSettings();

  // Check if author has previously approved comments
  const hasPriorApproved = comments.some(
    (c) => c.author.email.toLowerCase() === params.author.email.toLowerCase() && c.status === 'APPROVED'
  );

  // Run automod engine
  const automod = runAutomod(params.content, params.author.email, settings, hasPriorApproved);

  const newComment: CommentItem = {
    id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    siteId: params.siteId || 'site-default',
    contentEntryId: params.contentEntryId,
    contentEntryTitle: params.contentEntryTitle || 'Article',
    contentEntrySlug: params.contentEntrySlug,
    parentId: params.parentId || null,
    author: {
      ...params.author,
      role: params.author.role || (params.author.isGuest ? 'guest' : 'member'),
    },
    content: params.content.trim(),
    status: automod.status,
    isPinned: false,
    votesCount: 0,
    sentiment: automod.sentiment,
    spamScore: automod.spamScore,
    flaggedReasons: automod.flaggedReasons,
    clientIp: params.clientIp || '127.0.0.1',
    userAgent: params.userAgent || 'Web Browser',
    location: params.location || 'Localhost',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  comments.unshift(newComment);
  saveComments(comments);

  return newComment;
}

export function updateComment(id: string, updates: Partial<CommentItem>): CommentItem | null {
  const comments = loadComments();
  const index = comments.findIndex((c) => c.id === id);
  if (index === -1) return null;

  comments[index] = {
    ...comments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveComments(comments);
  return comments[index];
}

export function deleteComment(id: string, permanent: boolean = false): boolean {
  let comments = loadComments();
  const index = comments.findIndex((c) => c.id === id);
  if (index === -1) return false;

  if (permanent) {
    comments = comments.filter((c) => c.id !== id && c.parentId !== id);
  } else {
    comments[index].status = 'TRASH';
    comments[index].updatedAt = new Date().toISOString();
  }

  saveComments(comments);
  return true;
}

export function bulkUpdateStatus(ids: string[], status: CommentStatus): number {
  const comments = loadComments();
  let count = 0;

  comments.forEach((c) => {
    if (ids.includes(c.id)) {
      c.status = status;
      c.updatedAt = new Date().toISOString();
      count++;
    }
  });

  if (count > 0) {
    saveComments(comments);
  }
  return count;
}

export function voteComment(id: string, delta: number): CommentItem | null {
  const comments = loadComments();
  const comment = comments.find((c) => c.id === id);
  if (!comment) return null;

  comment.votesCount = (comment.votesCount || 0) + delta;
  comment.updatedAt = new Date().toISOString();
  saveComments(comments);

  return comment;
}
