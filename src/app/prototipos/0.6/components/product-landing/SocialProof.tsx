'use client';

import { useEffect, useRef } from 'react';
import { testimonials } from './data/v5Data';
import { BC } from './lib/constants';
import { RevealOnScroll } from './shared/components/RevealOnScroll';

const UNIVERSIDAD_FULL: Record<string, string> = {
  UPC: 'Universidad Peruana de Ciencias Aplicadas',
  UPN: 'Universidad Privada del Norte',
  PUCP: 'Pontificia Universidad Católica del Perú',
  UNI: 'Universidad Nacional de Ingeniería',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((w) => w.length > 1 && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

export default function SocialProof() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | null = null;

    async function init() {
      const [gsapMod, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      const { gsap } = gsapMod;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);

      const cards = grid!.querySelectorAll('[data-testimonial]');
      const isMobile = window.innerWidth < 768;

      gsap.set(cards, { opacity: 0, y: isMobile ? 30 : 40, scale: 0.92 });

      ctx = gsap.context(() => {
        const refreshFallback = (self: ScrollTrigger, elements: Element | Element[] | NodeListOf<Element> | HTMLCollection, props: Record<string, unknown>) => {
          if (self.progress > 0) gsap.set(elements, props);
        };

        if (isMobile) {
          // Mobile: each card triggers individually when it enters viewport
          cards.forEach((card) => {
            const avatar = card.querySelector('[data-avatar]');
            const quote = card.querySelector('[data-quote-mark]');
            if (avatar) gsap.set(avatar, { scale: 0 });
            if (quote) gsap.set(quote, { opacity: 0, y: -10 });

            gsap.to(card, {
              opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none',
                onRefresh: (self) => refreshFallback(self, card, { opacity: 1, y: 0, scale: 1 }) },
            });
            if (avatar) {
              gsap.to(avatar, {
                scale: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.3,
                scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none',
                  onRefresh: (self) => refreshFallback(self, avatar, { scale: 1 }) },
              });
            }
            if (quote) {
              gsap.to(quote, {
                opacity: 0.3, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.2,
                scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none',
                  onRefresh: (self) => refreshFallback(self, quote, { opacity: 0.3, y: 0 }) },
              });
            }
          });
        } else {
          // Desktop: stagger all cards from grid trigger
          const avatars = grid!.querySelectorAll('[data-avatar]');
          const quotes = grid!.querySelectorAll('[data-quote-mark]');
          gsap.set(avatars, { scale: 0 });
          gsap.set(quotes, { opacity: 0, y: -10 });

          gsap.to(cards, {
            opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power2.out',
            scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none none',
              onRefresh: (self) => refreshFallback(self, cards, { opacity: 1, y: 0, scale: 1 }) },
          });
          gsap.to(avatars, {
            scale: 1, duration: 0.4, stagger: 0.15, ease: 'back.out(1.7)', delay: 0.5,
            scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none none',
              onRefresh: (self) => refreshFallback(self, avatars, { scale: 1 }) },
          });
          gsap.to(quotes, {
            opacity: 0.3, y: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out', delay: 0.3,
            scrollTrigger: { trigger: grid, start: 'top 80%', toggleActions: 'play none none none',
              onRefresh: (self) => refreshFallback(self, quotes, { opacity: 0.3, y: 0 }) },
          });
        }
      });
    }

    init();
    return () => { ctx?.revert(); };
  }, []);

  return (
    <section id="social-proof" className="bg-[#f5f5f7] text-[#1d1d1f] py-16 sm:py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[#6e6e73] text-xs font-semibold mb-2 uppercase tracking-wider">
              Testimonios
            </p>
            <h2
              className="text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] font-semibold tracking-[-0.015em] leading-[1.05]"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Estudiantes como tú ya tienen su MacBook Neo
            </h2>
          </div>
        </RevealOnScroll>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t) => {
            const initials = getInitials(t.nombre);
            const fullUni = UNIVERSIDAD_FULL[t.universidad] || t.universidad;
            return (
              <div
                key={t.id}
                data-testimonial
                className="rounded-2xl p-5 sm:p-8 relative overflow-hidden flex flex-col cursor-default"
                style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid transparent',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = BC.primary;
                  e.currentTarget.style.boxShadow = `0 0 30px rgba(70, 84, 205, 0.12), 0 0 60px rgba(70, 84, 205, 0.05)`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Large typographic quote mark */}
                <span
                  data-quote-mark
                  className="block leading-none select-none"
                  style={{
                    fontSize: 'clamp(34px, 8.5vw, 54px)',
                    fontFamily: 'Georgia, serif',
                    color: BC.primary,
                    opacity: 0,
                    marginTop: -8,
                    marginBottom: -20,
                    transition: 'color 0.3s ease',
                  }}
                >
                  &ldquo;
                </span>

                {/* Quote */}
                <p className="text-[13px] md:text-[14px] leading-[1.6] text-[#1d1d1f] mb-8 flex-1">
                  {t.quote}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* Avatar circle with initials */}
                  <div
                    data-avatar
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
                    style={{ backgroundColor: BC.primary }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1d1d1f] m-0">{t.nombre}</p>
                    <p className="text-[10px] text-[#6e6e73] m-0">{fullUni}</p>
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
