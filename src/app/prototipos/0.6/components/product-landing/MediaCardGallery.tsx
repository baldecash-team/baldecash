'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { highlightCards } from './data/v5Data';

export default function MediaCardGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const cardCount = highlightCards.length;

  // Only auto-advance when section is in viewport
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const scrollToCard = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>('[data-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const cards = container.querySelectorAll<HTMLElement>('[data-card]');
      let closest = 0;
      let minDist = Infinity;
      const center = container.scrollLeft + container.clientWidth / 2;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIndex(closest);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isPlaying || !isVisible) return;
    autoTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % cardCount;
        scrollToCard(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(autoTimer.current);
  }, [isPlaying, isVisible, cardCount, scrollToCard]);

  return (
    <section ref={sectionRef} id="highlights" className="bg-black text-[#f5f5f7] pt-20 pb-12 overflow-hidden">
      <div className="mx-auto px-6 mb-10" style={{ maxWidth: 'calc(100% - clamp(0px, 6.25vw, 120px) * 2)' }}>
        <h2
          className="text-[32px] md:text-[40px] lg:text-[48px] font-semibold tracking-[-0.003em] leading-[1.08]"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Lo mejor de un vistazo.
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4"
        style={{
          scrollbarWidth: 'none',
          paddingLeft: 'max(20px, calc((100vw - 980px) / 2))',
          paddingRight: 'max(20px, calc((100vw - 980px) / 2))',
        }}
      >
        {highlightCards.map((card) => {
          const isDark = card.theme === 'dark';
          return (
            <div
              key={card.id}
              data-card
              className="flex-shrink-0 snap-center relative overflow-hidden"
              style={{
                width: 'min(90vw, 560px)',
                borderRadius: 18,
                backgroundColor: isDark ? '#1d1d1f' : '#f5f5f7',
              }}
            >
              {/* Image */}
              <div className="relative" style={{ aspectRatio: '1.85 / 1' }}>
                <Image src={card.image} alt={card.caption} fill className="object-cover" sizes="(max-width: 768px) 90vw, 560px" />
                {/* Gradient for text legibility */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)'
                      : 'linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 40%, transparent 65%)',
                  }}
                />
              </div>
              {/* Text at bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
                <p
                  className="text-[19px] sm:text-[24px] md:text-[28px] font-semibold leading-[1.14] tracking-[0.007em] m-0"
                  style={{ color: isDark ? '#f5f5f7' : '#1d1d1f' }}
                >
                  {card.caption}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <svg className="w-[14px] h-[14px]" viewBox="0 0 56 56" fill="#f5f5f7">
              <path d="m21.7334 36.67h2.5342c1.1483 0 1.7324-.5796 1.7324-1.7193v-13.9015c0-1.12-.5841-1.6898-1.7324-1.7193h-2.5342c-1.1483 0-1.7324.5698-1.7324 1.7193v13.9015c-.0297 1.1396.5544 1.7193 1.7324 1.7193zm9.9992 0h2.5347c1.1485 0 1.7327-.5796 1.7327-1.7193v-13.9015c0-1.12-.5842-1.7193-1.7327-1.7193h-2.5347c-1.1485 0-1.7327.5698-1.7327 1.7193v13.9015c0 1.1396.5545 1.7193 1.7327 1.7193z" />
            </svg>
          ) : (
            <svg className="w-[14px] h-[14px]" viewBox="0 0 56 56" fill="#f5f5f7">
              <path d="m23.7555 36.6237c.4478 0 .8598-.1343 1.4241-.4568l10.9178-6.3322c.8598-.5016 1.3614-1.021 1.3614-1.8361 0-.8061-.5016-1.3255-1.3614-1.8271l-10.9178-6.3322c-.5643-.3314-.9762-.4657-1.4241-.4657-.9315 0-1.7555.7165-1.7555 1.9435v13.3629c0 1.227.824 1.9435 1.7555 1.9435z" />
            </svg>
          )}
        </button>
        <div className="flex gap-[6px]">
          {highlightCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => { scrollToCard(i); setActiveIndex(i); }}
              className="rounded-full transition-all duration-300 border-none cursor-pointer p-0"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                backgroundColor: i === activeIndex ? '#f5f5f7' : '#424245',
              }}
              aria-label={card.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
