'use client';

/**
 * HeroCtaV1 - Accion directa al catalogo
 *
 * CTA Principal: "Ver laptops disponibles"
 * CTA Secundario: "Conocer requisitos"
 * Enfoque: Explorar productos primero
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Monitor, FileText, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroCtaProps } from '../../../types/hero';

export const HeroCtaV1: React.FC<HeroCtaProps> = ({
  primaryCta = {
    text: 'Ver laptops disponibles',
    href: '/prototipos/0.3/catalogo',
    icon: 'Monitor',
    variant: 'primary',
  },
  secondaryCta = {
    text: 'Conocer requisitos',
    href: '#requisitos',
    icon: 'FileText',
    variant: 'outline',
  },
  minQuota = 49,
  showSecurityBadge = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col items-center gap-4 sm:items-start"
    >
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button
          as="a"
          href={primaryCta.href}
          size="lg"
          className="bg-[#4654CD] text-white font-semibold px-8 min-w-[200px]"
          endContent={<Monitor className="w-5 h-5" />}
        >
          {primaryCta.text}
        </Button>

        {secondaryCta && (
          <Button
            as="a"
            href={secondaryCta.href}
            size="lg"
            variant="bordered"
            className="border-[#4654CD] text-[#4654CD] font-semibold px-8"
            endContent={<FileText className="w-5 h-5" />}
          >
            {secondaryCta.text}
          </Button>
        )}
      </div>

      {/* Security badge */}
      {showSecurityBadge && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Lock className="w-4 h-4 text-[#22c55e]" />
          <span>Conexion segura</span>
          <span className="text-neutral-300">|</span>
          <span>Desde S/{minQuota}/mes</span>
        </div>
      )}
    </motion.div>
  );
};

export default HeroCtaV1;
