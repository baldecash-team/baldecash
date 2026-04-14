'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedCounter } from '../shared/AnimatedCounter';
import { financingPlans } from '../../data/mockMacbookNeoData';

gsap.registerPlugin(ScrollTrigger);

export function FinancingCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.cta-element', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  const planDestacado = financingPlans.find((p) => p.destacado) || financingPlans[1];

  return (
    <section
      id="financing"
      ref={sectionRef}
      className="bg-black py-20 lg:py-32"
    >
      <div className="max-w-[980px] mx-auto px-4 text-center">
        {/* Price headline */}
        <p className="cta-element text-[clamp(3rem,8vw,5.5rem)] font-bold text-[#f5f5f7] leading-tight">
          Desde{' '}
          <span className="text-[#4247d2]">
            S/<AnimatedCounter end={planDestacado.cuotaMensual} />
          </span>
          /mes
        </p>
        <p className="cta-element text-[#86868b] mt-3 text-lg">
          Tu MacBook Neo financiada. Sin historial crediticio.
        </p>

        {/* CTA buttons */}
        <div className="cta-element flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <a
            href="#"
            className="bg-[#4247d2] text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-[#363bc2] transition-colors"
          >
            Solicitar financiamiento
          </a>
          <a
            href="#"
            className="text-[#2997FF] font-semibold text-base hover:underline"
          >
            Ver plan de cuotas ›
          </a>
        </div>

        {/* Financing plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          {financingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`cta-element rounded-2xl p-6 text-left transition-all ${
                plan.destacado
                  ? 'bg-[#4247d2] ring-2 ring-[#4247d2] ring-offset-2 ring-offset-black'
                  : 'bg-[#1d1d1f]'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  plan.destacado ? 'text-white/70' : 'text-[#86868b]'
                }`}
              >
                {plan.nombre}
              </p>
              <p className="text-white text-3xl font-bold mt-2">
                S/{plan.cuotaMensual}
                <span className="text-lg font-normal text-white/60">/mes</span>
              </p>
              <p
                className={`text-sm mt-2 ${
                  plan.destacado ? 'text-white/70' : 'text-[#86868b]'
                }`}
              >
                {plan.plazoMeses} meses · Total S/{plan.precioTotal.toLocaleString()}
              </p>
              {plan.destacado && (
                <span className="inline-block mt-3 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <p className="cta-element text-[#86868b] text-sm mt-10">
          Apple Partner Oficial · Envío a todo el Perú · Garantía Apple incluida
        </p>
      </div>
    </section>
  );
}
