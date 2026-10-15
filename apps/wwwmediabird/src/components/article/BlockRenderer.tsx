import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Quote, CheckCircle, ChevronDown } from 'lucide-react';
import { CmsBlock } from '@/types';
import { sanitizeEditorialHtml } from '@/lib/utils';
import { AdUnit } from '@/components/monetization/AdUnit';
import { ADSENSE_CONFIG } from '@/lib/monetization';

interface BlockRendererProps {
  blocks: CmsBlock[];
  categorySlug?: string;
}

export function BlockRenderer({ blocks, categorySlug }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="editorial-content space-y-6 text-stone-800 font-sans leading-relaxed text-base sm:text-lg">
      {blocks.map((block, index) => {
        const key = block.id || `blk_${index}`;

        switch (block.type) {
          // 1. RICH HTML BLOCK (Migrated WordPress Content or Visual Rich Text)
          case 'html':
          case 'richtext': {
            const rawHtml = block.data?.html || block.data?.text || '';
            const cleanHtml = sanitizeEditorialHtml(rawHtml);

            return (
              <React.Fragment key={key}>
                <div
                  className="prose prose-stone max-w-none text-stone-800 leading-relaxed font-sans text-base sm:text-lg space-y-4
                    [&>p]:mb-5 [&>p]:leading-[1.8]
                    [&>h2]:font-sans [&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-bold [&>h2]:text-stone-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:pt-4 [&>h2]:border-t [&>h2]:border-stone-100
                    [&>h3]:font-sans [&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-bold [&>h3]:text-stone-900 [&>h3]:mt-8 [&>h3]:mb-3
                    [&>blockquote]:border-l-4 [&>blockquote]:border-editorial-crimson [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:font-sans [&>blockquote]:text-stone-700 [&>blockquote]:my-6
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ul]:my-4
                    [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>ol]:my-4
                    [&>figure]:my-8 [&>figure_img]:rounded-lg [&>figure_img]:w-full [&>figure_img]:h-auto
                    [&>figcaption]:text-xs [&>figcaption]:text-stone-500 [&>figcaption]:mt-2 [&>figcaption]:text-center [&>figcaption]:italic
                    [&>table]:w-full [&>table]:border-collapse [&>table]:my-6 [&>table_th]:border-b [&>table_th]:border-stone-300 [&>table_th]:p-2 [&>table_td]:border-b [&>table_td]:border-stone-200 [&>table_td]:p-2
                    [&>a]:text-editorial-crimson [&>a]:underline [&>a]:underline-offset-2 [&>a:hover]:text-red-900"
                  dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />

                {/* Optional mid-content AdSense placement after main HTML */}
                {index === 0 && (
                  <AdUnit
                    slotId={ADSENSE_CONFIG.slots.articleInContent1}
                    minHeight="280px"
                    label="Editorial Advertisement"
                  />
                )}
              </React.Fragment>
            );
          }

          // 2. PARAGRAPH BLOCK
          case 'paragraph': {
            return (
              <p key={key} className="text-stone-800 leading-[1.8] text-base sm:text-lg">
                {block.data?.text}
              </p>
            );
          }

          // 3. HEADING BLOCK
          case 'heading': {
            const level = block.data?.level || 2;
            const text = block.data?.text || '';
            const headingId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            if (level === 3) {
              return (
                <h3 id={headingId} key={key} className="font-sans text-xl sm:text-2xl font-bold text-stone-900 mt-8 mb-3">
                  {text}
                </h3>
              );
            }
            return (
              <h2 id={headingId} key={key} className="font-sans text-2xl sm:text-3xl font-bold text-stone-900 mt-10 mb-4 pt-4 border-t border-stone-100">
                {text}
              </h2>
            );
          }

          // 4. BLOCKQUOTE / PULLQUOTE
          case 'quote': {
            return (
              <blockquote
                key={key}
                className="my-8 border-l-4 border-editorial-crimson bg-stone-50/80 p-6 rounded-r-lg"
              >
                <Quote className="w-6 h-6 text-editorial-crimson/50 mb-2" />
                <p className="font-sans text-xl sm:text-2xl italic text-stone-900 leading-snug">
                  “{block.data?.quote || block.data?.text}”
                </p>
                {(block.data?.author || block.data?.role) && (
                  <footer className="mt-3 text-xs font-sans text-stone-500 font-medium">
                    — {block.data.author}
                    {block.data.role && `, ${block.data.role}`}
                  </footer>
                )}
              </blockquote>
            );
          }

          // 5. IMAGE BLOCK
          case 'image': {
            const url = block.data?.url || block.data?.src;
            if (!url) return null;

            return (
              <figure key={key} className="my-8">
                <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-stone-100">
                  <Image
                    src={url}
                    alt={block.data?.alt || 'Editorial media'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
                {block.data?.caption && (
                  <figcaption className="text-xs text-stone-500 text-center mt-2 italic font-sans">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          // 6. ACCORDION / FAQ BLOCK
          case 'accordion': {
            const items = block.data?.items || [];
            if (!Array.isArray(items) || items.length === 0) return null;

            return (
              <div key={key} className="my-8 divide-y divide-stone-200 border border-stone-200 rounded-lg bg-white overflow-hidden">
                {items.map((item: any, i: number) => (
                  <details key={i} className="group p-4 open:bg-stone-50/60 transition-colors">
                    <summary className="font-sans font-bold text-base sm:text-lg text-stone-900 cursor-pointer list-none flex items-center justify-between">
                      <span>{item.title || item.question}</span>
                      <ChevronDown className="w-4 h-4 text-stone-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="mt-3 text-sm text-stone-700 leading-relaxed font-sans">
                      {item.content || item.answer}
                    </p>
                  </details>
                ))}
              </div>
            );
          }

          // 7. CALL TO ACTION / BUYING GUIDE BANNER
          case 'cta': {
            return (
              <div
                key={key}
                className="my-10 p-8 rounded-xl bg-stone-900 text-white text-center space-y-4"
              >
                <h4 className="font-sans text-2xl font-bold">
                  {block.data?.title || 'Explore More Slow Stories'}
                </h4>
                <p className="font-sans text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                  {block.data?.description || 'Deep reporting across culture, arts, science, and public interest.'}
                </p>
                {block.data?.buttonText && block.data?.buttonUrl && (
                  <div>
                    <Link
                      href={block.data.buttonUrl}
                      className="inline-block px-6 py-2.5 bg-editorial-crimson hover:bg-red-800 text-white font-sans text-xs uppercase font-bold tracking-wider rounded transition-colors"
                    >
                      {block.data.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          // DEFAULT / UNKNOWN BLOCK
          default:
            return null;
        }
      })}
    </div>
  );
}
