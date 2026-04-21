'use client';

import React, { useState } from 'react';
import {
  Heart,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Eye,
  GitCompareArrows,
  Check,
} from 'lucide-react';

import { type GamerTheme, BADGE_COLORS } from './gamerTheme';
import type { CatalogProduct } from '../../types/catalog';

interface GamerProductCardProps {
  product: CatalogProduct;
  isDark: boolean;
  T: GamerTheme;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  isCompared: boolean;
  onCompare: () => void;
  onDetail: () => void;
  onSolicitar: () => void;
  isInCart?: boolean;
  isFirstCard?: boolean;
}

export function GamerProductCard({
  product,
  isDark,
  T,
  isWishlisted,
  onWishlistToggle,
  isCompared,
  onCompare,
  onDetail,
  onSolicitar,
  isInCart = false,
  isFirstCard = false,
}: GamerProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Spec items helper
  const specItems: { icon: React.ReactNode; label: string }[] = [];
  if (product.specs?.processor?.model) {
    specItems.push({ icon: <Cpu className="w-3.5 h-3.5 shrink-0" />, label: product.specs.processor.model });
  }
  if (product.specs?.ram?.size && String(product.specs.ram.size) !== 'null') {
    specItems.push({ icon: <MemoryStick className="w-3.5 h-3.5 shrink-0" />, label: `${product.specs.ram.size}GB DDR${product.specs.ram.type?.includes('5') ? '5' : '4'}` });
  }
  if (product.specs?.storage?.size && String(product.specs.storage.size) !== 'null') {
    specItems.push({ icon: <HardDrive className="w-3.5 h-3.5 shrink-0" />, label: `${product.specs.storage.size}GB ${product.specs.storage.type ? product.specs.storage.type.toUpperCase() : 'SSD'}` });
  }
  if (product.specs?.gpu?.model && String(product.specs.gpu.model) !== 'null') {
    specItems.push({ icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/><path d="M6 2v4"/><path d="M10 2v4"/><path d="M14 2v4"/><path d="M18 2v4"/></svg>, label: `${product.specs.gpu.model}${product.specs.gpu.vram ? ` ${product.specs.gpu.vram}GB` : ''}` });
  }
  if (product.specs?.display?.size && String(product.specs.display.size) !== 'null') {
    specItems.push({ icon: <Monitor className="w-3.5 h-3.5 shrink-0" />, label: `${product.specs.display.size}" ${product.specs.display.resolution || 'FHD'} ${product.specs.display.refreshRate ? product.specs.display.refreshRate + 'Hz' : ''} ${product.specs.display.type || ''}`.replace(/null/gi, '').trim() });
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col"
      style={{
        background: T.bgCard,
        border: `1px solid ${isHovered ? T.neonCyan + '40' : T.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        transform: isHovered ? 'translateY(-3px)' : 'none',
        boxShadow: isHovered ? `0 8px 24px ${T.neonCyan}18` : 'none',
      }}
    >
      {/* ====== IMAGE AREA ====== */}
      <div
        className="relative"
        style={{
          background: isDark
            ? `linear-gradient(180deg, ${T.bgSurface}, ${T.bgCard})`
            : `linear-gradient(180deg, #f0f0f5, #ffffff)`,
          padding: '20px 20px 12px',
        }}
      >
        {/* Badges top-left */}
        {product.tags.length > 0 && (
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
            {product.tags.slice(0, 2).map((tag) => {
              const colors = BADGE_COLORS[tag] || { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.55)' };
              return (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    background: colors.bg,
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    color: colors.text,
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 6,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: 0.5,
                    border: `1px solid ${colors.border}`,
                    boxShadow: `0 0 10px ${colors.bg}`,
                  }}
                >
                  {tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              );
            })}
          </div>
        )}

        {/* Action buttons top-right */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-favorite' } : {})}
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(); }}
            className="flex items-center justify-center transition-all"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: isWishlisted
                ? (isDark ? 'rgba(255,0,85,0.15)' : 'rgba(255,0,85,0.1)')
                : (isDark ? 'rgba(10,10,20,0.6)' : 'rgba(255,255,255,0.9)'),
              backdropFilter: 'blur(8px)',
              border: isWishlisted
                ? `1.5px solid ${isDark ? 'rgba(255,0,85,0.3)' : 'rgba(255,0,85,0.3)'}`
                : (isDark ? 'none' : '1.5px solid rgba(0,0,0,0.15)'),
              boxShadow: isWishlisted
                ? '0 0 12px rgba(255,0,85,0.2)'
                : (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'),
              cursor: 'pointer',
              color: isWishlisted ? '#ff0055' : (isDark ? 'rgba(255,255,255,0.4)' : '#555'),
            }}
            title="Favorito"
          >
            <Heart
              className="w-5 h-5"
              style={{
                fill: isWishlisted ? '#ff0055' : 'none',
              }}
            />
          </button>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-compare' } : {})}
            onClick={(e) => { e.stopPropagation(); onCompare(); }}
            className="flex items-center justify-center transition-all"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: isCompared
                ? `${T.neonCyan}30`
                : (isDark ? 'rgba(10,10,20,0.6)' : 'rgba(255,255,255,0.9)'),
              backdropFilter: 'blur(8px)',
              border: isCompared
                ? `2px solid ${T.neonCyan}`
                : (isDark ? 'none' : '1.5px solid rgba(0,0,0,0.15)'),
              boxShadow: isCompared
                ? `0 0 12px ${T.neonCyan}40`
                : (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'),
              cursor: 'pointer',
              color: isCompared ? T.neonCyan : (isDark ? 'rgba(255,255,255,0.4)' : '#555'),
            }}
            title={isCompared ? 'Quitar de comparación' : 'Comparar'}
          >
            <GitCompareArrows className="w-5 h-5" />
          </button>
        </div>

        {/* Product image — prioritize images array like normal catalog */}
        <img
          src={(product.images.length > 0 ? product.images[0] : product.thumbnail) || '/images/products/placeholder.jpg'}
          alt={product.displayName}
          loading="lazy"
          className="object-contain block mx-auto"
          style={{ width: '100%', height: 176 }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/placeholder.jpg'; }}
        />

      </div>

      {/* ====== CARD BODY ====== */}
      <div style={{ padding: '12px 16px 0', flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
        {/* Brand */}
        <p
          style={{
            fontSize: 12,
            color: T.neonCyan,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 4,
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          {product.brand}
        </p>

        {/* Product name */}
        <h3
          onClick={onDetail}
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: "'Rajdhani', sans-serif",
            lineHeight: 1.3,
            margin: '0 0 12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '3.5rem',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
        >
          {product.displayName}
        </h3>

        {/* Specs centered with icons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100, marginBottom: 16 }}>
          {specItems.map((spec, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-2"
              style={{
                color: T.textSecondary,
                fontSize: 12,
              }}
            >
              <span style={{ color: T.neonCyan, display: 'flex' }}>{spec.icon}</span>
              <span>{spec.label}</span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 16 }} />

        {/* Price box */}
        <div
          style={{
            background: isDark ? 'rgba(0,255,213,0.05)' : 'rgba(0,179,150,0.05)',
            borderRadius: 16,
            padding: '16px 24px',
            marginBottom: 16,
          }}
        >
          {/* Label */}
          <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Cuota mensual</span>
          </div>
          {/* Main price */}
          <div className="flex items-baseline justify-center gap-0.5" style={{ marginTop: 4 }}>
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 30,
                fontWeight: 900,
                color: T.neonCyan,
              }}
            >
              S/{product.quotaMonthly}
            </span>
            <span
              style={{
                fontSize: 18,
                color: T.textMuted,
              }}
            >
              /mes
            </span>
          </div>
          {/* Sub info */}
          <p
            style={{
              fontSize: 12,
              color: T.textMuted,
              marginTop: 8,
            }}
          >
            en {product.maxTermMonths || 24} meses{product.hookInitialPercent && product.hookInitialPercent > 0 ? ` · inicial ${product.hookInitialPercent}%` : ' · sin inicial'}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-detail' } : {})}
            onClick={onDetail}
            className="flex items-center justify-center gap-2 transition-all"
            style={{
              height: 48,
              background: 'transparent',
              border: `2px solid ${T.neonCyan}`,
              borderRadius: 12,
              color: T.neonCyan,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            <Eye className="w-5 h-5 shrink-0" />
            Detalle
          </button>
          <button
            {...(isFirstCard ? { id: 'onboarding-card-add-to-cart' } : {})}
            onClick={onSolicitar}
            className="flex items-center justify-center gap-2 transition-all"
            style={{
              height: 48,
              backgroundColor: isInCart ? (isDark ? '#1a3a35' : '#e6faf7') : T.neonCyan,
              border: isInCart ? `1px solid ${T.neonCyan}60` : 'none',
              borderRadius: 12,
              color: isInCart ? T.neonCyan : (isDark ? '#0a0a0a' : '#fff'),
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            {isInCart ? <><Check className="w-4 h-4" /> En carrito</> : 'Lo quiero'}
          </button>
        </div>
      </div>
    </div>
  );
}
