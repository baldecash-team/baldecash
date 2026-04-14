'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedCounter } from '../shared/AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

export function LifestyleSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax: image moves slower than scroll
      gsap.to(imageRef.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[80vh] overflow-hidden">
      {/* Parallax image */}
      <div
        ref={imageRef}
        className="absolute inset-0 -top-[15%] -bottom-[15%]"
      >
        <Image
          src="https://baldecash.s3.amazonaws.com/images/macbook-neo/performance_lifestyle_2x.jpg"
          alt="MacBook Neo estilo de vida"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Stats overlay */}
      <div className="relative z-10 h-full flex items-end pb-16 lg:pb-20">
        <div className="max-w-[980px] mx-auto px-4 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <p className="text-white text-[clamp(2rem,5vw,3rem)] font-bold">
                <AnimatedCounter end={16} suffix="h" />
              </p>
              <p className="text-white/70 text-sm mt-1">De batería</p>
            </div>
            <div className="text-center">
              <p className="text-white text-[clamp(2rem,5vw,3rem)] font-bold">
                <AnimatedCounter end={18} prefix="A" suffix=" Pro" />
              </p>
              <p className="text-white/70 text-sm mt-1">Chip Apple</p>
            </div>
            <div className="text-center">
              <p className="text-white text-[clamp(2rem,5vw,3rem)] font-bold">
                <AnimatedCounter end={8} suffix=" GB" />
              </p>
              <p className="text-white/70 text-sm mt-1">Memoria unificada</p>
            </div>
            <div className="text-center">
              <p className="text-white text-[clamp(2rem,5vw,3rem)] font-bold">
                <AnimatedCounter end={256} suffix=" GB" />
              </p>
              <p className="text-white/70 text-sm mt-1">SSD ultrarrápido</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
