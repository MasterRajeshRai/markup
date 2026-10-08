import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full border border-border/80 rounded-2xl bg-card p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20 shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The requested administration page or route does not exist.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/admin">
            <Button variant="default" size="sm" className="gap-2 cursor-pointer">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
