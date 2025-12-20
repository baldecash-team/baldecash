'use client';

/**
 * HeroBannerV3 - Ilustracion Flat (Corporativo Moderno)
 *
 * Concepto: Vectores estilizados, estilo Notion/Linear
 * Layout: Texto izquierda + Ilustracion derecha
 * Referencia: Notion, Linear, Stripe
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Check, ArrowRight, Laptop, GraduationCap, Wallet } from 'lucide-react';
import { HeroBannerProps } from '../../../types/hero';
import { UnderlinedText } from '../common/UnderlinedText';

export const HeroBannerV3: React.FC<HeroBannerProps> = ({
  headline,
  subheadline,
  minQuota,
  primaryCta,
  underlineStyle = 1,
}) => {
  const benefits = [
    { icon: Wallet, text: 'Sin historial crediticio' },
    { icon: GraduationCap, text: 'Exclusivo para estudiantes' },
    { icon: Laptop, text: 'Laptops de calidad' },
  ];

  return (
    <section className="bg-[#EEF2FF] min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center py-16 md:py-24">
          {/* Left: Content */}
          <div className="space-y-6">
            {/* Badge */}
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD] px-3 py-1 h-auto',
                content: 'text-white text-xs font-medium',
              }}
            >
              Nuevo en Perú
            </Chip>

            {/* Headline */}
            <h1 className="font-['Baloo_2'] text-4xl md:text-5xl font-bold text-[#4654CD] leading-tight">
              Financiamiento{' '}
              <UnderlinedText style={underlineStyle} color="primary">
                estudiantil
              </UnderlinedText>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-neutral-600 max-w-md">
              Tu primera laptop sin necesidad de historial bancario. Aprobación en 24 horas.
            </p>

            {/* Benefits List */}
            <ul className="space-y-3 pt-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#03DBD0]/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-[#03DBD0]" />
                  </div>
                  <span className="text-neutral-700 font-medium">{benefit.text}</span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-neutral-500">Cuotas desde</span>
              <span className="text-3xl font-bold text-[#4654CD]">S/{minQuota}</span>
              <span className="text-neutral-500">/mes</span>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                radius="lg"
                className="bg-[#4654CD] text-white font-semibold px-8 cursor-pointer hover:bg-[#3a47b3] transition-colors"
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                {primaryCta?.text || 'Ver laptops'}
              </Button>
              <Button
                size="lg"
                radius="lg"
                variant="light"
                className="text-[#4654CD] font-medium cursor-pointer"
              >
                Conocer requisitos
              </Button>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="relative flex items-center justify-center">
            {/* Abstract shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#4654CD]/10" />
            <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-[#03DBD0]/20" />
            <div className="absolute top-20 left-0 w-16 h-16 rounded-full bg-[#4654CD]/5" />

            {/* Main illustration container */}
            <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full">
              {/* Laptop icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#4654CD]/10 flex items-center justify-center">
                <Laptop className="w-10 h-10 text-[#4654CD]" />
              </div>

              {/* Title */}
              <h3 className="text-center text-xl font-bold text-neutral-800 mb-2">
                Empieza ahora
              </h3>
              <p className="text-center text-neutral-500 text-sm mb-6">
                Proceso 100% digital
              </p>

              {/* Steps */}
              <div className="space-y-3">
                {['Elige tu laptop', 'Solicita online', 'Recibe en casa'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50">
                    <div className="w-6 h-6 rounded-full bg-[#4654CD] text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-neutral-700 text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBannerV3;
