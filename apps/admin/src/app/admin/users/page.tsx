'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  MoreVertical,
  MapPin,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  CheckSquare,
  Link2,
  FolderOpen,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  roles: Array<{ id: string; name: string; slug: string }>;
  createdAt?: string;
}

interface RoleItem {
  id: string;
  name: string;
  slug: string;
}

type Tab = 'profile' | 'teams' | 'projects' | 'connections';

const MOCK_TEAMS = [
  { name: 'Backend Developers', members: 126, color: 'bg-blue-500', role: 'Developer' },
  { name: 'React Developers', members: 34, color: 'bg-purple-500', role: 'Developer' },
  { name: 'Vue Developers', members: 58, color: 'bg-emerald-500', role: 'Developer' },
  { name: 'Angular Developers', members: 65, color: 'bg-red-500', role: 'Developer' },
  { name: 'UI Designers', members: 72, color: 'bg-pink-500', role: 'Designer' },
  { name: 'Digital Marketing', members: 58, color: 'bg-amber-500', role: 'Marketing' },
];

const MOCK_CONNECTIONS = [
  { name: 'Cecilia Payne', connections: '45', initials: 'CP', color: 'from-violet-500 to-purple-600' },
  { name: 'Curtis Fletcher', connections: '1.32k', initials: 'CF', color: 'from-blue-500 to-cyan-500' },
  { name: 'Alice Stone', connections: '125', initials: 'AS', color: 'from-emerald-500 to-teal-500' },
  { name: 'Darroll Barnes', connections: '456', initials: 'DB', color: 'from-orange-500 to-amber-500' },
  { name: 'Eugenia Moore', connections: '1.2k', initials: 'EM', color: 'from-rose-500 to-pink-500' },
];

const MOCK_PROJECTS = [
  { name: 'Atlas CRM Revamp', type: 'Figma Project', leader: 'Olivia Reed', progress: 82, color: 'bg-rose-500', team: ['OR', 'LM'] },
  { name: 'Nimbus Analytics Portal', type: 'Next Project', leader: 'Liam Cooper', progress: 64, color: 'bg-blue-500', team: ['LC', 'SP'] },
  { name: 'Shadon UI Admin Dashboard', type: 'Laravel Project', leader: 'Sophia Patel', progress: 47, color: 'bg-emerald-500', team: ['SP', 'NC'] },
  { name: 'Vertex System', type: 'Laravel Project', leader: 'Noah Bennett', progress: 91, color: 'bg-amber-500', team: ['NB', 'AC'] },
  { name: 'Pulse API Gateway', type: 'MCP Project', leader: 'Ava Collins', progress: 58, color: 'bg-purple-500', team: ['AC', 'LM'] },
];

const MOCK_ACTIVITY = [
  {
    title: '12 Invoices have been paid',
    desc: 'Invoices have been paid to the company.',
    time: '12 min ago',
    tag: 'invoice.pdf',
    color: 'bg-blue-500',
  },
  {
    title: 'Client Meeting',
    desc: 'Project meeting with john @10:15am',
    time: '45 min ago',
    person: 'Lester McCarthy (Client)',
    personRole: 'CEO of ThemeSelection',
    color: 'bg-purple-500',
  },
  {
    title: 'Create a new project for client',
    desc: '6 team members in a project',
    time: '2 Day Ago',
    avatars: ['CP', 'CF', 'AS'],
    extra: '+3',
    color: 'bg-emerald-500',
  },
];

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
];

