'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { type GamerTheme } from './gamerTheme';
import type { SortOption } from '../../types/catalog';

export function GamerSortDropdown({
  isDark,
  T,
  sort,
  onSortChange,
  options,
}: {
  isDark: boolean;
  T: GamerTheme;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === sort)?.label || 'Recomendados';

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '8px 12px', borderRadius: 10,
          background: isDark ? T.bgSurface : '#fff',
          border: `1px solid ${open ? T.neonCyan : T.border}`,
          color: T.textPrimary, fontSize: 13,
          fontFamily: "'Rajdhani', sans-serif",
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: T.textMuted, transform: 'rotate(-90deg)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{selectedLabel}</span>
        </div>
        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: T.textMuted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 200,
          background: isDark ? '#1a1a1a' : '#fff',
          border: `1px solid ${T.border}`,
          borderRadius: 12, padding: 4,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          {options.map((opt) => {
            const isSelected = opt.value === sort;
            return (
              <button
                key={opt.value}
                onClick={() => { onSortChange(opt.value as SortOption); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontFamily: "'Rajdhani', sans-serif",
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: isSelected ? T.neonCyan : 'transparent',
                  color: isSelected ? (isDark ? '#0a0a0a' : '#fff') : T.textPrimary,
                  fontWeight: isSelected ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = `${T.neonCyan}15`; e.currentTarget.style.color = T.neonCyan; } }}
                onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textPrimary; } }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 17 18" fill="none">
                    <polyline points="1 9 7 14 15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
