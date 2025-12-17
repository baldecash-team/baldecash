'use client';

/**
 * HeroCtaV2 - Enfoque en precio
 *
 * CTA Principal: "Desde S/49/mes - Solicitar ahora"
 * CTA Secundario: "Como funciona?"
 * Enfoque: Precio como gancho principal
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { CreditCard, HelpCircle, Shield, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroCtaProps } from '../../../types/hero';

export const HeroCtaV2: React.FC<HeroCtaProps> = ({
  primaryCta = {
    text: 'Solicitar ahora',
    href: '/prototipos/0.3/solicitud',
    icon: 'CreditCard',
    variant: 'primary',
  },
  secondaryCta = {
    text: 'Como funciona?',
    href: '#como-funciona',
    icon: 'HelpCircle',
    variant: 'outline',
  },
  minQuota = 49,
  showSecurityBadge = true,
}) => {
  const trustBadges = [
    { icon: Shield, text: 'Registrados en SBS' },
    { icon: Clock, text: 'Aprobacion 24h' },
    { icon: Users, text: '+10,000 estudiantes' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Price highlight + CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Price badge */}
        <div className="bg-[#4654CD] text-white px-6 py-3 rounded-xl">
          <p className="text-sm opacity-80">Cuotas desde</p>
          <p className="text-3xl font-bold">
            S/{minQuota}
            <span className="text-lg font-normal">/mes</span>
          </p>
        </div>

        {/* Primary CTA */}
        <Button
          as="a"
          href={primaryCta.href}
          size="lg"
          className="bg-[#03DBD0] text-neutral-900 font-semibold px-8 hover:bg-[#02C3BA]"
          endContent={<CreditCard className="w-5 h-5" />}
        >
          {primaryCta.text}
        </Button>
      </div>

      {/* Secondary CTA */}
      {secondaryCta && (
        <Button
          as="a"
          href={secondaryCta.href}
          variant="light"
          className="text-[#4654CD] font-medium self-start"
          startContent={<HelpCircle className="w-4 h-4" />}
        >
          {secondaryCta.text}
        </Button>
      )}

      {/* Trust badges */}
      {showSecurityBadge && (
        <div className="flex flex-wrap gap-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 text-sm text-neutral-600"
            >
              <badge.icon className="w-4 h-4 text-[#22c55e]" />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HeroCtaV2;
