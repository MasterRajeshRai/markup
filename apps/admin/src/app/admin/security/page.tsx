'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  KeyRound,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Lock,
  Server,
  FileCheck,
} from 'lucide-react';

interface SessionItem {
  id: string;
  ipAddress: string | null;
  device: string;
  userAgent: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export default function SecurityCenterPage() {
  // MFA States
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<'idle' | 'setup' | 'backup_codes'>('idle');
  const [totpSecret, setTotpSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable MFA States
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  // Sessions States
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Feedback messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch initial MFA status and active sessions
  const loadSecurityState = async () => {
    setError(null);
    try {
      // 1. Fetch MFA status
      const mfaRes = await fetch('/api/v1/auth/mfa/status');
      if (mfaRes.ok) {
        const mfaData = await mfaRes.json();
        setMfaEnabled(Boolean(mfaData.enabled));
      }
      setMfaLoading(false);

      // 2. Fetch active sessions
      const sessRes = await fetch('/api/v1/auth/sessions');
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessions(sessData.sessions || []);
      }
      setSessionsLoading(false);
    } catch {
      setError('Unable to load security state from server.');
      setMfaLoading(false);
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityState();
  }, []);

  // Initiate MFA Setup
  const handleStartMfaSetup = async () => {
    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      const res = await fetch('/api/v1/auth/mfa/setup', { method: 'POST' });
      const data = await res.json();
      setActionLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to start MFA setup.');
        return;
      }

      setTotpSecret(data.secret);
      setOtpauthUri(data.otpauthUri);
      setSetupStep('setup');
    } catch {
      setError('Failed to reach MFA setup service.');
      setActionLoading(false);
    }
  };

  // Confirm and Enable MFA
  const handleConfirmMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      const res = await fetch('/api/v1/auth/mfa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: totpSecret,
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();
      setActionLoading(false);

      if (!res.ok) {
        setError(data.error || 'Invalid verification code. Please try again.');
        return;
      }

      setMfaEnabled(true);
      setBackupCodes(data.backupCodes || []);
      setSetupStep('backup_codes');
      setSuccess('Two-factor authentication successfully enabled!');
    } catch {
      setError('Error verifying authenticator code.');
      setActionLoading(false);
    }
  };

  // Disable MFA
  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return;

    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      const res = await fetch('/api/v1/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword }),
      });

      const data = await res.json();
      setActionLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to disable MFA. Check your password.');
        return;
      }

      setMfaEnabled(false);
      setShowDisableModal(false);
      setCurrentPassword('');
      setSetupStep('idle');
      setSuccess('Two-factor authentication has been disabled.');
    } catch {
      setError('Failed to disable two-factor authentication.');
      setActionLoading(false);
    }
  };

  // Revoke a single session
  const handleRevokeSession = async (sessionId: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/v1/auth/sessions?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to revoke session.');
        return;
      }
      setSuccess('Session successfully terminated.');
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      setError('Error revoking session.');
    }
  };

  // Revoke all other sessions
  const handleRevokeAllOthers = async () => {
    if (!confirm('Are you sure you want to log out all other active sessions across devices?')) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/v1/auth/sessions?allOthers=true', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to revoke other sessions.');
        return;
      }
      setSuccess('All other sessions terminated.');
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch {
      setError('Error revoking other sessions.');
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Security Center</h1>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Defense-in-Depth Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise multi-factor credentials, session controls, SSRF shield, and cryptographic invariant telemetry.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSecurityState} disabled={mfaLoading || sessionsLoading}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Status
        </Button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div className="flex-1">{success}</div>
        </div>
      )}

      {/* Security Architecture Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/80">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Password Hashing</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-1">PBKDF2-SHA512</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            210,000 rounds with timing attack equalization and zero demo backdoors in production.
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Session Storage</span>
              <KeyRound className="w-4 h-4 text-blue-400" />
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-1">Hashed at Rest</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            SHA-256 hashed session tokens in database; HttpOnly SameSite=Lax cookie at edge.
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">SSRF & Webhooks</span>
              <Globe className="w-4 h-4 text-purple-400" />
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-1">DNS-Assert Guard</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            Blocks private subnets (RFC 1918), loopbacks, link-local, and AWS/GCP cloud metadata.
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/80">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Rate Limiting</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-1">Sliding Windows</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground">
            Multi-tier rate limits across auth (10/min), search, comments, and file uploads.
          </CardContent>
        </Card>
      </div>

      {/* TWO-FACTOR AUTHENTICATION SECTION */}
      <Card>
        <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Two-Factor Authentication (2FA / TOTP)
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Add a second verification layer using Google Authenticator, 1Password, or Authy.
            </CardDescription>
          </div>
          <div>
            {mfaLoading ? (
              <Badge variant="outline">Checking...</Badge>
            ) : mfaEnabled ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Active & Enforced
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                Disabled
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {!mfaEnabled && setupStep === 'idle' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Protect your account with TOTP</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Require an RFC 6238 time-based 6-digit one-time code alongside your password upon sign-in.
                </p>
              </div>
              <Button onClick={handleStartMfaSetup} disabled={actionLoading} className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold shrink-0">
                {actionLoading ? 'Initializing...' : 'Enable Two-Factor Auth'}
              </Button>
            </div>
          )}

          {/* Setup Step: Secret & Code Input */}
          {!mfaEnabled && setupStep === 'setup' && (
            <form onSubmit={handleConfirmMfa} className="space-y-4 p-5 rounded-xl bg-slate-950/40 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-400">Step 1: Configure Authenticator Device</h4>
                <Button variant="ghost" size="sm" onClick={() => setSetupStep('idle')} className="text-xs">
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                Add this manual key or URI into your authenticator app (Google Authenticator, Authy, Apple Passwords):
              </div>

              {/* Secret Key Display */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground">Setup Key:</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(totpSecret)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Secret
                  </button>
                </div>
                <div className="font-mono text-sm tracking-widest text-amber-400 font-bold select-all break-all">
                  {totpSecret}
                </div>
                <div className="text-[10px] text-muted-foreground truncate pt-1">
                  URI: <span className="font-mono">{otpauthUri}</span>
                </div>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">
                  Step 2: Enter 6-digit code from your authenticator app
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    required
                    maxLength={8}
                    autoFocus
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="font-mono text-base tracking-widest max-w-[200px]"
                  />
                  <Button type="submit" disabled={actionLoading || !verificationCode.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
                    {actionLoading ? 'Verifying...' : 'Verify & Activate 2FA'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Backup Codes Display */}
          {setupStep === 'backup_codes' && (
            <div className="p-5 rounded-xl bg-slate-950/60 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Save Emergency Backup Codes
                </h4>
                <Button size="sm" variant="outline" onClick={copyBackupCodes} className="text-xs">
                  {copiedCodes ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedCodes ? 'Copied' : 'Copy Codes'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                If you lose access to your authenticator app, these one-time codes are the only way to recover access. Each code can only be used once. Store them in a secure password manager.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="p-1.5 text-center text-slate-200 bg-slate-950/80 rounded border border-slate-800/80">
                    {code}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button size="sm" onClick={() => setSetupStep('idle')} className="text-xs">
                  I Have Safely Saved My Backup Codes
                </Button>
              </div>
            </div>
          )}

          {/* Active 2FA Management */}
          {mfaEnabled && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Two-Factor Authentication is Active</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    AES-256-GCM Encrypted Secret
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your account is protected from password reuse and single-factor credential stuffing.
                </p>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDisableModal(true)}
                className="shrink-0"
              >
                Disable 2FA
              </Button>
            </div>
          )}

          {/* Disable Modal Prompt */}
          {showDisableModal && (
            <form onSubmit={handleDisableMfa} className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-3">
              <h4 className="text-xs font-bold text-rose-300">Confirm Disabling Two-Factor Authentication</h4>
              <p className="text-xs text-muted-foreground">
                To prevent unauthorized removal, please enter your current administrator password:
              </p>
              <div className="flex items-center gap-3">
                <Input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="max-w-xs text-xs"
                />
                <Button type="submit" variant="destructive" size="sm" disabled={actionLoading || !currentPassword}>
                  {actionLoading ? 'Verifying...' : 'Confirm Disable'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowDisableModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ACTIVE SESSIONS MANAGEMENT */}
      <Card>
        <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-400" />
              Active Sessions & Device Control
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Audit and revoke active login tokens across devices and browsers.
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleRevokeAllOthers} className="text-xs text-rose-400 hover:text-rose-300 border-rose-900/50">
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Revoke All Other Sessions
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          {sessionsLoading ? (
            <div className="text-xs text-muted-foreground py-4 text-center">Loading active sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-xs text-muted-foreground py-4 text-center">No active sessions found.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground mt-0.5">
                      {sess.device.toLowerCase().includes('mobile') ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{sess.device}</span>
                        {sess.isCurrent && (
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px]">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>IP: {sess.ipAddress || '127.0.0.1'}</span>
                        <span>•</span>
                        <span>First sign-in: {new Date(sess.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Last active: {new Date(sess.lastActiveAt).toLocaleTimeString()}</span>
                      </div>
                      {sess.userAgent && (
                        <div className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-lg">
                          {sess.userAgent}
                        </div>
                      )}
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 self-end sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PRODUCTION HARDENING & RESIDUAL RISK DISCLOSURE */}
      <Card className="bg-card/30 border-dashed">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Security Baseline & Residual Risk Advisory
          </CardTitle>
          <CardDescription className="text-xs">
            Architectural summary of implemented security controls and external operational considerations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            • <strong>Layer 7 Defense:</strong> Next.js edge middleware enforces strict CSRF verification on cookie writes, dynamic CORS allowlists, and edge sliding-window rate limits.
          </p>
          <p>
            • <strong>File Upload Guard:</strong> Strict magic-byte validation verifies JPG, PNG, WebP, GIF, and PDF structures. Dangerous executable extensions and SVG scripts are blocked. Uploads are served with sandboxed, isolated CSP headers.
          </p>
          <p>
            • <strong>SSRF Isolation:</strong> Outbound webhook deliveries resolve hostnames and block private addresses, internal loopbacks, and cloud provider metadata IPs (169.254.169.254).
          </p>
          <p>
            • <strong>Production Note:</strong> In serverless multi-instance deployments, pair the edge limiter with an edge KV/Redis store (`RateLimitStore`) and deploy behind a reputable CDN WAF (Cloudflare/CloudFront) for volumetric DDoS mitigation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
