'use client';

import React from 'react';
import { type GamerTheme } from './gamerTheme';

export function GamerCardSkeleton({
  isDark,
  T,
}: {
  isDark: boolean;
  T: GamerTheme;
}) {
  const shimmerBg = isDark
    ? 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)'
    : 'linear-gradient(90deg, #e0e0e0 25%, #ebebeb 50%, #e0e0e0 75%)';
  const shimmerStyle = { backgroundImage: shimmerBg, backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' };

  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Image placeholder */}
      <div
        style={{
          height: 176,
          ...shimmerStyle,
        }}
      />
      <div style={{ padding: '12px 14px' }}>
        {/* Title placeholder */}
        <div
          style={{
            height: 14,
            width: '80%',
            borderRadius: 4,
            ...shimmerStyle,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 14,
            width: '60%',
            borderRadius: 4,
            ...shimmerStyle,
            marginBottom: 16,
          }}
        />
        {/* Price placeholder */}
        <div
          style={{
            height: 48,
            borderRadius: 10,
            ...shimmerStyle,
            marginBottom: 12,
          }}
        />
        {/* Buttons placeholder */}
        <div className="flex gap-2">
          <div
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              ...shimmerStyle,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              ...shimmerStyle,
            }}
          />
        </div>
      </div>
    </div>
  );
}
