'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroData } from '../../data/mockMacbookNeoData';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      // Title fades out and moves up as you scroll (scrub)
      gsap.to(titleRef.current, {
        opacity: 0,
        y: -80,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      });

      // Image zooms out from 1.2 to 1 (scrub)
      gsap.fromTo(
        imageRef.current,
        { scale: 1.2 },
        {
          scale: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[200vh] bg-[#fbfbfd]"
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Title block */}
        <div ref={titleRef} className="relative z-10 text-center px-4 mb-8">
          <p className="text-[#6e6e73] text-sm font-semibold tracking-wide uppercase mb-3">
            {heroData.badge}
          </p>
          <h1
            className="text-[clamp(3rem,10vw,5.5rem)] font-bold tracking-[-0.045em] leading-[1.05] text-[#1d1d1f]"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
          >
            {heroData.headline}
          </h1>
          <p className="text-[clamp(1.3rem,4vw,2rem)] font-semibold tracking-[-0.02em] text-[#6e6e73] mt-3">
            {heroData.subheadline}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <a
              href="#financing"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#financing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#0066CC] text-white text-base font-semibold px-7 py-3 rounded-full hover:bg-[#004499] transition-colors"
            >
              Financiar
            </a>
            <a
              href="#highlights"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#highlights')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#0066CC] text-base font-semibold hover:underline"
            >
              Conocer más ›
            </a>
          </div>
        </div>

        {/* Hero image with zoom-out parallax */}
        <div
          ref={imageRef}
          className="relative w-full max-w-4xl mx-auto px-4"
        >
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
            <Image
              src={heroData.heroImage}
              alt="MacBook Neo"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
