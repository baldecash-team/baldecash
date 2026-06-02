'use client';

import React from 'react';

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

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const LOCAL_IMAGE_MAP: Record<string, string> = {
  'nvidia-logo-white.svg': `${BASE}/brands/nvidia-logo-white.svg`,
  'nvidia-logo-green.svg': `${BASE}/brands/nvidia-logo-green.svg`,
};

function resolveImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  for (const [filename, local] of Object.entries(LOCAL_IMAGE_MAP)) {
    if (url.includes(filename)) return local;
  }
  return url;
}

export const RibbonLabel: React.FC<RibbonLabelProps> = ({ ribbon, style }) => {
  const imageUrl = resolveImageUrl(ribbon.imageUrl);
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
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={ribbon.partnerName || ribbon.code}
          style={{ width: 68, height: 15, objectFit: 'contain', objectPosition: 'left center', display: 'block' }}
        />
      )}
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>
        {imageUrl && ribbon.displayText
          ? 'GeForce ' + ribbon.displayText.replace(/nvidia\s*/i, '').replace(/geforce\s*/i, '').replace(/\s+de\s+\d+\s*GB\b.*/i, '').replace(/\s*\([\w\W]*?\)/g, '').trim()
          : ribbon.displayText}
      </span>
    </span>
  );
};

export default RibbonLabel;
