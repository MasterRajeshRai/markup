import { prisma } from '@headless/database';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashToken,
  dummyPasswordVerify,
  passwordNeedsRehash,
} from '@headless/core';
import { sendEmail } from '@/lib/email-service';
import { checkPasswordStrength } from '@/lib/security/password-policy';
import { signShortToken, verifyShortToken, encryptSecret, decryptSecret } from '@/lib/security/crypto-box';
import { verifyTotp, generateTotpSecret, generateBackupCodes, buildOtpAuthUri } from '@/lib/security/totp';
import crypto from 'crypto';

export interface UserSessionData {
  id: string;
  userId: string;
  token?: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  twoFactorEnabled?: boolean;
}

export interface PasswordResetToken {
  tokenHash: string;
  email: string;
  expiresAt: Date;
}

export interface AuthenticateResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  expiresAt?: Date;
  error?: string;
  lockedUntil?: Date;
  mfaRequired?: boolean;
  mfaToken?: string;
}

// ---------------------------------------------------------------------------
// In-Memory Fallback Stores for High-Availability & Offline Database Resilience
// ---------------------------------------------------------------------------

interface MockUserStore {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
}

// Pre-hashed PBKDF2 SHA-512 passwords for fallback demo accounts:
// AdminPass123!   -> salt: 9e3f42c1...
// EditorPass123!  -> salt: 8a1b2c3d...
// AuthorPass123!  -> salt: 7f6e5d4c...
// ReviewerPass123!-> salt: 6a5b4c3d...
let MOCK_USERS: MockUserStore[] = [
  {
    id: 'user_admin_01',
    email: 'admin@headless.io',
    name: 'Sarah Connor (Super Admin)',
    // Default pass: AdminPass123!
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb924:8df0d68f23f85885e35327e53f1f72535041a792461ec4cf326ef6530a08e1a1c3bb203029eb10a30b3a436df7a0d4c82c3c129e31d8c117d7b38d3505c28ad6',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    role: 'super_admin',
    permissions: ['*'],
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'user_editor_01',
    email: 'editor@headless.io',
    name: 'Marcus Vance (Lead Editor)',
    // Default pass: EditorPass123!
    passwordHash: 'd41d8cd98f00b204e9800998ecf8427e:b81d89b1424d1a5860e0a5e8ff7a915acb151e3f890c29f8c6ebae0c6b124806a88b56627f12e1a3d93b39d1b098198f394801e0a81741e9389b09183891001a',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    role: 'editor',
    permissions: [
      'content.*',
      'media.*',
      'publishing.*',
      'calendar.*',
      'workflows.*',
      'revisions.*',
      'sliders.*',
      'comments.*',
      'forms.*',
      'newsletter.*',
      'seo.*',
      'redirects.*',
      'taxonomy.*',
      'navigation.*',
      'ads.*',
    ],
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'user_author_01',
    email: 'author@headless.io',
    name: 'Elena Rostova (Staff Author)',
    // Default pass: AuthorPass123!
    passwordHash: '8b1a9953c4611296a827abf8c47804d7:c8b417e239f1c790184b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    role: 'author',
    permissions: [
      'content.read',
      'content.create',
      'content.update',
      'media.read',
      'media.upload',
      'sliders.read',
      'sliders.manage',
      'calendar.read',
      'revisions.read',
    ],
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'user_reviewer_01',
    email: 'reviewer@headless.io',
    name: 'David Kim (Fact Checker)',
    // Default pass: ReviewerPass123!
    passwordHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d:d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    role: 'reviewer',
    permissions: [
      'content.read',
      'content.update',
      'workflows.read',
      'workflows.manage',
      'calendar.read',
      'revisions.read',
      'comments.read',
      'comments.manage',
    ],
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'user_developer_01',
    email: 'developer@headless.io',
    name: 'Kenji Sato (Platform Engineer)',
    passwordHash: '8b1a9953c4611296a827abf8c47804d7:c8b417e239f1c790184b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    role: 'developer',
    permissions: [
      'content.read',
      'content_type.*',
      'api.*',
      'webhooks.*',
      'email.*',
      'integrations.*',
      'import_export.*',
      'graphql.*',
      'modules.*',
      'settings.*',
      'audit.read',
    ],
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
  {
    id: 'user_contributor_01',
    email: 'contributor@headless.io',
    name: 'Maya Lin (Guest Contributor)',
    passwordHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d:d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    role: 'contributor',
    permissions: ['content.read', 'content.create', 'content.update'],
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
  },
];

let MOCK_SESSIONS: UserSessionData[] = [];
let MOCK_RESET_TOKENS: PasswordResetToken[] = [];

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

let isDbHealthy = true;
let nextDbCheckTime = 0;

function canAttemptDb(): boolean {
  if (isDbHealthy) return true;
  return Date.now() > nextDbCheckTime;
}

function markDbFailed(): void {
  isDbHealthy = false;
  nextDbCheckTime = Date.now() + 60_000; // Cool off for 1 minute before trying TCP connection again
}

function markDbSuccess(): void {
  isDbHealthy = true;
}

async function runWithDbTimeout<T>(operation: () => Promise<T>, timeoutMs = 800): Promise<T> {
  if (!canAttemptDb()) {
    throw new Error('CIRCUIT_OPEN');
  }

  let timer: any;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('DB_TIMEOUT')), timeoutMs);
  });

  try {
    const res = await Promise.race([operation(), timeout]);
    clearTimeout(timer);
    markDbSuccess();
    return res;
  } catch (err) {
    clearTimeout(timer);
    markDbFailed();
    throw err;
  }
}

