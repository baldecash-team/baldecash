'use client';

import Image from 'next/image';
import { incentiveCards } from '../data/v4Data';

export default function IncentiveSection() {
  return (
    <section id="incentive" className="bg-[#f5f5f7] text-[#1d1d1f] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <h2 className="text-[32px] md:text-[48px] font-semibold tracking-[-0.003em] leading-[1.08] mb-4">
          Why Apple is the best place to buy Mac.
        </h2>
        <a
          href="#contrast"
          className="inline-block text-[#0066cc] text-lg font-medium hover:underline mb-12"
        >
          Shop Mac &rsaquo;
        </a>

        <div className="grid md:grid-cols-2 gap-5">
          {incentiveCards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl overflow-hidden">
              <div className="relative aspect-[3/2]">
                <Image
                  src={card.image}
                  alt={card.headline}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{card.headline}</h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed mb-4">{card.description}</p>
                <a href={card.ctaHref} className="text-[#0066cc] text-sm font-medium hover:underline">
                  {card.ctaLabel} &rsaquo;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
