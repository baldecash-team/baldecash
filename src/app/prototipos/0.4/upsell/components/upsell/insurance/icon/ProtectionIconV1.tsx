// ProtectionIconV1 - Escudo Clásico: Escudo con checkmark universal
'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ProtectionIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { container: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { container: 'w-20 h-20', icon: 'w-10 h-10' },
};

export const ProtectionIconV1: React.FC<ProtectionIconProps> = ({
  className = '',
  size = 'md',
}) => {
  const s = sizes[size];

  return (
    <div className={`${s.container} rounded-full bg-[#4654CD]/10 flex items-center justify-center ${className}`}>
      <ShieldCheck className={`${s.icon} text-[#4654CD]`} />
    </div>
  );
};

export default ProtectionIconV1;
