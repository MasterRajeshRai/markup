'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  GitBranch,
  MessageSquare,
  Send,
  Cpu,
  ExternalLink,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/app/api/v1/notifications/route';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'workflow' | 'comment' | 'system'>('all');
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh periodically
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_all' }),
      });
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.read;
    if (activeTab === 'workflow') return item.category === 'workflow';
    if (activeTab === 'comment') return item.category === 'comment';
    if (activeTab === 'system') return item.category === 'system' || item.category === 'publishing';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workflow':
        return <GitBranch className="h-3.5 w-3.5 text-orange-500" />;
      case 'comment':
        return <MessageSquare className="h-3.5 w-3.5 text-blue-500" />;
      case 'publishing':
        return <Send className="h-3.5 w-3.5 text-emerald-500" />;
      case 'system':
      default:
        return <Cpu className="h-3.5 w-3.5 text-purple-500" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
        title="Notifications & Activity Center"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-xs animate-in zoom-in-50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Popover Dropdown Panel with High Z-Index & Mobile Backdrop */}
      {isOpen && (
        <>
          {/* Mobile backdrop to prevent bleed-through and enable tap-outside dismissal */}
          <div
            className="fixed inset-0 bg-black/40 z-[9990] sm:hidden animate-in fade-in-50 duration-150"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-3 top-18 max-w-sm mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 rounded-xl border bg-card text-card-foreground shadow-2xl z-[9999] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Activity Center</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/60 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b bg-muted/10 overflow-x-auto text-[11px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'workflow', label: 'Workflows' },
              { id: 'comment', label: 'Comments' },
              { id: 'system', label: 'System' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer text-xs',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p>No notifications in this view.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'p-3 transition-colors flex items-start gap-2.5 relative group',
                    !item.read ? 'bg-primary/5 hover:bg-primary/8' : 'hover:bg-muted/40'
                  )}
                >
                  <div className="h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-xs text-foreground truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground/75 font-mono shrink-0">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                      {item.link ? (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <span>{item.actionLabel || 'View Details'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span />
                      )}

                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkRead(item.id, e)}
                          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted cursor-pointer"
                          title="Mark read"
                        >
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {!item.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/20 text-center">
            <Link
              href="/admin/audit-logs"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              View System Audit Logs →
            </Link>
          </div>
        </div>
      </>
    )}
  </div>
  );
}
