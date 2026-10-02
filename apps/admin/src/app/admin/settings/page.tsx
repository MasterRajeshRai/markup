'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Globe, BarChart3, Download, Upload, Save, CheckCircle2,
  ChevronRight, Settings, Palette, Bell, Shield, Database,
} from 'lucide-react';

type Section = 'general' | 'seo' | 'notifications' | 'security' | 'migration';

const NAV: { key: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'general', label: 'General', icon: Settings, desc: 'Site identity & branding' },
  { key: 'seo', label: 'SEO & Analytics', icon: BarChart3, desc: 'Meta defaults & tracking' },
  { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email & webhook alerts' },
  { key: 'security', label: 'Security', icon: Shield, desc: 'Auth & access settings' },
  { key: 'migration', label: 'Import / Export', icon: Database, desc: 'Data migration & backup' },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-6 items-start py-5 border-b last:border-0">
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
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30', checked ? 'bg-primary' : 'bg-muted')}>
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4.5' : 'translate-x-0.5')} style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }} />
    </button>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('general');
  const [siteName, setSiteName] = useState('');
  const [domain, setDomain] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [analyticsId, setAnalyticsId] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [publishNotifs, setPublishNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/settings').then(r => r.json()).then(data => {
      if (data.site) { setSiteName(data.site.name || ''); setDomain(data.site.domain || ''); }
      if (data.settings) { setSiteTagline(data.settings.site_tagline || ''); setMetaDesc(data.settings.meta_description || ''); setAnalyticsId(data.settings.analytics_id || ''); }
    }).catch(() => {});
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    await fetch('/api/v1/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: siteName, domain, settings: { site_title: siteName, site_tagline: siteTagline, meta_description: metaDesc, analytics_id: analyticsId } }),
    }).catch(() => {});
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImportStatus(null);
    try {
      const bundle = JSON.parse(await file.text());
      const res = await fetch('/api/v1/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bundle) });
      const data = await res.json();
      if (res.ok) setImportStatus({ type: 'success', msg: `Imported ${data.report?.entriesToImport ?? 0} entries and ${data.report?.contentTypesToImport ?? 0} models.` });
      else setImportStatus({ type: 'error', msg: data.error || 'Import failed' });
    } catch { setImportStatus({ type: 'error', msg: 'Failed to parse JSON file' }); }
  };

  return (
    <div className="flex gap-6">
      {/* Left nav */}
      <div className="w-52 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-2">Settings</p>
        <nav className="space-y-0.5">
          {NAV.map(({ key, label, icon: Icon, desc }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={cn(
                'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                section === key ? 'bg-card border border-primary/20 shadow-sm' : 'hover:bg-card/70 hover:border-border border border-transparent'
              )}
            >
              <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', section === key ? 'bg-primary/10' : 'bg-muted')}>
                <Icon className={cn('h-3.5 w-3.5', section === key ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div className="min-w-0">
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
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Settings saved successfully.
          </div>
        )}

        <form onSubmit={save}>
          <div className="bg-card border rounded-xl overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 border-b bg-muted/20">
              {(() => { const s = NAV.find(n => n.key === section)!; const Icon = s.icon; return (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{s.label}</h2>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ); })()}
            </div>

            {/* Fields */}
            <div className="px-6">
              {section === 'general' && (
                <>
                  <Field label="Site Name" hint="The public name of your site, used in browser titles and emails.">
                    <Input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Acme Digital Portal" className="h-9 text-sm" />
                  </Field>
                  <Field label="Primary Domain" hint="The canonical URL for your site. Used in sitemap and canonical tags.">
                    <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="https://acme.com" className="h-9 text-sm font-mono" />
                  </Field>
                  <Field label="Tagline" hint="A short description shown in meta tags and the admin dashboard.">
                    <Input value={siteTagline} onChange={e => setSiteTagline(e.target.value)} placeholder="The Universal Content Platform" className="h-9 text-sm" />
                  </Field>
                  <Field label="Logo" hint="Upload a logo for the admin panel header. SVG or PNG recommended.">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold">
                        {siteName?.charAt(0) || 'A'}
                      </div>
                      <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5">
                        <Upload className="h-3.5 w-3.5" /> Upload Logo
                      </Button>
                    </div>
                  </Field>
                </>
              )}

              {section === 'seo' && (
                <>
                  <Field label="Default Meta Description" hint="Used when no specific meta description is set on an entry.">
                    <textarea rows={3} value={metaDesc} onChange={e => setMetaDesc(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      placeholder="Enterprise-grade headless content management system." />
                    <p className="text-[10px] text-muted-foreground mt-1">{metaDesc.length}/160 characters</p>
                  </Field>
                  <Field label="Google Analytics / GTM ID" hint="Your GA4 Measurement ID or Google Tag Manager container ID.">
                    <Input value={analyticsId} onChange={e => setAnalyticsId(e.target.value)} placeholder="G-XXXXXXXXXX or GTM-XXXXXXX" className="h-9 text-sm font-mono" />
                  </Field>
                  <Field label="Robots.txt Directive" hint="Control how search engines index your content.">
                    <div className="flex items-center gap-3">
                      {['index, follow', 'noindex, nofollow'].map(v => (
                        <label key={v} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input type="radio" name="robots" defaultChecked={v === 'index, follow'} className="accent-primary" />
                          <code className="text-xs">{v}</code>
                        </label>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {section === 'notifications' && (
                <>
                  <Field label="Email Notifications" hint="Send email alerts when content is submitted for review or published.">
                    <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(p => !p)} />
                  </Field>
                  <Field label="Publish Alerts" hint="Notify editors via email when scheduled content goes live.">
                    <Toggle checked={publishNotifs} onChange={() => setPublishNotifs(p => !p)} />
                  </Field>
                  <Field label="Notification Email" hint="The address that receives system alerts.">
                    <Input type="email" placeholder="admin@acme.com" className="h-9 text-sm" />
                  </Field>
                  <Field label="Webhook URL" hint="POST a JSON payload to this URL on content events.">
                    <Input placeholder="https://hooks.example.com/cms" className="h-9 text-sm font-mono" />
                  </Field>
                </>
              )}

              {section === 'security' && (
                <>
                  <Field label="Two-Factor Authentication" hint="Require 2FA for all admin accounts on login.">
                    <Toggle checked={twoFactor} onChange={() => setTwoFactor(p => !p)} />
                  </Field>
                  <Field label="Session Timeout" hint="Automatically log out idle sessions after this many minutes.">
                    <div className="flex items-center gap-2">
                      <Input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="h-9 text-sm w-24" min="5" max="1440" />
                      <span className="text-xs text-muted-foreground">minutes</span>
                    </div>
                  </Field>
                  <Field label="Allowed IP Ranges" hint="Restrict admin access to specific IP CIDR ranges. Leave blank to allow all.">
                    <Input placeholder="192.168.1.0/24, 10.0.0.0/8" className="h-9 text-sm font-mono" />
                    <p className="text-[10px] text-muted-foreground mt-1">Comma-separated CIDR blocks</p>
                  </Field>
                </>
              )}

              {section === 'migration' && (
                <div className="py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Download className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Export</div>
                          <div className="text-[11px] text-muted-foreground">Download full JSON bundle</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Exports all content types, entries, media records, and settings into a portable JSON file.</p>
                      <Button type="button" variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={() => window.open('/api/v1/export', '_blank')}>
                        <Download className="h-3.5 w-3.5" /> Export Site JSON
                      </Button>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Upload className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Import</div>
                          <div className="text-[11px] text-muted-foreground">Upload a JSON migration bundle</div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Imports content types and entries from a previously exported bundle. Existing data is preserved.</p>
                      <input type="file" accept=".json" ref={importRef} className="hidden" onChange={handleImport} />
                      <Button type="button" variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={() => importRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5" /> Import JSON Bundle
                      </Button>
                    </div>
                  </div>

                  {importStatus && (
                    <div className={cn('p-3.5 rounded-xl border text-xs font-medium', importStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive')}>
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
                <Button type="submit" disabled={saving} size="sm" className="gap-1.5 text-xs">
                  <Save className="h-3.5 w-3.5" />
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
