'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing to Media Bird Weekly.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Unable to subscribe at this moment. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <section className="my-16 bg-stone-900 text-white rounded-2xl p-8 sm:p-12 border border-stone-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-editorial-crimson/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center space-y-4 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-800 text-xs font-sans font-bold uppercase tracking-wider text-red-400">
          <Mail className="w-3.5 h-3.5" />
          <span>Media Bird Dispatch</span>
        </div>

        <h3 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight">
          Slow Journalism, Delivered Weekly.
        </h3>

        <p className="font-sans text-sm sm:text-base text-stone-300 leading-relaxed">
          Receive a curated digest of our most insightful long-form essays, cultural critiques,
          and investigative deep-dives directly in your inbox. No spam. No clickbait.
        </p>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-700/50 rounded-lg text-emerald-200 text-sm flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Enter your email address..."
              required
              disabled={status === 'loading'}
              className="flex-1 px-4 py-3 text-sm text-stone-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-editorial-crimson"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-editorial-crimson hover:bg-red-800 disabled:opacity-50 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div className="mt-2 text-xs text-red-400 flex items-center justify-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{message}</span>
          </div>
        )}

        <p className="text-[11px] font-sans text-stone-400">
          By subscribing, you agree to our{' '}
          <a href="/privacy-policy" className="underline hover:text-stone-300">
            Privacy Policy
          </a>
          . You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
