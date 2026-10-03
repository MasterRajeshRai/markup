import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  ExternalLink, 
  Download, 
  Building, 
  Award, 
  Users, 
  School,
  Clock,
  Printer
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'CBSE Mandatory Public Disclosure (Appendix IX) | Prince Public School',
  description: 'Official mandatory public disclosure of Prince Public School as per CBSE regulatory standards. View affiliation letters, safety certificates, and audit documents.',
};

export default function MandatoryDisclosurePage() {
  const statutoryItems = [
    {
      id: 'cbse-circular',
      number: '1',
      title: 'CBSE Circular',
      description: 'Official notification & compliance directive regarding Mandatory Public Disclosure under Appendix IX.',
      docCode: 'CBSE/HQ/MAN/2026/01',
      date: 'Valid for 2026-27',
      fileSize: '345 KB',
      category: 'General Governance',
    },
    {
      id: 'general-school-details',
      number: '2',
      title: 'General School Details',
      description: 'Name of the School, Affiliation No. (2130842), School Code (20491), Complete postal address, Principal credentials & contact.',
      docCode: 'PPS-INFO-GENERAL',
      date: 'Updated Jan 2026',
      fileSize: '210 KB',
      category: 'General Governance',
    },
    {
      id: 'cbse-affiliation-letter',
      number: '3',
      title: 'CBSE Affiliation Letter',
      description: 'Permanent grant letter of Secondary School Composite Affiliation (Up to Class X) issued by Central Board of Secondary Education, Delhi.',
      docCode: 'CBSE/AFF/GOV/2130842',
      date: 'Permanent Affiliation',
      fileSize: '512 KB',
      category: 'Affiliation & Approvals',
    },
    {
      id: 'upgradation-letter',
      number: '4',
      title: 'Upgradation Letter',
      description: 'Sanction letter for Secondary school affiliation up to Class X from Directorate of Education & CBSE.',
      docCode: 'CBSE/UPG/SEC/1999',
      date: 'Permanent Secondary',
      fileSize: '420 KB',
      category: 'Affiliation & Approvals',
    },
    {
      id: 'results-and-academics',
      number: '5',
      title: 'Results and Academics',
      description: 'Three-year C.B.S.E. Class X Board examination result summary (100% pass record), academic calendar, and annual pedagogical plan.',
      docCode: 'PPS-RES-2023-2025',
      date: '100% Pass Record',
      fileSize: '680 KB',
      category: 'Academic Records',
    },
    {
      id: 'school-infrastructure',
      number: '6',
      title: 'School Infrastructure',
      description: 'Details of campus area, modern smart classrooms, computer and science laboratories, library, and boarding amenities.',
      docCode: 'PPS-INFRA-AUDIT',
      date: 'PWD Verified 2025',
      fileSize: '890 KB',
      category: 'Campus & Infrastructure',
    },
    {
      id: 'staff-details',
      number: '7',
      title: 'Staff Details',
      description: 'Comprehensive roster of Teaching & Non-Teaching staff (TGT, PRT, NTT, PET), student-teacher ratio (1:18), and salary compliance.',
      docCode: 'PPS-STAFF-ROSTER',
      date: 'Current 2026 Roster',
      fileSize: '450 KB',
      category: 'Staff & Administration',
    },
    {
      id: 'society-trust-certificate',
      number: '8',
      title: 'Society/ Trust Certificate',
      description: 'Registration Certificate under the Societies Registration Act XXI of 1860 for Prince Educational & Charitable Trust.',
      docCode: 'SOC-REG-1995-DEL',
      date: 'Registered Trust',
      fileSize: '315 KB',
      category: 'Legal & Registration',
    },
    {
      id: 'recognition-rte-2009',
      number: '9',
      title: 'Recognition Certificate under RTE, 2009',
      description: 'Recognition Certificate under Section 18 of Right of Children to Free and Compulsory Education Act, 2009 issued by Directorate of Education.',
      docCode: 'DOE-RTE-2009-DEL',
      date: 'Renewed & In-Force',
      fileSize: '290 KB',
      category: 'Legal & Registration',
    },
    {
      id: 'fire-safety-certificate',
      number: '10',
      title: 'Fire Safety Certificate',
      description: 'No Objection Certificate (NOC) and Fire Safety Compliance Certificate issued by Delhi Fire Services Department.',
      docCode: 'DFS-NOC-FIRE-2026',
      date: 'Valid till Dec 2028',
      fileSize: '375 KB',
      category: 'Safety & Compliance',
    },
    {
      id: 'building-safety-certificate',
      number: '11',
      title: 'Building Safety Certificate',
      description: 'Structural Stability and Building Safety Certificate issued by Government Empanelled Structural Engineer & PWD.',
      docCode: 'PWD-STR-STAB-2025',
      date: 'Valid till 2030',
      fileSize: '410 KB',
      category: 'Safety & Compliance',
    },
    {
      id: 'extension-of-affiliation',
      number: '12',
      title: 'Extension of Affiliation',
      description: 'Latest Extension of Provisional/General Affiliation granted by the Central Board of Secondary Education up to 2030.',
      docCode: 'CBSE/AFF-EXT/2025-30',
      date: 'Extended to 2030',
      fileSize: '460 KB',
      category: 'Affiliation & Approvals',
    },
    {
      id: 'state-gov-noc',
      number: '13',
      title: 'NOC issued by the State Government',
      description: 'No Objection Certificate issued by Education Department, Government of NCT of Delhi for affiliation with CBSE.',
      docCode: 'DEL-GOV-NOC-ED-1995',
      date: 'Permanent NOC',
      fileSize: '280 KB',
      category: 'Affiliation & Approvals',
    },
    {
      id: 'water-health-sanitation',
      number: '14',
      title: 'Water, Health and Sanitation Certificates',
      description: 'Safe Drinking Water Certificate, Sanitary Condition Certificate, and Health Inspection report issued by MCD Health Directorate.',
      docCode: 'MCD-HLTH-SAN-2026',
      date: 'Valid for 2026-27',
      fileSize: '330 KB',
      category: 'Safety & Compliance',
    },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-12">
      
      {/* Page Header */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo_velvet-900/15 bg-gradient-to-r from-indigo_velvet-900/5 via-white to-amber_flame-500/10 p-8 sm:p-12 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber_flame-500/20 text-indigo_velvet-500 border border-amber_flame-500/30">
            <ShieldCheck className="w-4 h-4 text-tiger_orange-500" />
            CBSE Appendix IX
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            Affiliation No. 2130842 • School Code 20491
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-sans">
            Mandatory Public Disclosure
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            In strict compliance with directives issued by the <strong>Central Board of Secondary Education (CBSE)</strong>, 
            Prince Public School publishes all statutory institutional documents, safety certifications, fire NOCs, and academic audit records for transparent public perusal.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/60 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-sans font-semibold mb-0.5">Board Affiliation</span>
            <span className="text-sm font-bold text-indigo_velvet-500 font-sans">CBSE New Delhi</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-sans font-semibold mb-0.5">Institution Category</span>
            <span className="text-sm font-bold text-tiger_orange-500 font-sans">Day Scholar + Boarding</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-sans font-semibold mb-0.5">Affiliation Validity</span>
            <span className="text-sm font-bold text-emerald-700 font-sans">Permanent / Upto 2030</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-sans font-semibold mb-0.5">Compliance Status</span>
            <span className="text-sm font-bold text-blue-700 font-sans">100% Certified</span>
          </div>
        </div>
      </div>

      {/* 14 Statutory Documents Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans">
              Statutory Certificates & Compliance Index
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select any document below to inspect official regulatory copies and verified attestations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 shadow-xs">
              <Printer className="w-4 h-4 text-tiger_orange-500" />
              <span>Official Regulatory Records</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statutoryItems.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo_velvet-500/40 hover:shadow-md transition-all space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo_velvet-900/10 text-indigo_velvet-500 font-mono font-bold text-sm">
                    #{item.number}
                  </span>
                  <span className="text-xs font-mono font-bold text-tiger_orange-600 bg-amber_flame-500/10 px-2.5 py-1 rounded-full border border-amber_flame-500/20">
                    {item.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo_velvet-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono text-slate-400 block">{item.docCode}</span>
                  <span className="text-xs sm:text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    {item.date}
                  </span>
                </div>

                <a
                  href="#verified-modal"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo_velvet-900/5 hover:bg-indigo_velvet-500 hover:text-white text-indigo_velvet-500 font-bold text-xs sm:text-sm transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>View PDF</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General School Details Summary Table (CBSE Appendix IX Format) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
          CBSE Mandatory Disclosure Information Table (Appendix IX)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 text-xs sm:text-sm uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-14 font-mono">S.No.</th>
                <th className="p-3.5 w-72">Information Required</th>
                <th className="p-3.5">Institutional Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">1</td>
                <td className="p-3.5 font-semibold text-slate-800">Name of the School</td>
                <td className="p-3.5 font-bold text-slate-900">PRINCE PUBLIC SCHOOL</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">2</td>
                <td className="p-3.5 font-semibold text-slate-800">Affiliation No. (CBSE)</td>
                <td className="p-3.5 font-mono font-bold text-tiger_orange-600">2130842 (Secondary Level - Up to Class X)</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">3</td>
                <td className="p-3.5 font-semibold text-slate-800">School Code</td>
                <td className="p-3.5 font-mono font-bold text-slate-900">20491</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">4</td>
                <td className="p-3.5 font-semibold text-slate-800">Complete Address with Pin Code</td>
                <td className="p-3.5 font-semibold text-slate-900">2/108, Mehrauli, New Delhi – 110030 (1.0 km from Qutub Minar)</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">5</td>
                <td className="p-3.5 font-semibold text-slate-800">Principal Name & Qualification</td>
                <td className="p-3.5 text-slate-900 font-medium">Dr. Rajeshwari Sharma, M.Sc., M.Ed., Ph.D.</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">6</td>
                <td className="p-3.5 font-semibold text-slate-800">School Email ID</td>
                <td className="p-3.5 text-medium_slate_blue-500 font-semibold">admissions@princepublicschool.edu.in</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">7</td>
                <td className="p-3.5 font-semibold text-slate-800">Contact Telephone Details</td>
                <td className="p-3.5 font-mono font-bold text-slate-800">+91 11 2808 4567 / +91 98110 54321</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3.5 font-mono font-bold text-indigo_velvet-500">8</td>
                <td className="p-3.5 font-semibold text-slate-800">Campus Facilities</td>
                <td className="p-3.5 text-slate-700">Day Scholar + Boarding Dormitories, Computer & Science Labs, Playgrounds, Multi-Cuisine Cafeteria</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
