'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { highlightCards } from './data/v5Data';

// Duplicate cards for seamless infinite loop
const loopCards = [...highlightCards, ...highlightCards];

export default function MediaCardGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Observe visibility
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Track active card based on animation progress
  useEffect(() => {
    if (!isVisible || !isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % highlightCards.length);
    }, 25000 / highlightCards.length);
    return () => clearInterval(interval);
  }, [isVisible, isPlaying]);

  const handleDotClick = useCallback((i: number) => {
    setActiveIndex(i);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="highlights"
      className="bg-black text-[#f5f5f7] pt-20 pb-12 overflow-hidden"
    >
      <div className="mb-8 sm:mb-10" style={{ paddingLeft: 'max(16px, calc((100vw - 980px) / 2))' }}>
        <h2
          className="text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] font-semibold tracking-[-0.015em] leading-[1.05]"
          style={{ fontFamily: "'Baloo 2', sans-serif" }}
        >
          Lo mejor de un vistazo
        </h2>
      </div>

      {/* Marquee track */}
      <div
        className="relative"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        <div
          className="flex gap-5"
          style={{
            animationName: isVisible ? 'marquee-scroll' : 'none',
            animationDuration: '25s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: isPlaying ? 'running' : 'paused',
            width: 'max-content',
            paddingLeft: 20,
          }}
        >
          {loopCards.map((card, i) => {
            const isDark = card.theme === 'dark';
            return (
              <div
                key={`${card.id}-${i}`}
                className="flex-shrink-0 relative overflow-hidden"
                style={{
                  width: 'min(80vw, 560px)',
                  borderRadius: 18,
                  backgroundColor: isDark ? '#1d1d1f' : '#f5f5f7',
                }}
              >
                <div className="relative" style={{ aspectRatio: '1.85 / 1' }}>
                  <Image
                    src={card.image}
                    alt={card.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 560px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)'
                        : 'linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 40%, transparent 65%)',
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6 md:p-8">
                  <p
                    className="text-[14px] sm:text-[17px] md:text-2xl font-semibold leading-[1.14] tracking-[0.007em] m-0"
                    style={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}
                  >
                    {card.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className="w-12 h-12 flex items-center justify-center rounded-full cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: 'none' }}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <svg className="w-[40px] h-[40px]" viewBox="0 0 56 56" fill="#f5f5f7">
              <path d="m21.7334 36.67h2.5342c1.1483 0 1.7324-.5796 1.7324-1.7193v-13.9015c0-1.12-.5841-1.6898-1.7324-1.7193h-2.5342c-1.1483 0-1.7324.5698-1.7324 1.7193v13.9015c-.0297 1.1396.5544 1.7193 1.7324 1.7193zm9.9992 0h2.5347c1.1485 0 1.7327-.5796 1.7327-1.7193v-13.9015c0-1.12-.5842-1.7193-1.7327-1.7193h-2.5347c-1.1485 0-1.7327.5698-1.7327 1.7193v13.9015c0 1.1396.5545 1.7193 1.7327 1.7193z" />
            </svg>
          ) : (
            <svg className="w-[40px] h-[40px]" viewBox="0 0 56 56" fill="#f5f5f7">
              <path d="m23.7555 36.6237c.4478 0 .8598-.1343 1.4241-.4568l10.9178-6.3322c.8598-.5016 1.3614-1.021 1.3614-1.8361 0-.8061-.5016-1.3255-1.3614-1.8271l-10.9178-6.3322c-.5643-.3314-.9762-.4657-1.4241-.4657-.9315 0-1.7555.7165-1.7555 1.9435v13.3629c0 1.227.824 1.9435 1.7555 1.9435z" />
            </svg>
          )}
        </button>
        <div className="flex gap-[6px]">
          {highlightCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => handleDotClick(i)}
              className="rounded-full transition-all duration-300 border-none cursor-pointer p-0"
              style={{
                width: i === activeIndex ? 28 : 10,
                height: 10,
                backgroundColor: i === activeIndex ? '#f5f5f7' : '#424245',
              }}
              aria-label={card.label}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
