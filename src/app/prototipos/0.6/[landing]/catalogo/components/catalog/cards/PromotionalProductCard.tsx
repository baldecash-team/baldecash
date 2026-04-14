'use client';

/**
 * PromotionalProductCard — Card variant for products with an active promotion.
 * Renders a dynamic banner (top_bar or ribbon_corner) based on PromotionTemplate,
 * simplified layout (no specs, no compare/favorite), with "Ver cronograma" / "Ver características" links.
 */

import React, { useState } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Flame, Siren, Zap, Star, Gift, ChevronRight, type LucideProps } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CatalogProduct,
  CartItem,
  TermMonths,
  InitialPaymentPercent,
  calculateQuotaWithInitial,
} from '../../../types/catalog';
import { formatMoneyNoDecimals } from '../../../utils/formatMoney';

const BANNER_ICONS: Record<string, React.FC<LucideProps>> = {
  fire: Flame,
  siren: Siren,
  lightning: Zap,
  star: Star,
  gift: Gift,
};

interface PromotionalProductCardProps {
  product: CatalogProduct;
  onAddToCart?: (item: CartItem) => void;
  onViewDetail?: (slug?: string) => void;
}

// Term and initial selectors
const TERM_OPTIONS: TermMonths[] = [6, 12, 18, 24];
const INITIAL_OPTIONS: { label: string; value: InitialPaymentPercent }[] = [
  { label: 'S/0', value: 0 },
  { label: '10%', value: 10 },
  { label: '20%', value: 20 },
];

export const PromotionalProductCard: React.FC<PromotionalProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetail,
}) => {
  const template = product.promotion?.template;
  const [selectedTerm, setSelectedTerm] = useState<TermMonths>(product.maxTermMonths as TermMonths);
  const [selectedInitial, setSelectedInitial] = useState<InitialPaymentPercent>(0);

  const { quota, initialAmount } = calculateQuotaWithInitial(product.price, selectedTerm, selectedInitial);
  const originalQuota = product.originalQuotaMonthly;

  // Border and banner colors
  const borderColor = template?.borderColor || 'var(--color-primary)';
  const bannerBg = template?.bannerBgColor || 'var(--color-primary)';
  const bannerTextColor = template?.bannerTextColor || '#FFFFFF';

  // Banner icon
  const IconComponent = template?.bannerIcon ? BANNER_ICONS[template.bannerIcon] : null;

  // CTA style
  const ctaText = template?.ctaText || '¡La quiero!';
  const isGoldenCta = template?.ctaStyle === 'golden';

  const createCartItem = (): CartItem => ({
    productId: product.id,
    slug: product.slug,
    name: product.displayName,
    shortName: product.name,
    brand: product.brand,
    price: product.price,
    image: product.thumbnail,
    type: product.deviceType,
    months: selectedTerm,
    initialPercent: selectedInitial,
    initialAmount,
    monthlyPayment: quota,
    addedAt: Date.now(),
  });

  // Render top_bar banner
  const renderTopBarBanner = () => (
    <div
      className="w-full py-2.5 px-4 flex items-center justify-center gap-2 rounded-t-xl"
      style={{ backgroundColor: bannerBg }}
    >
      {IconComponent && <IconComponent className="w-5 h-5" color={bannerTextColor} />}
      <span className="text-lg font-black tracking-wider" style={{ color: bannerTextColor }}>
        {template?.bannerText || 'OFERTA'}
      </span>
      {IconComponent && <IconComponent className="w-5 h-5" color={bannerTextColor} />}
    </div>
  );

  // Render ribbon_corner banner
  const renderRibbonBanner = () => (
    <div className="absolute top-0 left-0 z-10">
      <div
        className="px-4 py-1.5 text-sm font-black rounded-tl-xl rounded-br-xl shadow-md"
        style={{ backgroundColor: bannerBg, color: bannerTextColor }}
      >
        {IconComponent && <IconComponent className="w-4 h-4 inline mr-1" />}
        {template?.bannerText || 'OFERTA'}
      </div>
    </div>
  );

  const isTopBar = template?.bannerStyle === 'top_bar' || !template?.bannerStyle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card
        className="w-full overflow-hidden"
        style={{
          border: `3px solid ${borderColor}`,
          borderRadius: '0.75rem',
        }}
        shadow="md"
      >
        <CardBody className="p-0">
          {/* Banner */}
          {isTopBar ? renderTopBarBanner() : renderRibbonBanner()}

          {/* Product image */}
          <div className="relative w-full h-[200px] sm:h-[220px] flex items-center justify-center p-4 bg-white">
            {!isTopBar && renderRibbonBanner()}
            <img
              src={product.thumbnail}
              alt={product.displayName}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-center px-4 sm:px-5 pb-5 pt-2 text-center">
            {/* Reference text */}
            <p className="text-xs text-neutral-400 mb-1">Imagen referencial</p>

            {/* Product name */}
            <h3
              className="text-sm sm:text-base font-bold text-[var(--color-primary)] mb-4 line-clamp-3 cursor-pointer hover:underline min-h-[3rem]"
              onClick={() => onViewDetail?.(product.slug)}
            >
              {product.displayName}
            </h3>

            {/* Pricing */}
            <div className="w-full mb-4">
              {/* Original quota (struck through) */}
              <p className="text-sm text-neutral-400">
                Cuota Regular{' '}
                {originalQuota && originalQuota > quota ? (
                  <span className="line-through">S/{formatMoneyNoDecimals(Math.floor(originalQuota))}</span>
                ) : null}
              </p>
              {/* Promotional quota */}
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-[var(--color-primary)]">
                  S/{formatMoneyNoDecimals(Math.floor(quota))}
                </span>
              </div>
              <p className="text-base text-neutral-600 font-medium">mensual</p>
            </div>

            {/* Term and Initial selectors */}
            <div className="w-full grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Plazo</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(Number(e.target.value) as TermMonths)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {TERM_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t} meses</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Cuota inicial</label>
                <select
                  value={selectedInitial}
                  onChange={(e) => setSelectedInitial(Number(e.target.value) as InitialPaymentPercent)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {INITIAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onAddToCart?.(createCartItem())}
              className={`w-full py-3 rounded-full font-bold text-lg mb-4 transition-all ${
                isGoldenCta
                  ? 'bg-amber-400 hover:bg-amber-500 text-neutral-800'
                  : 'bg-[var(--color-primary)] hover:brightness-90 text-white'
              }`}
            >
              {ctaText}
            </button>

            {/* Links */}
            {template?.showLinks !== false && (
              <div className="space-y-2 w-full">
                <button
                  onClick={() => onViewDetail?.(product.slug)}
                  className="flex items-center justify-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline w-full"
                >
                  Ver cronograma <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewDetail?.(product.slug)}
                  className="flex items-center justify-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline w-full"
                >
                  Ver características <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default PromotionalProductCard;
