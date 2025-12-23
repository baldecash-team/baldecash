'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ShoppingCart, Heart, GraduationCap, Gamepad2, Palette, Briefcase, Code, Zap, BatteryFull, Feather, Eye, GitCompare } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CatalogProduct,
  ImageGalleryVersion,
  GallerySizeVersion,
  TagDisplayVersion,
  UsageType,
  TermMonths,
  termOptions,
  PricingMode,
  InitialPaymentPercent,
  initialOptions,
  initialLabels,
  calculateQuotaWithInitial,
} from '../../../types/catalog';
import { ImageGallery } from '../ImageGallery';
import { ProductTags } from '../ProductTags';

interface ProductCardV2Props {
  product: CatalogProduct;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  onViewDetail?: () => void;
  onMouseEnter?: () => void;
  isFavorite?: boolean;
  imageGalleryVersion?: ImageGalleryVersion;
  gallerySizeVersion?: GallerySizeVersion;
  tagDisplayVersion?: TagDisplayVersion;
  pricingMode?: PricingMode;
  defaultTerm?: TermMonths;
  defaultInitial?: InitialPaymentPercent;
  // Compare props
  onCompare?: () => void;
  isCompareSelected?: boolean;
  compareDisabled?: boolean;
}

const usageIcons: Record<UsageType, React.ReactNode> = {
  estudios: <GraduationCap className="w-3.5 h-3.5" />,
  gaming: <Gamepad2 className="w-3.5 h-3.5" />,
  'diseño': <Palette className="w-3.5 h-3.5" />,
  oficina: <Briefcase className="w-3.5 h-3.5" />,
  programacion: <Code className="w-3.5 h-3.5" />,
};

const usageLabels: Record<UsageType, string> = {
  estudios: 'Estudios',
  gaming: 'Gaming',
  'diseño': 'Diseño',
  oficina: 'Oficina',
  programacion: 'Programación',
};

