'use client';

import { useState } from 'react';
import { type FloatingCtaConfig } from '../types/landingConfig';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FloatingCtaButtonProps {
  config: FloatingCtaConfig | null;
}

function resolveIcon(name: string): LucideIcon {
  const icon = (LucideIcons as Record<string, unknown>)[name];
  if (icon && typeof icon === 'object' && '$$typeof' in icon) return icon as unknown as LucideIcon;
  if (typeof icon === 'function') return icon as LucideIcon;
  return LucideIcons.GraduationCap;
}

export function FloatingCtaButton({ config }: FloatingCtaButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!config) return null;

  const Icon = resolveIcon(config.icon);

  if (isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-[90] w-[320px] rounded-2xl bg-[#1a1a2e]/95 backdrop-blur-sm p-5 shadow-xl">
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          aria-label="Cerrar"
        >
          <LucideIcons.X className="h-4 w-4" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4654CD]/20 mb-4">
          <Icon className="h-5 w-5 text-[#03DBD0]" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">{config.expanded_title}</h3>
        <p className="text-sm text-white/70 mb-4">{config.expanded_description}</p>

        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-[#03DBD0] px-5 py-2.5 text-sm font-semibold text-[#1a1a2e] no-underline transition-all hover:brightness-110"
        >
          {config.cta_text}
          <LucideIcons.ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsExpanded(true)}
      className="fixed bottom-6 right-6 z-[90] flex items-center gap-3 rounded-2xl bg-[#1a1a2e]/90 backdrop-blur-sm px-5 py-3 shadow-lg transition-all hover:scale-105 hover:bg-[#1a1a2e] cursor-pointer border-none"
      aria-label={config.title}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4654CD]/20">
        <Icon className="h-5 w-5 text-[#03DBD0]" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-sm font-bold text-white leading-tight">{config.title}</span>
        <span className="text-xs text-white/70 leading-tight">{config.subtitle}</span>
      </div>
    </button>
  );
}
