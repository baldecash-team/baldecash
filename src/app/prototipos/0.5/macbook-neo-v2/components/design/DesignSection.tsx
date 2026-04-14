'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeader } from '../shared/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export function DesignSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      // Image scale 0.95 → 1 on scroll
      gsap.fromTo(
        imageRef.current,
        { scale: 0.95, opacity: 0.8 },
        {
          scale: 1,
          opacity: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'center center',
            scrub: true,
          },
        },
      );

      // Text stagger reveal
      gsap.from('.design-text-item', {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="design"
      ref={sectionRef}
      className="bg-black py-20 lg:py-32"
    >
      <div className="max-w-[980px] mx-auto px-4">
        <div className="design-text-item">
          <SectionHeader
            eyebrow="Diseño"
            title="Love at first Mac."
            description="Un diseño de aluminio increíblemente delgado y ligero en cuatro colores deslumbrantes. Tu MacBook Neo es tan hermosa como potente."
            dark
          />
        </div>

        <div ref={imageRef} className="mt-12 lg:mt-20">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src="https://baldecash.s3.amazonaws.com/images/macbook-neo/design_endframe_2x.png"
              alt="MacBook Neo diseño - cuatro colores"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 980px"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 lg:mt-20 text-center">
          <div className="design-text-item">
            <p className="text-[2.5rem] font-bold text-[#f5f5f7]">1.24 kg</p>
            <p className="text-[#86868b] mt-1">Increíblemente ligera</p>
          </div>
          <div className="design-text-item">
            <p className="text-[2.5rem] font-bold text-[#f5f5f7]">11.3 mm</p>
            <p className="text-[#86868b] mt-1">Ultra delgada</p>
          </div>
          <div className="design-text-item">
            <p className="text-[2.5rem] font-bold text-[#f5f5f7]">4 colores</p>
            <p className="text-[#86868b] mt-1">Aluminio reciclado</p>
          </div>
        </div>
      </div>
    </section>
  );
}