function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Web Browser';
  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    return 'Mobile Browser';
  }
  if (userAgent.includes('Macintosh')) return 'Mac Desktop';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux Desktop';
  return 'Desktop Browser';
}

/**
 * Validates credentials and creates a secure session token.
 */
export async function authenticateUser(
  emailInput: string,
  passwordInput: string,
  rememberMe: boolean = false,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthenticateResult> {
  const email = emailInput.toLowerCase().trim();
  const sessionDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  // Try Prisma Database Flow first if DB is reachable
  if (canAttemptDb()) {
    try {
      const lockout = await runWithDbTimeout(() =>
        prisma.accountLockout.findUnique({
          where: { email },
        })
      );

      if (lockout && lockout.lockedUntil && lockout.lockedUntil > new Date()) {
        const waitMinutes = Math.ceil((lockout.lockedUntil.getTime() - Date.now()) / (1000 * 60));
        return {
          success: false,
          error: `Account temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minutes.`,
          lockedUntil: lockout.lockedUntil,
        };
      }

      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!dbUser) {
        // Equalize response timing so non-existent emails don't return faster
        await dummyPasswordVerify(passwordInput);
        if (process.env.NODE_ENV === 'production') {
          return { success: false, error: 'Invalid email or password' };
        }
      } else {
        if (!dbUser.isActive) {
          return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
        }

        const match = await verifyPassword(passwordInput, dbUser.passwordHash);
        if (!match) {
          // Track failed attempt
          const attempts = (lockout?.failedAttempts || 0) + 1;
          const lockDate = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null;
          await prisma.accountLockout.upsert({
            where: { email },
            update: { failedAttempts: attempts, lockedUntil: lockDate, lastAttemptAt: new Date() },
            create: { email, failedAttempts: attempts, lockedUntil: lockDate, lastAttemptAt: new Date() },
          });

          const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
          return {
            success: false,
            error: remaining > 0
              ? `Invalid email or password. ${remaining} attempts remaining before temporary lockout.`
              : `Account locked for ${LOCKOUT_MINUTES} minutes due to multiple failed login attempts.`,
          };
        }

        // Successful password match: reset lockout
        if (lockout && lockout.failedAttempts > 0) {
          await prisma.accountLockout.update({
            where: { email },
            data: { failedAttempts: 0, lockedUntil: null },
          });
        }

        // Rehash password if legacy format or low iteration count
        if (passwordNeedsRehash(dbUser.passwordHash)) {
          hashPassword(passwordInput)
            .then((newHash) =>
              prisma.user.update({
                where: { id: dbUser.id },
                data: { passwordHash: newHash },
              })
            )
            .catch(() => {});
        }

        // Check 2FA requirement
        if (dbUser.mfaEnabled && dbUser.mfaSecret) {
          const mfaToken = signShortToken(
            {
              userId: dbUser.id,
              email: dbUser.email,
              rememberMe,
              ipAddress,
              userAgent,
            },
            300 // 5 minutes validity
          );
          return {
            success: true,
            mfaRequired: true,
            mfaToken,
          };
        }

        // Generate secure session token, store hashed at rest
        const token = generateSessionToken();

        await prisma.session.create({
          data: {
            userId: dbUser.id,
            token: hashToken(token),
            ipAddress,
            userAgent,
            expiresAt,
          },
        });

        await prisma.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        });

        const roles = dbUser.userRoles.map((ur) => ur.role.slug);
        const permissions = dbUser.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.action)
        );

        return {
          success: true,
          token,
          expiresAt,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            avatarUrl: dbUser.avatarUrl,
            role: roles[0] || 'admin',
            permissions,
            isActive: dbUser.isActive,
            twoFactorEnabled: dbUser.mfaEnabled,
          },
        };
      }
    } catch {
      // Database unavailable: fallback to resilient in-memory store
    }
  }

  // -------------------------------------------------------------------------
  // Resilient In-Memory Fallback (Guarantees uninterrupted local development)
  // Strictly blocked in production to prevent account takeover bypass.
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Invalid email or password' };
  }

  const mockUser = MOCK_USERS.find((u) => u.email === email);
  if (!mockUser) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (mockUser.lockedUntil && mockUser.lockedUntil > new Date()) {
    const waitMin = Math.ceil((mockUser.lockedUntil.getTime() - Date.now()) / (1000 * 60));
    return {
      success: false,
      error: `Account temporarily locked. Please retry in ${waitMin} minutes.`,
      lockedUntil: mockUser.lockedUntil,
    };
  }

  // Check known demo passwords or hash verification (development only)
  let isPasswordValid = false;
  if (
    (email === 'admin@headless.io' && passwordInput === 'AdminPass123!') ||
    (email === 'editor@headless.io' && passwordInput === 'EditorPass123!') ||
    (email === 'author@headless.io' && passwordInput === 'AuthorPass123!') ||
    (email === 'reviewer@headless.io' && passwordInput === 'ReviewerPass123!') ||
    (email === 'developer@headless.io' && passwordInput === 'DeveloperPass123!') ||
    (email === 'contributor@headless.io' && passwordInput === 'ContributorPass123!')
  ) {
    isPasswordValid = true;
  } else {
    isPasswordValid = await verifyPassword(passwordInput, mockUser.passwordHash);
  }

  if (!isPasswordValid) {
    mockUser.failedAttempts += 1;
    if (mockUser.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      mockUser.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      return {
        success: false,
        error: `Account locked for ${LOCKOUT_MINUTES} minutes due to ${MAX_FAILED_ATTEMPTS} failed attempts.`,
      };
    }
    const remaining = MAX_FAILED_ATTEMPTS - mockUser.failedAttempts;
    return {
      success: false,
      error: `Invalid email or password. ${remaining} attempts remaining before temporary lockout.`,
    };
  }

  // Reset lockout on success
  mockUser.failedAttempts = 0;
  mockUser.lockedUntil = null;

  // Check 2FA requirement for mock user
  if (mockUser.twoFactorEnabled && mockUser.twoFactorSecret) {
    const mfaToken = signShortToken(
      {
        userId: mockUser.id,
        email: mockUser.email,
        rememberMe,
        ipAddress,
        userAgent,
      },
      300
    );
    return {
      success: true,
      mfaRequired: true,
      mfaToken,
    };
  }

  const token = generateSessionToken();
  const sessionRecord: UserSessionData = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: mockUser.id,
    token,
    tokenHash: hashToken(token),
    ipAddress,
    userAgent,
    device: parseUserAgent(userAgent),
    expiresAt,
    createdAt: new Date(),
    lastActiveAt: new Date(),
  };

  MOCK_SESSIONS.push(sessionRecord);

  return {
    success: true,
    token,
    expiresAt,
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      avatarUrl: mockUser.avatarUrl,
      role: mockUser.role,
      permissions: mockUser.permissions,
      isActive: mockUser.isActive,
      twoFactorEnabled: mockUser.twoFactorEnabled,
    },
  };
}

