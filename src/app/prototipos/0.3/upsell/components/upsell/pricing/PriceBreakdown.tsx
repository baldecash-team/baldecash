'use client';

/**
 * PriceBreakdown - Desglose de precios
 *
 * D.8: Desglose siempre visible / tooltip / expandible
 */

import React, { useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Divider,
} from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Info, Laptop, Package, Shield } from 'lucide-react';
import { UpsellConfig } from '../../../types/upsell';

interface BreakdownItem {
  label: string;
  price: number;
  monthlyQuota: number;
  type: 'product' | 'accessory' | 'insurance';
}

interface PriceBreakdownProps {
  items: BreakdownItem[];
  totalPrice: number;
  totalMonthlyQuota: number;
  displayMode: UpsellConfig['breakdownDisplay'];
}

const getItemIcon = (type: BreakdownItem['type']) => {
  switch (type) {
    case 'product':
      return <Laptop className="w-4 h-4" />;
    case 'accessory':
      return <Package className="w-4 h-4" />;
    case 'insurance':
      return <Shield className="w-4 h-4" />;
  }
};

const BreakdownList: React.FC<{
  items: BreakdownItem[];
  totalPrice: number;
  totalMonthlyQuota: number;
}> = ({ items, totalPrice, totalMonthlyQuota }) => (
  <div className="space-y-2">
    {items.map((item, index) => (
      <div key={index} className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-neutral-600">
          {getItemIcon(item.type)}
          <span className="truncate max-w-[150px]">{item.label}</span>
        </div>
        <div className="text-right">
          <span className="font-medium text-neutral-800">
            S/{item.price.toLocaleString()}
          </span>
          <span className="text-xs text-neutral-400 ml-1">
            (+S/{item.monthlyQuota}/mes)
          </span>
        </div>
      </div>
    ))}
    <Divider className="my-2" />
    <div className="flex items-center justify-between">
      <span className="font-semibold text-neutral-800">Total</span>
      <div className="text-right">
        <span className="font-bold text-[#4654CD] font-['Baloo_2']">
          S/{totalPrice.toLocaleString()}
        </span>
        <span className="text-xs text-neutral-500 ml-1">
          (S/{totalMonthlyQuota}/mes)
        </span>
      </div>
    </div>
  </div>
);

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  items,
  totalPrice,
  totalMonthlyQuota,
  displayMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // V1: Always visible
  if (displayMode === 'always_visible') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white border border-neutral-200 rounded-xl"
      >
        <h4 className="text-sm font-semibold text-neutral-800 mb-3">
          Desglose de tu pedido
        </h4>
        <BreakdownList
          items={items}
          totalPrice={totalPrice}
          totalMonthlyQuota={totalMonthlyQuota}
        />
      </motion.div>
    );
  }

  // V2: Tooltip/hover
  if (displayMode === 'tooltip') {
    return (
      <div className="flex items-center gap-2">
        <div>
          <p className="text-sm text-neutral-500">Total</p>
          <p className="font-bold text-lg text-[#4654CD] font-['Baloo_2']">
            S/{totalPrice.toLocaleString()}
          </p>
        </div>
        <Popover placement="top">
          <PopoverTrigger>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="cursor-pointer"
            >
              <Info className="w-4 h-4 text-neutral-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 w-80">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">
              Desglose de tu pedido
            </h4>
            <BreakdownList
              items={items}
              totalPrice={totalPrice}
              totalMonthlyQuota={totalMonthlyQuota}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // V3: Expandable "Ver desglose"
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
      >
        <div>
          <p className="text-sm text-neutral-500 text-left">Total</p>
          <p className="font-bold text-lg text-[#4654CD] font-['Baloo_2']">
            S/{totalPrice.toLocaleString()}
            <span className="text-sm font-normal text-neutral-500 ml-1">
              (S/{totalMonthlyQuota}/mes)
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm text-neutral-500">
          <span>{isExpanded ? 'Ocultar' : 'Ver desglose'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-neutral-100">
              <BreakdownList
                items={items}
                totalPrice={totalPrice}
                totalMonthlyQuota={totalMonthlyQuota}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceBreakdown;
