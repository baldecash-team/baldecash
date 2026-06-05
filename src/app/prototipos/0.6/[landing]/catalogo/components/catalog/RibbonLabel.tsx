'use client';

import React from 'react';
import { NvidiaBadge } from '@/app/prototipos/0.6/components/NvidiaBadge';
import { parseNvidiaModel } from '@/app/prototipos/0.6/utils/nvidiaGpu';

export interface RibbonLabelData {
  code: string;
  displayText: string;
  backgroundColor: string;
  textColor: string;
  imageUrl?: string | null;
  partnerName?: string | null;
}

interface RibbonLabelProps {
  ribbon: RibbonLabelData;
  style?: React.CSSProperties;
}

export const RibbonLabel: React.FC<RibbonLabelProps> = ({ ribbon, style }) => {
  const isNvidia = !!ribbon.imageUrl && !!ribbon.displayText && !!parseNvidiaModel(ribbon.displayText);

  if (isNvidia) {
    return <NvidiaBadge value={ribbon.displayText} size="sm" style={style} />;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        padding: '4px 8px',
        backgroundColor: ribbon.backgroundColor,
        color: ribbon.textColor,
        borderRadius: 6,
        lineHeight: 1,
        ...style,
      }}
    >
      {ribbon.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ribbon.imageUrl} alt={ribbon.partnerName || ribbon.code} style={{ width: 68, height: 15, objectFit: 'contain', objectPosition: 'left center', display: 'block' }} />
      )}
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>{ribbon.displayText}</span>
    </span>
  );
};

export default RibbonLabel;
