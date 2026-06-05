'use client';

import React from 'react';
import { parseNvidiaModel } from '@/app/prototipos/0.6/utils/nvidiaGpu';

interface NvidiaBadgeProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

const LOGO_URL = 'https://baldecash.s3.amazonaws.com/brands/nvidia-geforce-green-block.png?v=3';

export const NvidiaBadge: React.FC<NvidiaBadgeProps> = ({ value, size = 'lg', style }) => {
  const nv = parseNvidiaModel(value) ?? { family: '', model: '-' };

  const cfg = {
    sm: { radius: 4, logoW: 38, logoH: 28, logoPL: 4, pad: '3px 6px', fs1: 6,  fs2: 9  },
    md: { radius: 5, logoW: 44, logoH: 36, logoPL: 5, pad: '4px 7px', fs1: 7,  fs2: 10 },
    lg: { radius: 6, logoW: 52, logoH: 44, logoPL: 6, pad: '5px 8px', fs1: 8,  fs2: 11 },
  }[size ?? 'lg'];

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'stretch', borderRadius: cfg.radius, overflow: 'hidden', whiteSpace: 'nowrap', lineHeight: 1, ...style }}>
      <span
        style={{
          display: 'inline-block',
          backgroundImage: `url(${LOGO_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: cfg.logoW,
          minHeight: cfg.logoH,
          paddingLeft: cfg.logoPL,
        }}
        aria-label="NVIDIA"
      />
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', backgroundColor: '#1a1a1a', padding: cfg.pad, gap: 1 }}>
        <span style={{ fontSize: cfg.fs1, fontWeight: 700, letterSpacing: '0.08em', color: '#fff', textTransform: 'uppercase' }}>
          {nv.family ? `GeForce ${nv.family}` : 'GeForce'}
        </span>
        <span style={{ fontSize: cfg.fs2, fontWeight: 900, letterSpacing: '0.04em', color: '#fff' }}>
          {nv.model}
        </span>
      </span>
      {/* Borde verde derecho — igual al logo oficial GeForce */}
      <span style={{ display: 'inline-block', backgroundColor: '#76b900', width: cfg.radius === 4 ? 3 : 4 }} />
    </span>
  );
};

export default NvidiaBadge;
