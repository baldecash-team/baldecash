'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { productImages } from '../../data/mockMacbookNeoData';
import { SectionHeader } from '../shared/SectionHeader';

gsap.registerPlugin(ScrollTrigger);

export function ProductGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        opacity: 0,
        y: 50,
        scale: 0.95,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, gridRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-[#fbfbfd] py-20 lg:py-28">
      <div className="max-w-[980px] mx-auto px-4">
        <SectionHeader
          eyebrow="Detalles del producto"
          title="Cada detalle, pensado."
        />

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {productImages.map((img) => (
            <div
              key={img.src}
              className="product-card group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f5f7]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 320px"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white text-sm font-semibold">{img.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
