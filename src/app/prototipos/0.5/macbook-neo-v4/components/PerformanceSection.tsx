'use client';

import Image from 'next/image';
import { performanceData } from '../data/v4Data';
import { ASSETS } from '../lib/constants';
import { RevealOnScroll } from '../../macbook-neo-v3/shared/components/RevealOnScroll';

export default function PerformanceSection() {
  return (
    <section id="performance" className="bg-black text-[#f5f5f7] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        {/* Section header */}
        <RevealOnScroll>
          <div className="md:text-center">
            <p className="text-[#86868b] text-sm font-semibold mb-2">{performanceData.eyebrow}</p>
            <h2 className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4">
              {performanceData.headline}
            </h2>
            <p className="text-[17px] md:text-[21px] text-[#86868b] max-w-[680px] md:mx-auto leading-[1.47] mb-20">
              {performanceData.description}
            </p>
          </div>
        </RevealOnScroll>

        {/* Chapters */}
        {performanceData.chapters.map((chapter, index) => (
          <RevealOnScroll key={chapter.id}>
            <div className={`grid md:grid-cols-2 gap-10 items-center mb-24`}>
              <div className={chapter.reversed ? 'md:order-2' : ''}>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={chapter.image}
                    alt={chapter.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className={chapter.reversed ? 'md:order-1' : ''}>
                <h3 className="text-3xl md:text-4xl font-semibold mb-3">{chapter.title}</h3>
                <p className="text-lg text-[#86868b] leading-relaxed">{chapter.description}</p>
              </div>
            </div>
          </RevealOnScroll>
        ))}

        {/* Battery stat */}
        <RevealOnScroll>
          <div className="text-center py-16 border-t border-[#424245]">
            <p className="text-sm text-[#86868b] mb-2">{performanceData.batteryLabel}</p>
            <p className="text-4xl md:text-5xl font-semibold">{performanceData.batteryValue}</p>
          </div>
        </RevealOnScroll>

        {/* Lifestyle image */}
        <RevealOnScroll>
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mt-8">
            <Image
              src={ASSETS.lifestyle}
              alt="MacBook Neo lifestyle"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