const usageColors: Record<UsageType, { bg: string; text: string }> = {
  estudios: { bg: 'bg-blue-50', text: 'text-blue-600' },
  gaming: { bg: 'bg-red-50', text: 'text-red-600' },
  'diseño': { bg: 'bg-purple-50', text: 'text-purple-600' },
  oficina: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  programacion: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

/**
 * ProductCardV2 - Enfoque Beneficios (Lifestyle)
 * Muestra uso recomendado prominentemente, sin specs técnicas visibles
 * Tono emocional y aspiracional
 * Referencia: Apple Store, Samsung
 */
export const ProductCardV2: React.FC<ProductCardV2Props> = ({
  product,
  onAddToCart,
  onFavorite,
  onViewDetail,
  onMouseEnter,
  isFavorite = false,
  imageGalleryVersion = 1,
  gallerySizeVersion = 2,
  tagDisplayVersion = 1,
  pricingMode = 'interactive',
  defaultTerm = 24,
  defaultInitial = 10,
  onCompare,
  isCompareSelected = false,
  compareDisabled = false,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermMonths>(defaultTerm);
  const [selectedInitial, setSelectedInitial] = useState<InitialPaymentPercent>(defaultInitial);
  const { quota, initialAmount } = calculateQuotaWithInitial(product.price, selectedTerm, selectedInitial);

  // Generar beneficios basados en specs
  const benefits: { icon: React.ReactNode; text: string }[] = [];

  if (product.specs.battery) {
    benefits.push({ icon: <BatteryFull className="w-3.5 h-3.5" />, text: `${product.specs.battery.life} de batería` });
  }
  if (product.specs.dimensions.weight < 1.8) {
    benefits.push({ icon: <Feather className="w-3.5 h-3.5" />, text: 'Ultraligera' });
  }
  if (product.specs.display.refreshRate >= 120) {
    benefits.push({ icon: <Zap className="w-3.5 h-3.5" />, text: `Pantalla ${product.specs.display.refreshRate}Hz` });
  }
  if (product.specs.keyboard.backlit) {
    benefits.push({ icon: <Zap className="w-3.5 h-3.5" />, text: 'Teclado retroiluminado' });
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all overflow-hidden">
        <CardBody className="p-0">
          {/* Image with gradient overlay */}
          <div className="relative">
            <ImageGallery
              images={[product.thumbnail, ...product.images.slice(0, 3)]}
              alt={product.displayName}
              version={imageGalleryVersion}
              sizeVersion={gallerySizeVersion}
            />

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="absolute top-3 left-3 z-10">
                <ProductTags tags={product.tags} version={tagDisplayVersion} />
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.();
                }}
                className="p-2 rounded-full bg-white/90 hover:bg-[#4654CD]/10 shadow-md cursor-pointer transition-all"
              >
                <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#4654CD] text-[#4654CD]' : 'text-neutral-400 hover:text-[#4654CD]'}`} />
              </button>
              {/* Compare button */}
              {onCompare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!compareDisabled || isCompareSelected) {
                      onCompare();
                    }
                  }}
                  disabled={compareDisabled && !isCompareSelected}
                  className={`p-2 rounded-full shadow-md transition-all ${
                    isCompareSelected
                      ? 'bg-[#4654CD] text-white'
                      : compareDisabled
                        ? 'bg-white/50 text-neutral-300 cursor-not-allowed'
                        : 'bg-white/90 hover:bg-[#4654CD]/10 cursor-pointer'
                  }`}
                  title={compareDisabled && !isCompareSelected ? 'Máximo 3 productos' : isCompareSelected ? 'Quitar de comparación' : 'Agregar a comparación'}
                >
                  <GitCompare className={`w-4 h-4 transition-colors ${isCompareSelected ? 'text-white' : compareDisabled ? 'text-neutral-300' : 'text-neutral-400 hover:text-[#4654CD]'}`} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Usage tags prominentes */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.usage.slice(0, 3).map((usage) => {
                const colors = usageColors[usage];
                return (
                  <Chip
                    key={usage}
                    size="sm"
                    radius="sm"
                    startContent={usageIcons[usage]}
                    classNames={{
                      base: `${colors.bg} px-2 py-0.5 h-auto`,
                      content: `${colors.text} text-[10px] font-medium flex items-center gap-1`,
                    }}
                  >
                    {usageLabels[usage]}
                  </Chip>
                );
              })}
            </div>

            {/* Brand & Title */}
            <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{product.brand}</p>
            <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-3 min-h-[40px]">
              {product.displayName}
            </h3>

            {/* Benefits (no specs) */}
            <div className="space-y-1.5 mb-4">
              {benefits.slice(0, 3).map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                  <span className="text-[#4654CD]">{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Cuota y selector de plazo */}
            <div className="bg-[#4654CD]/5 rounded-lg p-3 mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#4654CD]">
                  S/{quota}
                </span>
                <span className="text-sm text-neutral-500">/mes</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 mb-2">
                en {selectedTerm} meses
                {selectedInitial > 0 && ` · inicial S/${initialAmount}`}
              </p>
              {pricingMode === 'interactive' && (
                <div className="space-y-2">
                  {/* Selector de plazo */}
                  <div className="flex flex-wrap gap-1">
                    {termOptions.map((term) => (
                      <button
                        key={term}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTerm(term);
                        }}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer transition-all ${
                          selectedTerm === term
                            ? 'bg-[#4654CD] text-white'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {term}m
                      </button>
                    ))}
                  </div>
                  {/* Selector de inicial */}
                  <div className="flex flex-wrap gap-1">
                    {initialOptions.map((initial) => {
                      const amount = Math.round(product.price * (initial / 100));
                      const label = initial === 0 ? 'Sin inicial' : `S/${amount}`;
                      return (
                        <button
                          key={initial}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInitial(initial);
                          }}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer transition-all ${
                            selectedInitial === initial
                              ? 'bg-[#03DBD0] text-white'
                              : 'bg-white text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Stock indicator */}
            {product.stock === 'limited' && (
              <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Últimas unidades disponibles
              </p>
            )}

            {/* CTAs */}
            <div className="flex gap-2">
              <Button
                variant="bordered"
                className="flex-1 border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD]/5"
                startContent={<Eye className="w-4 h-4" />}
                onPress={onViewDetail}
              >
                Detalle
              </Button>
              <Button
                className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
                startContent={<ShoppingCart className="w-4 h-4" />}
                onPress={onAddToCart}
              >
                Lo quiero
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
