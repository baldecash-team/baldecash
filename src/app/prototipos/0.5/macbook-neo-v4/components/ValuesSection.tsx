'use client';

import { valuesCards } from '../data/v4Data';

export default function ValuesSection() {
  return (
    <section id="values" className="bg-[#f5f5f7] text-[#1d1d1f] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <h2 className="text-[32px] md:text-[48px] font-semibold tracking-[-0.003em] leading-[1.08] mb-12">
          Our values lead the way.
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {valuesCards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl p-8 flex flex-col">
              <span className="text-4xl mb-4">{card.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{card.headline}</h3>
              <p className="text-sm text-[#6e6e73] leading-relaxed mb-6 flex-1">
                {card.description}
              </p>
              {card.link && (
                <a
                  href={card.link.href}
                  className="text-[#0066cc] text-sm font-medium hover:underline"
                >
                  {card.link.label} &rsaquo;
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
