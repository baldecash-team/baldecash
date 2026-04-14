'use client';

import { SectionHeader } from '../shared/SectionHeader';
import { RevealOnScroll } from '../shared/RevealOnScroll';
import { Lock, Fingerprint, Eye, ShieldCheck } from 'lucide-react';

const features = [
  { icon: Lock, title: 'Secure Enclave', desc: 'Tu información biométrica nunca sale del chip.' },
  { icon: Fingerprint, title: 'Touch ID', desc: 'Desbloquea tu Mac y aprueba compras con tu huella.' },
  { icon: Eye, title: 'Prevención de rastreo', desc: 'Safari bloquea rastreadores automáticamente.' },
  { icon: ShieldCheck, title: 'Gatekeeper', desc: 'Solo se ejecutan apps verificadas y confiables.' },
];

export function PrivacySection() {
  return (
    <section className="bg-[#fbfbfd] py-20 lg:py-28">
      <div className="max-w-[980px] mx-auto px-4">
        <RevealOnScroll>
          <div>
            <SectionHeader
              eyebrow="Privacidad y seguridad"
              title="Tu privacidad. Nuestra prioridad."
              description="Cada MacBook Neo incluye funciones avanzadas de seguridad para proteger tu información."
            />
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12" stagger={0.1}>
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.06)] flex items-start gap-5"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center">
                <f.icon className="w-6 h-6 text-[#1d1d1f]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f]">{f.title}</h3>
                <p className="text-[#6e6e73] text-sm mt-1 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
