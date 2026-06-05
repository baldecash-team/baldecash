'use client';

/**
 * QuizLayoutV4Gamer - Bottom sheet deslizable (mobile) con tema gamer
 * Mismo comportamiento que V4 pero con estética dark/light del tema gamer.
 */

import React, { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { QuizLayoutProps } from '../../../types/quiz';
import type { GamerTheme } from '@/app/prototipos/0.6/[landing]/catalogo/components/gamer/gamerTheme';

const F_RAJ = "'Rajdhani', sans-serif";

interface QuizLayoutV4GamerProps extends QuizLayoutProps {
  T: GamerTheme;
  isDark: boolean;
}

export const QuizLayoutV4Gamer: React.FC<QuizLayoutV4GamerProps> = ({
  children,
  footer,
  isOpen,
  onClose,
  currentStep,
  totalSteps,
  T,
  isDark,
}) => {
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    };
  }, [isOpen]);

  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const stepLabel = currentStep >= totalSteps ? 'Resultados' : `Pregunta ${currentStep + 1}/${totalSteps}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9998 }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: T.bgCard,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              zIndex: 9999,
              minHeight: '50vh', maxHeight: '80vh',
              display: 'flex', flexDirection: 'column',
              border: `1px solid ${T.border}`,
              borderBottom: 'none',
            }}
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', cursor: 'grab' }}
            >
              <div style={{ width: 40, height: 5, borderRadius: 3, background: T.border }} />
            </div>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 16px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${T.neonCyan}1F`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Sparkles size={18} style={{ color: T.neonCyan }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: F_RAJ }}>
                    Encuentra tu equipo ideal
                  </h2>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0, fontFamily: F_RAJ }}>
                    {stepLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: T.textSecondary, flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: T.border }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: T.neonCyan,
                transition: 'width 0.3s ease-out',
                boxShadow: `0 0 6px ${T.neonCyan}80`,
              }} />
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: 16 }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div style={{
                borderTop: `1px solid ${T.border}`,
                background: T.bgSurface,
                padding: 16,
                paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuizLayoutV4Gamer;
