import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Prince Public School',
  description: 'Privacy and data protection policy of Prince Public School website and student portals.',
};

export default function PrivacyPage() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy & Student Data Protection Policy</h1>
        <p className="text-xs text-slate-500 font-mono">Last Updated: October 2026 • Prince Public School, New Delhi</p>
      </div>

      <div className="prose prose-slate text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Commitment to Student Privacy</h2>
          <p>
            Prince Public School is committed to safeguarding the privacy and personal data of our students, parents, faculty, and website visitors. This privacy statement outlines the types of information we collect, how it is used, and the security protocols enforced to protect personal records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Information Collection & Usage</h2>
          <p>
            When submitting an online admission inquiry or accessing the school ERP portal, we may collect student names, dates of birth, parent contact details, academic transcripts, and residential addresses. This data is strictly utilized for admission evaluations, academic progress tracking, fee receipts, and emergency school alerts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Third-Party Sharing & Commercial Sale</h2>
          <p>
            Prince Public School does not sell, lease, or commercially trade personal student data to any commercial advertisers or external marketers. Information is disclosed solely to authorized educational authorities (such as the CBSE, Directorate of Education) when legally mandated.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Data Security</h2>
          <p>
            All digital student records, marks, and online payment transactions are encrypted using industry-standard SSL/TLS protocols and safeguarded by role-based access control (RBAC).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Contact Information</h2>
          <p>
            For privacy inquiries or corrections regarding your student's file, write to us at{' '}
            <a href="mailto:privacy@princepublicschool.edu.in" className="text-blue-700 underline font-medium">
              privacy@princepublicschool.edu.in
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
