'use client';

import Image from 'next/image';
import { performanceData } from './data/v5Data';
import { ASSETS } from './lib/constants';
import { RevealOnScroll } from './shared/components/RevealOnScroll';

export default function PerformanceSection() {
  return (
    <section id="performance" className="bg-black text-[#f5f5f7] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        {/* Header */}
        <RevealOnScroll>
          <div className="md:text-center mb-20">
            <p className="text-[#86868b] text-sm font-semibold mb-2 uppercase tracking-wider">
              {performanceData.eyebrow}
            </p>
            <h2
              className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {performanceData.headline}
            </h2>
            <p className="text-[17px] md:text-[21px] text-[#86868b] max-w-[680px] md:mx-auto leading-[1.47]">
              {performanceData.description}
            </p>
          </div>
        </RevealOnScroll>

        {/* Chapter cards — stacked hero layout */}
        <div className="flex flex-col gap-6">
          {performanceData.chapters.map((chapter) => (
            <RevealOnScroll key={chapter.id}>
              <div
                className="relative overflow-hidden"
                style={{ borderRadius: 20 }}
              >
                {/* Image */}
                <div className="relative" style={{ aspectRatio: '1.63 / 1' }}>
                  <Image
                    src={chapter.image}
                    alt={chapter.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 980px) 100vw, 980px"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 35%, transparent 60%)',
                    }}
                  />
                </div>
                {/* Text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
                  <h3
                    className="text-2xl md:text-3xl font-semibold mb-2 text-white m-0"
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    {chapter.title}
                  </h3>
                  <p className="text-[15px] md:text-[17px] text-white/70 leading-relaxed m-0 max-w-[520px]">
                    {chapter.description}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Battery stat */}
        <RevealOnScroll>
          <div className="text-center py-20 mt-16">
            <p className="text-sm text-[#86868b] mb-3 uppercase tracking-wider font-medium m-0">
              {performanceData.batteryLabel}
            </p>
            <p
              className="font-bold text-[#f5f5f7] m-0"
              style={{
                fontSize: 'clamp(80px, 15vw, 140px)',
                fontFamily: "'Baloo 2', cursive",
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              16<span className="text-[#86868b]">h</span>
            </p>
            <p className="text-[17px] md:text-[21px] text-[#86868b] mt-4 m-0">
              de batería con una sola carga
            </p>
          </div>
        </RevealOnScroll>

        {/* Lifestyle image */}
        <RevealOnScroll>
          <div className="relative overflow-hidden" style={{ borderRadius: 20, aspectRatio: '16 / 9' }}>
            <Image
              src={ASSETS.lifestyle}
              alt="MacBook Neo en uso"
              fill
              className="object-cover"
              sizes="(max-width: 980px) 100vw, 980px"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
