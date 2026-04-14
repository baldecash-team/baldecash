'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '../shared/SectionHeader';
import { AnimatedCounter } from '../shared/AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

export function DisplaySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.display-stat', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.display-stats-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="display"
      ref={sectionRef}
      className="bg-black py-20 lg:py-32"
    >
      <div className="max-w-[980px] mx-auto px-4">
        <SectionHeader
          eyebrow="Pantalla"
          title="Brillo que deslumbra."
          description="Pantalla Liquid Retina de 13 pulgadas con colores vívidos, texto nítido y un brillo impresionante."
          dark
        />

        {/* Display image */}
        <div className="relative mt-12 lg:mt-20 aspect-[16/9] rounded-2xl overflow-hidden">
          <Image
            src="/images/macbook-neo/dca_display_2x.png"
            alt="MacBook Neo pantalla Liquid Retina"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 980px"
          />
        </div>

        {/* Animated counter stats */}
        <div className="display-stats-grid grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12 lg:mt-20">
          <div className="display-stat text-center">
            <p className="text-[clamp(2rem,5vw,3rem)] font-bold text-[#f5f5f7]">
              <AnimatedCounter end={13} suffix='"' />
            </p>
            <p className="text-[#86868b] text-sm mt-1">Liquid Retina</p>
          </div>
          <div className="display-stat text-center">
            <p className="text-[clamp(2rem,5vw,3rem)] font-bold text-[#f5f5f7]">
              <AnimatedCounter end={3.6} suffix="M" decimals={1} />
            </p>
            <p className="text-[#86868b] text-sm mt-1">De píxeles</p>
          </div>
          <div className="display-stat text-center">
            <p className="text-[clamp(2rem,5vw,3rem)] font-bold text-[#f5f5f7]">
              <AnimatedCounter end={500} suffix=" nits" />
            </p>
            <p className="text-[#86868b] text-sm mt-1">De brillo</p>
          </div>
          <div className="display-stat text-center">
            <p className="text-[clamp(2rem,5vw,3rem)] font-bold text-[#f5f5f7]">
              <AnimatedCounter end={1} suffix="B" />
            </p>
            <p className="text-[#86868b] text-sm mt-1">De colores</p>
          </div>
        </div>
      </div>
    </section>
  );
}
