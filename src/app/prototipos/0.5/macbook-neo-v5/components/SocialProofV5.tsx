'use client';

import { testimonials } from '../data/v5Data';
import { BC } from '../lib/constants';
import { RevealOnScroll } from '../../macbook-neo-v3/shared/components/RevealOnScroll';
import { StaggeredFadeIn } from '../../macbook-neo-v3/shared/components/StaggeredFadeIn';

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

export default function SocialProofV5() {
  return (
    <section id="social-proof" className="bg-[#f5f5f7] text-[#1d1d1f] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <p className="text-[#6e6e73] text-sm font-semibold mb-2 uppercase tracking-wider">
              Testimonios
            </p>
            <h2
              className="text-[40px] sm:text-[56px] md:text-[64px] font-semibold tracking-[-0.009em] leading-[1.06]"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Estudiantes como tú ya tienen su MacBook Neo
            </h2>
          </div>
        </RevealOnScroll>

        <StaggeredFadeIn>
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => {
              const initials = getInitials(t.nombre);
              const fullUni = UNIVERSIDAD_FULL[t.universidad] || t.universidad;
              return (
                <div
                  key={t.id}
                  className="rounded-2xl p-8 relative overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Large typographic quote mark */}
                  <span
                    className="block leading-none select-none"
                    style={{
                      fontSize: 64,
                      fontFamily: 'Georgia, serif',
                      color: BC.primary,
                      opacity: 0.3,
                      marginTop: -8,
                      marginBottom: -20,
                    }}
                  >
                    &ldquo;
                  </span>

                  {/* Quote */}
                  <p className="text-[15px] md:text-[16px] leading-[1.6] text-[#1d1d1f] mb-8 flex-1">
                    {t.quote}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    {/* Avatar circle with initials */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white"
                      style={{ backgroundColor: BC.primary }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f] m-0">{t.nombre}</p>
                      <p className="text-xs text-[#6e6e73] m-0">{fullUni}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </StaggeredFadeIn>
      </div>
    </section>
  );
}
