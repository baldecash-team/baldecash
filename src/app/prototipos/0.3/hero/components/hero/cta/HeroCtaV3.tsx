'use client';

/**
 * HeroCtaV3 - Pre-calificacion sin compromiso
 *
 * CTA Principal: "Descubre tu monto disponible"
 * CTA Secundario: "Hablar con un asesor"
 * Enfoque: Baja friccion, sin compromiso
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Calculator, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroCtaProps } from '../../../types/hero';

export const HeroCtaV3: React.FC<HeroCtaProps> = ({
  primaryCta = {
    text: 'Descubre tu monto disponible',
    href: '/prototipos/0.3/precalificacion',
    icon: 'Calculator',
    variant: 'primary',
  },
  secondaryCta = {
    text: 'Hablar con un asesor',
    href: '#asesor',
    icon: 'MessageCircle',
    variant: 'outline',
  },
  minQuota = 49,
  showSecurityBadge = true,
}) => {
  const benefits = [
    'Sin compromiso',
    'Respuesta inmediata',
    'No afecta tu historial',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Main CTA card */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 max-w-md">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-[#4654CD]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calculator className="w-6 h-6 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">
              Calcula tu capacidad de pago
            </h3>
            <p className="text-sm text-neutral-500">
              Descubre cuanto puedes financiar en 30 segundos
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-3 mb-6">
          {benefits.map((benefit) => (
            <span
              key={benefit}
              className="flex items-center gap-1 text-xs text-neutral-600 bg-neutral-50 px-3 py-1 rounded-full"
            >
              <CheckCircle className="w-3 h-3 text-[#22c55e]" />
              {benefit}
            </span>
          ))}
        </div>

        {/* Primary CTA */}
        <Button
          as="a"
          href={primaryCta.href}
          size="lg"
          className="w-full bg-[#4654CD] text-white font-semibold"
          endContent={<ArrowRight className="w-5 h-5" />}
        >
          {primaryCta.text}
        </Button>

        {/* Price hint */}
        <p className="text-center text-sm text-neutral-500 mt-4">
          Cuotas desde <span className="font-semibold text-[#4654CD]">S/{minQuota}/mes</span>
        </p>
      </div>

      {/* Secondary CTA */}
      {secondaryCta && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Tienes dudas?</span>
          <Button
            as="a"
            href={secondaryCta.href}
            variant="light"
            size="sm"
            className="text-[#4654CD] font-medium p-0 min-w-0 h-auto"
            startContent={<MessageCircle className="w-4 h-4" />}
          >
            {secondaryCta.text}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default HeroCtaV3;
