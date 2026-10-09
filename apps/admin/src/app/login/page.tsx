'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Layers,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Clock,
  Shield,
  Check,
} from 'lucide-react';

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading security portal...</div>}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'login' | 'forgot' | 'reset' | 'mfa'
  const initialMode = searchParams.get('mode') === 'reset' ? 'reset' : 'login';
  const initialToken = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || 'admin@headless.io';
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset' | 'mfa'>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('AdminPass123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // MFA Challenge state
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Reset password states
  const [resetToken, setResetToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoResetUrl, setDemoResetUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Monitor CapsLock
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Sign In handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to authenticate');
        setLoading(false);
        return;
      }

      if (data.mfaRequired && data.mfaToken) {
        setMfaToken(data.mfaToken);
        setMode('mfa');
        setLoading(false);
        return;
      }

      setSuccessMessage('Authentication verified. Redirecting to control plane...');
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 600);
    } catch {
      setError('Network error while connecting to authentication service.');
      setLoading(false);
    }
  };

  // MFA Challenge handler
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken) {
      setError('Two-factor session expired. Please sign in again.');
      setMode('login');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, code: mfaCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid verification code');
        setLoading(false);
        return;
      }

      setSuccessMessage('Two-factor credentials verified. Redirecting...');
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 600);
    } catch {
      setError('Network error while verifying 2FA challenge.');
      setLoading(false);
    }
  };

  // Forgot Password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to request password reset.');
        return;
      }

      setSuccessMessage(data.message || 'Password reset instructions have been sent.');
      if (data.demoResetUrl) {
        setDemoResetUrl(data.demoResetUrl);
      }
    } catch {
      setError('Unable to contact password recovery gateway.');
      setLoading(false);
    }
  };

  // Reset Password handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Password reset failed.');
        return;
      }

      setSuccessMessage('Password successfully updated! You may now sign in with your new credentials.');
      setPassword(newPassword);
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch {
      setError('Error updating password.');
      setLoading(false);
    }
  };

  // Quick Seed Role Switcher
  const setPresetUser = (presetEmail: string) => {
    setEmail(presetEmail);
    if (presetEmail === 'admin@headless.io') setPassword('AdminPass123!');
    if (presetEmail === 'editor@headless.io') setPassword('EditorPass123!');
    if (presetEmail === 'author@headless.io') setPassword('AuthorPass123!');
    if (presetEmail === 'reviewer@headless.io') setPassword('ReviewerPass123!');
  };

  // Password strength calculation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-10">
        {/* Brand Header */}
        <div className="p-6 pb-4 text-center border-b border-slate-800/80 bg-slate-900/40">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Markup CMS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Security Control Plane & Content Infrastructure
          </p>
        </div>

        {/* Dynamic Form Content */}
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" onKeyDown={handleKeyDown}>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@headless.io"
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Password with Eye Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Caps Lock Alert */}
                {capsLockActive && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Caps Lock is ON</span>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-0"
                  />
                  <span>Remember session for 30 days</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>

              {/* Quick Preset Role Switcher */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Fast Login Seed Accounts:</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    Offline Resilient
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPresetUser('admin@headless.io')}
                    className="flex items-center gap-1.5 p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
                  >
                    <span className="text-amber-400 font-semibold">Super Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('editor@headless.io')}
                    className="flex items-center gap-1.5 p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
                  >
                    <span className="text-blue-400 font-semibold">Chief Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('author@headless.io')}
                    className="flex items-center gap-1.5 p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
                  >
                    <span className="text-purple-400 font-semibold">Staff Author</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser('reviewer@headless.io')}
                    className="flex items-center gap-1.5 p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors"
                  >
                    <span className="text-emerald-400 font-semibold">Fact Checker</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MODE: TWO-FACTOR AUTHENTICATION CHALLENGE */}
          {mode === 'mfa' && (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  Two-Factor Authentication is active for this account. Enter the 6-digit verification code from your authenticator app (Google Authenticator, Authy) or an 8-character backup code.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Authentication Code</span>
                  <span className="text-[10px] text-slate-500">TOTP or Backup Code</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  autoComplete="one-time-code"
                  maxLength={16}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 text-center font-mono text-lg tracking-widest bg-slate-950 border border-slate-800 rounded-lg text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !mfaCode.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMfaCode('');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 w-full pt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </form>
          )}

          {/* MODE 2: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-xs text-slate-400 leading-relaxed">
                Enter your verified account email address. We will dispatch a cryptographically signed password reset link.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@headless.io"
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
              </button>

              {demoResetUrl && (
                <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/30 space-y-1.5">
                  <span className="text-[11px] font-semibold text-amber-400">Demo Instant Reset Link:</span>
                  <a
                    href={demoResetUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      setMode('reset');
                      setResetToken(new URL(demoResetUrl).searchParams.get('token') || '');
                    }}
                    className="block text-xs font-mono text-blue-400 hover:underline truncate"
                  >
                    Click to Open Password Reset Screen
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 w-full pt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </form>
          )}

          {/* MODE 3: RESET PASSWORD VIA TOKEN */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-xs text-slate-400 leading-relaxed">
                Set a strong, new password for account <strong className="text-slate-200">{email}</strong>.
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="space-y-1.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Password Strength:</span>
                    <span
                      className={`font-semibold ${
                        strengthScore >= 4 ? 'text-emerald-400' : strengthScore >= 2 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {strengthScore >= 4 ? 'Strong' : strengthScore >= 2 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthScore >= 1 ? 'bg-rose-500' : 'bg-transparent'}`} />
                    <div className={`h-full ${strengthScore >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                    <div className={`h-full ${strengthScore >= 3 ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div className={`h-full ${strengthScore >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-400 pt-1">
                    <span className={hasMinLength ? 'text-emerald-400' : ''}>✓ 8+ Characters</span>
                    <span className={hasUpperCase && hasLowerCase ? 'text-emerald-400' : ''}>✓ Upper & Lowercase</span>
                    <span className={hasNumber ? 'text-emerald-400' : ''}>✓ Number</span>
                    <span className={hasSpecial ? 'text-emerald-400' : ''}>✓ Special symbol</span>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 w-full pt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </form>
          )}
        </div>

        {/* Security Trust Badges */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PBKDF2-SHA512</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>HttpOnly Session</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Brute-Force Shield</span>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-6 text-xs text-slate-500">
        Markup CMS © 2026 • High-Security Architecture
      </div>
    </div>
  );
}
