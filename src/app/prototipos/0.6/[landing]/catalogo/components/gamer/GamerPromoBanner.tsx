'use client';

import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { type GamerTheme } from './gamerTheme';

export function GamerPromoBanner({
  isDark,
  T,
  text,
  highlight,
  ctaText,
  ctaUrl,
  dismissible = true,
}: {
  isDark: boolean;
  T: GamerTheme;
  text: string;
  highlight?: string;
  ctaText?: string;
  ctaUrl?: string;
  dismissible?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className="text-white text-center relative z-[60]"
      style={{
        background: `linear-gradient(to right, ${T.neonPurple}, ${T.neonPurple})`,
        padding: '10px 16px',
        fontSize: 14,
      }}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 relative">
        <Zap className="w-4 h-4 shrink-0" style={{ color: T.neonCyan }} />
        <span>
          {highlight && <strong>{highlight}</strong>}
          {highlight && text ? ' ' : ''}
          {text}
          {ctaText && ctaUrl && (
            <a
              href={ctaUrl}
              className="text-white font-semibold underline underline-offset-2 ml-2 hover:no-underline hidden sm:inline"
            >
              {ctaText}
            </a>
          )}
        </span>
        {dismissible && (
          <button
            onClick={() => setVisible(false)}
            className="absolute right-0 p-1.5 bg-transparent border-none text-white cursor-pointer rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
