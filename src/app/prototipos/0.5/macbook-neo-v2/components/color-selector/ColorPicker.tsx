'use client';

import { useState } from 'react';
import Image from 'next/image';
import { colorOptions } from '../../data/mockMacbookNeoData';
import { SectionHeader } from '../shared/SectionHeader';
import { RevealOnScroll } from '../shared/RevealOnScroll';

export function ColorPicker() {
  const [selected, setSelected] = useState(0);

  return (
    <section className="bg-[#fbfbfd] py-20 lg:py-28">
      <div className="max-w-[980px] mx-auto px-4">
        <RevealOnScroll>
          <div>
            <SectionHeader
              eyebrow="Colores"
              title="Elige tu color."
              description="Cuatro opciones deslumbrantes en aluminio 100% reciclado."
            />
          </div>
        </RevealOnScroll>

        {/* Image crossfade */}
        <div className="relative mt-12 aspect-[16/10] rounded-3xl overflow-hidden bg-[#f5f5f7]">
          {colorOptions.map((color, i) => (
            <div
              key={color.id}
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: selected === i ? 1 : 0 }}
            >
              <Image
                src={color.imagePath}
                alt={`MacBook Neo en ${color.label}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 980px"
              />
            </div>
          ))}
        </div>

        {/* Color dots */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {colorOptions.map((color, i) => (
            <button
              key={color.id}
              onClick={() => setSelected(i)}
              className={`group flex flex-col items-center gap-2 transition-all`}
              aria-label={`Color ${color.label}`}
            >
              <span
                className={`block w-8 h-8 rounded-full border-2 transition-all ${
                  selected === i
                    ? 'border-[#0066CC] scale-110'
                    : 'border-transparent hover:border-[#d2d2d7]'
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <span
                className={`text-xs transition-colors ${
                  selected === i ? 'text-[#1d1d1f] font-semibold' : 'text-[#6e6e73]'
                }`}
              >
                {color.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
