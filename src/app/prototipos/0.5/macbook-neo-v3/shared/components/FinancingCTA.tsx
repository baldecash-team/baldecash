'use client';

import { RevealOnScroll } from './RevealOnScroll';
import { heroData } from '../data/macbookNeoData';

export function FinancingCTA() {
  return (
    <section
      id="financing"
      className="py-20 text-center"
      style={{ backgroundColor: '#000' }}
    >
      <div className="mx-auto max-w-[980px] px-4">
        <RevealOnScroll>
          <p
            className="text-[clamp(3rem,8vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.045em]"
            style={{ color: '#f5f5f7' }}
          >
            Desde{' '}
            <span style={{ color: '#4247d2' }}>
              S/{heroData.cuotaDesde}
            </span>
            /mes
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15}>
          <p
            className="mt-4 text-[clamp(1rem,2vw,1.25rem)]"
            style={{ color: '#86868b' }}
          >
            Tu MacBook Neo financiada. Sin historial crediticio.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.3}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#apply"
              className="cursor-pointer rounded-full px-8 py-3 text-[16px] font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: '#4247d2' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#363bc2')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#4247d2')
              }
            >
              Solicitar financiamiento
            </a>
            <a
              href="#plans"
              className="cursor-pointer text-[16px] font-medium transition-opacity hover:opacity-80"
              style={{ color: '#2997FF' }}
            >
              Ver plan de cuotas ›
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
