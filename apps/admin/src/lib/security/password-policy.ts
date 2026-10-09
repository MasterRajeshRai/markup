/**
 * Password policy (NIST 800-63B inspired): length first, deny known-bad passwords,
 * no personal-info reuse. Edge-safe.
 */

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'letmein', 'welcome',
  'welcome1', 'welcome123', 'admin', 'admin123', 'administrator', 'qwerty', 'qwerty123', 'qwertyuiop', 'abc123',
  'iloveyou', 'monkey', 'dragon', 'football', 'baseball', 'master', 'sunshine', 'princess', 'changeme', 'changeit',
  'default', 'secret', 'letmein123', 'trustno1', 'markup', 'markup123', 'headless', 'headless123', 'cms', 'cms12345',
  'adminpass123', 'editorpass123', 'authorpass123', 'reviewerpass123', 'developerpass123', 'contributorpass123',
]);

export interface PasswordCheck {
  ok: boolean;
  errors: string[];
}

function isSequential(pw: string): boolean {
  const s = pw.toLowerCase();
  if (s.length < 6) return false;
  let asc = 0;
  let desc = 0;
  for (let i = 1; i < s.length; i++) {
    const d = s.charCodeAt(i) - s.charCodeAt(i - 1);
    if (d === 1) asc++;
    if (d === -1) desc++;
  }
  return asc >= s.length - 2 || desc >= s.length - 2;
}

export function checkPasswordStrength(password: string, context: { email?: string; name?: string } = {}): PasswordCheck {
  const errors: string[] = [];
  const pw = typeof password === 'string' ? password : '';

  if (pw.length < PASSWORD_MIN_LENGTH) errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  if (pw.length > PASSWORD_MAX_LENGTH) errors.push(`Password must be at most ${PASSWORD_MAX_LENGTH} characters long`);

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  if (pw.length > 0 && pw.length < 16 && classes < 3) {
    errors.push('Use at least three of: lowercase, uppercase, numbers, symbols (or a passphrase of 16+ characters)');
  }
  if (/^(.)\1+$/.test(pw) || isSequential(pw)) errors.push('Password is too predictable (repeated or sequential characters)');

  const lower = pw.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9]/g, '').replace(/\d+$/, '');
  if (COMMON.has(lower) || COMMON.has(stripped)) errors.push('Password is too common');

  const local = (context.email || '').split('@')[0].toLowerCase();
  if (local.length >= 4 && lower.includes(local)) errors.push('Password must not contain your email name');
  const first = (context.name || '').trim().split(/\s+/)[0]?.toLowerCase();
  if (first && first.length >= 4 && lower.includes(first)) errors.push('Password must not contain your name');

  return { ok: errors.length === 0, errors };
}

export const validatePasswordPolicy = checkPasswordStrength;
