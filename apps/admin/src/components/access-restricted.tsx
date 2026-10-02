'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessRestrictedProps {
  pathname?: string;
  requiredPermission?: string;
}

export function AccessRestricted({ pathname, requiredPermission }: AccessRestrictedProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-destructive/20 bg-card p-6 sm:p-8 text-center shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Access Restricted
        </h2>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
          You do not have permission to access{' '}
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[13px] text-foreground">
            {pathname || 'this resource'}
          </code>
          .
        </p>

        {user && (
          <div className="mt-5 rounded-xl border border-border/80 bg-muted/40 p-4 text-left space-y-2.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Logged in as:</span>
              <span className="font-semibold text-foreground">{user.name}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Your Role:</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Lock className="h-3 w-3" />
                {user.roleName || user.role}
              </span>
            </div>
            {requiredPermission && (
              <div className="flex items-center justify-between text-[13px] pt-1 border-t border-border/60">
                <span className="text-muted-foreground">Required Permission:</span>
                <code className="text-rose-500 font-mono text-[12px] font-medium">
                  {requiredPermission}
                </code>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="default" className="w-full gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => logout()}
            className="w-full sm:w-auto gap-2 cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
}
