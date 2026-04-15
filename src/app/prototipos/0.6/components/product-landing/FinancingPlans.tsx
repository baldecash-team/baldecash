'use client';

import { useEffect, useRef } from 'react';
import { Clock, Truck, Shield, Check, ArrowRight } from 'lucide-react';
import { financingPlans } from './data/v5Data';
import { BC } from './lib/constants';
import { useReducedMotion } from './shared/hooks/useReducedMotion';

interface FinancingPlansV5Props {
  tier: string;
  landing?: string;
}

export default function FinancingPlans({ tier, landing = 'baldecash-mac-book-neo' }: FinancingPlansV5Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const isEnhanced = tier === 'enhanced' && !reducedMotion;

  useEffect(() => {
    if (!isEnhanced) return;

    const container = containerRef.current;
    const price = priceRef.current;
    const cards = cardsRef.current;
    const cta = ctaRef.current;
    if (!container || !price || !cards || !cta) return;

    let ctx: ReturnType<typeof import('gsap')['gsap']['context']> | null = null;

    async function init() {
      const [gsapMod, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      const { gsap } = gsapMod;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(price, { opacity: 0, y: 40 });
      gsap.set(cards!.children, { opacity: 0, y: 40 });
      gsap.set(cta, { opacity: 0, y: 20 });

      ctx = gsap.context(() => {
        gsap.to(price, {
          opacity: 1, y: 0, ease: 'power2.out',
          scrollTrigger: { trigger: container, start: 'top bottom', end: '25% bottom', scrub: true },
        });
        gsap.to(cards!.children, {
          opacity: 1, y: 0, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: container, start: '20% bottom', end: '50% bottom', scrub: true },
        });
        gsap.to(cta, {
          opacity: 1, y: 0, ease: 'power2.out',
          scrollTrigger: { trigger: container, start: '40% bottom', end: '60% bottom', scrub: true },
        });
      });
    }

    init();
    return () => { ctx?.revert(); };
  }, [isEnhanced]);

  const useStaticLayout = tier === 'base' || reducedMotion;

  const handleScrollToFinancing = () => {
    const el = document.getElementById('financing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="financing" className="bg-black">
      <div ref={containerRef} style={{ height: useStaticLayout ? 'auto' : '150vh' }}>
        <div
          className={`flex items-center justify-center ${
            useStaticLayout ? 'py-24' : 'sticky top-0 h-screen'
          }`}
        >
          <div className="max-w-[1040px] w-full mx-auto px-5 sm:px-6 md:px-4 text-center">
            {/* Price headline */}
            <div ref={priceRef}>
              <p className="text-lg text-[#a1a1a6] m-0">Desde</p>
              <p
                className="font-bold m-0 mt-1"
                style={{
                  fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                  fontFamily: "'Baloo 2', cursive",
                  lineHeight: 1.05,
                }}
              >
                <span className="text-[#f5f5f7]">S/</span>
                <span style={{ color: BC.primary }}>199</span>
                <span className="text-[#f5f5f7]">/mes</span>
              </p>
              <p className="text-lg mt-3 text-[#a1a1a6] m-0">
                Sin historial crediticio. Sin tarjeta de crédito.
              </p>
            </div>

            {/* Plan cards */}
            <div ref={cardsRef} className="flex flex-col md:flex-row gap-4 mt-10 sm:mt-14 justify-center">
              {financingPlans.map((plan) => (
                <a
                  key={plan.id}
                  href={`/prototipos/0.6/${landing}/solicitar?plan=${plan.id}`}
                  className="rounded-2xl flex-1 w-full md:max-w-[340px] md:mx-0 relative overflow-hidden block no-underline group active:scale-[0.98]"
                  style={{
                    backgroundColor: '#161617',
                    border: plan.destacado
                      ? `2px solid ${BC.primary}`
                      : '2px solid transparent',
                    transform: plan.destacado ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: plan.destacado
                      ? `0 0 40px rgba(70, 84, 205, 0.15), 0 0 80px rgba(70, 84, 205, 0.06)`
                      : 'none',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.destacado) {
                      e.currentTarget.style.borderColor = BC.primary;
                      e.currentTarget.style.boxShadow = `0 0 40px rgba(70, 84, 205, 0.15), 0 0 80px rgba(70, 84, 205, 0.06)`;
                      e.currentTarget.style.transform = 'scale(1.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.destacado) {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {/* Popular badge */}
                  {plan.destacado && (
                    <div
                      className="text-xs font-semibold text-white text-center py-1.5"
                      style={{ backgroundColor: BC.primary }}
                    >
                      Más popular
                    </div>
                  )}

                  <div className="p-5 sm:p-7">
                    <p className="text-sm font-medium text-[#a1a1a6] m-0 uppercase tracking-wider">
                      {plan.nombre}
                    </p>

                    <p className="font-bold text-[#f5f5f7] m-0 mt-3">
                      <span className="text-3xl sm:text-4xl" style={{ fontFamily: "'Baloo 2', cursive" }}>
                        S/{plan.cuotaMensual}
                      </span>
                      <span className="text-base text-[#a1a1a6] ml-1">/mes</span>
                    </p>

                    <p className="text-sm mt-1 text-[#6e6e73] m-0">
                      {plan.plazoMeses} meses &middot; {plan.descripcion}
                    </p>

                    {/* Benefits checklist */}
                    <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2.5 text-sm text-[#a1a1a6]">
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: BC.secondary }} />
                        <span>Cuota inicial S/0</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-[#a1a1a6] mt-2.5">
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: BC.secondary }} />
                        <span>Aprobación en 24 horas</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-[#a1a1a6] mt-2.5">
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: BC.secondary }} />
                        <span>Envío gratis a todo el Perú</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-10">
              <div className="flex items-center gap-2 text-sm text-[#86868b]">
                <Clock className="w-4 h-4" style={{ color: BC.secondary }} />
                Aprobación en 24h
              </div>
              <div className="flex items-center gap-2 text-sm text-[#86868b]">
                <Truck className="w-4 h-4" style={{ color: BC.secondary }} />
                Envío gratis
              </div>
              <div className="flex items-center gap-2 text-sm text-[#86868b]">
                <Shield className="w-4 h-4" style={{ color: BC.secondary }} />
                Garantía 12 meses
              </div>
            </div>

            {/* CTA */}
            <div ref={ctaRef} className="mt-10">
              <a
                href={`/prototipos/0.6/${landing}/solicitar`}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white hover:opacity-90 transition-all no-underline cursor-pointer rounded-lg shadow-sm active:scale-[0.97]"
                style={{ backgroundColor: BC.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BC.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BC.primary)}
              >
                Solicitar ahora
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
