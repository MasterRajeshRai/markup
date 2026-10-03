import React from 'react';
import Link from 'next/link';

export function BlockRenderer({ block }: { block: any }) {
  if (!block || !block.type) return null;

  switch (block.type) {
    case 'hero':
      return (
        <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
          {block.data.badge && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {block.data.badge}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            {block.data.title}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {block.data.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {block.data.primaryCta?.label && (
              <Link
                href={block.data.primaryCta.url || '#'}
                className="px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-md shadow-blue-700/20"
              >
                {block.data.primaryCta.label}
              </Link>
            )}
            {block.data.secondaryCta?.label && (
              <Link
                href={block.data.secondaryCta.url || '#'}
                className="px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors"
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
                className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition-all space-y-3"
              >
                <h3 className="font-bold text-lg text-slate-900">{card.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed">{card.description}</p>
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
            className="rounded-xl border border-slate-200 shadow-lg mx-auto max-h-[600px] object-cover"
          />
          {block.data.caption && (
            <figcaption className="mt-2 text-sm text-slate-500">
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
              <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
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
          <blockquote className="text-xl md:text-2xl font-semibold font-sans text-slate-800 border-l-4 border-indigo_velvet-500 pl-4 py-2 my-4">
            “{block.data.quote}”
          </blockquote>
          <div className="mt-2 text-base">
            <span className="font-semibold text-slate-900">{block.data.author}</span>
            {block.data.role && <span className="text-slate-500">, {block.data.role}</span>}
          </div>
        </section>
      );

    case 'cta':
      return (
        <section className="my-16 mx-6 max-w-4xl md:mx-auto p-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-black font-sans text-slate-900">{block.data.title}</h2>
          <p className="text-base text-slate-600 max-w-lg mx-auto">{block.data.description}</p>
          <div className="pt-2">
            <Link
              href={block.data.buttonUrl || '#'}
              className="inline-block px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-base transition-colors shadow-sm"
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
              className="group p-4 rounded-xl border border-slate-200 bg-slate-50 open:bg-white shadow-xs"
            >
              <summary className="font-semibold text-base text-slate-900 cursor-pointer select-none">
                {item.title}
              </summary>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed pl-2 border-l-2 border-blue-600">
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
          <HeadingTag className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight font-sans">
            {block.data.text}
          </HeadingTag>
        </div>
      );

    case 'paragraph':
      return (
        <div className="max-w-3xl mx-auto px-6 py-2">
          <p className="text-slate-700 leading-relaxed text-base">{block.data.text}</p>
        </div>
      );

    case 'divider':
      return (
        <div className="max-w-3xl mx-auto px-6 py-4">
          <hr className="border-slate-200" />
        </div>
      );

    case 'code':
      return (
        <div className="max-w-3xl mx-auto px-6 py-4">
          <pre className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-blue-900 text-sm font-mono overflow-x-auto">
            {block.data.code}
          </pre>
        </div>
      );

    default:
      return null;
  }
}
