'use client';

/**
 * QuizLayoutV5Gamer - Modal desktop con tema gamer
 * Mismo comportamiento que V5 pero con estética dark/light del tema gamer.
 */

import React, { useRef, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, ModalFooter } from '@nextui-org/react';
import { X, Sparkles } from 'lucide-react';
import { QuizLayoutProps } from '../../../types/quiz';
import type { GamerTheme } from '@/app/prototipos/0.6/[landing]/catalogo/components/gamer/gamerTheme';

const F_RAJ = "'Rajdhani', sans-serif";

interface QuizLayoutV5GamerProps extends QuizLayoutProps {
  T: GamerTheme;
  isDark: boolean;
}

export const QuizLayoutV5Gamer: React.FC<QuizLayoutV5GamerProps> = ({
  children,
  footer,
  isOpen,
  onClose,
  currentStep,
  totalSteps,
  T,
  isDark,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const stepLabel = currentStep >= totalSteps ? 'Resultados' : `Pregunta ${currentStep + 1} de ${totalSteps}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
      placement="center"
      hideCloseButton
      isDismissable={false}
      classNames={{
        base: 'm-4 rounded-2xl max-h-[90vh]',
        backdrop: 'bg-black/70 z-[99]',
        body: 'p-0 overflow-hidden',
        wrapper: 'overflow-hidden z-[100]',
      }}
    >
      <ModalContent style={{ background: T.bgCard, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          background: T.bgSurface,
          borderBottom: `1px solid ${T.border}`,
          padding: '20px 24px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${T.neonCyan}1F`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Sparkles size={20} style={{ color: T.neonCyan }} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: F_RAJ }}>
                  Asistente de Compra
                </h2>
                <p style={{ fontSize: 12, color: T.textMuted, margin: 0, fontFamily: F_RAJ }}>
                  {stepLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: T.textSecondary, flexShrink: 0,
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14, height: 3, background: T.border, borderRadius: 2 }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: T.neonCyan,
              borderRadius: 2,
              transition: 'width 0.3s ease-out',
              boxShadow: `0 0 8px ${T.neonCyan}80`,
            }} />
          </div>
        </div>

        {/* Body */}
        <ModalBody
          style={{
            background: T.bgCard,
            maxHeight: 'calc(90vh - 200px)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '24px',
          }}
        >
          <div ref={bodyRef}>
            {children}
          </div>
        </ModalBody>

        {/* Footer */}
        {footer && (
          <ModalFooter style={{
            borderTop: `1px solid ${T.border}`,
            background: T.bgSurface,
            padding: '16px 24px',
          }}>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default QuizLayoutV5Gamer;
