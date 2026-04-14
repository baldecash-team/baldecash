'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { highlightCards } from '../../data/mockMacbookNeoData';
import { SectionHeader } from '../shared/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export function HighlightsGallery() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const startAutoRotate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % highlightCards.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoRotate]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.highlight-tab', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef.current);
    return () => ctx.revert();
  }, []);

  const handleTabClick = (index: number) => {
    setActive(index);
    startAutoRotate();
  };

  return (
    <section id="highlights" ref={sectionRef} className="bg-[#fbfbfd] py-20 lg:py-28">
      <div className="max-w-[980px] mx-auto px-4">
        <SectionHeader
          eyebrow="Lo más destacado"
          title="Razones para amar la MacBook Neo."
        />

        {/* Tabs */}
        <div className="flex justify-center gap-1 mt-10">
          {highlightCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => handleTabClick(i)}
              className={`highlight-tab px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                active === i
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              {card.badge || card.title}
            </button>
          ))}
        </div>

        {/* Image crossfade */}
        <div className="relative mt-10 aspect-[16/9] rounded-2xl overflow-hidden bg-[#f5f5f7]">
          {highlightCards.map((card, i) => (
            <div
              key={card.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: active === i ? 1 : 0 }}
            >
              <Image
                src={card.imagePath}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 980px"
              />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="text-center mt-8 min-h-[80px]">
          <h3 className="text-xl font-semibold text-[#1d1d1f]">
            {highlightCards[active].title}
          </h3>
          <p className="text-[#6e6e73] mt-2 max-w-lg mx-auto">
            {highlightCards[active].description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {highlightCards.map((_, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                active === i ? 'bg-[#1d1d1f] w-6' : 'bg-[#d2d2d7]'
              }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
