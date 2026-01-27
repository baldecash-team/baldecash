'use client';

/**
 * WebchatDrawer - Chat en vivo responsive
 * Mobile: Bottom sheet drawer
 * Desktop: Widget flotante en esquina inferior derecha
 */

import React, { useRef, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useIsMobile } from '@/app/prototipos/_shared';

interface WebchatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Shared chat content component
const ChatContent: React.FC<{ inputRef: React.RefObject<HTMLInputElement | null> }> = ({ inputRef }) => (
  <>
    {/* Chat Messages Area (Placeholder) */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Welcome message */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[#4654CD] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">BC</span>
        </div>
        <div className="bg-neutral-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
          <p className="text-sm text-neutral-800">
            ¡Hola! Soy el asistente de BaldeCash. ¿En qué puedo ayudarte hoy?
          </p>
          <p className="text-xs text-neutral-400 mt-1">Ahora</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 pl-11">
        <button className="px-3 py-1.5 text-xs font-medium bg-[#4654CD]/10 text-[#4654CD] rounded-full hover:bg-[#4654CD]/20 transition-colors cursor-pointer">
          Tengo una consulta
        </button>
        <button className="px-3 py-1.5 text-xs font-medium bg-[#4654CD]/10 text-[#4654CD] rounded-full hover:bg-[#4654CD]/20 transition-colors cursor-pointer">
          Ayuda con mi pedido
        </button>
        <button className="px-3 py-1.5 text-xs font-medium bg-[#4654CD]/10 text-[#4654CD] rounded-full hover:bg-[#4654CD]/20 transition-colors cursor-pointer">
          Conocer requisitos
        </button>
      </div>

      {/* Placeholder for integration notice */}
      <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
        <p className="text-xs text-neutral-500 text-center">
          Placeholder para integración con servicio de chat real
        </p>
      </div>
    </div>

    {/* Input Area */}
    <div className="border-t border-neutral-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Escribe tu mensaje..."
          className="flex-1 bg-neutral-100 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-[#4654CD]/30"
        />
        <Button
          isIconOnly
          className="bg-[#4654CD] text-white cursor-pointer"
          radius="lg"
          size="sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </>
);

export const WebchatDrawer: React.FC<WebchatDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const inputRef = useRef<HTMLInputElement>(null);

  // Block body scroll when drawer is open (mobile only)
  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    // Only lock scroll on mobile
    if (!isMobile) return;

    if (isOpen) {
      if (document.body.style.position !== 'fixed') {
        scrollYRef.current = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        didLockRef.current = true;
      }
    } else {
      if (didLockRef.current) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollYRef.current);
        didLockRef.current = false;
      }
    }
  }, [isOpen, isMobile]);

  // Focus input when opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Desktop: Floating widget
  if (!isMobile) {
    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="webchat-desktop"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[9998] w-[380px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#4654CD] to-[#5B68D6] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">
                    BaldeBOT
                  </h2>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                    En línea
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={onClose}
                  className="cursor-pointer text-white hover:bg-white/20"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={onClose}
                  className="cursor-pointer text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ChatContent inputRef={inputRef} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Mobile: Bottom sheet drawer
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="webchat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ touchAction: 'none' }}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="webchat-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col"
            style={{ overscrollBehavior: 'contain', height: '85vh', maxHeight: '700px' }}
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    BaldeBOT
                  </h2>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                    En línea
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <ChatContent inputRef={inputRef} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WebchatDrawer;
