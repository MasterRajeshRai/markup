'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Sparkles, FileText, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export function AdmissionInquiry() {
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    gender: 'male',
    gradeApplying: 'nursery',
    parentName: '',
    phone: '',
    email: '',
    locality: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedRef = `PPS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setReferenceId(generatedRef);
      setIsSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFormData({
      studentName: '',
      dob: '',
      gender: 'male',
      gradeApplying: 'nursery',
      parentName: '',
      phone: '',
      email: '',
      locality: '',
      message: '',
    });
  };

  return (
    <section id="admission-form" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <div className="rounded-3xl border border-indigo_velvet-900/15 bg-gradient-to-br from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-12 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber_flame-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo_velvet-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Guidelines & Helpline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Session 2026-27
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-sans tracking-tight leading-tight">
                Online Admission Registration & Inquiry
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Take the first step towards securing your child’s place at Prince Public School. Submit your details below, and our admissions counselor will reach out within 24 hours.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Age Criteria', desc: 'Pre-School Nursery: Minimum 3 years as of 30th March 2026' },
                { title: 'Interactive Campus Tour', desc: 'Guided walkthrough of smart classrooms, science labs & sports arenas' },
                { title: 'Transparent Process', desc: 'Merit and neighborhood criteria strictly in accordance with CBSE guidelines' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Helpline Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-xs">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-800">
                Admissions Help Desk
              </h4>
              <div className="flex flex-col gap-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Direct: +91 11 2808 4567 / +91 98110 54321</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>admissions@princepublicschool.edu.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Visiting Hours: Mon – Sat: 8:00 AM to 2:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg">
            {isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Application Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for registering. Your admission registration inquiry has been successfully logged with the Prince Public School admissions board.
                </p>
                <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Registration Reference Number:</span>
                  <span className="text-lg font-mono font-black text-amber-700">{referenceId}</span>
                </div>
                <p className="text-xs text-slate-500">
                  An email confirmation with prospectus download instructions has been dispatched.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 font-sans mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Student Registration Form
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Student's Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Sharma"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Class / Grade Applying For *
                    </label>
                    <select
                      value={formData.gradeApplying}
                      onChange={(e) => setFormData({ ...formData, gradeApplying: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="pre-school">Pre-School / Nursery (Age 3+ on 30th March)</option>
                      <option value="pre-primary">Pre-Primary / KG (Age 4+ on 30th March)</option>
                      <option value="class-1">Class I (Age 5+ on 30th March)</option>
                      <option value="class-2-5">Classes II to V (Primary)</option>
                      <option value="class-6-8">Classes VI to VIII (Middle)</option>
                      <option value="class-9">Class IX (Secondary)</option>
                      <option value="class-10">Class X (Subject to TC & CBSE criteria)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Residential Locality / City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mehrauli / Saket / Vasant Kunj, New Delhi"
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Additional Queries or Message (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mention any specific transport route queries or hostel / day scholar requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base tracking-wide shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Registering Application...</span>
                  ) : (
                    <>
                      <span>Submit Admission Inquiry & Download Prospectus</span>
                      <Send className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  <p className="font-bold text-slate-800 text-xs sm:text-sm">Important Admission Guidelines:</p>
                  <p>• Age criteria (as on 30th March): Pre-School (3+), Pre-Primary (4+), Class I (5+).</p>
                  <p>• Transfer Certificate (TC) from the previous school is mandatory for admission.</p>
                  <p>• Admission Committee&apos;s decision is final based on admission test and criteria.</p>
                  <p>• Fees and charges once paid shall not be refunded except Caution Money.</p>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
