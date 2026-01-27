'use client';

/**
 * HomeCta v0.6 - CTA con WhatsApp
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';

interface HomeCtaProps {
  primaryColor?: string;
  catalogUrl?: string;
}

export const HomeCta: React.FC<HomeCtaProps> = ({
  primaryColor = '#4654CD',
  catalogUrl = '#catalogo',
}) => {
  const whatsappMessage = encodeURIComponent(
    'Hola, soy estudiante universitario y me interesa financiar una laptop. ¿Me pueden ayudar?'
  );
  const whatsappUrl = `https://wa.me/51999999999?text=${whatsappMessage}`;

  return (
    <section
      className="py-16"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']">
              ¿Tienes dudas? Hablemos
            </h2>
            <p className="text-lg text-white/80 mb-6">
              Nuestro equipo de asesores está listo para ayudarte a elegir el mejor equipo
              y explicarte cómo funciona el financiamiento.
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-xs font-medium">A{i}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-white/90">Asesores en línea</p>
                <p className="text-xs text-white/60">Respuesta promedio: 5 min</p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                size="lg"
                className="bg-[#25D366] text-white font-bold rounded-xl cursor-pointer hover:bg-[#20BD5A] transition-colors"
                startContent={<MessageCircle className="w-5 h-5" />}
              >
                Escribir por WhatsApp
              </Button>
            </a>

            <p className="text-white/60 text-sm mt-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              También puedes llamar: (01) 123-4567
            </p>
          </div>

          {/* Right: Quick links */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8">
            <h3 className="text-white font-semibold mb-4">También puedes:</h3>

            <div className="space-y-3">
              <a
                href={catalogUrl}
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-white">Ver equipos disponibles</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </a>

              <a
                href="#faq"
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-white">Ver preguntas frecuentes</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </a>

              <a
                href="#beneficios"
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <span className="text-white">Conocer nuestros beneficios</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20 text-center">
              <p className="text-white/60 text-sm mb-1">Cuotas desde</p>
              <p className="text-3xl font-bold text-white font-['Baloo_2']">
                S/99/mes
              </p>
              <p className="text-white/60 text-xs mt-1">
                TEA preferencial para estudiantes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCta;
