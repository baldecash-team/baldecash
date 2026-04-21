'use client';

import React from 'react';
import { X } from 'lucide-react';
import { type GamerTheme } from './gamerTheme';
import type { FilterState } from '../../types/catalog';

export function GamerActiveFilters({
  isDark,
  T,
  filters,
  searchQuery,
  onBrandToggle,
  onGamaToggle,
  onConditionToggle,
  onDeviceTypeToggle,
  onUsageToggle,
  onTagToggle,
  onRamToggle,
  onStorageToggle,
  onGpuToggle,
  onProcessorToggle,
  onScreenSizeToggle,
  onClearSearch,
  onClearAll,
}: {
  isDark: boolean;
  T: GamerTheme;
  filters: FilterState;
  searchQuery: string;
  onBrandToggle: (b: string) => void;
  onGamaToggle: (g: string) => void;
  onConditionToggle: (c: string) => void;
  onDeviceTypeToggle: (t: string) => void;
  onUsageToggle: (u: string) => void;
  onTagToggle: (t: string) => void;
  onRamToggle: (r: number) => void;
  onStorageToggle: (s: number) => void;
  onGpuToggle: (g: string) => void;
  onProcessorToggle: (p: string) => void;
  onScreenSizeToggle: (s: number) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}) {
  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    background: `${T.neonCyan}10`,
    border: `1px solid ${T.neonCyan}40`,
    borderRadius: 16,
    color: T.neonCyan,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Rajdhani', sans-serif",
    cursor: 'pointer',
  } as const;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {searchQuery.trim() && (
        <button onClick={onClearSearch} style={chipStyle}>
          Búsqueda: {searchQuery}
          <X className="w-3 h-3" />
        </button>
      )}
      {filters.brands.map((b) => (
        <button key={b} onClick={() => onBrandToggle(b)} style={chipStyle}>
          {b}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.deviceTypes.map((t) => (
        <button key={t} onClick={() => onDeviceTypeToggle(t)} style={chipStyle}>
          {t === 'laptop' ? 'Laptops' : t === 'tablet' ? 'Tablets' : t}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.gpuType.map((g) => (
        <button key={g} onClick={() => onGpuToggle(g)} style={chipStyle}>
          {g}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.processorModel.map((p) => (
        <button key={p} onClick={() => onProcessorToggle(p)} style={chipStyle}>
          {p}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.ram.map((r) => (
        <button key={r} onClick={() => onRamToggle(r)} style={chipStyle}>
          {r} GB RAM
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.storage.map((s) => (
        <button key={s} onClick={() => onStorageToggle(s)} style={chipStyle}>
          {s >= 1000 ? `${s / 1000} TB` : `${s} GB`}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.displaySize.map((s) => (
        <button key={s} onClick={() => onScreenSizeToggle(s)} style={chipStyle}>
          {s}&quot;
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.usage.map((u) => (
        <button key={u} onClick={() => onUsageToggle(u)} style={chipStyle}>
          {u}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.gama.map((g) => (
        <button key={g} onClick={() => onGamaToggle(g)} style={chipStyle}>
          {g}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.condition.map((c) => (
        <button key={c} onClick={() => onConditionToggle(c)} style={chipStyle}>
          {c}
          <X className="w-3 h-3" />
        </button>
      ))}
      {filters.tags.map((t) => (
        <button key={t} onClick={() => onTagToggle(t)} style={chipStyle}>
          {t}
          <X className="w-3 h-3" />
        </button>
      ))}
      <button
        onClick={onClearAll}
        style={{
          ...chipStyle,
          background: 'transparent',
          borderColor: T.textMuted,
          color: T.textMuted,
        }}
      >
        Limpiar todo
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
