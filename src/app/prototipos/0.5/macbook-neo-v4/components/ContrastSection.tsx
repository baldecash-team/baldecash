'use client';

import Image from 'next/image';
import { ASSETS } from '../lib/constants';

const colorSwatches = [
  { name: 'Silver', color: '#e3e4e5' },
  { name: 'Blush', color: '#e8c4b8' },
  { name: 'Citrus', color: '#d4c98e' },
  { name: 'Indigo', color: '#8b8fad' },
];

export default function ContrastSection() {
  return (
    <section id="contrast" className="bg-[#f5f5f7] text-[#1d1d1f] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <h2 className="text-[32px] md:text-[48px] font-semibold tracking-[-0.003em] leading-[1.08] mb-12">
          Keep exploring Mac.
        </h2>

        <div className="bg-white rounded-3xl overflow-hidden p-8 md:p-12 text-center">
          <span className="inline-block px-3 py-1 bg-[#e8553f] text-white text-xs font-semibold rounded-full mb-4">
            New
          </span>

          <div className="relative w-full max-w-[500px] mx-auto aspect-[16/10] mb-6">
            <Image
              src={ASSETS.hero.fallback}
              alt="MacBook Neo 13 inch"
              fill
              className="object-contain"
              sizes="500px"
            />
          </div>

          <h3 className="text-3xl md:text-4xl font-semibold mb-1">MacBook Neo 13&quot;</h3>
          <p className="text-[#6e6e73] text-sm mb-4">A18 Pro chip</p>

          <div className="flex justify-center gap-2 mb-4">
            {colorSwatches.map(swatch => (
              <span
                key={swatch.name}
                title={swatch.name}
                className="w-4 h-4 rounded-full border border-[#d2d2d7]"
                style={{ backgroundColor: swatch.color }}
              />
            ))}
          </div>

          <p className="text-lg font-medium mb-6">From $999</p>

          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#0066cc] text-white text-lg font-medium rounded-full hover:bg-[#0055b3] transition-colors"
          >
            Buy
          </a>
        </div>
      </div>
    </section>
  );
}
