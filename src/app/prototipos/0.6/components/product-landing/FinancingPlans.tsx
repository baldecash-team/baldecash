'use client';

import { useEffect, useRef } from 'react';
import { Check, ArrowRight, Zap, Star, Crown, type LucideIcon } from 'lucide-react';
import { financingPlans } from './data/v5Data';
import { BC } from './lib/constants';
import { useReducedMotion } from './shared/hooks/useReducedMotion';

interface FinancingPlansV5Props {
  tier: string;
}

const ICON_MAP: Record<string, LucideIcon> = { Zap, Star, Crown };

export default function FinancingPlans({ tier }: FinancingPlansV5Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const isEnhanced = tier === 'enhanced' && !reducedMotion;

  useEffect(() => {
    if (!isEnhanced) return;

    const header = headerRef.current;
    const cards = cardsRef.current;
    if (!header || !cards) return;

    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | null = null;

    async function init() {
      const [gsapMod, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      const { gsap } = gsapMod;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(header, { opacity: 0, y: 30 });
      gsap.set(cards!.children, { opacity: 0, y: 40 });

      ctx = gsap.context(() => {
        gsap.to(header, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' },
        });
        gsap.to(cards!.children, {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: cards, start: 'top 80%', toggleActions: 'play none none none' },
        });
      });
    }

    init();
    return () => { ctx?.revert(); };
  }, [isEnhanced]);

  return (
    <section id="financing" ref={sectionRef} className="bg-black py-20 sm:py-28">
      <div className="max-w-[1100px] w-full mx-auto px-5 sm:px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12 sm:mb-16">
          <p className="text-[#86868b] text-xs font-semibold mb-2 uppercase tracking-wider">
            Planes y precios
          </p>
          <h2
            className="text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] font-semibold tracking-[-0.015em] leading-[1.05] text-[#f5f5f7] mb-4"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Tu MacBook, a tu ritmo
          </h2>
          <p className="text-[13px] sm:text-[15px] text-[#86868b] max-w-[540px] mx-auto leading-[1.5]">
            Desde <span className="text-[#f5f5f7] font-semibold">S/199/mes</span>. Sin inicial. Sin tarjeta de crédito.
          </p>
        </div>

        {/* Plan cards */}
        <div ref={cardsRef} className="flex flex-col md:flex-row gap-5 md:gap-4 items-stretch justify-center">
          {financingPlans.map((plan) => {
            const Icon = ICON_MAP[plan.icono] || Zap;
            const accent = plan.colorAccent;
            const isDestacado = plan.destacado;
            const isPremium = plan.id === 'premium';

            return (
              <div
                key={plan.id}
                className="rounded-2xl flex-1 w-full md:max-w-[360px] relative flex flex-col overflow-visible"
                style={{
                  backgroundColor: '#161617',
                  border: `2px solid ${isDestacado ? accent : 'rgba(255,255,255,0.06)'}`,
                  transform: isDestacado ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: isDestacado
                    ? `0 0 40px ${accent}26, 0 0 80px ${accent}14`
                    : 'none',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
                }}
              >
                {/* Popular badge */}
                {isDestacado && (
                  <div
                    className="absolute text-[10px] font-semibold text-white uppercase tracking-wider px-3 py-1 rounded-full z-10"
                    style={{
                      backgroundColor: accent,
                      top: 12,
                      right: 12,
                      boxShadow: `0 0 20px ${accent}66`,
                    }}
                  >
                    Más elegido
                  </div>
                )}

                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {/* Image */}
                  <div
                    className="w-full rounded-xl mb-5 overflow-hidden flex items-center justify-center"
                    style={{
                      aspectRatio: '16 / 10',
                      backgroundColor: '#000000',
                      border: `1px solid rgba(255,255,255,0.06)`,
                    }}
                  >
                    {plan.imagen ? (
                      <img
                        src={plan.imagen}
                        alt={plan.descripcion}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-[#424245]">
                        Imagen del pack
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${accent}14`,
                        border: `1.5px solid ${accent}`,
                        boxShadow: isPremium ? `0 0 20px ${accent}4D` : undefined,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                  </div>

                  {/* Name */}
                  <p
                    className="text-center text-xl sm:text-2xl font-bold text-[#f5f5f7] m-0"
                    style={{ fontFamily: "'Baloo 2', cursive", letterSpacing: '0.02em' }}
                  >
                    {plan.nombre}
                  </p>

                  {/* Subtitle */}
                  <p className="text-center text-[10px] font-semibold text-[#86868b] uppercase tracking-[0.15em] m-0 mt-1">
                    {plan.subtitulo}
                  </p>

                  {/* Price */}
                  <p className="text-center font-bold m-0 mt-5">
                    <span
                      className="text-4xl sm:text-5xl"
                      style={{
                        fontFamily: "'Baloo 2', cursive",
                        color: accent,
                        textShadow: isPremium ? `0 0 20px ${accent}4D` : undefined,
                      }}
                    >
                      S/{plan.cuotaMensual}
                    </span>
                    <span className="text-sm text-[#86868b] ml-1">/mes</span>
                  </p>

                  {/* Items */}
                  <div className="mt-6 pt-5 flex-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <ul className="space-y-2.5 m-0 p-0 list-none">
                      {plan.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-xs text-[#d1d1d6]">
                          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: accent }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA button */}
                  <a
                    href={plan.productUrl ?? '#'}
                    className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 text-xs font-semibold no-underline rounded-xl transition-all active:scale-[0.97]"
                    style={
                      isDestacado
                        ? {
                            color: '#ffffff',
                            background: `linear-gradient(135deg, ${BC.primary}, #6B4EE6)`,
                            border: 'none',
                          }
                        : isPremium
                        ? {
                            color: '#1a1a1a',
                            background: `linear-gradient(135deg, #B8891C, #E5C870)`,
                            border: 'none',
                          }
                        : {
                            color: accent,
                            backgroundColor: 'transparent',
                            border: `1.5px solid ${accent}66`,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (isDestacado || isPremium) {
                        e.currentTarget.style.filter = 'brightness(1.1)';
                      } else {
                        e.currentTarget.style.backgroundColor = `${accent}14`;
                        e.currentTarget.style.borderColor = accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isDestacado || isPremium) {
                        e.currentTarget.style.filter = 'brightness(1)';
                      } else {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = `${accent}66`;
                      }
                    }}
                  >
                    Lo quiero
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  {/* Savings footer */}
                  {plan.ahorroText && (
                    <div
                      className="mt-3 text-center text-[10px] font-semibold py-2 px-3 rounded-lg"
                      style={{
                        color: accent,
                        backgroundColor: `${accent}14`,
                        border: `1px solid ${accent}33`,
                      }}
                    >
                      {plan.ahorroText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
