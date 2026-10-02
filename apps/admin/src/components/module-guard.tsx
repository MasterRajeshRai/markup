'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useModules } from '@/components/modules-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Puzzle,
  Power,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface ModuleGuardProps {
  moduleId: string;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function ModuleGuard({
  moduleId,
  children,
  fallbackTitle,
  fallbackDescription,
}: ModuleGuardProps) {
  const { modules, isModuleEnabled, toggleModule, loading } = useModules();
  const [activating, setActivating] = useState(false);

  const isEnabled = isModuleEnabled(moduleId);
  const targetModule = modules.find((m) => m.id === moduleId);

  const handleActivate = async () => {
    setActivating(true);
    try {
      await toggleModule(moduleId, true);
    } finally {
      setActivating(false);
    }
  };

  // While loading initial module state, render children without flash
  if (loading) {
    return <>{children}</>;
  }

  // If enabled, render children normally
  if (isEnabled) {
    return <>{children}</>;
  }

  const moduleName = targetModule?.name || fallbackTitle || moduleId;
  const moduleDesc =
    targetModule?.description ||
    fallbackDescription ||
    'This feature is currently deactivated in your site configuration.';

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto space-y-6">
      <Card className="border-border/80 shadow-md overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />
        <CardHeader className="text-center pb-3 pt-6 space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <Puzzle className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono">
                Module Deactivated
              </Badge>
              {targetModule?.categoryLabel && (
                <Badge variant="secondary" className="text-[11px]">
                  {targetModule.categoryLabel}
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              {moduleName}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {moduleDesc}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-2 text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Why is this page inaccessible?</span>
            </div>
            <p className="leading-relaxed">
              This feature is separated into an independent module just like a WordPress plugin. It has been deactivated to conserve memory, reduce network traffic, and streamline your administrative navigation.
            </p>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/admin/modules" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-9">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>All Modules & Plugins</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleActivate}
            disabled={activating}
            className="w-full sm:w-auto gap-2 text-xs font-semibold h-9 shadow-sm"
          >
            {activating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Activating...</span>
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5" />
                <span>Activate {moduleName}</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
