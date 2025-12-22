// ProtectionIconV5 - Split: Escudo izquierda + beneficios derecha
'use client';

import React from 'react';
import { Shield, Check } from 'lucide-react';

interface ProtectionIconProps {
  className?: string;
  benefits?: string[];
}

export const ProtectionIconV5: React.FC<ProtectionIconProps> = ({
  className = '',
  benefits = ['Robo', 'Accidentes', 'Daños por líquidos'],
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Shield */}
      <div className="w-16 h-16 rounded-2xl bg-[#4654CD]/10 flex items-center justify-center shrink-0">
        <Shield className="w-8 h-8 text-[#4654CD]" />
      </div>

      {/* Benefits list */}
      <div className="space-y-1">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center gap-2 text-sm text-neutral-600">
            <Check className="w-4 h-4 text-[#03DBD0]" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProtectionIconV5;
