'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Globe, BarChart3, Download, Upload, Save, CheckCircle2,
  ChevronRight, Settings, Palette, Bell, Shield, Database,
  Image as ImageIcon, Trash2, ExternalLink, RefreshCw, AlertCircle,
  Sparkles, Check,
} from 'lucide-react';

type Section = 'general' | 'seo' | 'notifications' | 'security' | 'migration';

const NAV: { key: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'general', label: 'General & Branding', icon: Settings, desc: 'Site identity, logo & favicon' },
  { key: 'seo', label: 'SEO & Analytics', icon: BarChart3, desc: 'Meta defaults & tracking' },
  { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email & webhook alerts' },
  { key: 'security', label: 'Security & Access', icon: Shield, desc: 'Auth & IP restrictions' },
  { key: 'migration', label: 'Import / Export', icon: Database, desc: 'Data migration & backup' },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-6 items-start py-5 border-b last:border-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('general');
  const [loading, setLoading] = useState(true);

  // General & Branding
  const [siteName, setSiteName] = useState('Markup Digital Portal');
  const [domain, setDomain] = useState('http://localhost:3000');
  const [siteTagline, setSiteTagline] = useState('Enterprise Universal Content Operating System');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');

  // Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // SEO & Analytics
  const [metaDesc, setMetaDesc] = useState('Enterprise API-first headless content management system.');
  const [analyticsId, setAnalyticsId] = useState('G-MARKUP2026');
  const [robotsDirective, setRobotsDirective] = useState('index, follow');

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [publishNotifs, setPublishNotifs] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('admin@headless.io');
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:3000/api/v1/webhooks/mock-consumer');

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [allowedIps, setAllowedIps] = useState('');

  // Status
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Migration
  const importRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Load settings on mount
  useEffect(() => {
    fetch('/api/v1/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.site) {
          if (data.site.name) setSiteName(data.site.name);
          if (data.site.domain) setDomain(data.site.domain);
          if (data.site.branding) {
            if (data.site.branding.logoUrl) setLogoUrl(data.site.branding.logoUrl);
            if (data.site.branding.faviconUrl) setFaviconUrl(data.site.branding.faviconUrl);
            if (data.site.branding.primaryColor) setPrimaryColor(data.site.branding.primaryColor);
          }
        }
        if (data.settings) {
          if (data.settings.site_tagline) setSiteTagline(String(data.settings.site_tagline));
          if (data.settings.site_logo && !logoUrl) setLogoUrl(String(data.settings.site_logo));
          if (data.settings.site_favicon && !faviconUrl) setFaviconUrl(String(data.settings.site_favicon));
          if (data.settings.meta_description) setMetaDesc(String(data.settings.meta_description));
          if (data.settings.analytics_id) setAnalyticsId(String(data.settings.analytics_id));
          if (data.settings.robots) setRobotsDirective(String(data.settings.robots));
          if (data.settings.email_notifications !== undefined) setEmailNotifs(Boolean(data.settings.email_notifications));
          if (data.settings.publish_alerts !== undefined) setPublishNotifs(Boolean(data.settings.publish_alerts));
          if (data.settings.notification_email) setNotificationEmail(String(data.settings.notification_email));
          if (data.settings.webhook_url) setWebhookUrl(String(data.settings.webhook_url));
          if (data.settings.two_factor_required !== undefined) setTwoFactor(Boolean(data.settings.two_factor_required));
          if (data.settings.session_timeout) setSessionTimeout(String(data.settings.session_timeout));
          if (data.settings.allowed_ips) setAllowedIps(String(data.settings.allowed_ips));
        }
      })
      .catch((err) => console.error('Error loading settings:', err))
      .finally(() => setLoading(false));
  }, []);

  // Broadcast branding update to Sidebar and other components
  const broadcastBranding = (name: string, logo: string, favicon: string) => {
    const detail = { name, logoUrl: logo, faviconUrl: favicon, primaryColor };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cms-settings-updated', { detail }));
      localStorage.setItem('cms_site_branding', JSON.stringify(detail));
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('seoName', 'site-logo');

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload logo');
      }

      const uploadedUrl = data.assets?.[0]?.publicUrl || data.assets?.[0]?.variants?.[0]?.publicUrl;
      if (uploadedUrl) {
        setLogoUrl(uploadedUrl);
        broadcastBranding(siteName, uploadedUrl, faviconUrl);
      } else {
        throw new Error('No public URL returned from upload');
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setUploadError(err.message || 'Logo upload failed');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Handle Favicon Upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('seoName', 'favicon');

      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload favicon');
      }

      const uploadedUrl = data.assets?.[0]?.publicUrl || data.assets?.[0]?.variants?.[0]?.publicUrl;
      if (uploadedUrl) {
        setFaviconUrl(uploadedUrl);
        broadcastBranding(siteName, logoUrl, uploadedUrl);
      }
    } catch (err: any) {
      console.error('Favicon upload error:', err);
      setUploadError(err.message || 'Favicon upload failed');
    } finally {
      setIsUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const payload = {
        name: siteName,
        domain,
        branding: {
          logoUrl,
          faviconUrl,
          primaryColor,
        },
        settings: {
          site_title: siteName,
          site_tagline: siteTagline,
          site_logo: logoUrl,
          site_favicon: faviconUrl,
          meta_description: metaDesc,
          analytics_id: analyticsId,
          robots: robotsDirective,
          email_notifications: emailNotifs,
          publish_alerts: publishNotifs,
          notification_email: notificationEmail,
          webhook_url: webhookUrl,
          two_factor_required: twoFactor,
          session_timeout: sessionTimeout,
          allowed_ips: allowedIps,
        },
      };

      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        broadcastBranding(siteName, logoUrl, faviconUrl);
        setTimeout(() => setSaved(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus(null);
    try {
      const bundle = JSON.parse(await file.text());
      const res = await fetch('/api/v1/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle),
      });
      const data = await res.json();
      if (res.ok) {
        setImportStatus({
          type: 'success',
          msg: `Imported ${data.report?.entriesToImport ?? 0} entries and ${data.report?.contentTypesToImport ?? 0} models.`,
        });
      } else {
        setImportStatus({ type: 'error', msg: data.error || 'Import failed' });
      }
    } catch {
      setImportStatus({ type: 'error', msg: 'Failed to parse JSON file' });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left nav */}
      <div className="w-full lg:w-56 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-2">
          Configuration
        </p>
        <nav className="space-y-1">
          {NAV.map(({ key, label, icon: Icon, desc }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={cn(
                'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer',
                section === key
                  ? 'bg-card border border-primary/20 shadow-xs'
                  : 'hover:bg-card/70 hover:border-border border border-transparent'
              )}
            >
              <div
                className={cn(
                  'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                  section === key ? 'bg-primary/10' : 'bg-muted'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', section === key ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground truncate">{desc}</div>
              </div>
              {section === key && <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0">
        {saved && (
          <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Settings and branding saved successfully. Changes are live across the platform.</span>
          </div>
        )}

        {uploadError && (
          <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={save}>
          <div className="bg-card border rounded-xl overflow-hidden shadow-2xs">
            {/* Section header */}
            <div className="px-6 py-4 border-b bg-muted/20">
              {(() => {
                const s = NAV.find((n) => n.key === section)!;
                const Icon = s.icon;
                return (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">{s.label}</h2>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Hidden File Inputs for Logo and Favicon */}
            <input
              type="file"
              ref={logoInputRef}
              accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <input
              type="file"
              ref={faviconInputRef}
              accept="image/png,image/x-icon,image/svg+xml"
              onChange={handleFaviconUpload}
              className="hidden"
            />

            {/* Fields */}
            <div className="px-6">
              {section === 'general' && (
                <>
                  <Field label="Site Name" hint="The public name of your site, used in browser titles, headers, and outgoing emails.">
                    <Input
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Markup Digital Portal"
                      className="h-9 text-sm"
                    />
                  </Field>

                  <Field label="Primary Domain" hint="The canonical root URL for your site. Used in sitemap, canonical links, and API delivery.">
                    <Input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="http://localhost:3000"
                      className="h-9 text-sm font-mono"
                    />
                  </Field>

                  <Field label="Tagline" hint="A short description shown in meta tags and dashboard previews.">
                    <Input
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                      placeholder="Enterprise Universal Content Operating System"
                      className="h-9 text-sm"
                    />
                  </Field>

                  {/* SITE LOGO UPLOAD (Fully Functional) */}
                  <Field label="Site Logo" hint="Upload your site logo for the admin panel header and frontend client. SVG, WebP, PNG recommended.">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Logo Preview Container */}
                        <div className="h-14 w-24 rounded-xl border border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative group">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt="Site Logo"
                              className="h-full w-full object-contain p-1.5"
                              onError={() => setUploadError('Failed to display logo preview from URL')}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground/60">
                              <ImageIcon className="h-5 w-5 mb-0.5" />
                              <span className="text-[10px] font-bold uppercase">{siteName?.charAt(0) || 'M'}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingLogo}
                            onClick={() => logoInputRef.current?.click()}
                            className="text-xs gap-1.5 h-8 font-medium cursor-pointer"
                          >
                            <Upload className={cn('h-3.5 w-3.5', isUploadingLogo ? 'animate-spin' : '')} />
                            <span>{isUploadingLogo ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                          </Button>

                          {logoUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setLogoUrl('');
                                broadcastBranding(siteName, '', faviconUrl);
                              }}
                              className="text-xs text-destructive hover:bg-destructive/10 gap-1.5 h-8 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Direct Logo URL Option */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Or Direct URL / CDN Path</label>
                        <Input
                          value={logoUrl}
                          onChange={(e) => {
                            setLogoUrl(e.target.value);
                            broadcastBranding(siteName, e.target.value, faviconUrl);
                          }}
                          placeholder="https://cdn.example.com/logo.svg or /uploads/..."
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </Field>

                  {/* SITE FAVICON UPLOAD */}
                  <Field label="Site Favicon" hint="Upload a 32x32 or 64x64 icon for browser tabs and mobile bookmarks.">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg border border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {faviconUrl ? (
                            <img src={faviconUrl} alt="Favicon" className="h-6 w-6 object-contain" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-muted-foreground/60" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingFavicon}
                            onClick={() => faviconInputRef.current?.click()}
                            className="text-xs gap-1.5 h-8 cursor-pointer"
                          >
                            <Upload className={cn('h-3.5 w-3.5', isUploadingFavicon ? 'animate-spin' : '')} />
                            <span>{isUploadingFavicon ? 'Uploading...' : faviconUrl ? 'Change Favicon' : 'Upload Favicon'}</span>
                          </Button>

                          {faviconUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFaviconUrl('');
                                broadcastBranding(siteName, logoUrl, '');
                              }}
                              className="text-xs text-destructive hover:bg-destructive/10 gap-1.5 h-8 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      <Input
                        value={faviconUrl}
                        onChange={(e) => {
                          setFaviconUrl(e.target.value);
                          broadcastBranding(siteName, logoUrl, e.target.value);
                        }}
                        placeholder="Favicon URL (e.g. /favicon.ico)"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </Field>

                  {/* BRAND ACCENT COLOR */}
                  <Field label="Brand Accent Color" hint="Primary theme color used in dashboard accents and client components.">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-9 w-12 rounded-lg border border-border cursor-pointer bg-background p-1"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-9 w-32 font-mono text-sm"
                        placeholder="#3b82f6"
                      />
                      <div
                        className="h-6 w-6 rounded-full border shadow-2xs"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                  </Field>
                </>
              )}

              {section === 'seo' && (
                <>
                  <Field label="Default Meta Description" hint="Used when no specific meta description is set on an entry.">
                    <textarea
                      rows={3}
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      placeholder="Enterprise-grade headless content management system."
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">{metaDesc.length}/160 characters</p>
                  </Field>

                  <Field label="Google Analytics / GTM ID" hint="Your GA4 Measurement ID or Google Tag Manager container ID.">
                    <Input
                      value={analyticsId}
                      onChange={(e) => setAnalyticsId(e.target.value)}
                      placeholder="G-XXXXXXXXXX or GTM-XXXXXXX"
                      className="h-9 text-sm font-mono"
                    />
                  </Field>

                  <Field label="Robots.txt Directive" hint="Control how search engines index your content by default.">
                    <div className="flex flex-wrap items-center gap-4">
                      {['index, follow', 'noindex, nofollow', 'noindex, follow'].map((v) => (
                        <label key={v} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="robots"
                            checked={robotsDirective === v}
                            onChange={() => setRobotsDirective(v)}
                            className="accent-primary cursor-pointer"
                          />
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{v}</code>
                        </label>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {section === 'notifications' && (
                <>
                  <Field label="Email Notifications" hint="Send email alerts when content is submitted for review or published.">
                    <Toggle checked={emailNotifs} onChange={() => setEmailNotifs((p) => !p)} />
                  </Field>

                  <Field label="Publish Alerts" hint="Notify editors via email when scheduled content goes live.">
                    <Toggle checked={publishNotifs} onChange={() => setPublishNotifs((p) => !p)} />
                  </Field>

                  <Field label="Notification Email" hint="The primary inbox address that receives administrative and operational alerts.">
                    <Input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      placeholder="admin@headless.io"
                      className="h-9 text-sm"
                    />
                  </Field>

                  <Field label="Default Webhook Dispatch URL" hint="POST a JSON payload to this endpoint on content mutation events.">
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="http://localhost:3000/api/v1/webhooks/mock-consumer"
                      className="h-9 text-sm font-mono"
                    />
                  </Field>
                </>
              )}

              {section === 'security' && (
                <>
                  <Field label="Two-Factor Authentication" hint="Enforce 2FA for all administrative accounts upon login.">
                    <Toggle checked={twoFactor} onChange={() => setTwoFactor((p) => !p)} />
                  </Field>

                  <Field label="Session Timeout" hint="Automatically invalidate and log out idle admin sessions after inactivity.">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="h-9 text-sm w-28"
                        min="5"
                        max="1440"
                      />
                      <span className="text-xs text-muted-foreground font-medium">minutes</span>
                    </div>
                  </Field>

                  <Field label="Allowed IP Ranges" hint="Restrict admin login to specific CIDR addresses. Leave empty to allow all IP addresses.">
                    <Input
                      value={allowedIps}
                      onChange={(e) => setAllowedIps(e.target.value)}
                      placeholder="192.168.1.0/24, 10.0.0.0/8"
                      className="h-9 text-sm font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Comma-separated IPv4 or IPv6 CIDR blocks</p>
                  </Field>
                </>
              )}

              {section === 'migration' && (
                <div className="py-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Download className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Export Platform Data</div>
                          <div className="text-[11px] text-muted-foreground">Download portable JSON bundle</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Exports all content models, entries, taxonomies, media records, and site configurations into a standardized JSON snapshot.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-1.5 cursor-pointer"
                        onClick={() => window.open('/api/v1/export', '_blank')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Site JSON</span>
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Upload className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Import Migration Bundle</div>
                          <div className="text-[11px] text-muted-foreground">Restore from JSON backup</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Imports content models and entries from a previous snapshot. Existing records and IDs are safely preserved.
                      </p>
                      <input type="file" accept=".json" ref={importRef} className="hidden" onChange={handleImport} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs gap-1.5 cursor-pointer"
                        onClick={() => importRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Import JSON Bundle</span>
                      </Button>
                    </div>
                  </div>

                  {importStatus && (
                    <div
                      className={cn(
                        'p-3.5 rounded-xl border text-xs font-medium',
                        importStatus.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-destructive/10 border-destructive/20 text-destructive'
                      )}
                    >
                      {importStatus.type === 'success' ? <CheckCircle2 className="inline h-3.5 w-3.5 mr-1.5" /> : null}
                      {importStatus.msg}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {section !== 'migration' && (
              <div className="px-6 py-4 border-t bg-muted/10 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Changes are applied immediately after saving.</p>
                <Button type="submit" disabled={saving} size="sm" className="gap-1.5 text-xs cursor-pointer shadow-xs">
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving…' : 'Save Changes'}</span>
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
