import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { AffiliateProduct } from '@/types';

interface AffiliateTableProps {
  title?: string;
  products: AffiliateProduct[];
  className?: string;
}

export function AffiliateTable({
  title = 'Editorial Comparison & Buying Guide',
  products,
  className = '',
}: AffiliateTableProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className={`my-10 overflow-hidden rounded-lg border border-stone-200 bg-white ${className}`}>
      <div className="bg-stone-100/70 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
        <h4 className="font-sans text-lg font-bold text-stone-900">{title}</h4>
        <span className="text-[11px] font-sans text-stone-600 uppercase tracking-wider">
          Sponsored Overview
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-sans border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/50 text-[11px] uppercase tracking-wider text-stone-600">
              <th className="py-3 px-4 font-bold">Product / Edition</th>
              <th className="py-3 px-4 font-bold">Category</th>
              <th className="py-3 px-4 font-bold">Key Focus</th>
              <th className="py-3 px-4 font-bold text-right">Destination</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-sans font-bold text-stone-900">{item.name}</div>
                  {item.badge && (
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-editorial-crimson bg-red-50 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-xs text-stone-600">{item.category}</td>
                <td className="py-4 px-4 text-xs text-stone-600">
                  {item.features?.[0] ? (
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-stone-600 flex-shrink-0" />
                      <span>{item.features[0]}</span>
                    </span>
                  ) : (
                    item.description.slice(0, 50) + '...'
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <a
                    href={item.merchantUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-stone-900 hover:bg-editorial-crimson text-white text-xs font-semibold rounded transition-colors"
                  >
                    <span>{item.merchant}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
