// ProtectionIconV3 - Candado Flat: Candado ilustración flat
'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface ProtectionIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'w-12 h-12', icon: 'w-5 h-5' },
  md: { container: 'w-16 h-16', icon: 'w-8 h-8' },
  lg: { container: 'w-24 h-24', icon: 'w-12 h-12' },
};

export const ProtectionIconV3: React.FC<ProtectionIconProps> = ({
  className = '',
  size = 'md',
}) => {
  const s = sizes[size];

  return (
    <div className={`${s.container} rounded-xl bg-neutral-100 flex items-center justify-center relative ${className}`}>
      <Lock className={`${s.icon} text-neutral-500`} />
      {/* Decorative elements */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4654CD] rounded-full flex items-center justify-center">
        <span className="text-white text-xs">✓</span>
      </div>
    </div>
  );
};

export default ProtectionIconV3;
