'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { financingPlans } from '../data/v4Data';
import { COLORS } from '../lib/constants';
import { useReducedMotion } from '../../macbook-neo-v3/shared/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface FinancingStickyCTAProps {
  tier: string;
}

export function FinancingStickyCTA({ tier }: FinancingStickyCTAProps) {
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

    // Set initial states
    gsap.set(price, { opacity: 0, y: 40 });
    gsap.set(cards.children, { opacity: 0, y: 40 });
    gsap.set(cta, { opacity: 0, y: 20 });

    const ctx = gsap.context(() => {
      // Price fade in: 0-25%
      gsap.to(price, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: '25% bottom',
          scrub: true,
        },
      });

      // Plan cards stagger: 20-50%
      gsap.to(cards.children, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: '20% bottom',
          end: '50% bottom',
          scrub: true,
        },
      });

      // CTA fade in: 40-60%
      gsap.to(cta, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: '40% bottom',
          end: '60% bottom',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [isEnhanced]);

  const useStaticLayout = tier === 'base' || reducedMotion;

  return (
    <section id="financing" style={{ backgroundColor: '#000' }}>
      <div
        ref={containerRef}
        style={{ height: useStaticLayout ? 'auto' : '200vh' }}
      >
        <div
          className={`flex items-center justify-center ${
            useStaticLayout ? 'py-24' : 'sticky top-0 h-screen'
          }`}
        >
          <div className="max-w-[980px] w-full mx-auto px-4 text-center">
            {/* Price */}
            <div ref={priceRef}>
              <p className="text-lg" style={{ color: COLORS.textTertiary }}>
                Desde
              </p>
              <p
                className="font-bold"
                style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
              >
                <span style={{ color: '#f5f5f7' }}>S/</span>
                <span style={{ color: COLORS.bcPrimary }}>159</span>
                <span style={{ color: '#f5f5f7' }}>/mes</span>
              </p>
              <p className="text-lg mt-2" style={{ color: COLORS.textTertiary }}>
                Tu MacBook Neo financiada. Sin historial crediticio.
              </p>
            </div>

            {/* Plan cards */}
            <div
              ref={cardsRef}
              className="flex flex-col md:flex-row gap-4 mt-12 justify-center"
            >
              {financingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl p-6 flex-1 max-w-[300px] mx-auto md:mx-0"
                  style={{
                    backgroundColor: '#1c1c1e',
                    border: plan.destacado
                      ? `2px solid ${COLORS.bcPrimary}`
                      : '2px solid transparent',
                  }}
                >
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: '#f5f5f7' }}
                  >
                    {plan.nombre}
                  </p>
                  <p className="font-bold" style={{ color: '#f5f5f7' }}>
                    <span className="text-3xl">S/{plan.cuotaMensual}</span>
                    <span className="text-sm">/mes</span>
                  </p>
                  <p className="text-sm mt-2" style={{ color: COLORS.textTertiary }}>
                    {plan.plazoMeses} meses
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div ref={ctaRef}>
              <button
                className="rounded-full px-8 py-3 text-white font-medium mt-8 transition-colors"
                style={{ backgroundColor: COLORS.bcPrimary }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    COLORS.bcPrimaryHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    COLORS.bcPrimary;
                }}
              >
                Solicitar financiamiento
              </button>
              <p className="mt-3">
                <a
                  href="#"
                  className="text-sm"
                  style={{ color: COLORS.linkDark }}
                >
                  Ver plan de cuotas
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
