'use client';

import Image from 'next/image';
import { newToMacFeatures } from '../data/v4Data';
import { ASSETS } from '../lib/constants';
import { RevealOnScroll } from '../../macbook-neo-v3/shared/components/RevealOnScroll';

export default function NewToMacSection() {
  return (
    <section id="new-to-mac" className="bg-white text-[#1d1d1f]">
      {/* Header */}
      <div className="max-w-[980px] mx-auto px-6 pt-24 text-center">
        <RevealOnScroll>
          <p className="text-[#86868b] text-sm font-semibold mb-2">New to Mac</p>
          <h2 className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4">
            Intuitive by design.
          </h2>
          <p className="text-[17px] md:text-[21px] text-[#6e6e73] max-w-[680px] mx-auto leading-[1.47]">
            Feel at home in no time, even if you&apos;ve never used a Mac before. The MacBook Neo experience feels familiar and effortless from the very first time you start it up.
          </p>
        </RevealOnScroll>
      </div>

      {/* Hero image */}
      <div className="max-w-[980px] mx-auto px-6 mt-16 md:mt-20">
        <div className="relative w-full aspect-[16/9] rounded-[18px] overflow-hidden">
          <Image
            src={ASSETS.performance[0]}
            alt="MacBook Neo in use"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>

      {/* Caption Tile Gallery */}
      <div className="mt-16 md:mt-24 pb-8">
        <div
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            paddingLeft: 'max(24px, calc((100vw - 980px) / 2))',
            paddingRight: 'max(24px, calc((100vw - 980px) / 2))',
          }}
        >
          {newToMacFeatures.map(feature => (
            <div
              key={feature.id}
              className="flex-shrink-0 snap-start"
              style={{ width: feature.wide ? 'min(85vw, 640px)' : 'min(85vw, 320px)' }}
            >
              <div className="mb-3">
                <h3 className="text-[17px] md:text-[19px] font-semibold mb-1">{feature.title}</h3>
                <p className="text-[14px] text-[#6e6e73] leading-[1.43]">{feature.description}</p>
              </div>
              <div className={`relative ${feature.wide ? 'aspect-[2/1]' : 'aspect-[4/3]'} rounded-[18px] overflow-hidden bg-[#f5f5f7]`}>
                <Image src={feature.image} alt={feature.title} fill className="object-cover" sizes={feature.wide ? '85vw' : '33vw'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
