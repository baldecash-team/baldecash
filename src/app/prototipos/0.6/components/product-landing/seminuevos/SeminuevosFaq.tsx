'use client';

import { useState } from 'react';
import type { FaqData } from '../../../types/hero';
import { faq } from './data/seminuevosData';
import { IconChevron } from './icons/SeminuevosIcons';

export function SeminuevosFaq({ data }: { data?: FaqData | null }) {
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());

  const items = data?.items ?? [];
  if (items.length === 0) return null;

  const toggle = (id: string) => {
    setAbiertas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="faq" className="px-[22px] py-12" style={{ background: '#fff' }}>
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-extrabold text-center" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>
          {data?.title || faq.title}
        </h2>

        {data?.subtitle && (
          <p className="mt-3 text-center" style={{ color: '#5b5c6b', fontSize: '15px' }}>
            {data.subtitle}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-2.5">
          {items.map((item) => {
            const open = abiertas.has(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-[16px] overflow-hidden"
                style={{ boxShadow: 'var(--sombra)', border: '1px solid #f0f1f4' }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between gap-3 text-left p-4"
                >
                  <span className="font-semibold text-[15px]">{item.question}</span>
                  <IconChevron
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* grid-template-rows en vez de max-height fijo: el max-height del
                    prototipo corta las respuestas largas, y las de BD son de largo libre. */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-[14px]" style={{ color: '#5b5c6b', lineHeight: 1.6 }}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
