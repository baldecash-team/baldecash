'use client';

import Image from 'next/image';
import { TextOverMedia } from '../../macbook-neo-v3/shared/components/TextOverMedia';
import { designData } from '../data/v4Data';

export function TextOverMediaDesign() {
  return (
    <TextOverMedia
      height="300vh"
      align="center"
      media={
        <Image
          src={designData.videoEndframe}
          alt="MacBook Neo diseño"
          fill
          style={{ objectFit: 'cover' }}
          sizes="100vw"
        />
      }
    >
      <div className="flex flex-col items-center gap-4">
        {/* Headline — 96px, Apple exact */}
        <span className="text-[56px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.05] text-white">
          {designData.headline}
        </span>

        {/* Description */}
        <p className="text-[17px] sm:text-[19px] md:text-[21px] font-semibold text-white max-w-[680px] leading-[1.38]">
          Introducing MacBook Neo, an amazing Mac at a surprising price. With an ultra-thin design, a vivid display, and superfast performance.
        </p>

        {/* CTA — Watch the film */}
        <a
          href="#design-film"
          className="inline-flex items-center rounded-full px-6 py-2 text-sm font-normal text-white no-underline hover:opacity-90 transition-opacity mt-2 border border-white/30"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          Watch the film
        </a>
      </div>
    </TextOverMedia>
  );
}
