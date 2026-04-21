'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Zap,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Gamepad2,
  BookOpen,
  Palette,
  Briefcase,
  Code2,
  Layers,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { type GamerTheme } from './gamerTheme';
import { type FilterState, type SortOption, defaultFilterState } from '../../types/catalog';
import type { CatalogFiltersResponse } from '@/app/prototipos/0.6/types/filters';

// ============================================
// Brand Button (used inside sidebar brand grid)
// ============================================

export function BrandButton({ brand, isActive, T, onToggle }: { brand: { id: number; slug: string; name: string; logo_url?: string | null; count: number }; isActive: boolean; T: GamerTheme; onToggle: () => void }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        padding: '10px 4px', border: `2px solid ${isActive ? T.neonCyan : T.border}`, borderRadius: 10,
        cursor: 'pointer', transition: 'all 0.3s',
        background: isActive ? 'rgba(0,255,213,0.06)' : T.bgCard,
        boxShadow: isActive ? '0 0 12px rgba(0,255,213,0.2)' : 'none', minHeight: 68,
      }}
    >
      {imgError ? (
        <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? T.neonCyan : T.textSecondary, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>{brand.name}</span>
      ) : (
        <Image
          src={brand.logo_url || `/img/logos/${brand.slug}.svg`}
          alt={brand.name}
          width={48}
          height={24}
          style={{ maxWidth: 48, maxHeight: 24, objectFit: 'contain', borderRadius: 4, opacity: isActive ? 1 : 0.8, transition: 'all 0.3s' }}
          onError={() => setImgError(true)}
        />
      )}
      <span style={{ fontSize: 10, color: isActive ? T.neonCyan : T.textMuted, fontFamily: "'Share Tech Mono', monospace" }}>
        {brand.name} ({brand.count})
      </span>
    </button>
  );
}

// ============================================
// Filter Section (collapsible)
// ============================================

