'use client';

import { SectionHeader } from '../shared/SectionHeader';
import { RevealOnScroll } from '../shared/RevealOnScroll';
import { Smartphone, Copy, Camera, Wifi, Headphones, Cloud } from 'lucide-react';

const features = [
  { icon: Smartphone, title: 'iPhone Mirroring', desc: 'Usa tu iPhone directamente desde tu Mac.' },
  { icon: Copy, title: 'Portapapeles universal', desc: 'Copia en un dispositivo, pega en otro.' },
  { icon: Camera, title: 'Cámara de continuidad', desc: 'Usa tu iPhone como cámara web HD.' },
  { icon: Wifi, title: 'AirDrop', desc: 'Comparte archivos al instante entre dispositivos Apple.' },
  { icon: Headphones, title: 'AirPods', desc: 'Se conectan automáticamente cuando abres tu Mac.' },
  { icon: Cloud, title: 'iCloud', desc: 'Tus fotos, archivos y contraseñas, en todos tus dispositivos.' },
];

export function ContinuitySection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-[980px] mx-auto px-4">
        <RevealOnScroll>
          <div>
            <SectionHeader
              eyebrow="Continuidad"
              title="Mac + iPhone. Mejor juntos."
              description="Tu MacBook Neo trabaja perfectamente con tu iPhone y el resto del ecosistema Apple."
            />
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12" stagger={0.08}>
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#f5f5f7] rounded-2xl p-6"
            >
              <f.icon className="w-8 h-8 text-[#1d1d1f] mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-[#1d1d1f]">{f.title}</h3>
              <p className="text-[#6e6e73] text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
