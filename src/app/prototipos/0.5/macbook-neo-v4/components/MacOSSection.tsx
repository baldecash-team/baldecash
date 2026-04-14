'use client';

import Image from 'next/image';
import { macOSFeatures } from '../data/v4Data';
import { TextOverMedia } from '../../macbook-neo-v3/shared/components/TextOverMedia';
import { ASSETS } from '../lib/constants';

export default function MacOSSection() {
  return (
    <section id="macos">
      {/* TextOverMedia hero — "Smooth operator." */}
      <TextOverMedia
        height="300vh"
        align="center"
        media={
          <Image
            src={ASSETS.performance[2]}
            alt="macOS on MacBook Neo"
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
          />
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[14px] font-semibold text-white/80 tracking-[0.005em]">macOS</p>
          <h2 className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.05] text-white">
            Smooth operator.
          </h2>
          <p className="text-[17px] sm:text-[19px] md:text-[21px] font-semibold text-white/90 max-w-[680px] leading-[1.38]">
            macOS is the powerful yet friendly operating system that makes a Mac a Mac. Simple navigation. Free, automatic updates. Apps that run without a hitch.
          </p>
        </div>
      </TextOverMedia>

      {/* Caption Tile Gallery */}
      <div className="bg-[#f5f5f7] py-16 md:py-24">
        <div
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            paddingLeft: 'max(24px, calc((100vw - 980px) / 2))',
            paddingRight: 'max(24px, calc((100vw - 980px) / 2))',
          }}
        >
          {macOSFeatures.map(feature => (
            <div
              key={feature.id}
              className="flex-shrink-0 snap-start"
              style={{ width: feature.wide ? 'min(85vw, 640px)' : 'min(85vw, 320px)' }}
            >
              {/* Caption above tile */}
              <div className="mb-3">
                <h3 className="text-[17px] md:text-[19px] font-semibold text-[#1d1d1f] mb-1">{feature.title}</h3>
                <p className="text-[14px] text-[#6e6e73] leading-[1.43]">{feature.description}</p>
              </div>
              {/* Tile image */}
              <div className={`relative ${feature.wide ? 'aspect-[2/1]' : 'aspect-[4/3]'} rounded-[18px] overflow-hidden bg-[#1d1d1f]`}>
                <Image src={feature.image} alt={feature.title} fill className="object-cover" sizes={feature.wide ? '85vw' : '33vw'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
