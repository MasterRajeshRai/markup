export type CommentStatus = 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASH';

export type CommentSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'SPAM';

export interface CommentAuthor {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  website?: string;
  role?: 'admin' | 'editor' | 'author' | 'member' | 'guest';
  isGuest?: boolean;
  isVerified?: boolean;
}

export interface CommentItem {
  id: string;
  siteId: string;
  contentEntryId: string;
  contentEntryTitle?: string;
  contentEntrySlug?: string;
  parentId?: string | null;
  author: CommentAuthor;
  content: string;
  status: CommentStatus;
  isPinned: boolean;
  votesCount: number;
  userVote?: 'up' | 'down' | null;
  sentiment?: CommentSentiment;
  spamScore: number; // 0 (clean) to 100 (definitive spam)
  flaggedReasons?: string[];
  clientIp?: string;
  userAgent?: string;
  location?: string;
  replies?: CommentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentSettings {
  moderationMode: 'MANUAL_ALL' | 'FIRST_TIME_ONLY' | 'AUTO_APPROVE';
  allowGuestComments: boolean;
  requireEmailVerification: boolean;
  maxLinksAllowed: number;
  closeCommentsAfterDays: number; // 0 = never close
  maxThreadDepth: number;
  enableMarkdown: boolean;
  enableUpvotes: boolean;
  enableAvatars: boolean;
  blocklistKeywords: string[];
  notifyAdminOnNew: boolean;
  notifyAuthorOnReply: boolean;
  akismetEnabled: boolean;
  akismetApiKey?: string;
  turnstileEnabled: boolean;
}

export interface CommentStats {
  total: number;
  pending: number;
  approved: number;
  spam: number;
  trash: number;
  totalVotes: number;
  spamRate: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    spam: number;
  };
}

export interface ModerationResult {
  status: CommentStatus;
  spamScore: number;
  sentiment: CommentSentiment;
  flaggedReasons: string[];
}
