'use client';

/**
 * HeroCtaV10 - Boton con Confianza
 *
 * Concepto: Iconos de seguridad alrededor
 * Estilo: Trust signals visuales
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Shield, Lock, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';

interface HeroCtaV10Props {
  onCtaClick?: () => void;
}

const trustSignals = [
  { icon: Shield, label: 'SBS regulado' },
  { icon: Lock, label: 'Datos protegidos' },
  { icon: CreditCard, label: 'Sin cargos ocultos' },
];

export const HeroCtaV10: React.FC<HeroCtaV10Props> = ({ onCtaClick }) => {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Trust Signals - Above */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {trustSignals.map((signal) => (
          <div
            key={signal.label}
            className="flex items-center gap-1.5 text-xs text-neutral-500"
          >
            <signal.icon className="w-4 h-4 text-[#03DBD0]" />
            <span>{signal.label}</span>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <Button
        size="lg"
        className="bg-[#4654CD] text-white font-semibold px-12 py-6 text-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onCtaClick}
      >
        Solicitar mi laptop
      </Button>

      {/* Trust Badge */}
      <div className="flex items-center gap-2 bg-[#03DBD0]/10 border border-[#03DBD0]/30 rounded-lg px-4 py-2">
        <CheckCircle className="w-5 h-5 text-[#03DBD0]" />
        <div className="text-left">
          <p className="text-sm font-semibold text-neutral-800">
            Proceso 100% seguro
          </p>
          <p className="text-xs text-neutral-500">
            Cifrado SSL 256 bits · No compartimos tus datos
          </p>
        </div>
      </div>

      {/* Certifications */}
      <div className="flex items-center gap-4 opacity-60">
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Shield className="w-3 h-3" />
          <span>ISO 27001</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Lock className="w-3 h-3" />
          <span>PCI DSS</span>
        </div>
      </div>
    </div>
  );
};

export default HeroCtaV10;
