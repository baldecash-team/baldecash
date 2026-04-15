'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { dcaChapters } from './data/v5Data';
import { RevealOnScroll } from './shared/components/RevealOnScroll';

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const numericPart = parseFloat(value.replace(/[^\d.]/g, ''));
          const hasDecimal = value.includes('.');
          const duration = 1500;
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = numericPart * eased;
            setDisplay(hasDecimal ? current.toFixed(1) : Math.floor(current).toString());
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

  const valueSuffix = value.replace(/[\d.]/g, '') || '';

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {valueSuffix}
    </span>
  );
}

export default function DisplayCameraAudio() {
  const displayChapter = dcaChapters[0]; // Pantalla
  const subChapters = dcaChapters.slice(1); // Cámara, Audio

  return (
    <section id="display" className="bg-black text-[#f5f5f7] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        {/* Header */}
        <RevealOnScroll>
          <div className="md:text-center mb-20">
            <p className="text-[#86868b] text-sm font-semibold mb-2 uppercase tracking-wider">
              Pantalla, Cámara y Audio
            </p>
            <h2
              className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Un festín para tus sentidos.
            </h2>
            <p className="text-[17px] md:text-[21px] text-[#86868b] max-w-[680px] md:mx-auto leading-[1.47]">
              Fotos y videos con contraste vibrante y detalle nítido. Texto legible para
              estudiar sin cansarte. Y altavoces laterales con sonido envolvente.
            </p>
          </div>
        </RevealOnScroll>

        {/* Pantalla — hero grande */}
        <RevealOnScroll>
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 20, backgroundColor: '#1d1d1f' }}
          >
            <div className="relative" style={{ aspectRatio: '1.64 / 1' }}>
              <Image
                src={displayChapter.image}
                alt={displayChapter.title}
                fill
                className="object-contain"
                sizes="(max-width: 980px) 100vw, 980px"
              />
            </div>
            {/* Text + stats below image */}
            <div className="p-8 md:p-10">
              <h3
                className="text-2xl md:text-3xl font-semibold mb-2 m-0"
                style={{ letterSpacing: '-0.01em' }}
              >
                {displayChapter.title}
              </h3>
              <p className="text-[15px] md:text-[17px] text-[#86868b] leading-relaxed m-0 max-w-[520px]">
                {displayChapter.description}
              </p>
              {displayChapter.stats && (
                <div className="flex gap-10 mt-8">
                  {displayChapter.stats.map((stat) => (
                    <div key={stat.label}>
                      <p
                        className="text-[36px] md:text-[48px] font-semibold m-0"
                        style={{ fontFamily: "'Baloo 2', cursive", lineHeight: 1.1 }}
                      >
                        <AnimatedNumber value={stat.value} />
                      </p>
                      <p className="text-sm text-[#86868b] mt-1 m-0">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </RevealOnScroll>

        {/* Cámara + Audio — two cards side by side */}
        <div className="grid md:grid-cols-2 gap-5 mt-5">
          {subChapters.map((chapter) => {
            const isLight = chapter.id === 'audio';
            return (
              <RevealOnScroll key={chapter.id}>
                <div
                  className="relative overflow-hidden h-full flex flex-col"
                  style={{
                    borderRadius: 20,
                    backgroundColor: isLight ? '#f5f5f7' : '#1d1d1f',
                  }}
                >
                  {/* Image */}
                  <div className="relative" style={{ aspectRatio: '1.89 / 1' }}>
                    <Image
                      src={chapter.image}
                      alt={chapter.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 490px"
                    />
                  </div>
                  {/* Text */}
                  <div className="p-6 md:p-8 flex-1">
                    <h3
                      className="text-xl md:text-2xl font-semibold mb-2 m-0"
                      style={{
                        color: isLight ? '#1d1d1f' : '#f5f5f7',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {chapter.title}
                    </h3>
                    <p
                      className="text-[14px] md:text-[15px] leading-relaxed m-0"
                      style={{ color: isLight ? '#6e6e73' : '#86868b' }}
                    >
                      {chapter.description}
                    </p>
                    {chapter.stats && (
                      <div className="flex gap-8 mt-5">
                        {chapter.stats.map((stat) => (
                          <div key={stat.label}>
                            <p
                              className="text-[28px] md:text-[36px] font-semibold m-0"
                              style={{
                                fontFamily: "'Baloo 2', cursive",
                                lineHeight: 1.1,
                                color: isLight ? '#1d1d1f' : '#f5f5f7',
                              }}
                            >
                              <AnimatedNumber value={stat.value} />
                            </p>
                            <p
                              className="text-xs mt-1 m-0"
                              style={{ color: isLight ? '#6e6e73' : '#86868b' }}
                            >
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
