'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin 
} from 'lucide-react';

export function TopBar() {
  return (
    <div className="bg-[#09182d] text-slate-300 text-xs sm:text-[13px] border-b border-[#162a45] w-full max-w-full overflow-x-hidden">
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-2 sm:py-2.5 gap-2 text-xs sm:text-[13px] font-medium text-center sm:text-left">
          
          {/* Left: Location, Email, Phone */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4 md:gap-6 max-w-full">
            <span className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors max-w-full">
              <MapPin className="w-3.5 h-3.5 text-[#e2a02b] shrink-0" />
              <span className="break-words">2/108, Mehrauli, New Delhi - 110030 (1 km from Qutub Minar)</span>
            </span>

            <a 
              href="mailto:info@princepublicschool.edu.in" 
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#e2a02b] transition-colors break-all"
            >
              <Mail className="w-3.5 h-3.5 text-[#e2a02b] shrink-0" />
              <span>info@princepublicschool.edu.in</span>
            </a>

            <a 
              href="tel:+919876543210" 
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#e2a02b] transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-[#e2a02b] shrink-0" />
              <span>+91 98765 43210</span>
            </a>
          </div>

          {/* Right: Social Icons + Student / Parent Login */}
          <div className="flex items-center gap-4 text-slate-300">
            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Facebook"
                className="hover:text-[#e2a02b] transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram"
                className="hover:text-[#e2a02b] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="YouTube"
                className="hover:text-[#e2a02b] transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="LinkedIn"
                className="hover:text-[#e2a02b] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Divider */}
            <div className="h-3.5 w-px bg-slate-700 hidden sm:block" />

            {/* Logins */}
            <div className="flex items-center gap-3 font-medium">
              <Link 
                href="/admissions" 
                className="inline-flex items-center gap-1 hover:text-[#e2a02b] transition-colors"
              >
                <User className="w-3 h-3 text-[#e2a02b]" />
                <span>Student Login</span>
              </Link>
              <span className="text-slate-600">/</span>
              <Link 
                href="/admissions" 
                className="inline-flex items-center gap-1 hover:text-[#e2a02b] transition-colors"
              >
                <User className="w-3 h-3 text-[#e2a02b]" />
                <span>Parent Login</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
