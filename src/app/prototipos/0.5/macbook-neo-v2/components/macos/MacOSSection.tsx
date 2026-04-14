'use client';

import { SectionHeader } from '../shared/SectionHeader';
import { RevealOnScroll } from '../shared/RevealOnScroll';
import { Monitor, Sparkles, Shield, Zap, Globe, MessageSquare } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Apple Intelligence', desc: 'IA integrada para ayudarte a escribir, resumir y crear.' },
  { icon: Monitor, title: 'Stage Manager', desc: 'Organiza tus ventanas automáticamente para mayor productividad.' },
  { icon: Zap, title: 'Spotlight', desc: 'Busca todo en tu Mac al instante, incluyendo archivos e imágenes.' },
  { icon: Globe, title: 'Safari', desc: 'El navegador más rápido del mundo con protección de privacidad.' },
  { icon: MessageSquare, title: 'iMessage', desc: 'Mensajes sin interrupciones entre tu Mac, iPhone y iPad.' },
  { icon: Shield, title: 'FileVault', desc: 'Encriptación de disco completa para proteger tus datos.' },
];

export function MacOSSection() {
  return (
    <section className="bg-[#fbfbfd] py-20 lg:py-28">
      <div className="max-w-[980px] mx-auto px-4">
        <RevealOnScroll>
          <div>
            <SectionHeader
              eyebrow="macOS"
              title="Hecho para el Mac."
              description="macOS trabaja en armonía con el hardware para ofrecer una experiencia intuitiva y potente."
            />
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12" stagger={0.08}>
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.06)]"
            >
              <f.icon className="w-8 h-8 text-[#0066CC] mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-[#1d1d1f]">{f.title}</h3>
              <p className="text-[#6e6e73] text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
