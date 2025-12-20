'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Navigation, Info, Keyboard } from 'lucide-react';

interface ShortcutToastProps {
  message: string | null;
  type?: 'version' | 'navigation' | 'info';
}

const typeConfig = {
  version: { icon: Layers, bg: 'bg-[#4654CD]', text: 'text-white' },
  navigation: { icon: Navigation, bg: 'bg-neutral-800', text: 'text-white' },
  info: { icon: Info, bg: 'bg-white', text: 'text-neutral-800' },
};

export const ShortcutToast: React.FC<ShortcutToastProps> = ({ message, type = 'info' }) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] ${config.bg} ${config.text} px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium`}
        >
          <Icon className="w-4 h-4" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ShortcutHelpBadgeProps {
  activeComponent: string;
}

export const ShortcutHelpBadge: React.FC<ShortcutHelpBadgeProps> = ({ activeComponent }) => {
  return (
    <div className="fixed top-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 border border-neutral-200">
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
        <Keyboard className="w-3.5 h-3.5" />
        <span>Press ? for help</span>
      </div>
      <div className="text-xs font-medium text-[#4654CD]">
        Activo: {activeComponent}
      </div>
    </div>
  );
};

export default ShortcutToast;
