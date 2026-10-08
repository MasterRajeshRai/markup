'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Markup Admin Runtime Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full border border-border/80 rounded-2xl bg-card p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred in the administrative interface.
          </p>
          {error.digest && (
            <div className="mt-2 text-xs font-mono bg-muted/60 text-muted-foreground px-2 py-1 rounded-md inline-block">
              Digest: {error.digest}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            size="sm"
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>

          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
