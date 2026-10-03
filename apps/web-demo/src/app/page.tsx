import React from 'react';
import { cmsClient, FALLBACK_SLIDER } from '@/lib/cms-client';
import { HeroSlider } from '@/components/hero-slider';
import { SchoolStats } from '@/components/school-stats';
import { AboutFeatureSection } from '@/components/about-feature-section';
import { PrincipalMessage } from '@/components/principal-message';
import { AcademicWings } from '@/components/academic-wings';
import { FacilitiesGrid } from '@/components/facilities-grid';
import { CampusHighlightsRow } from '@/components/campus-highlights-row';
import { CbseDisclosureBanner } from '@/components/cbse-disclosure-banner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let sliderData = FALLBACK_SLIDER;

  try {
    const sliderRes = await cmsClient.getSlider('homepage-hero');
    if (sliderRes && sliderRes.slides && sliderRes.slides.length > 0) {
      const enrichedSlides = sliderRes.slides.map((s: any, idx: number) => {
        const fallback = FALLBACK_SLIDER.slides[idx] || FALLBACK_SLIDER.slides[0];
        return {
          ...fallback,
          ...s,
          imageUrl: s.imageUrl || fallback.imageUrl,
          customData: {
            ...fallback.customData,
            ...s.customData,
          },
        };
      });
      sliderData = {
        slider: { ...FALLBACK_SLIDER.slider, ...sliderRes.slider },
        slides: enrichedSlides,
      };
    }
  } catch {
    sliderData = FALLBACK_SLIDER;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Schema.org EducationalOrganization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'Prince Public School',
            description:
              'Premier CBSE affiliated Secondary School (Pre-School to Class X) located 1.0 km from Qutub Minar at 2/108, Mehrauli, New Delhi. Renowned for 100% CBSE Class X board results, value-based character building, and comprehensive facilities.',
            url: 'https://princepublicschool.edu.in',
            logo: 'https://princepublicschool.edu.in/images/pps-crest.svg',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '2/108, Mehrauli',
              addressLocality: 'New Delhi',
              addressRegion: 'Delhi',
              postalCode: '110030',
              addressCountry: 'IN',
            },
            telephone: '+91-9876543210',
            email: 'info@princepublicschool.edu.in',
          }),
        }}
      />

      {/* 1. Flagship Hero Section Slider */}
      <HeroSlider initialData={sliderData || undefined} />

      {/* 2. 5 Pillars Highlights Floating Bar */}
      <SchoolStats />

      {/* 3. About Section: A Legacy of Excellence, A Future of Possibilities */}
      <AboutFeatureSection />

      {/* 4. Principal's Desk: From the Desk of the Principal */}
      <PrincipalMessage />

      {/* 5. Our Academics: Learning for Life & 3 Stage Cards */}
      <AcademicWings />

      {/* 6. World-Class Facilities: 5 Cards Grid */}
      <FacilitiesGrid />

      {/* 7. Bottom 3-Part Row: Gallery (Dark Box) + Latest News & Events + Testimonials */}
      <CampusHighlightsRow />

      {/* 8. CBSE Mandatory Public Disclosure Banner */}
      <CbseDisclosureBanner />
    </div>
  );
}
