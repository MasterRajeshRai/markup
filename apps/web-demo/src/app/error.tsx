'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function WebDemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Web Demo Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            We encountered an unexpected issue while loading this page.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
