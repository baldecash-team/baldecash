'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Scale,
  Trophy,
  Star,
  Sparkles,
  ArrowRight,
  Trash2,
  ShoppingCart,
  Check,
} from 'lucide-react';
import { type GamerTheme } from './gamerTheme';
import { type CatalogProduct } from '../../types/catalog';

export function GamerCompareModal({
  products,
  isDark,
  T,
  showDiffOnly,
  onToggleDiffOnly,
  onClose,
  onRemove,
  onClearAll,
  onSelectProduct,
  showCart = false,
  onAddToCart,
  cartItems = [],
}: {
  products: CatalogProduct[];
  isDark: boolean;
  T: GamerTheme;
  showDiffOnly: boolean;
  onToggleDiffOnly: () => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onSelectProduct: (product: CatalogProduct) => void;
  showCart?: boolean;
  onAddToCart?: (product: CatalogProduct) => void;
  cartItems?: string[];
}) {
  // Primary color for tints
  const primaryColor = T.neonCyan;
  const trophyGreen = '#00ffd5'; // cyan — paleta consolidada (era verde)
  const colTint = isDark ? 'rgba(0,255,213,0.05)' : 'rgba(70,84,205,0.05)';

  // Extract spec values for comparison
  const getSpecValue = (product: CatalogProduct, spec: string): string => {
    switch (spec) {
      case 'Procesador':
        return product.specs?.processor?.model || '-';
      case 'Memoria RAM':
        return product.specs?.ram ? `${product.specs.ram.size}GB DDR${product.specs.ram.type?.includes('5') ? '5' : '4'}` : '-';
      case 'Gráficos (GPU)':
        return (product.specs?.gpu?.model && product.specs.gpu.model !== 'null') ? `${product.specs.gpu.model}${product.specs.gpu.vram ? ` ${product.specs.gpu.vram}GB` : ''}` : '-';
      case 'Almacenamiento':
        return product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type.toUpperCase()}` : '-';
      case 'Tamaño de Pantalla':
        return product.specs?.display ? `${product.specs.display.size}"` : '-';
      case 'Resolución':
        return product.specs?.display?.resolution || '-';
      case 'Refresh Rate':
        return product.specs?.display?.refreshRate ? `${product.specs.display.refreshRate}Hz` : '-';
      case 'Peso':
        return product.specs?.dimensions?.weight ? `${product.specs.dimensions.weight} kg` : '-';
      case 'Precio':
        return `S/ ${product.price.toLocaleString('es-PE')}`;
      case 'Cuota Mensual':
        return `S/ ${product.quotaMonthly.toLocaleString('es-PE')}`;
      default:
        return '-';
    }
  };

  // Numeric extraction for winner detection
  const getNumericValue = (product: CatalogProduct, spec: string): number | null => {
    switch (spec) {
      case 'Memoria RAM':
        return product.specs?.ram?.size ?? null;
      case 'Almacenamiento':
        return product.specs?.storage?.size ?? null;
      case 'Tamaño de Pantalla':
        return product.specs?.display?.size ?? null;
      case 'Refresh Rate':
        return product.specs?.display?.refreshRate ?? null;
      case 'Gráficos (GPU)':
        return product.specs?.gpu?.vram ?? null;
      case 'Peso':
        return product.specs?.dimensions?.weight ?? null;
      case 'Precio':
        return product.price;
      case 'Cuota Mensual':
        return product.quotaMonthly;
      default:
        return null;
    }
  };

  // Determine winner index for a spec row
  const getWinnerIndex = (spec: string): number | null => {
    const values = products.map(p => getNumericValue(p, spec));
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length < 2) return null;

    const lowerIsBetter = spec === 'Precio' || spec === 'Cuota Mensual' || spec === 'Peso';
    const bestValue = lowerIsBetter ? Math.min(...validValues) : Math.max(...validValues);

    // Only mark winner if not all values are the same
    if (validValues.every(v => v === validValues[0])) return null;

    const winnerIdx = values.findIndex(v => v === bestValue);
    return winnerIdx >= 0 ? winnerIdx : null;
  };

  const specRows = [
    'Procesador',
    'Memoria RAM',
    'Gráficos (GPU)',
    'Almacenamiento',
    'Tamaño de Pantalla',
    'Resolución',
    'Refresh Rate',
    'Peso',
    'Precio',
    'Cuota Mensual',
  ];

  // Best option state
  const [showBestOption, setShowBestOption] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when best option view is shown
  useEffect(() => {
    if (showBestOption) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showBestOption]);

  // Animation helper
  const fadeIn = (delay: number, duration = 0.4) => ({
    opacity: 0 as const,
    animation: `fadeInUp ${duration}s ease-out ${delay}s forwards`,
  });

  // Calculate winner: product with most spec wins
  const winCounts = products.map((_, pIdx) => {
    let wins = 0;
    specRows.forEach(spec => {
      if (getWinnerIndex(spec) === pIdx) wins++;
    });
    return wins;
  });
  const totalComparableSpecs = specRows.filter(spec => getWinnerIndex(spec) !== null).length;
  const bestIdx = winCounts.indexOf(Math.max(...winCounts));
  const bestProduct = products[bestIdx];
  const bestWins = winCounts[bestIdx];
  const otherProducts = products.filter((_, i) => i !== bestIdx);

  // Notable advantage for losers
  const getNotableAdvantage = (product: CatalogProduct): string | null => {
    const pIdx = products.indexOf(product);
    // Check if this product wins on price
    if (getWinnerIndex('Precio') === pIdx || getWinnerIndex('Cuota Mensual') === pIdx) return 'Más barato';
    if (getWinnerIndex('Memoria RAM') === pIdx) return 'Más RAM';
    if (getWinnerIndex('Almacenamiento') === pIdx) return 'Más almacenamiento';
    if (getWinnerIndex('Gráficos (GPU)') === pIdx) return 'Mejor GPU';
    if (getWinnerIndex('Peso') === pIdx) return 'Más liviano';
    return null;
  };

  // Filter rows for diff-only mode
  const filteredRows = showDiffOnly
    ? specRows.filter(spec => {
        const values = products.map(p => getSpecValue(p, spec));
        return !values.every(v => v === values[0]);
      })
    : specRows;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: isDark ? T.bg : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '16px 20px',
            background: isDark ? T.bgSurface : '#ffffff',
            borderBottom: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scale className="w-5 h-5" style={{ color: primaryColor }} />
            <div>
              <h2
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark ? T.textPrimary : '#171717',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Comparador de Equipos
              </h2>
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 13,
                  color: isDark ? T.textMuted : '#737373',
                  fontWeight: 500,
                }}
              >
                {products.length} equipo{products.length > 1 ? 's' : ''} seleccionado{products.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
              background: 'transparent',
              color: isDark ? T.textMuted : '#a3a3a3',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflow: 'auto',
            background: isDark ? T.bgSurface : '#fafafa',
            padding: '20px 16px',
          }}
        >
          {/* Best Option View */}
          {showBestOption && bestProduct && (
            <>
              {/* Winner Hero Card */}
              <div style={{ position: 'relative', marginBottom: 24, ...fadeIn(0.1, 0.5) }}>
                {/* Glow effect - matching HTML: absolute -inset-2, blur-xl */}
                <div
                  style={{
                    position: 'absolute',
                    inset: -8,
                    background: isDark ? 'rgba(0,255,213,0.2)' : 'rgba(70,84,205,0.2)',
                    borderRadius: 24,
                    filter: 'blur(24px)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    border: `2px solid ${primaryColor}`,
                    borderRadius: 14,
                    background: isDark ? T.bgCard : '#ffffff',
                    boxShadow: `0 25px 50px -12px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}`,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                  }}
                  className="md:!flex-row"
                >
                  {/* Left side - Image & badge */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      flexShrink: 0,
                      padding: '16px 24px',
                      background: isDark ? 'rgba(0,255,213,0.05)' : 'rgba(70,84,205,0.05)',
                      borderRadius: 12,
                      position: 'relative',
                    }}
                    className="w-full md:w-1/3"
                  >
                    {/* Badge - positioned absolute at top center */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        right: 12,
                        display: 'flex',
                        justifyContent: 'center',
                        ...fadeIn(0, 0.4),
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: primaryColor,
                          color: isDark ? '#000' : '#fff',
                          padding: '6px 16px',
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "'Rajdhani', sans-serif",
                          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                        Mejor opción para ti
                      </span>
                    </div>
                    {/* Thumbnail */}
                    <div
                      style={{
                        borderRadius: 16,
                        background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        marginTop: 32,
                        padding: 12,
                        ...fadeIn(0.2, 0.5),
                      }}
                      className="w-28 h-28 md:w-40 md:h-40"
                    >
                      <img
                        src={(bestProduct.images?.length > 0 ? bestProduct.images[0] : bestProduct.thumbnail) || '/images/products/placeholder.jpg'}
                        alt={bestProduct.displayName}
                        className="w-24 h-24 md:w-36 md:h-36"
                        style={{ objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                      />
                    </div>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: 2, ...fadeIn(0.3, 0.3) }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          style={{ color: primaryColor, fill: primaryColor }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right side - Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, ...fadeIn(0.15, 0.4) }}>
                    {/* Brand */}
                    <span
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: isDark ? T.textMuted : '#a3a3a3',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {bestProduct.brand}
                    </span>
                    {/* Product name */}
                    <h3
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 24,
                        fontWeight: 700,
                        color: isDark ? T.textPrimary : '#171717',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {bestProduct.displayName}
                    </h3>
                    {/* Subtitle */}
                    <p
                      style={{
                        fontSize: 14,
                        color: isDark ? T.textSecondary : '#525252',
                        margin: 0,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      La mejor relación precio-calidad basada en tus preferencias
                    </p>
                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4, ...fadeIn(0.25, 0.4) }}>
                      <span
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: 36,
                          fontWeight: 700,
                          color: primaryColor,
                          lineHeight: 1,
                        }}
                      >
                        S/{bestProduct.quotaMonthly.toLocaleString('es-PE')}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: 18,
                          color: isDark ? T.textMuted : '#737373',
                        }}
                      >
                        /mes
                      </span>
                    </div>
                    {/* Wins badge */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        gap: 4,
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: isDark ? 'rgba(0,255,213,0.1)' : 'rgba(70,84,205,0.1)',
                        color: primaryColor,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {bestWins}/{totalComparableSpecs} ventajas
                    </span>
                    {/* Specs grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                        marginTop: 8,
                        ...fadeIn(0.35, 0.4),
                      }}
                    >
                      {['Procesador', 'Memoria RAM', 'Gráficos (GPU)', 'Almacenamiento'].map(spec => (
                        <div
                          key={spec}
                          style={{
                            background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
                            borderRadius: 10,
                            padding: '8px 12px',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 11,
                              fontWeight: 500,
                              color: isDark ? T.textMuted : '#a3a3a3',
                              marginBottom: 2,
                            }}
                          >
                            {spec === 'Gráficos (GPU)' ? 'Gráficos' : spec}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 13,
                              fontWeight: 600,
                              color: isDark ? T.textPrimary : '#171717',
                            }}
                          >
                            {getSpecValue(bestProduct, spec)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Lo quiero button */}
                    <button
                      onClick={() => onSelectProduct(bestProduct)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        height: 44,
                        padding: '0 24px',
                        background: primaryColor,
                        border: 'none',
                        borderRadius: 10,
                        color: isDark ? '#000' : '#fff',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Rajdhani', sans-serif",
                        marginTop: 8,
                        alignSelf: 'flex-start',
                        ...fadeIn(0.45, 0.4),
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Lo quiero
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Otras opciones */}
              {otherProducts.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h4
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: isDark ? T.textMuted : '#737373',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: '0 0 12px 0',
                      ...fadeIn(0.5, 0.3),
                    }}
                  >
                    Otras opciones
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gap: 10,
                    }}
                    className="grid-cols-1 md:grid-cols-2"
                  >
                    {otherProducts.map((product, otherIdx) => {
                      const advantage = getNotableAdvantage(product);
                      return (
                        <div
                          key={product.id}
                          style={{
                            position: 'relative',
                            background: isDark ? T.bgCard : '#ffffff',
                            border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
                            borderRadius: 12,
                            padding: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            ...fadeIn(0.55 + otherIdx * 0.1, 0.3),
                          }}
                          className="group"
                        >
                          {/* Remove button */}
                          <button
                            onClick={() => onRemove(product.id)}
                            className="opacity-0 group-hover:opacity-100"
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
                              background: isDark ? T.bgSurface : '#fff',
                              color: isDark ? T.textMuted : '#a3a3a3',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              transition: 'opacity 0.2s',
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 10,
                              background: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={(product.images?.length > 0 ? product.images[0] : product.thumbnail) || '/images/products/placeholder.jpg'}
                              alt={product.displayName}
                              style={{ objectFit: 'contain', width: 72, height: 72 }}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                            />
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 11,
                                fontWeight: 500,
                                color: isDark ? T.textMuted : '#a3a3a3',
                                textTransform: 'uppercase',
                              }}
                            >
                              {product.brand}
                            </span>
                            <div
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 14,
                                fontWeight: 600,
                                color: isDark ? T.textPrimary : '#171717',
                                lineHeight: 1.2,
                                marginBottom: 4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {product.displayName}
                            </div>
                            <div
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 16,
                                fontWeight: 700,
                                color: primaryColor,
                                marginBottom: 6,
                              }}
                            >
                              S/{product.quotaMonthly.toLocaleString('es-PE')}<span style={{ fontSize: 12, fontWeight: 400, color: isDark ? T.textMuted : '#737373' }}>/mes</span>
                            </div>
                            {/* Specs chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                              {['Procesador', 'Memoria RAM', 'Gráficos (GPU)', 'Almacenamiento'].map(spec => {
                                const val = getSpecValue(product, spec);
                                if (val === '-') return null;
                                return (
                                  <span
                                    key={spec}
                                    style={{
                                      fontSize: 10,
                                      fontFamily: "'Rajdhani', sans-serif",
                                      fontWeight: 500,
                                      color: isDark ? T.textSecondary : '#525252',
                                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                    }}
                                  >
                                    {val}
                                  </span>
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {advantage && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: 600,
                                    color: '#00ffd5',
                                    background: 'rgba(34,197,94,0.1)',
                                    padding: '2px 10px',
                                    borderRadius: 999,
                                  }}
                                >
                                  {advantage}
                                </span>
                              )}
                              <button
                                onClick={() => onSelectProduct(product)}
                                style={{
                                  height: 28,
                                  padding: '0 14px',
                                  borderRadius: 6,
                                  border: `1px solid ${isDark ? T.border : '#d4d4d4'}`,
                                  background: 'transparent',
                                  color: isDark ? T.textPrimary : '#171717',
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Elegir
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Card wrapper */}
          <div
            style={{
              background: isDark ? T.bgCard : '#ffffff',
              border: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Card header - "Comparación resumida" + checkbox */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
                background: isDark ? T.bgCard : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? T.textPrimary : '#404040',
                  margin: 0,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Comparación resumida
              </h4>
              <button
                type="button"
                onClick={onToggleDiffOnly}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `2px solid ${showDiffOnly ? primaryColor : (isDark ? T.border : '#d4d4d4')}`,
                    background: showDiffOnly ? primaryColor : (isDark ? T.bgSurface : '#ffffff'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {showDiffOnly && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isDark ? T.textPrimary : '#262626',
                    margin: 0,
                    fontFamily: "'Rajdhani', sans-serif",
                    textAlign: 'left',
                  }}
                >
                  Solo mostrar diferencias
                </p>
              </button>
            </div>

            {/* Comparison table */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                }}
              >
                {/* Product header row */}
                <thead>
                  <tr>
                    <th
                      style={{
                        width: 'clamp(80px, 22vw, 120px)',
                        padding: 'clamp(8px, 2vw, 16px) clamp(6px, 1.5vw, 12px) 12px',
                        textAlign: 'left',
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: isDark ? T.textMuted : '#a3a3a3',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        verticalAlign: 'bottom',
                        borderBottom: `1px solid ${isDark ? T.border : '#f0f0f0'}`,
                      }}
                    >
                      Specs
                    </th>
                    {products.map((p, colIdx) => (
                      <th
                        key={p.id}
                        style={{
                          padding: 'clamp(8px, 2vw, 16px) clamp(4px, 1vw, 10px) 12px',
                          textAlign: 'center',
                          verticalAlign: 'bottom',
                          borderBottom: `1px solid ${isDark ? T.border : '#f0f0f0'}`,
                          background: colIdx % 2 === 1 ? colTint : 'transparent',
                          ...fadeIn(0.1 + colIdx * 0.1, 0.3),
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              background: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={(p.images?.length > 0 ? p.images[0] : p.thumbnail) || '/images/products/placeholder.jpg'}
                              alt={p.displayName}
                              style={{ objectFit: 'contain', width: 48, height: 48 }}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
                            />
                          </div>
                          {/* Brand */}
                          <span
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 11,
                              fontWeight: 500,
                              color: isDark ? T.textMuted : '#a3a3a3',
                              textTransform: 'uppercase',
                              letterSpacing: 0.3,
                            }}
                          >
                            {p.brand}
                          </span>
                          {/* Product name */}
                          <span
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              fontSize: 'clamp(11px, 2.8vw, 13px)',
                              fontWeight: 600,
                              color: isDark ? T.textPrimary : '#171717',
                              lineHeight: 1.2,
                              maxWidth: 'clamp(80px, 25vw, 140px)',
                              textAlign: 'center',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {p.displayName}
                          </span>
                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            <button
                              onClick={() => onSelectProduct(p)}
                              style={{
                                height: 28,
                                padding: '0 12px',
                                borderRadius: 6,
                                border: 'none',
                                background: primaryColor,
                                color: isDark ? '#000' : '#fff',
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Elegir
                            </button>
                            {showCart && (
                              <button
                                onClick={() => !cartItems.includes(p.id) && onAddToCart?.(p)}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  border: `1px solid ${cartItems.includes(p.id) ? T.neonCyan + '60' : (isDark ? T.border : '#d4d4d4')}`,
                                  background: cartItems.includes(p.id) ? (isDark ? 'rgba(0,255,213,0.1)' : 'rgba(14,148,133,0.08)') : 'transparent',
                                  color: cartItems.includes(p.id) ? T.neonCyan : (isDark ? T.textSecondary : '#525252'),
                                  cursor: cartItems.includes(p.id) ? 'default' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0,
                                  flexShrink: 0,
                                }}
                                title={cartItems.includes(p.id) ? 'Ya en carrito' : 'Agregar al carrito'}
                              >
                                {cartItems.includes(p.id) ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((spec, rowIdx) => {
                    const winnerIdx = getWinnerIndex(spec);
                    return (
                      <tr
                        key={spec}
                        style={{
                          background: rowIdx % 2 === 0
                            ? 'transparent'
                            : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'),
                          ...fadeIn(0.03 * rowIdx, 0.3),
                        }}
                      >
                        <td
                          style={{
                            padding: '10px 12px',
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: 12,
                            fontWeight: 500,
                            color: isDark ? T.textMuted : '#737373',
                            whiteSpace: 'nowrap',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#fafafa'}`,
                          }}
                        >
                          {spec}
                        </td>
                        {products.map((p, colIdx) => {
                          const value = getSpecValue(p, spec);
                          const isWinner = winnerIdx === colIdx;
                          return (
                            <td
                              key={p.id}
                              style={{
                                padding: '10px 8px',
                                textAlign: 'center',
                                fontFamily: "'Rajdhani', sans-serif",
                                fontSize: 13,
                                fontWeight: isWinner ? 600 : 400,
                                color: isWinner ? primaryColor : (isDark ? T.textPrimary : '#404040'),
                                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#fafafa'}`,
                                background: colIdx % 2 === 1 ? colTint : 'transparent',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  justifyContent: 'center',
                                }}
                              >
                                {isWinner && (
                                  <Trophy
                                    className="w-3.5 h-3.5"
                                    style={{ color: trophyGreen, flexShrink: 0 }}
                                  />
                                )}
                                {value}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ====== FOOTER ====== */}
        <footer
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${isDark ? T.border : '#e5e5e5'}`,
            background: isDark ? T.bgCard : '#ffffff',
            flexShrink: 0,
          }}
        >
          {!showBestOption ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Limpiar comparación */}
              <button
                onClick={onClearAll}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  width: '100%', padding: '8px 0',
                  background: 'none', border: 'none',
                  color: isDark ? T.textMuted : '#a3a3a3',
                  fontSize: 13, fontFamily: "'Rajdhani', sans-serif",
                  cursor: 'pointer',
                }}
              >
                <Trash2 className="w-4 h-4" />
                Limpiar comparación
              </button>

              {/* Ver mejor opción */}
              <button
                onClick={() => setShowBestOption(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', height: 44, borderRadius: 12, border: 'none',
                  background: primaryColor, color: isDark ? '#000' : '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                <Trophy className="w-4 h-4" />
                Ver mejor opción
              </button>

              {/* Cerrar */}
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '10px 0',
                  background: 'none', border: 'none',
                  color: isDark ? T.textPrimary : '#171717',
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Limpiar */}
                <button
                  onClick={onClearAll}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '8px 0',
                    background: 'none', border: 'none',
                    color: isDark ? T.textMuted : '#a3a3a3',
                    fontSize: 13, fontFamily: "'Rajdhani', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar comparación
                </button>

                {/* Elegir ganador */}
                <button
                  onClick={() => onSelectProduct(bestProduct)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', height: 44, borderRadius: 12, border: 'none',
                    background: primaryColor, color: isDark ? '#000' : '#fff',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  Elegir ganador
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Cerrar */}
                <button
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', padding: '10px 0',
                    background: 'none', border: 'none',
                    color: isDark ? T.textPrimary : '#171717',
                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
