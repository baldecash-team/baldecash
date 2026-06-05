'use client';

import React from 'react';
import { parseNvidiaModel } from '@/app/prototipos/0.6/utils/nvidiaGpu';

interface NvidiaBadgeProps {
  value: string;
  size?: 'sm' | 'lg';
  style?: React.CSSProperties;
}

const LOGO_URL = 'https://baldecash.s3.amazonaws.com/brands/nvidia-geforce-green-block.png?v=3';

export const NvidiaBadge: React.FC<NvidiaBadgeProps> = ({ value, size = 'lg', style }) => {
  const nv = parseNvidiaModel(value);
  if (!nv) return null;

  const isSmall = size === 'sm';

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'stretch', borderRadius: isSmall ? 4 : 6, overflow: 'hidden', whiteSpace: 'nowrap', lineHeight: 1, ...style }}>
      <span
        style={{
          display: 'inline-block',
          backgroundImage: `url(${LOGO_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: isSmall ? 38 : 52,
          minHeight: isSmall ? 28 : 44,
          paddingLeft: isSmall ? 4 : 6,
        }}
        aria-label="NVIDIA"
      />
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', backgroundColor: '#1a1a1a', padding: isSmall ? '3px 6px' : '5px 8px', gap: 1 }}>
        <span style={{ fontSize: isSmall ? 6 : 8, fontWeight: 700, letterSpacing: '0.08em', color: '#fff', textTransform: 'uppercase' }}>
          {nv.family ? `GeForce ${nv.family}` : 'GeForce'}
        </span>
        <span style={{ fontSize: isSmall ? 9 : 11, fontWeight: 900, letterSpacing: '0.04em', color: '#fff' }}>
          {nv.model}
        </span>
      </span>
    </span>
  );
};

export default NvidiaBadge;
