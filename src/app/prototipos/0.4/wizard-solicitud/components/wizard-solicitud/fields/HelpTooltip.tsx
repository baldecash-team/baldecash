'use client';

/**
 * HelpTooltip Components - BaldeCash Web 4.0
 * 6 versiones de tooltips de ayuda según C1.28
 */

import React, { useState } from 'react';
import { Tooltip, Popover, PopoverTrigger, PopoverContent, Button } from '@nextui-org/react';
import { HelpCircle, Info, X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HelpTooltipProps {
  content: string;
  title?: string;
}

// V1: Tooltip hover clásico - Rápido y no intrusivo
export const HelpTooltipV1: React.FC<HelpTooltipProps> = ({ content }) => (
  <Tooltip
    content={content}
    placement="top"
    delay={200}
    closeDelay={0}
    classNames={{
      content: 'bg-neutral-800 text-white text-xs py-2 px-3 rounded-lg max-w-[200px] shadow-lg',
    }}
  >
    <button type="button" className="inline-flex items-center text-neutral-400 hover:text-[#4654CD] transition-colors shrink-0">
      <HelpCircle className="w-4 h-4" />
    </button>
  </Tooltip>
);

// V2: Popover click - Para contenido más largo
export const HelpTooltipV2: React.FC<HelpTooltipProps> = ({ content, title }) => (
  <Popover placement="top" showArrow>
    <PopoverTrigger>
      <button type="button" className="inline-flex items-center text-neutral-400 hover:text-[#4654CD] transition-colors shrink-0">
        <Info className="w-4 h-4" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="max-w-[240px]">
      <div className="p-2">
        {title && <p className="text-sm font-medium text-neutral-800 mb-1">{title}</p>}
        <p className="text-xs text-neutral-600 leading-relaxed">{content}</p>
      </div>
    </PopoverContent>
  </Popover>
);

// V3: Texto inline expandible - Visible pero discreto
export const HelpTooltipV3: React.FC<HelpTooltipProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-[#4654CD] transition-colors"
      >
        <MessageCircle className="w-3 h-3" />
        <span>{isExpanded ? 'Ocultar ayuda' : 'Ver ayuda'}</span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-neutral-500 mt-1.5 pl-4 border-l-2 border-[#4654CD]/20">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// V4: Badge con icono - Compacto y moderno
export const HelpTooltipV4: React.FC<HelpTooltipProps> = ({ content }) => (
  <Tooltip
    content={content}
    placement="right"
    delay={100}
    classNames={{
      content: 'bg-[#4654CD] text-white text-xs py-2 px-3 rounded-lg max-w-[180px] shadow-lg',
    }}
  >
    <span className="inline-flex items-center justify-center w-4 h-4 bg-neutral-100 hover:bg-[#4654CD]/10 rounded-full cursor-help transition-colors">
      <span className="text-[10px] font-bold text-neutral-400">?</span>
    </span>
  </Tooltip>
);

// V5: Drawer/panel lateral - Para ayuda extensa
export const HelpTooltipV5: React.FC<HelpTooltipProps> = ({ content, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center text-neutral-400 hover:text-[#4654CD] transition-colors shrink-0"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-800">{title || 'Ayuda'}</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-neutral-100 rounded">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">{content}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// V6: Toast/snackbar temporal - Para tips rápidos
export const HelpTooltipV6: React.FC<HelpTooltipProps> = ({ content }) => {
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center text-neutral-400 hover:text-[#4654CD] transition-colors shrink-0"
      >
        <Info className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] bg-neutral-800 text-white text-sm py-3 px-4 rounded-xl shadow-xl max-w-[280px]"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#03DBD0] shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Mapeo de versiones
export const HelpTooltipVersions = {
  1: HelpTooltipV1,
  2: HelpTooltipV2,
  3: HelpTooltipV3,
  4: HelpTooltipV4,
  5: HelpTooltipV5,
  6: HelpTooltipV6,
};

export const getHelpTooltip = (version: 1 | 2 | 3 | 4 | 5 | 6) => HelpTooltipVersions[version];

export default HelpTooltipV1;