export function FilterSection({
  title,
  T,
  expanded,
  onToggle,
  children,
  isLast,
}: {
  title: string;
  T: GamerTheme;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div style={{ borderBottom: isLast ? 'none' : `1px solid ${T.border}`, padding: '16px 0' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          width: '100%',
          padding: 0,
          background: 'none',
          border: 'none',
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            transition: 'color 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: 0,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          {title}
        </h3>
        <ChevronUp
          size={18}
          style={{
            color: T.textMuted,
            fontSize: 14,
            transition: 'all 0.3s',
            transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        />
      </button>
      {expanded && (
        <div
          style={{
            marginTop: 12,
            overflow: 'hidden',
            opacity: 1,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// Sidebar Filters
// ============================================

export function GamerSidebar({
  isDark,
  T,
  filters,
  apiFilters,
  sort,
  onSortChange,
  expandedSections,
  onToggleSection,
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
  onQuotaRangeChange,
  onClearFilters,
  activeFilterCount,
  sortOptions,
  bare = false,
  isFiltersLoading = false,
}: {
  isDark: boolean;
  T: GamerTheme;
  filters: FilterState;
  apiFilters: CatalogFiltersResponse | null;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  expandedSections: Record<string, boolean>;
  onToggleSection: (s: string) => void;
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
  onQuotaRangeChange: (min: number, max: number) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  sortOptions: { value: string; label: string }[];
  bare?: boolean;
  isFiltersLoading?: boolean;
}) {
  // Quota range bounds vienen del backend (apiFilters.quota_range)
  const RANGE_ABS_MIN = apiFilters?.quota_range?.min ?? 0;
  const RANGE_ABS_MAX = apiFilters?.quota_range?.max ?? 0;
  // Estado local del slider, sincronizado con filters.quotaRange del padre
  const quotaMinSentinel = filters.quotaRange[0] !== defaultFilterState.quotaRange[0];
  const quotaMaxSentinel = filters.quotaRange[1] !== defaultFilterState.quotaRange[1];
  const rangeMin = quotaMinSentinel ? filters.quotaRange[0] : RANGE_ABS_MIN;
  const rangeMax = quotaMaxSentinel ? filters.quotaRange[1] : RANGE_ABS_MAX;

  const gamaOptions: { value: string; label: string; color: string; chipBg: string; chipBorder: string; chipShadow: string }[] = [
    { value: 'economica', label: 'Económica', color: T.textSecondary, chipBg: 'rgba(136,136,170,0.18)', chipBorder: 'rgba(136,136,170,0.5)', chipShadow: 'rgba(136,136,170,0.1)' },
    { value: 'estudiante', label: 'Estudiante', color: '#5b9cff', chipBg: 'rgba(59,130,246,0.18)', chipBorder: 'rgba(59,130,246,0.5)', chipShadow: 'rgba(59,130,246,0.1)' },
    { value: 'profesional', label: 'Profesional', color: '#3de876', chipBg: 'rgba(34,197,94,0.18)', chipBorder: 'rgba(34,197,94,0.5)', chipShadow: 'rgba(34,197,94,0.1)' },
    { value: 'creativa', label: 'Creativa', color: '#818cf8', chipBg: 'rgba(99,102,241,0.18)', chipBorder: 'rgba(99,102,241,0.5)', chipShadow: 'rgba(99,102,241,0.1)' },
    { value: 'gamer', label: 'Gamer', color: '#ff3366', chipBg: 'rgba(255,0,64,0.18)', chipBorder: 'rgba(255,0,64,0.5)', chipShadow: 'rgba(255,0,64,0.1)' },
  ];

  // Paleta consolidada: red (oferta), purple (destacados), cyan (beneficio)
  const destacadosOptions: { value: string; label: string; color: string; chipBg: string; chipBorder: string; chipShadow: string }[] = [
    { value: 'oferta', label: 'Oferta', color: '#ff3366', chipBg: 'rgba(255,0,85,0.18)', chipBorder: 'rgba(255,0,85,0.5)', chipShadow: 'rgba(255,0,85,0.1)' },
    { value: 'mas_vendido', label: 'Más vendido', color: '#818cf8', chipBg: 'rgba(99,102,241,0.18)', chipBorder: 'rgba(99,102,241,0.5)', chipShadow: 'rgba(99,102,241,0.1)' },
    { value: 'recomendado', label: 'Recomendado', color: '#818cf8', chipBg: 'rgba(99,102,241,0.18)', chipBorder: 'rgba(99,102,241,0.5)', chipShadow: 'rgba(99,102,241,0.1)' },
    { value: 'cuota_baja', label: 'Cuota baja', color: T.neonCyan, chipBg: 'rgba(0,255,213,0.12)', chipBorder: 'rgba(0,255,213,0.4)', chipShadow: 'rgba(0,255,213,0.1)' },
  ];

  const usoOptions: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: 'estudios', label: 'Estudios', icon: <BookOpen size={20} /> },
    { value: 'gaming', label: 'Gaming', icon: <Gamepad2 size={20} /> },
    { value: 'diseno', label: 'Diseño', icon: <Palette size={20} /> },
    { value: 'oficina', label: 'Oficina', icon: <Briefcase size={20} /> },
    { value: 'programacion', label: 'Programación', icon: <Code2 size={20} /> },
  ];

  // Range fill calculation (guarda contra división por cero si aún no llega apiFilters)
  const span = RANGE_ABS_MAX - RANGE_ABS_MIN || 1;
  const fillLeft = ((rangeMin - RANGE_ABS_MIN) / span) * 100;
  const fillRight = ((rangeMax - RANGE_ABS_MIN) / span) * 100;

  // Shared button style for grid items (type, uso, condicion, advanced)
  const gridItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: '10px 4px',
    border: `2px solid ${isActive ? T.neonCyan : T.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: isActive ? 'rgba(0,255,213,0.06)' : T.bgCard,
    boxShadow: isActive ? '0 0 10px rgba(0,255,213,0.15)' : 'none',
    minHeight: 68,
    color: isActive ? T.neonCyan : T.textMuted,
    fontFamily: "'Rajdhani', sans-serif",
  });

  const gridLabelStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 600,
    color: isActive ? T.neonCyan : T.textSecondary,
    textAlign: 'center',
    lineHeight: 1.2,
  });

  const gridCountStyle: React.CSSProperties = {
    fontSize: 9,
    color: T.textMuted,
    fontFamily: "'Share Tech Mono', monospace",
  };

  const content = (
    <>
      {/* Range slider thumb styles (can't be done inline) */}
      <style>{`
        .gamer-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px;
          background: ${isDark ? '#0e0e0e' : '#fff'};
          border: 2px solid ${T.neonCyan};
          border-radius: 50%; cursor: grab;
          pointer-events: auto;
          box-shadow: 0 0 8px rgba(0,255,213,0.4), inset 0 0 4px rgba(0,255,213,0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .gamer-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 15px rgba(0,255,213,0.6);
        }
        .gamer-range-slider::-moz-range-thumb {
          width: 20px; height: 20px;
          background: ${isDark ? '#0e0e0e' : '#fff'};
          border: 2px solid ${T.neonCyan};
          border-radius: 50%; cursor: grab;
          pointer-events: auto;
          box-shadow: 0 0 8px rgba(0,255,213,0.4);
        }
        .gamer-range-slider::-moz-range-track { background: transparent; }
        .gamer-filter-header:hover h3 { color: ${T.neonCyan} !important; }
        .gamer-filter-header:hover .gamer-chevron { color: ${T.neonCyan} !important; }
      `}</style>

      {/* ======= Header (hidden in bare/fullscreen mode) ======= */}
      {!bare && <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.textPrimary,
            margin: 0,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          Filtros
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: T.textMuted,
              fontSize: 12,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              transition: 'all 0.3s',
            }}
          >
            <Trash2 size={16} />
            <span>Limpiar</span>
          </button>
        )}
      </div>}

      {/* Sort (mobile/sidebar - hidden in bare mode) */}
      {!bare && <div className="lg:hidden" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: T.textMuted,
            marginBottom: 6,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Ordenar
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.textPrimary,
            fontSize: 13,
            fontFamily: "'Rajdhani', sans-serif",
            outline: 'none',
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>}

      {/* =====================================================================
          NUEVO ORDEN DE FILTROS (optimizado para gamers — specs primero)
          Toda la data viene de apiFilters (backend). Solo cambia el ORDEN.
          ===================================================================== */}

      {/* Filter skeletons while API loads */}
      {isFiltersLoading && !apiFilters && (() => {
        const shimmerBg = isDark
          ? 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)'
          : 'linear-gradient(90deg, #e5e5e5 25%, #f0f0f0 50%, #e5e5e5 75%)';
        const shimmerStyle = { backgroundImage: shimmerBg, backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' };
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['GPU', 'Procesador', 'RAM', 'Cuota mensual'].map((label) => (
              <div key={label}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase',
                  letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 10,
                }}>
                  {label}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: label === 'Cuota mensual' ? '1fr' : 'repeat(2, 1fr)', gap: 8 }}>
                  {(label === 'Cuota mensual' ? [0] : [0, 1, 2, 3]).map((i) => (
                    <div
                      key={i}
                      style={{
                        height: label === 'Cuota mensual' ? 48 : 60,
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        ...shimmerStyle,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ======= 1. GPU / Tarjeta Gráfica ======= */}
      {apiFilters?.specs?.gpu && apiFilters.specs.gpu.values.length > 1 && (
        <FilterSection title="GPU / Tarjeta Gráfica" T={T} expanded={expandedSections.gpu !== false} onToggle={() => onToggleSection('gpu')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.specs.gpu.values.map((val) => {
              const isActive = (filters.gpuType as string[]).includes(String(val.value));
              return (
                <button key={String(val.value)} onClick={() => onGpuToggle(String(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><Zap size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count} equipo{val.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 2. Procesador (CPU) ======= */}
      {apiFilters?.specs?.processor && apiFilters.specs.processor.values.length > 1 && (
        <FilterSection title="Procesador" T={T} expanded={expandedSections.procesador !== false} onToggle={() => onToggleSection('procesador')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.specs.processor.values.map((val) => {
              const isActive = (filters.processorModel as string[]).includes(String(val.value));
              return (
                <button key={String(val.value)} onClick={() => onProcessorToggle(String(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><Cpu size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count} equipo{val.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 3. RAM ======= */}
      {apiFilters?.specs?.ram && apiFilters.specs.ram.values.length > 1 && (
        <FilterSection title="RAM" T={T} expanded={expandedSections.ram !== false} onToggle={() => onToggleSection('ram')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {apiFilters.specs.ram.values.map((val) => {
              const isActive = filters.ram.some((v) => v === val.value);
              return (
                <button key={String(val.value)} onClick={() => onRamToggle(Number(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><MemoryStick size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 4. Almacenamiento (debajo de RAM) ======= */}
      {apiFilters?.specs?.storage && apiFilters.specs.storage.values.length > 1 && (
        <FilterSection title="Almacenamiento" T={T} expanded={expandedSections.almacenamiento !== false} onToggle={() => onToggleSection('almacenamiento')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.specs.storage.values.map((val) => {
              const isActive = filters.storage.some((v) => v === val.value);
              return (
                <button key={String(val.value)} onClick={() => onStorageToggle(Number(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><HardDrive size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 5. Pantalla ======= */}
      {apiFilters?.specs?.screen_size && apiFilters.specs.screen_size.values.length > 1 && (
        <FilterSection title="Pantalla" T={T} expanded={expandedSections.pantalla !== false} onToggle={() => onToggleSection('pantalla')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {apiFilters.specs.screen_size.values.map((val) => {
              const isActive = filters.displaySize.includes(Number(val.value));
              return (
                <button key={String(val.value)} onClick={() => onScreenSizeToggle(Number(val.value))} style={{ ...gridItemStyle(isActive), minHeight: 60, padding: '8px 4px' }}>
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}><Monitor size={18} /></span>
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 10 }}>{val.display}</span>
                  <span style={gridCountStyle}>{val.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 6. Cuota mensual ======= */}
      {apiFilters?.quota_range && RANGE_ABS_MAX > RANGE_ABS_MIN && (
      <FilterSection title="Cuota mensual" T={T} expanded={expandedSections.cuota !== false} onToggle={() => onToggleSection('cuota')}>
        {/* Range display boxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              background: 'rgba(0,255,213,0.05)',
              border: '1px solid rgba(0,255,213,0.15)',
              borderRadius: 8,
              padding: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace" }}>
              DESDE
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.neonCyan, fontFamily: "'Barlow Condensed', sans-serif", textShadow: '0 0 8px rgba(0,255,213,0.3)' }}>
              S/{rangeMin}
            </div>
          </div>
          <div style={{ color: T.textMuted, fontSize: 12 }}>—</div>
          <div
            style={{
              flex: 1,
              background: 'rgba(0,255,213,0.05)',
              border: '1px solid rgba(0,255,213,0.15)',
              borderRadius: 8,
              padding: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace" }}>
              HASTA
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.neonCyan, fontFamily: "'Barlow Condensed', sans-serif", textShadow: '0 0 8px rgba(0,255,213,0.3)' }}>
              S/{rangeMax}
            </div>
          </div>
        </div>

        {/* Dual range slider */}
        <div style={{ position: 'relative', height: 36, margin: '0 4px' }}>
          {/* Track bg */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 6,
              transform: 'translateY(-50%)',
              background: T.border,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Fill */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                height: '100%',
                left: `${fillLeft}%`,
                width: `${fillRight - fillLeft}%`,
                background: `linear-gradient(90deg, ${T.neonCyan}, ${T.neonPurple})`,
                borderRadius: 3,
                boxShadow: '0 0 8px rgba(0,255,213,0.3)',
              }}
            />
          </div>
          {/* Min slider */}
          <input
            className="gamer-range-slider"
            type="range"
            min={RANGE_ABS_MIN}
            max={RANGE_ABS_MAX}
            step={1}
            value={rangeMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v <= rangeMax - 1) onQuotaRangeChange(v, rangeMax);
            }}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '100%',
              height: 20,
              WebkitAppearance: 'none',
              appearance: 'none' as never,
              background: 'transparent',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          {/* Max slider */}
          <input
            className="gamer-range-slider"
            type="range"
            min={RANGE_ABS_MIN}
            max={RANGE_ABS_MAX}
            step={1}
            value={rangeMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= rangeMin + 1) onQuotaRangeChange(rangeMin, v);
            }}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '100%',
              height: 20,
              WebkitAppearance: 'none',
              appearance: 'none' as never,
              background: 'transparent',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        </div>
        {/* Range labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            color: T.textMuted,
            fontFamily: "'Share Tech Mono', monospace",
            marginTop: 4,
            padding: '0 4px',
          }}
        >
          <span>S/{RANGE_ABS_MIN}</span>
          <span>S/{RANGE_ABS_MAX}</span>
        </div>
      </FilterSection>
      )}

      {/* ======= 7. Destacados ======= */}
      {apiFilters?.labels && apiFilters.labels.length > 0 && (
        <FilterSection title="Destacados" T={T} expanded={expandedSections.destacados !== false} onToggle={() => onToggleSection('destacados')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {apiFilters.labels.map((lbl) => {
              const isActive = (filters.tags as string[]).includes(lbl.code);
              const preset = destacadosOptions.find((o) => o.value === lbl.code);
              const chipBg = preset?.chipBg || `${lbl.color}22`;
              const chipBorder = preset?.chipBorder || `${lbl.color}99`;
              const chipShadow = preset?.chipShadow || `${lbl.color}33`;
              const color = preset?.color || lbl.color;
              return (
                <span
                  key={lbl.code}
                  onClick={() => onTagToggle(lbl.code)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: `1px solid ${isActive ? T.neonCyan : chipBorder}`,
                    letterSpacing: 0.3,
                    background: chipBg,
                    color,
                    boxShadow: isActive ? `0 0 12px rgba(0,255,213,0.3)` : `0 0 6px ${chipShadow}`,
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {lbl.name}
                  <span style={{ opacity: 0.7, fontSize: 10, fontFamily: "'Share Tech Mono', monospace" }}>({lbl.count})</span>
                </span>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 8. Marca ======= */}
      {apiFilters?.brands && apiFilters.brands.length > 1 && (
        <FilterSection title="Marca" T={T} expanded={expandedSections.marca !== false} onToggle={() => onToggleSection('marca')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {apiFilters.brands.map((brand) => {
              const isActive = filters.brands.includes(brand.slug);
              return (
                <BrandButton key={brand.id} brand={brand} isActive={isActive} T={T} onToggle={() => onBrandToggle(brand.slug)} />
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 9. Uso recomendado ======= */}
      {apiFilters?.usages && apiFilters.usages.length > 1 && (
        <FilterSection title="Uso recomendado" T={T} expanded={expandedSections.uso !== false} onToggle={() => onToggleSection('uso')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.usages.map((u, idx) => {
              const isActive = (filters.usage as string[]).includes(u.value);
              const isLast = idx === apiFilters.usages.length - 1;
              const isOddLast = isLast && apiFilters.usages.length % 2 !== 0;
              const preset = usoOptions.find((o) => o.value === u.value);
              const icon = preset?.icon || <Laptop size={20} />;
              return (
                <button
                  key={u.value}
                  onClick={() => onUsageToggle(u.value)}
                  style={{
                    ...gridItemStyle(isActive),
                    ...(isOddLast ? { gridColumn: '1 / -1' } : {}),
                  }}
                >
                  <span style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s' }}>{icon}</span>
                  <span style={gridLabelStyle(isActive)}>{u.label}</span>
                  <span style={gridCountStyle}>{u.count} equipo{u.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ======= 10. Condición (último) ======= */}
      {apiFilters?.conditions && apiFilters.conditions.length > 1 && (
        <FilterSection title="Condición" T={T} expanded={expandedSections.condicion !== false} onToggle={() => onToggleSection('condicion')} isLast>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {apiFilters.conditions.map((c) => {
              const isActive = (filters.condition as string[]).includes(c.value);
              const isNueva = c.value.startsWith('nuev');
              return (
                <button
                  key={c.value}
                  onClick={() => onConditionToggle(c.value)}
                  style={{
                    ...gridItemStyle(isActive),
                    minHeight: 'unset',
                    padding: '12px 8px',
                  }}
                >
                  {isNueva ? (
                    <Package size={20} style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s', marginBottom: 6 }} />
                  ) : (
                    <CheckCircle2 size={20} style={{ color: isActive ? T.neonCyan : T.textMuted, transition: 'color 0.3s', marginBottom: 6 }} />
                  )}
                  <span style={{ ...gridLabelStyle(isActive), fontSize: 11, lineHeight: 1.2 }}>{c.label}</span>
                  <span style={{ ...gridCountStyle, marginTop: 2 }}>{c.count} equipo{c.count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </>
  );

  if (bare) return content;

  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        maxHeight: 'calc(100vh - 170px)',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: `${T.border} transparent`,
      }}
    >
      {content}
    </div>
  );
}
