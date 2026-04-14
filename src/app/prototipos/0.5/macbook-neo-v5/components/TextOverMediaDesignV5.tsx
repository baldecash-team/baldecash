'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { TextOverMedia } from '../../macbook-neo-v3/shared/components/TextOverMedia';
import { designData } from '../data/v5Data';
import { BC } from '../lib/constants';

export default function TextOverMediaDesignV5() {
  const handleScrollTo = () => {
    const el = document.getElementById(designData.ctaScrollTo);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <TextOverMedia
      height="300vh"
      align="center"
      media={
        <Image
          src={designData.image}
          alt="MacBook Neo diseño"
          fill
          style={{ objectFit: 'cover' }}
          sizes="100vw"
        />
      }
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="text-[56px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.05] text-white"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {designData.headline}
        </span>
        <p className="text-[17px] sm:text-[19px] md:text-[21px] font-medium text-white max-w-[680px] leading-[1.38]">
          {designData.description}
        </p>
        <button
          onClick={handleScrollTo}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white hover:opacity-90 transition-all border-none cursor-pointer rounded-lg shadow-sm mt-2"
          style={{ backgroundColor: BC.primary }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BC.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BC.primary)}
        >
          {designData.ctaLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </TextOverMedia>
  );
}
