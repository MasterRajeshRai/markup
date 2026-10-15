'use client';

import React, { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG } from '@/lib/monetization';

interface AdUnitProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  label?: string;
  minHeight?: string;
  width?: number | string;
  height?: number | string;
}

export function AdUnit({
  slotId,
  format = 'auto',
  className = '',
  label = 'Advertisement',
  minHeight = '280px',
  width,
  height,
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isPushed = useRef(false);

  const isFixedDimension = Boolean(width && height);
  const containerMaxWidth = width ? (typeof width === 'number' ? `${width}px` : width) : '100%';
  const containerHeight = height ? (typeof height === 'number' ? `${height}px` : height) : undefined;
  const effectiveMinHeight = containerHeight || minHeight;

  useEffect(() => {
    // Only attempt push if in browser, window.adsbygoogle is loaded, and not already pushed
    if (typeof window !== 'undefined' && !isPushed.current && slotId) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isPushed.current = true;
      } catch (e) {
        // Suppress AdSense duplicate initialization warnings in SPA transitions
      }
    }
  }, [slotId]);

  // If className already defines margin (e.g. my-0), don't inject default my-6
  const defaultMargin = className.includes('my-') || className.includes('m-') ? '' : 'my-6';

  return (
    <div
      className={`${defaultMargin} text-center overflow-hidden transition-all mx-auto ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth: containerMaxWidth,
      }}
      ref={adRef}
    >
      {/* Policy-compliant, unambiguous advertisement indicator */}
      {label && (
        <div className="text-[10px] uppercase tracking-wider text-stone-400 font-sans mb-1.5 select-none leading-none">
          {label}
        </div>
      )}

      <div
        className="bg-white border border-stone-200/70 rounded flex items-center justify-center relative mx-auto overflow-hidden shadow-2xs"
        style={{
          width: isFixedDimension ? (typeof width === 'number' ? `${width}px` : width) : '100%',
          maxWidth: '100%',
          height: isFixedDimension ? containerHeight : undefined,
          minHeight: isFixedDimension ? containerHeight : effectiveMinHeight,
        }}
      >
        {/* Real Google AdSense Tag */}
        {slotId ? (
          <ins
            className="adsbygoogle"
            style={{
              display: isFixedDimension ? 'inline-block' : 'block',
              width: isFixedDimension ? (typeof width === 'number' ? `${width}px` : width) : '100%',
              maxWidth: '100%',
              height: containerHeight || '100%',
            }}
            data-ad-client={ADSENSE_CONFIG.publisherId}
            data-ad-slot={slotId}
            data-ad-format={isFixedDimension ? undefined : format}
            data-full-width-responsive={isFixedDimension ? 'false' : 'true'}
          />
        ) : (
          /* Neutral reserved placeholder when slot ID is not set */
          <div className="text-xs font-sans text-stone-400 flex flex-col items-center justify-center h-full w-full p-4 text-center">
            <span className="font-semibold text-stone-500 text-xs">
              Reserved Ad Placement {isFixedDimension ? `(${width} × ${height} px)` : ''}
            </span>
            <span className="text-[10px] text-stone-400 mt-1">
              Google AdSense • Publisher ID: {ADSENSE_CONFIG.publisherId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
