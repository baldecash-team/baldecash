// ProtectionIconV2 - Paraguas: Protección sutil lifestyle
'use client';

import React from 'react';
import { Umbrella } from 'lucide-react';

interface ProtectionIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  md: { container: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { container: 'w-20 h-20', icon: 'w-10 h-10' },
};

export const ProtectionIconV2: React.FC<ProtectionIconProps> = ({
  className = '',
  size = 'md',
}) => {
  const s = sizes[size];

  return (
    <div className={`${s.container} rounded-2xl bg-[#03DBD0]/10 flex items-center justify-center ${className}`}>
      <Umbrella className={`${s.icon} text-[#03DBD0]`} />
    </div>
  );
};

export default ProtectionIconV2;