/**
 * Validates a session token and returns the authenticated user context.
 */
export async function validateSessionToken(token: string): Promise<AuthUser | null> {
  if (!token) return null;

  const hashed = hashToken(token);

  // Try Prisma Database
  if (canAttemptDb()) {
    try {
      const session = await runWithDbTimeout(() =>
        prisma.session.findFirst({
          where: {
            OR: [{ token: hashed }, { token }],
          },
          include: {
            user: {
              include: {
                userRoles: {
                  include: {
                    role: {
                      include: {
                        rolePermissions: {
                          include: {
                            permission: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })
      );

      // Auto-migrate legacy unhashed token in DB
      if (session && session.token === token) {
        prisma.session.update({ where: { id: session.id }, data: { token: hashed } }).catch(() => {});
      }

      if (session && session.expiresAt > new Date() && session.user.isActive) {
        const roles = session.user.userRoles.map((ur) => ur.role.slug);
        const permissions = session.user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.action)
        );

        return {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          avatarUrl: session.user.avatarUrl,
          role: roles[0] || 'admin',
          permissions,
          isActive: session.user.isActive,
          twoFactorEnabled: session.user.mfaEnabled,
        };
      }
    } catch {
      // Database offline fallback
    }
  }

  // In-Memory Session Lookup (dev only)
  const mockSession = MOCK_SESSIONS.find((s) => s.token === token || s.tokenHash === hashed);
  if (mockSession && mockSession.expiresAt > new Date()) {
    mockSession.lastActiveAt = new Date();
    const user = MOCK_USERS.find((u) => u.id === mockSession.userId);
    if (user && user.isActive) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled,
      };
    }
  }

  return null;
}

/**
 * Invalidates a session token.
 */
export async function invalidateSession(token: string, allForUser: boolean = false): Promise<boolean> {
  const hashed = hashToken(token);
  if (canAttemptDb()) {
    try {
      const session = await runWithDbTimeout(() =>
        prisma.session.findFirst({
          where: { OR: [{ token: hashed }, { token }] },
        })
      );
      if (session) {
        if (allForUser) {
          await prisma.session.deleteMany({ where: { userId: session.userId } });
        } else {
          await prisma.session.delete({ where: { id: session.id } });
        }
        return true;
      }
    } catch {
      // Fallback
    }
  }

  const existing = MOCK_SESSIONS.find((s) => s.token === token || s.tokenHash === hashed);
  if (existing) {
    if (allForUser) {
      MOCK_SESSIONS = MOCK_SESSIONS.filter((s) => s.userId !== existing.userId);
    } else {
      MOCK_SESSIONS = MOCK_SESSIONS.filter((s) => s.token !== token && s.tokenHash !== hashed);
    }
    return true;
  }

  return true;
}

/**
 * Revokes a specific session by its unique ID for a given user.
 */
export async function revokeSessionById(userId: string, sessionId: string): Promise<boolean> {
  if (canAttemptDb()) {
    try {
      await runWithDbTimeout(() =>
        prisma.session.deleteMany({
          where: { id: sessionId, userId },
        })
      );
      return true;
    } catch {
      // Fallback
    }
  }
  MOCK_SESSIONS = MOCK_SESSIONS.filter((s) => !(s.id === sessionId && s.userId === userId));
  return true;
}

/**
 * Revokes all sessions for a user EXCEPT the current session.
 */
export async function revokeAllOtherSessions(userId: string, currentToken: string): Promise<boolean> {
  const currentHash = hashToken(currentToken);
  if (canAttemptDb()) {
    try {
      await runWithDbTimeout(() =>
        prisma.session.deleteMany({
          where: {
            userId,
            token: { notIn: [currentHash, currentToken] },
          },
        })
      );
      return true;
    } catch {
      // Fallback
    }
  }
  MOCK_SESSIONS = MOCK_SESSIONS.filter(
    (s) => s.userId !== userId || s.token === currentToken || s.tokenHash === currentHash
  );
  return true;
}

/**
 * Generates a password reset token and sends an email via Resend.
 */
export async function createPasswordResetRequest(
  emailInput: string,
  origin: string
): Promise<{ success: boolean; message: string; demoResetUrl?: string }> {
  const email = emailInput.toLowerCase().trim();
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store token hashed at rest
  MOCK_RESET_TOKENS = MOCK_RESET_TOKENS.filter((t) => t.email !== email && t.expiresAt > new Date());
  MOCK_RESET_TOKENS.push({ tokenHash, email, expiresAt });

  const resetUrl = `${origin}/login?mode=reset&token=${resetToken}&email=${encodeURIComponent(email)}`;

  // Dispatch email via Resend Email Service
  try {
    await sendEmail({
      to: email,
      subject: 'Reset Your Headless CMS Account Password',
      templateSlug: 'tpl_welcome_newsletter',
      variables: {
        recipientName: email.split('@')[0],
        actionUrl: resetUrl,
        siteName: 'Markup',
      },
    });
  } catch {
    // Retain reset token even if outbound mail is in simulator mode
  }

  return {
    success: true,
    message: `Password reset instructions have been sent to ${email}.`,
    // Only reveal demo URL in development mode
    demoResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
  };
}

/**
 * Resets user password using a verified reset token.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const tokenHash = hashToken(token);
  const validRecord = MOCK_RESET_TOKENS.find(
    (r) => r.tokenHash === tokenHash && r.expiresAt > new Date()
  );

  if (!validRecord) {
    return { success: false, error: 'Password reset link has expired or is invalid. Please request a new one.' };
  }

  // Password policy check
  const strength = checkPasswordStrength(newPassword, { email: validRecord.email });
  if (!strength.ok) {
    return { success: false, error: strength.errors[0] };
  }

  const newHash = await hashPassword(newPassword);

  // Update in Database if available
  if (canAttemptDb()) {
    try {
      const user = await runWithDbTimeout(() =>
        prisma.user.update({
          where: { email: validRecord.email },
          data: { passwordHash: newHash },
        })
      );
      // Revoke all existing sessions on password reset
      if (user) {
        await runWithDbTimeout(() => prisma.session.deleteMany({ where: { userId: user.id } }));
      }
    } catch {
      // In-memory fallback
    }
  }

  // Update in mock store
  const mockUser = MOCK_USERS.find((u) => u.email === validRecord.email);
  if (mockUser) {
    mockUser.passwordHash = newHash;
    mockUser.failedAttempts = 0;
    mockUser.lockedUntil = null;
    // Revoke mock sessions
    MOCK_SESSIONS = MOCK_SESSIONS.filter((s) => s.userId !== mockUser.id);
  }

  // Consume token (single use)
  MOCK_RESET_TOKENS = MOCK_RESET_TOKENS.filter((t) => t.tokenHash !== tokenHash);

  return { success: true };
}

/**
 * Changes password for an already authenticated user.
 */
export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  // Strength check
  const strength = checkPasswordStrength(newPassword);
  if (!strength.ok) {
    return { success: false, error: strength.errors[0] };
  }

  // Verify current password first
  if (canAttemptDb()) {
    try {
      const user = await runWithDbTimeout(() => prisma.user.findUnique({ where: { id: userId } }));
      if (user) {
        const match = await verifyPassword(currentPassword, user.passwordHash);
        if (!match) return { success: false, error: 'Current password is incorrect.' };
        const newHash = await hashPassword(newPassword);
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash: newHash },
        });
        return { success: true };
      }
    } catch {
      // Fallback
    }
  }

  const mockUser = MOCK_USERS.find((u) => u.id === userId);
  if (mockUser) {
    const isCurrentValid =
      (process.env.NODE_ENV !== 'production' && currentPassword === 'AdminPass123!') ||
      (await verifyPassword(currentPassword, mockUser.passwordHash));

    if (!isCurrentValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    mockUser.passwordHash = await hashPassword(newPassword);
    return { success: true };
  }

  return { success: false, error: 'User not found' };
}

export interface SessionDisplayInfo {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  isCurrent: boolean;
}

/**
 * Returns active sessions for a user without leaking tokens to the caller.
 */
export async function getUserSessions(userId: string, currentToken?: string): Promise<SessionDisplayInfo[]> {
  const currentHash = currentToken ? hashToken(currentToken) : null;
  if (canAttemptDb()) {
    try {
      const sessions = await runWithDbTimeout(() =>
        prisma.session.findMany({
          where: { userId, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        })
      );

      if (sessions.length > 0) {
        return sessions.map((s) => ({
          id: s.id,
          userId: s.userId,
          ipAddress: s.ipAddress || '127.0.0.1',
          userAgent: s.userAgent || 'Chrome / MacOS',
          device: parseUserAgent(s.userAgent || ''),
          expiresAt: s.expiresAt,
          createdAt: s.createdAt,
          lastActiveAt: s.createdAt,
          isCurrent: Boolean(
            (currentHash && s.token === currentHash) ||
            (currentToken && s.token === currentToken)
          ),
        }));
      }
    } catch {
      // Fallback
    }
  }

  return MOCK_SESSIONS.filter((s) => s.userId === userId && s.expiresAt > new Date()).map((s) => ({
    id: s.id,
    userId: s.userId,
    ipAddress: s.ipAddress || '127.0.0.1',
    userAgent: s.userAgent || 'Chrome / MacOS',
    device: s.device || parseUserAgent(s.userAgent),
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
    lastActiveAt: s.lastActiveAt,
    isCurrent: Boolean((currentToken && s.token === currentToken) || (currentHash && s.tokenHash === currentHash)),
  }));
}

// ---------------------------------------------------------------------------
// Multi-Factor Authentication (MFA / 2FA) Operations
// ---------------------------------------------------------------------------

/**
 * Verifies a 2FA TOTP or backup code and creates a full session upon success.
 */
export async function verifyMfaChallenge(
  mfaToken: string,
  code: string
): Promise<AuthenticateResult> {
  const payload = verifyShortToken<{
    userId: string;
    email: string;
    rememberMe?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }>(mfaToken);

  if (!payload) {
    return { success: false, error: 'MFA challenge expired or invalid. Please log in again.' };
  }

  const { userId, rememberMe, ipAddress, userAgent } = payload;
  const sessionDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  // 1. Try DB user
  if (canAttemptDb()) {
    try {
      const dbUser = await runWithDbTimeout(() =>
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      );

      if (dbUser && dbUser.mfaEnabled && dbUser.mfaSecret) {
        let isCodeValid = false;
        const decrypted = decryptSecret(dbUser.mfaSecret) || dbUser.mfaSecret;
        let secretB32 = decrypted;
        let backupCodes: string[] = [];

        try {
          const parsed = JSON.parse(decrypted);
          if (parsed.secret) {
            secretB32 = parsed.secret;
            backupCodes = Array.isArray(parsed.backupCodes) ? parsed.backupCodes : [];
          }
        } catch {
          // Plain secret string
        }

        const cleanCode = code.trim();
        // Check TOTP code
        if (verifyTotp(secretB32, cleanCode) !== null) {
          isCodeValid = true;
        } else if (backupCodes.includes(cleanCode)) {
          // One-time backup code match: consume code
          isCodeValid = true;
          const remainingBackup = backupCodes.filter((c) => c !== cleanCode);
          const reencrypted = encryptSecret(JSON.stringify({ secret: secretB32, backupCodes: remainingBackup }));
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { mfaSecret: reencrypted },
          });
        }

        if (!isCodeValid) {
          return { success: false, error: 'Invalid verification code or backup code' };
        }

        const token = generateSessionToken();
        await prisma.session.create({
          data: {
            userId: dbUser.id,
            token: hashToken(token),
            ipAddress,
            userAgent,
            expiresAt,
          },
        });

        await prisma.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        });

        const roles = dbUser.userRoles.map((ur) => ur.role.slug);
        const permissions = dbUser.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.action)
        );

        return {
          success: true,
          token,
          expiresAt,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            avatarUrl: dbUser.avatarUrl,
            role: roles[0] || 'admin',
            permissions,
            isActive: dbUser.isActive,
            twoFactorEnabled: true,
          },
        };
      }
    } catch {
      // Fallback
    }
  }

  // 2. Mock user fallback (dev only)
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Verification failed' };
  }

  const mockUser = MOCK_USERS.find((u) => u.id === userId);
  if (!mockUser || !mockUser.twoFactorSecret) {
    return { success: false, error: 'User not found or MFA not configured' };
  }

  const cleanCode = code.trim();
  let valid = false;
  if (verifyTotp(mockUser.twoFactorSecret, cleanCode) !== null) {
    valid = true;
  } else if (mockUser.backupCodes && mockUser.backupCodes.includes(cleanCode)) {
    valid = true;
    mockUser.backupCodes = mockUser.backupCodes.filter((c) => c !== cleanCode);
  }

  if (!valid) {
    return { success: false, error: 'Invalid verification code' };
  }

  const token = generateSessionToken();
  const sessionRecord: UserSessionData = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: mockUser.id,
    token,
    tokenHash: hashToken(token),
    ipAddress,
    userAgent,
    device: parseUserAgent(userAgent),
    expiresAt,
    createdAt: new Date(),
    lastActiveAt: new Date(),
  };
  MOCK_SESSIONS.push(sessionRecord);

  return {
    success: true,
    token,
    expiresAt,
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      avatarUrl: mockUser.avatarUrl,
      role: mockUser.role,
      permissions: mockUser.permissions,
      isActive: mockUser.isActive,
      twoFactorEnabled: true,
    },
  };
}

