import React from 'react';
import { ExternalLink, Check, X, ShieldAlert } from 'lucide-react';
import { AffiliateProduct } from '@/types';

interface AffiliateCardProps {
  product: AffiliateProduct;
  className?: string;
}

export function AffiliateCard({ product, className = '' }: AffiliateCardProps) {
  return (
    <div
      className={`my-8 rounded-lg border border-stone-200 bg-stone-50/50 p-6 shadow-sm transition-all hover:border-stone-300 ${className}`}
    >
      {/* Top Header Badge & Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {product.badge && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-sans font-bold uppercase tracking-wider bg-editorial-crimson/10 text-editorial-crimson border border-editorial-crimson/20">
            {product.badge}
          </span>
        )}
        <span className="text-[11px] font-sans text-stone-500 uppercase tracking-wider">
          Merchant: {product.merchant}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-sans text-xl font-bold text-stone-900 mb-2">
        {product.name}
      </h4>

      {/* Description */}
      <p className="font-sans text-sm text-stone-700 leading-relaxed mb-4">
        {product.description}
      </p>

      {/* Key Features */}
      {product.features && product.features.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-sans font-bold uppercase tracking-wider text-stone-600 mb-2">
            Notable Specifications:
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-sans text-stone-600">
            {product.features.map((feat, idx) => (
              <li key={idx} className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-editorial-crimson flex-shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pros & Cons (if present) */}
      {(product.pros || product.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-3.5 bg-white rounded border border-stone-200 text-xs font-sans">
          {product.pros && product.pros.length > 0 && (
            <div>
              <span className="font-bold text-emerald-800 flex items-center space-x-1 mb-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Strengths</span>
              </span>
              <ul className="space-y-1 text-stone-600 pl-4 list-disc">
                {product.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
          )}

          {product.cons && product.cons.length > 0 && (
            <div>
              <span className="font-bold text-stone-700 flex items-center space-x-1 mb-1.5">
                <X className="w-3.5 h-3.5 text-stone-500" />
                <span>Considerations</span>
              </span>
              <ul className="space-y-1 text-stone-600 pl-4 list-disc">
                {product.cons.map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action CTA with rel="sponsored noopener noreferrer" */}
      <div className="mt-5 pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 text-[11px] font-sans text-stone-600">
          <ShieldAlert className="w-3.5 h-3.5 text-stone-600" />
          <span>Verified Merchant Partner • Rel: Sponsored</span>
        </div>

        <a
          href={product.merchantUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 bg-stone-900 hover:bg-editorial-crimson text-white text-xs font-sans font-semibold rounded transition-colors group"
        >
          <span>View on {product.merchant}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-stone-300 group-hover:text-white transition-colors" />
        </a>
      </div>
    </div>
  );
}
