'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { ShoppingCart, Heart, Cpu, MemoryStick, GraduationCap, Gamepad2, Palette, Briefcase, Code, Check, Eye, GitCompare } from 'lucide-react';
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

interface ProductCardV3Props {
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
  estudios: <GraduationCap className="w-3 h-3" />,
  gaming: <Gamepad2 className="w-3 h-3" />,
  'diseño': <Palette className="w-3 h-3" />,
  oficina: <Briefcase className="w-3 h-3" />,
  programacion: <Code className="w-3 h-3" />,
};

const usageLabels: Record<UsageType, string> = {
  estudios: 'Estudios',
  gaming: 'Gaming',
  'diseño': 'Diseño',
  oficina: 'Oficina',
  programacion: 'Programación',
};

/**
 * ProductCardV3 - Híbrido Flat
 * Balance entre specs y beneficios: 2 specs + 2 usos recomendados
 * Fondo sutil, iconos flat, líneas limpias
 * Referencia: Notion, Stripe
 */
export const ProductCardV3: React.FC<ProductCardV3Props> = ({
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

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
    >
      <Card className="h-full border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all bg-gradient-to-b from-[#f8fafc] to-white">
        <CardBody className="p-4">
          {/* Top row: Brand + Actions */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-neutral-400 uppercase tracking-wide">{product.brand}</p>
            <div className="flex items-center gap-1">
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
                  className={`p-1.5 rounded-full transition-colors ${
                    isCompareSelected
                      ? 'bg-[#4654CD] text-white'
                      : compareDisabled
                        ? 'text-neutral-200 cursor-not-allowed'
                        : 'hover:bg-[#4654CD]/10 cursor-pointer'
                  }`}
                  title={compareDisabled && !isCompareSelected ? 'Máximo 3 productos' : isCompareSelected ? 'Quitar de comparación' : 'Agregar a comparación'}
                >
                  <GitCompare className={`w-4 h-4 transition-colors ${isCompareSelected ? 'text-white' : compareDisabled ? 'text-neutral-200' : 'text-neutral-300 hover:text-[#4654CD]'}`} />
                </button>
              )}
              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.();
                }}
                className="p-1.5 rounded-full hover:bg-[#4654CD]/10 cursor-pointer transition-colors"
              >
                <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#4654CD] text-[#4654CD]' : 'text-neutral-300 hover:text-[#4654CD]'}`} />
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="relative mb-4">
            <ImageGallery
              images={[product.thumbnail, ...product.images.slice(0, 3)]}
              alt={product.displayName}
              version={imageGalleryVersion}
              sizeVersion={gallerySizeVersion}
            />

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="absolute top-2 left-2 z-10">
                <ProductTags tags={product.tags} version={tagDisplayVersion} />
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-neutral-800 text-sm line-clamp-2 mb-3 min-h-[40px]">
            {product.displayName}
          </h3>

          {/* Hybrid: 2 specs + divider + 2 usage */}
          <div className="bg-white rounded-lg border border-neutral-100 p-3 mb-4">
            {/* 2 Key Specs */}
            <div className="flex items-center gap-4 mb-2 pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Cpu className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>{product.specs.processor.brand === 'intel' ? 'Intel' : 'AMD'} {product.specs.processor.model.split(' ').pop()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <MemoryStick className="w-3.5 h-3.5 text-[#4654CD]" />
                <span>{product.specs.ram.size}GB</span>
              </div>
            </div>

            {/* 2 Usage tags */}
            <div className="flex flex-wrap gap-1.5">
              {product.usage.slice(0, 2).map((usage) => (
                <div
                  key={usage}
                  className="flex items-center gap-1 text-xs text-neutral-500"
                >
                  <Check className="w-3 h-3 text-[#22c55e]" />
                  <span className="flex items-center gap-1">
                    {usageIcons[usage]}
                    {usageLabels[usage]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cuota y plazo */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#4654CD]">S/{quota}</span>
              <span className="text-xs text-neutral-400">/mes</span>
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
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Stock limitado
            </p>
          )}

          {/* CTAs */}
          <div className="flex gap-2">
            <Button
              variant="bordered"
              size="sm"
              className="flex-1 border-[#4654CD] text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD]/5"
              startContent={<Eye className="w-3.5 h-3.5" />}
              onPress={onViewDetail}
            >
              Detalle
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
              startContent={<ShoppingCart className="w-3.5 h-3.5" />}
              onPress={onAddToCart}
            >
              Lo quiero
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
