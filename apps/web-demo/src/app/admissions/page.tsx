import React from 'react';
import type { Metadata } from 'next';
import { 
  CheckCircle2, 
  FileText, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  HelpCircle, 
  Download,
  AlertCircle
} from 'lucide-react';
import { AdmissionInquiry } from '@/components/admission-inquiry';
import { SchoolTimingsCard } from '@/components/school-timings-card';

export const metadata: Metadata = {
  title: 'Admissions 2026-27 — Procedure, Fees & Registration | Prince Public School',
  description: 'Complete admissions guide for academic session 2026-27 at Prince Public School. Day Scholar & Boarding options, age criteria, fee structure, checklist, and online application form.',
};

export default function AdmissionsPage() {
  const steps = [
    {
      num: '01',
      title: 'Online or Offline Registration',
      desc: 'Submit the registration form either through our portal or in person at the school administrative counter with the registration fee.',
    },
    {
      num: '02',
      title: 'Informal Interaction / Diagnostic Assessment',
      desc: 'For Pre-Primary, an informal parent-child interaction. For Classes I to IX, a conceptual diagnostic assessment in core subjects.',
    },
    {
      num: '03',
      title: 'Document Verification & Offer Letter',
      desc: 'Successful candidates receive an admission offer letter. Parents present original documents for administrative verification.',
    },
    {
      num: '04',
      title: 'Fee Payment & Enrollment Finalization',
      desc: 'Upon fee clearance via net banking, debit/credit card, or DD, the student ERP portal credentials and admission kit are issued.',
    },
  ];

  const ageCriteria = [
    { grade: 'Pre-School', minAge: 'Child should be 3+ on 30th March of the year in which admission is sought', seats: 'Open' },
    { grade: 'Pre-Primary', minAge: 'Child should be 4+ on 30th March of the year in which admission is sought', seats: 'Open' },
    { grade: 'Class I', minAge: 'Child should be 5+ on 30th March of the year in which admission is sought', seats: 'Open' },
    { grade: 'Classes II to IX', minAge: 'Based on admission test, fitness criteria & previous school TC', seats: 'Subject to vacancy' },
    { grade: 'Class X', minAge: 'Subject to C.B.S.E. transfer regulations & valid Transfer Certificate', seats: 'Limited vacancy' },
  ];

  const feeSchedule = [
    { component: 'Registration & Prospectus Fee (One Time)', amount: '₹ 1,500' },
    { component: 'Admission Fee (New Admission Only)', amount: '₹ 25,000' },
    { component: 'Refundable Security Caution Deposit (Refundable on Withdrawal)', amount: '₹ 10,000' },
    { component: 'Composite Tuition Fee (Pre-School to Class V, Quarterly)', amount: '₹ 18,500' },
    { component: 'Composite Tuition Fee (Classes VI – X, Quarterly)', amount: '₹ 21,500' },
    { component: 'Residential Hostel Fee (Quarterly, 2/3/4 Seater with Attached Baths & Hot Water)', amount: '₹ 34,500' },
    { component: 'Nutritional Mess & Dining (Quarterly, Chinese/Indian/Continental Meals)', amount: '₹ 18,000' },
    { component: 'School Bus Conveyance (Day Scholars, Quarterly, Optional)', amount: '₹ 6,500 – ₹ 9,500' },
  ];

  const documents = [
    'Original Birth Certificate issued by Municipal Corporation',
    'Recent passport-sized photographs of Student (6 copies) and Parents (2 copies each)',
    'Proof of Residence (Voter ID / Aadhaar Card / Electricity Bill / Passport)',
    'Previous Class Report Card & Transfer Certificate (TC) countersigned by Education Officer (for Class II onwards)',
    'Aadhaar Card copy of Student and Parents',
    'Medical Fitness Certificate & Immunization Record signed by a Registered Medical Practitioner',
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
          Admissions Open 2026-27 • Day Scholar & Boarding
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-sans">
          Join the Legacy of Prince Public School
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          We welcome applications from enthusiastic learners and supportive families. Secure your child’s educational journey with our seamless online and offline admissions process.
        </p>
      </div>

      {/* Step-by-Step Procedure */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-600">
            Four Simple Steps
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans">Admission Process Roadmap</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-white relative space-y-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <span className="text-3xl font-mono font-black text-amber-500/60 block">
                {st.num}
              </span>
              <h3 className="text-base sm:text-lg font-bold font-sans text-slate-900">{st.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Age Criteria & Seat Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-700">
            Eligibility Norms
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">Age Criteria for Session 2026-27</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase bg-slate-50">
                <th className="py-3 px-4">Grade / Class</th>
                <th className="py-3 px-4">Minimum Age Requirement</th>
                <th className="py-3 px-4">Seat Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ageCriteria.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.grade}</td>
                  <td className="py-3.5 px-4 text-slate-700">{item.minAge}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">{item.seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day Scholar vs Boarding Enrollment Options */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/60 p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">
            Enrollment Streams
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">Day Scholar vs Boarder Options</h3>
          <p className="text-base text-slate-600">
            Parents may choose between our comprehensive day scholar program and full boarding residential care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700 block">
              Option A: Day Scholar
            </span>
            <h4 className="text-lg font-bold text-slate-900">Standard Schooling & Transportation</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• School Hours: 8:00 AM – 2:00 PM (Mon–Fri) & 8:00 AM – 12:00 PM (Sat)</li>
              <li>• AC GPS bus transportation covering 40+ city routes</li>
              <li>• Nutritious afternoon snacks & cafeteria lunch facility</li>
              <li>• Access to all clubs, sports tournaments, and labs</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-amber-300 space-y-3 shadow-xs relative">
            <span className="absolute top-4 right-4 text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              Popular Choice
            </span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-800 block">
              Option B: Full Boarder
            </span>
            <h4 className="text-lg font-bold text-slate-900">Residential Life & Supervised Prep</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• 2, 3 & 4 Seater air-cooled rooms with attached modern toilets</li>
              <li>• 24-hr hot & cold water, ISD/STD communication & Wi-Fi</li>
              <li>• 4 balanced daily meals: Indian, Chinese & Continental cuisine</li>
              <li>• Daily evening prep guided by resident subject teachers</li>
              <li>• Weekend holiday programmes: movie screenings, picnics & sports</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fee Structure Table */}
      <div id="fees" className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">
              Transparent Schedule
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">Approved Fee Structure (2026-27)</h3>
          </div>
          <a
            href="#admission-form"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Download Fee Circular (PDF)</span>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider bg-slate-50">
                <th className="py-3.5 px-4">Fee Particulars</th>
                <th className="py-3.5 px-4 text-right">Applicable Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeSchedule.map((fee, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 text-slate-800 font-medium">{fee.component}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm sm:text-base text-amber-700">{fee.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-sm text-slate-700 space-y-2.5 leading-relaxed">
          <p className="font-bold text-amber-900 text-base">Official Admission &amp; Fee Policies:</p>
          <p>• <strong>Admission Test &amp; Committee Decision:</strong> Based on the admission test and other criteria, the school reserves the right to admit students who are found fit for admission. In all matters related to admission, the Admission Committee&apos;s decision is final.</p>
          <p>• <strong>Mandatory Transfer Certificate:</strong> Students who have attended another school cannot be admitted until a Transfer Certificate (TC) from the earlier school is produced.</p>
          <p>• <strong>Withdrawal &amp; Non-Refundable Clause:</strong> A student who is admitted to the school and all admission formalities are completed, but afterwards wants to withdraw from the school, should understand that fees &amp; charges once paid shall not be refunded except Caution Money.</p>
          <p>• <strong>School Transport Notice:</strong> With our school conveyance, we take care of the students&apos; transportation which is easy &amp; in safe hands. But the students who travel in the school bus do so at their parents&apos; own risk.</p>
          <p>• <strong>Cleanliness, Health Camps &amp; Food Policy:</strong> Strict hygiene, regular pest control, building repairs &amp; electrical safety checks. Polio and medical camps organized periodically. Outside edibles are strictly prohibited on campus.</p>
        </div>
      </div>

      {/* Official School Timings for Prospective Parents */}
      <SchoolTimingsCard />

      {/* Documents Required Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="p-8 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-600" />
            Document Checklist for Verification
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            {documents.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Transfer Certificate (TC) Portal Info */}
        <div id="tc" className="p-8 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            Transfer Certificate (TC) Verification
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            In compliance with CBSE norms, Transfer Certificates for outgoing students are digitized and publicly verifiable online.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Verify Student TC by Admission No:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PPS/2024/1042"
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm shadow-sm transition-colors"
              >
                Search TC
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            For issuance of fresh TC, contact the school office with a 15-day written notice.
          </p>
        </div>
      </div>

      {/* Online Application Form Widget */}
      <AdmissionInquiry />

    </div>
  );
}