function Avatar({ initials, gradient, size = 'md' }: { initials: string; gradient?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-16 w-16 text-xl' };
  return (
    <div className={cn('rounded-full bg-gradient-to-tr text-white font-bold flex items-center justify-center shrink-0', gradient || 'from-blue-500 to-indigo-600', sizes[size])}>
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [projectPage, setProjectPage] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/v1/users')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setUsers(res.data);
          if (res.data[0] && !selectedUser) setSelectedUser(res.data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    fetch('/api/v1/roles').then((r) => r.json()).then((res) => {
      if (res.roles) { setRoles(res.roles); if (res.roles[0]) setSelectedRoleId(res.roles[0].id); }
    });
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, roleIds: selectedRoleId ? [selectedRoleId] : [] }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to create user'); return; }
    setIsModalOpen(false); setName(''); setEmail(''); setPassword('');
    fetchUsers();
  };

  const handleDeleteUser = async (id: string, uname: string) => {
    if (!confirm(`Delete user "${uname}"?`)) return;
    await fetch(`/api/v1/users/${id}`, { method: 'DELETE' });
    if (selectedUser?.id === id) setSelectedUser(null);
    fetchUsers();
  };

  const user = selectedUser || (users[0] ?? null);
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'April 2021';

  if (isListView) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">User Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage staff, authors, and role assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsListView(false)} className="text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" /> Profile View
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Roles</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={u.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => { setSelectedUser(u); setIsListView(false); }}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={u.name.charAt(0)} gradient={avatarColors[i % avatarColors.length]} size="sm" />
                          <span className="font-semibold text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => <Badge key={r.id} variant="secondary" className="text-[10px]">{r.name}</Badge>)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', u.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500')}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', u.isActive ? 'bg-emerald-500' : 'bg-rose-500')} />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id, u.name)} className="h-7 w-7 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {isModalOpen && <CreateUserModal roles={roles} selectedRoleId={selectedRoleId} setSelectedRoleId={setSelectedRoleId} name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error} onSubmit={handleCreateUser} onClose={() => setIsModalOpen(false)} />}
      </div>
    );
  }

  // ── Profile View ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Users</h1>
          <Badge variant="secondary" className="text-[10px]">{users.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsListView(true)} className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" /> List View
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-4">
        {/* ── User List Sidebar ── */}
        <Card className="overflow-hidden">
          <div className="px-3 py-2.5 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-8 h-8 text-xs" />
            </div>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Loading...</div>
            ) : users.map((u, i) => (
              <button
                key={u.id}
                onClick={() => { setSelectedUser(u); setActiveTab('profile'); }}
                className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors', selectedUser?.id === u.id && 'bg-accent/60')}
              >
                <Avatar initials={u.name.charAt(0)} gradient={avatarColors[i % avatarColors.length]} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate">{u.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{u.roles[0]?.name || 'User'}</div>
                </div>
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', u.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30')} />
              </button>
            ))}
          </div>
        </Card>

        {/* ── Profile Panel ── */}
        {user ? (
          <div className="space-y-4 min-w-0">
            {/* Cover + Avatar + Name */}
            <Card className="overflow-hidden">
              {/* Cover banner */}
              <div className="h-28 relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
                {/* Geometric grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {[...Array(6)].map((_, i) => (
                    <rect key={i} x={i * 80 + 20} y={8} width={24} height={24} rx={3} fill="white" fillOpacity={0.06 + (i % 3) * 0.04} />
                  ))}
                </svg>
                <button className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              <CardContent className="pt-0 pb-4 px-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 -mt-8 mb-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full ring-4 ring-card bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Connected button */}
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs self-start sm:self-auto mt-8 sm:mt-0">
                    <UserPlus className="h-3.5 w-3.5" />
                    Connected
                  </Button>
                </div>

                {/* Name + meta */}
                <div>
                  <h2 className="text-base font-bold text-foreground">{user.name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {user.roles[0]?.name || 'User'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Global
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {joinDate}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4 border-b">
                  {(['profile', 'teams', 'projects', 'connections'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={cn('px-3 py-1.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px',
                        activeTab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Tab Content ── */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
                {/* Left column */}
                <div className="space-y-4">
                  {/* About */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">About</h3>
                      {[
                        { label: 'Full Name', value: user.name },
                        { label: 'Status', value: user.isActive ? 'Active' : 'Disabled', badge: true, active: user.isActive },
                        { label: 'Role', value: user.roles[0]?.name || 'User' },
                        { label: 'Email Verified', value: user.isEmailVerified ? 'Yes' : 'No' },
                      ].map(({ label, value, badge, active }) => (
                        <div key={label} className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground w-24 shrink-0">{label}:</span>
                          {badge ? (
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500')}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-rose-500')} />{value}
                            </span>
                          ) : (
                            <span className="font-medium text-foreground">{value}</span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Contacts */}
                  <Card>
                    <CardContent className="p-4 space-y-2.5">
                      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Contacts</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground w-16 shrink-0">Email:</span>
                        <span className="font-medium text-foreground truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground w-16 shrink-0">Last Login:</span>
                        <span className="font-medium text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Overview stats */}
                  <Card>
                    <CardContent className="p-4 space-y-2.5">
                      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Overview</h3>
                      {[
                        { icon: CheckSquare, label: 'Tasks Compiled', value: '13.5k', color: 'text-blue-500' },
                        { icon: Link2, label: 'Connections', value: '897', color: 'text-emerald-500' },
                        { icon: FolderOpen, label: 'Projects', value: '146', color: 'text-purple-500' },
                      ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="flex items-center gap-2.5">
                          <div className={cn('h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0', color)}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs text-muted-foreground flex-1">{label}:</span>
                          <span className="text-xs font-bold text-foreground">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right column: Activity Timeline */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <span className="h-4 w-1 bg-primary rounded-full" />
                      Activity Timeline
                    </h3>
                    <div className="space-y-5">
                      {MOCK_ACTIVITY.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn('h-2.5 w-2.5 rounded-full shrink-0 mt-1', item.color)} />
                            {i < MOCK_ACTIVITY.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">{item.title}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                            {item.tag && (
                              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                                📎 {item.tag}
                              </span>
                            )}
                            {item.person && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white text-[9px] font-bold flex items-center justify-center">LM</div>
                                <div>
                                  <div className="text-[11px] font-semibold text-foreground">{item.person}</div>
                                  <div className="text-[10px] text-muted-foreground">{item.personRole}</div>
                                </div>
                              </div>
                            )}
                            {item.avatars && (
                              <div className="mt-1.5 flex items-center gap-1">
                                {item.avatars.map((a, j) => (
                                  <div key={j} className={cn('h-5 w-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center -ml-1 first:ml-0 ring-1 ring-card', avatarColors[j % avatarColors.length].includes('from-') ? `bg-gradient-to-tr ${avatarColors[j % avatarColors.length]}` : 'bg-slate-600')}>{a}</div>
                                ))}
                                <span className="text-[10px] text-muted-foreground ml-1">{item.extra}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-foreground">Connections</h3>
                      <button className="text-muted-foreground/60 hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-2">
                      {MOCK_CONNECTIONS.map((c) => (
                        <div key={c.name} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                          <Avatar initials={c.initials} gradient={c.color} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-foreground">{c.name}</div>
                            <div className="text-[10px] text-muted-foreground">{c.connections} Connections</div>
                          </div>
                          <button className="h-7 w-7 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                            <UserPlus className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs">View All Connections</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-foreground">Teams</h3>
                      <button className="text-muted-foreground/60 hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-2">
                      {MOCK_TEAMS.slice(0, 5).map((t) => (
                        <div key={t.name} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                          <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0', t.color)}>
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-foreground">{t.name}</div>
                            <div className="text-[10px] text-muted-foreground">{t.members} Members</div>
                          </div>
                          <Badge variant="secondary" className="text-[9px] px-1.5">{t.role}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs">View All Teams</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'teams' && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Teams</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MOCK_TEAMS.map((t) => (
                      <div key={t.name} className="p-3 rounded-xl border hover:bg-muted/30 transition-colors flex items-center gap-3">
                        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', t.color)}>
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">{t.name}</div>
                          <div className="text-[10px] text-muted-foreground">{t.members} Members</div>
                          <Badge variant="secondary" className="text-[9px] mt-1 px-1.5">{t.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'projects' && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">Projects List</h3>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="Search project" className="pl-8 h-7 text-xs w-36" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="pb-2 pr-4 text-left">Project</th>
                          <th className="pb-2 pr-4 text-left">Leader</th>
                          <th className="pb-2 pr-4 text-left">Team</th>
                          <th className="pb-2 pr-4 text-left">Progress</th>
                          <th className="pb-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {MOCK_PROJECTS.map((p, i) => (
                          <tr key={p.name} className="hover:bg-muted/20">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <div className={cn('h-6 w-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0', p.color)}>
                                  {p.name.slice(0, 1)}
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground text-xs">{p.name}</div>
                                  <div className="text-[10px] text-muted-foreground">{p.type}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground">{p.leader}</td>
                            <td className="py-3 pr-4">
                              <div className="flex -space-x-1">
                                {p.team.map((t, j) => (
                                  <div key={j} className={cn('h-6 w-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-card', `bg-gradient-to-tr ${avatarColors[(i + j) % avatarColors.length]}`)}>
                                    {t}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full min-w-[80px]">
                                  <div className={cn('h-1.5 rounded-full', p.color)} style={{ width: `${p.progress}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground w-7 shrink-0">{p.progress}%</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <button className="text-muted-foreground/60 hover:text-foreground">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-[10px] text-muted-foreground">Showing 1 to 5 of 10 entries</span>
                    <div className="flex items-center gap-1">
                      <button className="h-7 w-7 rounded border flex items-center justify-center text-muted-foreground hover:bg-muted/40 disabled:opacity-40" disabled={projectPage === 1} onClick={() => setProjectPage(1)}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      {[1, 2].map((p) => (
                        <button key={p} onClick={() => setProjectPage(p)} className={cn('h-7 w-7 rounded border text-xs font-medium', projectPage === p ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted/40')}>
                          {p}
                        </button>
                      ))}
                      <button className="h-7 w-7 rounded border flex items-center justify-center text-muted-foreground hover:bg-muted/40" onClick={() => setProjectPage(2)}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="flex items-center justify-center py-20">
            <div className="text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a user to view their profile</p>
            </div>
          </Card>
        )}
      </div>

      {isModalOpen && <CreateUserModal roles={roles} selectedRoleId={selectedRoleId} setSelectedRoleId={setSelectedRoleId} name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error} onSubmit={handleCreateUser} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function CreateUserModal({ roles, selectedRoleId, setSelectedRoleId, name, setName, email, setEmail, password, setPassword, error, onSubmit, onClose }: {
  roles: RoleItem[]; selectedRoleId: string; setSelectedRoleId: (v: string) => void;
  name: string; setName: (v: string) => void; email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void; error: string | null;
  onSubmit: (e: React.FormEvent) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="p-5 border-b">
          <h2 className="text-sm font-bold text-foreground">Create New User</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Add staff member and assign an RBAC role</p>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-5 space-y-3">
            {error && <div className="p-2.5 rounded bg-destructive/15 text-destructive text-xs">{error}</div>}
            {[{ label: 'Full Name', value: name, set: setName, placeholder: 'Jane Doe', type: 'text' },
              { label: 'Email Address', value: email, set: setEmail, placeholder: 'jane@example.com', type: 'email' },
              { label: 'Password', value: password, set: setPassword, placeholder: '••••••••', type: 'password' }].map(({ label, value, set, placeholder, type }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-semibold">{label}</label>
                <Input required type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="h-8 text-xs" />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs font-semibold">Role</label>
              <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="w-full h-8 rounded border bg-background px-3 text-xs">
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="p-4 border-t flex justify-end gap-2 bg-muted/20">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
            <Button type="submit" size="sm" className="text-xs">Create User</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
