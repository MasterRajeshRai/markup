'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Shield, Plus, Check, Lock, Users, X, ChevronRight,
  FileText, Image, Tags, Settings, Key, Globe, BarChart3,
} from 'lucide-react';

interface RoleItem {
  id: string; name: string; slug: string; description?: string;
  isSystem: boolean; usersCount: number; permissions: string[];
}
interface PermissionItem { id: string; action: string; module: string; description?: string; }

const MODULE_ICONS: Record<string, React.ElementType> = {
  content: FileText, media: Image, taxonomy: Tags,
  settings: Settings, api: Key, site: Globe, analytics: BarChart3,
};

const ROLE_COLORS = [
  { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
];

const MOCK_ROLES: RoleItem[] = [
  { id: '1', name: 'Super Admin', slug: 'super_admin', description: 'Full unrestricted access to all platform features and settings.', isSystem: true, usersCount: 2, permissions: ['*'] },
  { id: '2', name: 'Editor', slug: 'editor', description: 'Can create, edit, and publish content entries. Cannot manage users or system settings.', isSystem: true, usersCount: 5, permissions: ['content.read', 'content.write', 'content.publish', 'media.read', 'media.write'] },
  { id: '3', name: 'Author', slug: 'author', description: 'Can create and edit content entries but cannot publish.', isSystem: true, usersCount: 12, permissions: ['content.read', 'content.write', 'media.read'] },
  { id: '4', name: 'Viewer', slug: 'viewer', description: 'Read-only access to content, media, and analytics.', isSystem: true, usersCount: 8, permissions: ['content.read', 'media.read', 'analytics.read'] },
];

const MOCK_PERMISSIONS: PermissionItem[] = [
  { id: '1', action: 'content.read', module: 'content', description: 'View all content entries' },
  { id: '2', action: 'content.write', module: 'content', description: 'Create and edit entries' },
  { id: '3', action: 'content.publish', module: 'content', description: 'Publish and unpublish entries' },
  { id: '4', action: 'content.delete', module: 'content', description: 'Permanently delete entries' },
  { id: '5', action: 'media.read', module: 'media', description: 'View media assets' },
  { id: '6', action: 'media.write', module: 'media', description: 'Upload and edit assets' },
  { id: '7', action: 'media.delete', module: 'media', description: 'Delete assets permanently' },
  { id: '8', action: 'taxonomy.read', module: 'taxonomy', description: 'View taxonomies and terms' },
  { id: '9', action: 'taxonomy.write', module: 'taxonomy', description: 'Manage taxonomies and terms' },
  { id: '10', action: 'settings.read', module: 'settings', description: 'View site settings' },
  { id: '11', action: 'settings.write', module: 'settings', description: 'Modify site settings' },
  { id: '12', action: 'api.manage', module: 'api', description: 'Manage API keys and webhooks' },
  { id: '13', action: 'analytics.read', module: 'analytics', description: 'Access analytics dashboards' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selected, setSelected] = useState<RoleItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const load = () => {
    fetch('/api/v1/roles').then(r => r.json()).then(res => {
      const r = res.roles?.length ? res.roles : MOCK_ROLES;
      const p = res.permissions?.length ? res.permissions : MOCK_PERMISSIONS;
      setRoles(r); setPermissions(p); setSelected(r[0] ?? null);
    }).catch(() => { setRoles(MOCK_ROLES); setPermissions(MOCK_PERMISSIONS); setSelected(MOCK_ROLES[0]); });
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, slug, description, permissionActions: selectedPerms }) });
    setShowModal(false); setName(''); setSlug(''); setDescription(''); setSelectedPerms([]); load();
  };

  const modules = Array.from(new Set(permissions.map(p => p.module)));
  const hasAll = selected?.slug === 'super_admin' || selected?.permissions.includes('*');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage role-based access control and permission matrices for your team.</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowModal(true)}>
          <Plus className="h-3.5 w-3.5" /> New Role
        </Button>
      </div>

      <div className="flex gap-4 min-h-0">
        {/* Left: Roles list */}
        <div className="w-60 shrink-0 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-1 mb-2">
            {roles.length} Roles
          </p>
          {roles.map((role, i) => {
            const c = ROLE_COLORS[i % ROLE_COLORS.length];
            const isActive = selected?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role)}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl border transition-all',
                  isActive ? 'bg-card border-primary/25 shadow-sm' : 'bg-card/50 border-transparent hover:bg-card hover:border-border'
                )}
              >
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold', c.bg, c.text)}>
                  {role.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground truncate">{role.name}</span>
                    {role.isSystem && <Lock className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Users className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground">{role.usersCount} users</span>
                  </div>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right: Permission matrix */}
        {selected ? (
          <div className="flex-1 min-w-0 space-y-4">
            {/* Role info bar */}
            <div className="bg-card border rounded-xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-base font-bold', ROLE_COLORS[roles.findIndex(r => r.id === selected.id) % ROLE_COLORS.length].bg, ROLE_COLORS[roles.findIndex(r => r.id === selected.id) % ROLE_COLORS.length].text)}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">{selected.name}</h2>
                    {selected.isSystem && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
                        <Lock className="h-2.5 w-2.5" /> System
                      </span>
                    )}
                    {hasAll && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-medium border border-violet-500/20">
                        Full Access
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{hasAll ? '∞' : selected.permissions.length}</div>
                  <div className="text-[10px] text-muted-foreground">permissions</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{selected.usersCount}</div>
                  <div className="text-[10px] text-muted-foreground">users</div>
                </div>
              </div>
            </div>

            {/* Permission matrix by module */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/20">
                <h3 className="text-xs font-bold text-foreground">Permission Matrix</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Showing which capabilities this role has across all modules</p>
              </div>
              <div className="divide-y divide-border">
                {modules.map(mod => {
                  const modPerms = permissions.filter(p => p.module === mod);
                  const ModIcon = MODULE_ICONS[mod] ?? Shield;
                  const grantedCount = hasAll ? modPerms.length : modPerms.filter(p => selected.permissions.includes(p.action)).length;
                  return (
                    <div key={mod} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <ModIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-bold text-foreground capitalize">{mod}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{grantedCount}/{modPerms.length} granted</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(grantedCount / modPerms.length) * 100}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {modPerms.map(perm => {
                          const granted = hasAll || selected.permissions.includes(perm.action);
                          return (
                            <div key={perm.id} className={cn(
                              'flex items-center justify-between p-3 rounded-lg border text-xs transition-all',
                              granted ? 'bg-emerald-500/6 border-emerald-500/20' : 'bg-muted/30 border-border opacity-50'
                            )}>
                              <div className="min-w-0">
                                <div className="font-mono font-semibold text-[11px] text-foreground truncate">{perm.action}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{perm.description}</div>
                              </div>
                              {granted
                                ? <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 ml-2"><Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /></div>
                                : <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0 ml-2"><X className="h-3 w-3 text-muted-foreground/40" /></div>
                              }
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border rounded-xl border-dashed">
            <div className="text-center">
              <Shield className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">Select a role</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Choose a role from the left to view its permissions</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
              <div>
                <h2 className="text-sm font-bold">Create Custom Role</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Assign granular permissions to a new role</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={create} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-5 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold">Role Name</label>
                    <Input required value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')); }} placeholder="Content Publisher" className="h-8 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Slug</label>
                    <Input required value={slug} onChange={e => setSlug(e.target.value)} placeholder="content_publisher" className="h-8 text-xs font-mono mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold">Description</label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Role responsibilities…" className="h-8 text-xs mt-1" />
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold">Permissions</span>
                    <span className="text-[10px] text-muted-foreground">{selectedPerms.length} selected</span>
                  </div>
                  <div className="space-y-3">
                    {modules.map(mod => {
                      const modPerms = permissions.filter(p => p.module === mod);
                      const ModIcon = MODULE_ICONS[mod] ?? Shield;
                      return (
                        <div key={mod}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <ModIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">{mod}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {modPerms.map(p => (
                              <label key={p.id} className={cn(
                                'flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all',
                                selectedPerms.includes(p.action) ? 'border-primary/30 bg-primary/5' : 'border-border hover:bg-muted/40'
                              )}>
                                <input type="checkbox" className="h-3.5 w-3.5 accent-primary" checked={selectedPerms.includes(p.action)} onChange={() => setSelectedPerms(prev => prev.includes(p.action) ? prev.filter(x => x !== p.action) : [...prev, p.action])} />
                                <span className="font-mono text-[11px]">{p.action}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-5 py-4 border-t bg-muted/20 rounded-b-2xl shrink-0">
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="text-xs gap-1"><Plus className="h-3.5 w-3.5" /> Create Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
