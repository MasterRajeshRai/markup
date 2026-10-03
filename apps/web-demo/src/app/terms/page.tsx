import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | Prince Public School',
  description: 'Terms and conditions governing the use of Prince Public School website and online portals.',
};

export default function TermsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Use & Institutional Guidelines</h1>
        <p className="text-xs text-slate-500 font-mono">Applicable for Academic Year 2026-27 • Prince Public School</p>
      </div>

      <div className="prose prose-slate text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or browsing the official Prince Public School website (princepublicschool.edu.in) or using our digital admission and fee portals, you agree to comply with and be bound by these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Intellectual Property Rights</h2>
          <p>
            All content, school crest emblems, photographs, curriculum circulars, and educational publications displayed on this website are the intellectual property of Prince Public School and are protected under Indian copyright laws.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Online Fee Payments & Cancellations</h2>
          <p>
            Fees paid online through net banking, debit cards, or UPI are subject to school refund regulations. In the event of duplicate transactions, refunds are processed within 7 working days following written notification to the accounts office.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Code of Conduct & Communication</h2>
          <p>
            Parents and visitors using the digital portal are requested to maintain courteous and constructive communication with faculty and administrative personnel.
          </p>
        </section>
      </div>
    </div>
  );
}
