'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollStories } from '../../data/mockMacbookNeoData';
import { SectionHeader } from '../shared/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export function PerformanceSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const totalWidth = track.scrollWidth - window.innerWidth;

      // Sticky pin + horizontal scroll
      gsap.to(track, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section id="performance" className="bg-white">
      <div className="py-16 lg:py-20 max-w-[980px] mx-auto px-4">
        <SectionHeader
          eyebrow="Rendimiento"
          title="Poder para todo."
          description="Chip A18 Pro con rendimiento increíble para todo lo que necesitas hacer."
        />
      </div>

      <div ref={containerRef} className="overflow-hidden">
        <div ref={trackRef} className="flex h-screen items-center">
          {scrollStories.map((story) => (
            <div
              key={story.id}
              className="flex-shrink-0 w-screen h-full flex items-center justify-center px-4"
            >
              <div className="max-w-4xl w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Image */}
                <div className="relative w-full lg:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={story.imagePath}
                    alt={story.headline}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Text */}
                <div className="lg:w-1/2 text-center lg:text-left">
                  <h3
                    className="text-[clamp(1.8rem,5vw,2.8rem)] font-bold tracking-[-0.03em] leading-tight"
                    style={{ color: story.headlineColor }}
                  >
                    {story.headline}
                  </h3>
                  <p className="text-[#6e6e73] text-lg mt-4 leading-relaxed">
                    {story.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-3 py-8">
        {scrollStories.map((story, i) => (
          <span
            key={story.id}
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: story.headlineColor, opacity: 0.6 }}
          />
        ))}
      </div>
    </section>
  );
}
