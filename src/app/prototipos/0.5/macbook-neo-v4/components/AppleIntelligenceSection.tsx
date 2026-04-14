'use client';

import Image from 'next/image';
import { aiFeatures } from '../data/v4Data';
import { ASSETS } from '../lib/constants';
import { RevealOnScroll } from '../../macbook-neo-v3/shared/components/RevealOnScroll';

export default function AppleIntelligenceSection() {
  return (
    <section id="apple-intelligence" className="bg-white text-[#1d1d1f]">
      {/* Header */}
      <div className="max-w-[980px] mx-auto px-6 pt-24">
        <RevealOnScroll>
          <p className="text-[#86868b] text-sm font-semibold mb-2">AI</p>
          <h2 className="text-[48px] sm:text-[72px] md:text-[96px] font-semibold tracking-[-0.015em] leading-[1.04] mb-4">
            From to‑do to&nbsp;ta‑da.
          </h2>
          <p className="text-[17px] md:text-[21px] text-[#6e6e73] max-w-[680px] leading-[1.47] mb-0">
            The AI apps and tools you use the most, like ChatGPT and Canva, run beautifully on MacBook Neo. It delivers a smooth, versatile AI experience — opening up new possibilities for your work and hobbies.
          </p>
        </RevealOnScroll>
      </div>

      {/* Hero image — full-width laptop with AI apps */}
      <div className="max-w-[980px] mx-auto px-6 mt-16 md:mt-20">
        <div className="relative w-full aspect-[16/9] rounded-[18px] overflow-hidden">
          <Image
            src={ASSETS.performance[0]}
            alt="MacBook Neo using AI apps"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>

      {/* "Built for Apple Intelligence" sub-headline */}
      <div className="max-w-[980px] mx-auto px-6 mt-20 md:mt-28 text-center">
        <RevealOnScroll>
          <h3 className="text-[32px] md:text-[48px] lg:text-[64px] font-semibold tracking-[-0.009em] leading-[1.06] mb-4">
            Built for <span className="text-[#6e6e73]">Apple Intelligence.</span>
          </h3>
          <p className="text-[17px] md:text-[21px] text-[#6e6e73] max-w-[680px] mx-auto leading-[1.47]">
            Apple Intelligence is the personal intelligence system that helps you write, express yourself, and get things done. And it comes fully integrated into MacBook Neo.
          </p>
        </RevealOnScroll>
      </div>

      {/* Caption Tile Gallery — horizontal scrollable */}
      <div className="mt-12 md:mt-16 pb-8">
        <div
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            paddingLeft: 'max(24px, calc((100vw - 980px) / 2))',
            paddingRight: 'max(24px, calc((100vw - 980px) / 2))',
          }}
        >
          {aiFeatures.map(feature => (
            <div key={feature.id} className="flex-shrink-0 snap-start" style={{ width: 'min(85vw, 320px)' }}>
              {/* Caption above tile */}
              <div className="mb-3">
                <h3 className="text-[17px] md:text-[19px] font-semibold mb-1">{feature.title}</h3>
                <p className="text-[14px] text-[#6e6e73] leading-[1.43]">{feature.description}</p>
              </div>
              {/* Tile image */}
              <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden bg-[#f5f5f7]">
                <Image src={feature.image} alt={feature.title} fill className="object-cover" sizes="33vw" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy callout */}
      <div className="max-w-[980px] mx-auto px-6 py-20 md:py-28 text-center">
        <RevealOnScroll>
          <h3 className="text-[32px] md:text-[48px] lg:text-[64px] font-semibold tracking-[-0.009em] leading-[1.06] mb-4">
            Great powers come with great&nbsp;<span className="text-[#6e6e73]">privacy.</span>
          </h3>
          <p className="text-[17px] md:text-[21px] text-[#6e6e73] max-w-[680px] mx-auto leading-[1.47]">
            Apple Intelligence is designed to protect your privacy at every step. It&apos;s integrated into the core of your Mac through on-device processing. So it&apos;s aware of your personal information without collecting your personal information.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
