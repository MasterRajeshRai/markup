import React from 'react';
import Link from 'next/link';

export function BlockRenderer({ block }: { block: any }) {
  if (!block || !block.type) return null;

  switch (block.type) {
    case 'hero':
      return (
        <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
          {block.data.badge && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {block.data.badge}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {block.data.title}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {block.data.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {block.data.primaryCta?.label && (
              <Link
                href={block.data.primaryCta.url || '#'}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/30"
              >
                {block.data.primaryCta.label}
              </Link>
            )}
            {block.data.secondaryCta?.label && (
              <Link
                href={block.data.secondaryCta.url || '#'}
                className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors"
              >
                {block.data.secondaryCta.label}
              </Link>
            )}
          </div>
        </section>
      );

    case 'cards':
      return (
        <section className="py-12 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {((block.data.items as any[]) || []).map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-3"
              >
                <h3 className="font-bold text-lg text-white">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case 'image':
      const imageUrl = block.data.url || block.data.publicUrl || block.data.src;
      return (
        <figure className="max-w-4xl mx-auto px-6 py-6 text-center">
          <img
            src={imageUrl}
            alt={block.data.alt || block.data.altText || ''}
            className="rounded-xl border border-slate-800 shadow-xl mx-auto max-h-[600px] object-cover"
          />
          {block.data.caption && (
            <figcaption className="mt-2 text-xs text-slate-400 italic">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'gallery':
      const images = (block.data.images as any[]) || [];
      return (
        <section className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img: any, idx: number) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50 aspect-video">
                <img
                  src={img.url || img.publicUrl || img}
                  alt={img.alt || ''}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </section>
      );

    case 'columns':
      return (
        <section className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {(block.children || []).map((col: any, idx: number) => (
            <div key={idx}>
              <BlockRenderer block={col} />
            </div>
          ))}
        </section>
      );

    case 'quote':
      return (
        <section className="py-12 px-6 max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-2xl italic font-serif text-slate-200 border-l-4 border-blue-500 pl-4 py-2 my-4">
            “{block.data.quote}”
          </blockquote>
          <div className="mt-2 text-sm">
            <span className="font-semibold text-white">{block.data.author}</span>
            {block.data.role && <span className="text-slate-400">, {block.data.role}</span>}
          </div>
        </section>
      );

    case 'cta':
      return (
        <section className="my-16 mx-6 max-w-4xl md:mx-auto p-10 rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{block.data.title}</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">{block.data.description}</p>
          <div className="pt-2">
            <Link
              href={block.data.buttonUrl || '#'}
              className="inline-block px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
            >
              {block.data.buttonText}
            </Link>
          </div>
        </section>
      );

    case 'accordion':
      return (
        <section className="py-8 px-6 max-w-3xl mx-auto space-y-3">
          {((block.data.items as any[]) || []).map((item, idx) => (
            <details
              key={idx}
              className="group p-4 rounded-xl border border-slate-800 bg-slate-900/50 open:bg-slate-900"
            >
              <summary className="font-semibold text-sm text-white cursor-pointer select-none">
                {item.title}
              </summary>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-2 border-l border-blue-500/50">
                {item.content}
              </p>
            </details>
          ))}
        </section>
      );

    case 'heading':
      const HeadingTag = (`h${block.data.level || 2}`) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <div className="max-w-3xl mx-auto px-6 py-3">
          <HeadingTag className="font-bold text-2xl text-white tracking-tight">
            {block.data.text}
          </HeadingTag>
        </div>
      );

    case 'paragraph':
      return (
        <div className="max-w-3xl mx-auto px-6 py-2">
          <p className="text-slate-300 leading-relaxed text-sm">{block.data.text}</p>
        </div>
      );

    case 'divider':
      return (
        <div className="max-w-3xl mx-auto px-6 py-4">
          <hr className="border-slate-800" />
        </div>
      );

    case 'code':
      return (
        <div className="max-w-3xl mx-auto px-6 py-4">
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 text-xs font-mono overflow-x-auto">
            {block.data.code}
          </pre>
        </div>
      );

    default:
      return null;
  }
}
