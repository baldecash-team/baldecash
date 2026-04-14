'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { dcaChapters } from '../data/v4Data';
import { RevealOnScroll } from '../../macbook-neo-v3/shared/components/RevealOnScroll';

function AnimatedNumber({ value, suffix }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          // Parse the target value
          const numericPart = parseFloat(value.replace(/[^\d.]/g, ''));
          const hasDecimal = value.includes('.');
          const duration = 1500;
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = numericPart * eased;
            setDisplay(
              hasDecimal ? current.toFixed(1) : Math.floor(current).toString()
            );
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  // Extract non-numeric suffix from value (e.g. "M" from "3.6M")
  const valueSuffix = value.replace(/[\d.]/g, '') || suffix || '';

  return (
    <span ref={ref} className="text-[32px] md:text-[48px] font-semibold tabular-nums">
      {display}
      {valueSuffix}
    </span>
  );
}

export function DisplayCameraAudio() {
  return (
    <section id="display" className="bg-black text-[#f5f5f7] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        {/* Section header */}
        <RevealOnScroll>
          <div className="md:text-center">
            <p className="text-[#86868b] text-sm font-semibold mb-2">
              Display, Camera, and Audio
            </p>
            <h2 className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4">
              A feast for the senses.
            </h2>
            <p className="text-[17px] md:text-[21px] text-[#86868b] max-w-[680px] md:mx-auto leading-[1.47] mb-16">
              Photos and videos pop with rich contrast and sharp detail. Text is
              crisp for easy reading. And dual side-firing speakers surround you in
              sound.
            </p>
          </div>
        </RevealOnScroll>

        {/* Chapters */}
        {dcaChapters.map((chapter, index) => (
          <RevealOnScroll key={chapter.id}>
            <div
              className={`mb-20 ${index > 0 ? 'pt-10 border-t border-[#424245]' : ''}`}
            >
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#1d1d1f]">
                    <Image
                      src={chapter.image}
                      alt={chapter.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-semibold mb-3">
                    {chapter.title}
                  </h3>
                  <p className="text-lg text-[#86868b] leading-relaxed">
                    {chapter.description}
                  </p>

                  {chapter.stats && (
                    <div className="flex gap-8 mt-8">
                      {chapter.stats.map((stat) => (
                        <div key={stat.label}>
                          <AnimatedNumber value={stat.value} />
                          <p className="text-sm text-[#86868b] mt-1">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
