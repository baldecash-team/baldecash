'use client';

/**
 * ProductInfoHeaderV6 - Stacked Cards Layout
 *
 * Vertically stacked, tappable cards that expand
 * on interaction. Mobile-first accordion-style
 * with visual depth.
 */

import React, { useState } from 'react';
import { Star, ChevronDown, Cpu, MemoryStick, HardDrive, Monitor, Battery, Shield, Truck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductInfoHeaderProps } from '../../../types/detail';

type CardType = 'specs' | 'price' | 'benefits' | null;

export const ProductInfoHeaderV6: React.FC<ProductInfoHeaderProps> = ({ product }) => {
  const [expandedCard, setExpandedCard] = useState<CardType>(null);

  const toggleCard = (card: CardType) => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  const specs = [
    { icon: Cpu, label: 'Procesador', value: 'Ryzen 5' },
    { icon: MemoryStick, label: 'RAM', value: '8GB' },
    { icon: HardDrive, label: 'Almacenamiento', value: '256GB SSD' },
    { icon: Monitor, label: 'Pantalla', value: '15.6" FHD' },
    { icon: Battery, label: 'Batería', value: product.batteryLife || '8h' },
  ];

  const benefits = [
    { icon: Shield, label: 'Garantía extendida', desc: '1 año de cobertura total' },
    { icon: Truck, label: 'Envío gratis', desc: 'A todo el Perú' },
    { icon: CreditCard, label: 'Sin tarjeta', desc: 'Solo necesitas tu DNI' },
  ];

  return (
    <div className="space-y-3">
      {/* Header - Always Visible */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-[#4654CD] text-white text-xs font-bold rounded-lg">
            {product.brand}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-neutral-700">{product.rating}</span>
            <span className="text-xs text-neutral-400">({product.reviewCount})</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-neutral-900 font-['Baloo_2'] leading-snug mb-3">
          {product.displayName}
        </h1>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-600 font-medium">{product.stock} disponibles</span>
        </div>
      </div>

      {/* Stacked Card: Specs */}
      <div
        className={`bg-white rounded-2xl border overflow-hidden transition-all ${
          expandedCard === 'specs'
            ? 'border-[#4654CD] shadow-lg shadow-[#4654CD]/10'
            : 'border-neutral-200'
        }`}
      >
        <button
          onClick={() => toggleCard('specs')}
          className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-neutral-800">Especificaciones</p>
              <p className="text-xs text-neutral-500">Ryzen 5 • 8GB • 256GB SSD</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-neutral-400 transition-transform ${
              expandedCard === 'specs' ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {expandedCard === 'specs' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                {specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"
                    >
                      <Icon className="w-5 h-5 text-[#4654CD]" />
                      <div>
                        <p className="text-[10px] text-neutral-500 uppercase">{spec.label}</p>
                        <p className="text-sm font-bold text-neutral-800">{spec.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stacked Card: Price */}
      <div
        className={`bg-gradient-to-r from-[#4654CD] to-[#6B7AE5] rounded-2xl border overflow-hidden transition-all ${
          expandedCard === 'price'
            ? 'border-[#4654CD] shadow-lg shadow-[#4654CD]/20'
            : 'border-transparent'
        }`}
      >
        <button
          onClick={() => toggleCard('price')}
          className="w-full p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-lg font-black">S/</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-white/70">Cuota mensual desde</p>
              <p className="text-2xl font-black text-white">S/{product.lowestQuota}/mes</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-white/60 transition-transform ${
              expandedCard === 'price' ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {expandedCard === 'price' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[12, 24, 36].map((months) => (
                    <div
                      key={months}
                      className="p-3 bg-white/10 rounded-xl text-center"
                    >
                      <p className="text-lg font-bold text-white">
                        S/{Math.round(product.lowestQuota * (36 / months) * (months === 12 ? 0.9 : months === 24 ? 0.95 : 1))}
                      </p>
                      <p className="text-[10px] text-white/60">{months} meses</p>
                    </div>
                  ))}
                </div>
                {product.originalQuota && (
                  <div className="flex items-center justify-center gap-2 py-2 bg-emerald-500/20 rounded-lg">
                    <span className="text-sm text-white/80 line-through">S/{product.originalQuota}</span>
                    <span className="px-2 py-0.5 bg-emerald-400 text-emerald-900 text-xs font-bold rounded">
                      -{Math.round(((product.originalQuota - product.lowestQuota) / product.originalQuota) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stacked Card: Benefits */}
      <div
        className={`bg-white rounded-2xl border overflow-hidden transition-all ${
          expandedCard === 'benefits'
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
            : 'border-neutral-200'
        }`}
      >
        <button
          onClick={() => toggleCard('benefits')}
          className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-neutral-800">Beneficios incluidos</p>
              <p className="text-xs text-neutral-500">Garantía • Envío gratis • Sin tarjeta</p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-neutral-400 transition-transform ${
              expandedCard === 'benefits' ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {expandedCard === 'benefits' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-800">{benefit.label}</p>
                        <p className="text-xs text-neutral-500">{benefit.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductInfoHeaderV6;
