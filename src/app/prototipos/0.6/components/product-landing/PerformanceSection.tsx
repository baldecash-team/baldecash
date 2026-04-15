'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { performanceData } from './data/v5Data';
import { BC } from './lib/constants';
import { RevealOnScroll } from './shared/components/RevealOnScroll';

function ChapterCard({ chapter, imageLeft }: { chapter: { id: string; title: string; description: string; image: string }; imageLeft: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | null = null;

    async function init() {
      const [gsapMod, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      const { gsap } = gsapMod;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);

      const imgEl = el!.querySelector('[data-perf-img]');
      const txtEl = el!.querySelector('[data-perf-txt]');
      if (!imgEl || !txtEl) return;

      gsap.set(imgEl, { opacity: 0, y: 50 });
      gsap.set(txtEl, { opacity: 0, y: 50 });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
        tl.to(imgEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
          .to(txtEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5');
      });
    }

    init();
    return () => { ctx?.revert(); };
  }, [imageLeft]);

  return (
    <div
      ref={rowRef}
      className={`flex flex-col ${imageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-center`}
    >
      <div
        data-perf-img
        className="w-full md:w-1/2 relative overflow-hidden flex-shrink-0"
        style={{ borderRadius: 20, aspectRatio: '4 / 3' }}
      >
        <Image
          src={chapter.image}
          alt={chapter.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 490px"
        />
      </div>
      <div
        data-perf-txt
        className="w-full md:w-1/2 flex flex-col justify-center gap-3 py-4 md:px-6"
      >
        <h3
          className="text-3xl md:text-4xl font-bold m-0 text-[#f5f5f7]"
          style={{ fontFamily: "'Baloo 2', cursive", letterSpacing: '-0.01em' }}
        >
          {chapter.title}
        </h3>
        <p className="text-[17px] md:text-[19px] text-[#86868b] leading-relaxed m-0">
          {chapter.description}
        </p>
      </div>
    </div>
  );
}

export default function PerformanceSection() {
  const handleScrollToPlans = () => {
    const el = document.getElementById('financing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="performance" className="bg-black text-[#f5f5f7] py-16 sm:py-24">
      <div className="max-w-[980px] mx-auto px-6">
        {/* Header */}
        <RevealOnScroll>
          <div className="md:text-center mb-12 sm:mb-20">
            <p className="text-[#86868b] text-sm font-semibold mb-2 uppercase tracking-wider">
              {performanceData.eyebrow}
            </p>
            <h2
              className="text-[32px] sm:text-[48px] md:text-[72px] lg:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {performanceData.headline}
            </h2>
            <p className="text-[15px] sm:text-[17px] md:text-[21px] text-[#86868b] max-w-[680px] md:mx-auto leading-[1.47]">
              {performanceData.description}
            </p>
          </div>
        </RevealOnScroll>

        {/* Chapter cards — alternating layout with slide-in */}
        <div className="flex flex-col gap-10">
          {performanceData.chapters.map((chapter, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                imageLeft={imageLeft}
              />
            );
          })}
        </div>

        {/* Battery stat */}
        <RevealOnScroll>
          <div className="text-center py-12 sm:py-20 mt-10 sm:mt-16">
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

        {/* Mini CTA */}
        <RevealOnScroll>
          <div className="text-center mt-4">
            <p className="text-xl sm:text-2xl md:text-3xl text-[#f5f5f7] m-0 mb-4">
              Desde{' '}
              <span className="font-bold" style={{ color: BC.primary, fontFamily: "'Baloo 2', cursive" }}>
                S/199
              </span>
              <span className="text-[#86868b]">/mes</span>
            </p>
            <button
              onClick={handleScrollToPlans}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white border-none cursor-pointer rounded-xl transition-opacity hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: BC.primary }}
            >
              Ver planes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
