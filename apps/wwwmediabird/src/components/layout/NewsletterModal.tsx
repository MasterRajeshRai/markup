'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, AlertCircle, X, Sparkles, ShieldCheck } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = 'unset';
      setStatus('idle');
      setMessage('');
      setEmail('');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
        setMessage(data.message || `You're all set! ${email} has been subscribed to Media Bird Weekly.`);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Unable to subscribe right now. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network connection error. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 transform transition-all animate-in zoom-in-95 duration-150 relative">
        {/* Header Banner in Brand Crimson */}
        <div className="bg-[#931b1c] text-white p-6 sm:p-8 text-center relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close newsletter modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Envelope Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Mail className="w-6 h-6 text-white" />
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-sans font-bold uppercase tracking-widest text-white/90 mb-2">
            Media Bird Dispatch
          </span>

          <h3 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
            Slow Journalism, In Your Inbox.
          </h3>

          <p className="font-sans text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
            Thoughtful essays, cultural inquiry, and curated weekend reading.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {status === 'success' ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans text-xl font-bold text-stone-900">
                  Welcome Aboard!
                </h4>
                <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
                  {message}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#931b1c] hover:bg-[#7a1315] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feature Highlights */}
              <div className="space-y-2 text-xs font-sans text-stone-600 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-editorial-crimson shrink-0" />
                  <span>Curated long-form features every Saturday</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-editorial-crimson shrink-0" />
                  <span>No clickbait, zero spam, strictly independent</span>
                </div>
              </div>

              {/* Input Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-newsletter-email"
                  className="block text-xs font-sans font-bold uppercase tracking-wider text-stone-700"
                >
                  Email Address
                </label>
                <input
                  ref={inputRef}
                  id="modal-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-sans placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-editorial-crimson/20 focus:border-editorial-crimson transition-all"
                  disabled={status === 'loading'}
                />
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-[#931b1c] hover:bg-[#7a1315] disabled:opacity-60 text-white font-sans text-xs uppercase tracking-widest font-bold rounded-xl shadow transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>{status === 'loading' ? 'Subscribing...' : 'Subscribe for Free'}</span>
              </button>

              <p className="text-[11px] text-center text-stone-400 font-sans">
                Unsubscribe anytime with one click. We respect your privacy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