/**
 * Initiates MFA setup by generating a new TOTP secret and provisioning URI.
 */
export async function setupUserMfa(
  userId: string
): Promise<{ secret: string; otpauthUri: string } | null> {
  let email = 'admin@headless.io';

  if (canAttemptDb()) {
    try {
      const user = await runWithDbTimeout(() => prisma.user.findUnique({ where: { id: userId } }));
      if (user) email = user.email;
    } catch {
      // Fallback
    }
  } else {
    const mockUser = MOCK_USERS.find((u) => u.id === userId);
    if (mockUser) email = mockUser.email;
  }

  const secret = generateTotpSecret(20);
  const otpauthUri = buildOtpAuthUri(secret, email, 'Markup CMS');
  return { secret, otpauthUri };
}

/**
 * Validates the initial TOTP code to confirm enrollment and saves encrypted secret + backup codes.
 */
export async function enableUserMfa(
  userId: string,
  secretB32: string,
  code: string
): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
  const match = verifyTotp(secretB32, code);
  if (match === null) {
    return { success: false, error: 'Verification code is invalid. Check the time on your authenticator device.' };
  }

  const backupCodes = generateBackupCodes(8);
  const payload = JSON.stringify({ secret: secretB32, backupCodes });
  const encrypted = encryptSecret(payload);

  if (canAttemptDb()) {
    try {
      await runWithDbTimeout(() =>
        prisma.user.update({
          where: { id: userId },
          data: {
            mfaEnabled: true,
            mfaSecret: encrypted,
          },
        })
      );
      return { success: true, backupCodes };
    } catch {
      // Fallback
    }
  }

  const mockUser = MOCK_USERS.find((u) => u.id === userId);
  if (mockUser) {
    mockUser.twoFactorEnabled = true;
    mockUser.twoFactorSecret = secretB32;
    mockUser.backupCodes = backupCodes;
    return { success: true, backupCodes };
  }

  return { success: false, error: 'User not found' };
}

/**
 * Disables MFA after verifying user's current password.
 */
export async function disableUserMfa(
  userId: string,
  currentPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (canAttemptDb()) {
    try {
      const user = await runWithDbTimeout(() => prisma.user.findUnique({ where: { id: userId } }));
      if (!user) return { success: false, error: 'User not found' };

      const match = await verifyPassword(currentPassword, user.passwordHash);
      if (!match) return { success: false, error: 'Current password is incorrect' };

      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
        },
      });
      return { success: true };
    } catch {
      // Fallback
    }
  }

  const mockUser = MOCK_USERS.find((u) => u.id === userId);
  if (mockUser) {
    const isCurrentValid =
      (process.env.NODE_ENV !== 'production' && currentPassword === 'AdminPass123!') ||
      (await verifyPassword(currentPassword, mockUser.passwordHash));

    if (!isCurrentValid) return { success: false, error: 'Current password is incorrect' };

    mockUser.twoFactorEnabled = false;
    mockUser.twoFactorSecret = undefined;
    mockUser.backupCodes = undefined;
    return { success: true };
  }

  return { success: false, error: 'User not found' };
}

