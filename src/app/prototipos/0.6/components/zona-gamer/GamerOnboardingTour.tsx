'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface OnboardingStep {
  id: string;
  targetId: string;
  targetIdMobile?: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  positionMobile?: 'top' | 'bottom' | 'center';
}

interface GamerOnboardingTourProps {
  isActive: boolean;
  currentStep: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  theme: 'dark' | 'light';
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const GamerOnboardingTour: React.FC<GamerOnboardingTourProps> = ({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  theme,
  onNext,
  onPrev,
  onSkip,
}) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateTargetRect = useCallback(() => {
    if (!currentStep) { setTargetRect(null); return; }
    const targetId = isMobile && currentStep.targetIdMobile ? currentStep.targetIdMobile : currentStep.targetId;
    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, bottom: rect.bottom, right: rect.right });
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isMobile]);

  // Scroll to element on step change
  useEffect(() => {
    if (!isActive || !currentStep) return;
    const targetId = isMobile && currentStep.targetIdMobile ? currentStep.targetIdMobile : currentStep.targetId;
    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep?.id, isMobile]);

  useEffect(() => {
    if (isActive && currentStep) {
      const timeout = setTimeout(updateTargetRect, 100);
      window.addEventListener('scroll', updateTargetRect, true);
      window.addEventListener('resize', updateTargetRect);
      return () => { clearTimeout(timeout); window.removeEventListener('scroll', updateTargetRect, true); window.removeEventListener('resize', updateTargetRect); };
    }
  }, [isActive, currentStep, updateTargetRect]);

  // Keyboard nav
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onNext, onPrev, onSkip]);

  if (!isMounted || !isActive || !currentStep || !targetRect) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Colors
  const neonCyan = isDark ? '#00ffd5' : '#00897a';
  const neonPurple = isDark ? '#6366f1' : '#4f46e5';
  const bgCard = isDark ? '#1a1a1a' : '#ffffff';
  const border = isDark ? '#2a2a2a' : '#e0e0e0';
  const textPrimary = isDark ? '#f0f0f0' : '#1a1a1a';
  const textSecondary = isDark ? '#a0a0a0' : '#555';
  const textMuted = isDark ? '#707070' : '#888';

  // Tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const position = isMobile && currentStep.positionMobile ? currentStep.positionMobile : currentStep.position;
    const padding = 16;
    const tooltipWidth = isMobile ? window.innerWidth - 32 : 340;
    const tooltipHeight = isMobile ? 240 : 260;

    if (isMobile) {
      const isNearBottom = targetRect.bottom > window.innerHeight - tooltipHeight - 100;
      let top = isNearBottom || position === 'top'
        ? targetRect.top - tooltipHeight - padding
        : Math.min(targetRect.bottom + padding, window.innerHeight - tooltipHeight - padding);
      top = Math.min(top, window.innerHeight - tooltipHeight - padding);
      top = Math.max(top, padding);
      return { top, left: padding };
    }

    const isNearBottom = targetRect.bottom > window.innerHeight - 150;
    const effectivePosition = isNearBottom && position !== 'top' ? 'top' : position;

    switch (effectivePosition) {
      case 'top':
        return {
          top: Math.max(padding, targetRect.top - tooltipHeight - padding),
          left: Math.min(Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2), window.innerWidth - tooltipWidth - padding),
        };
      case 'bottom':
        return {
          top: Math.min(targetRect.bottom + padding, window.innerHeight - tooltipHeight - padding),
          left: Math.min(Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2), window.innerWidth - tooltipWidth - padding),
        };
      case 'left':
        return {
          top: Math.min(Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2), window.innerHeight - tooltipHeight - padding),
          left: Math.max(padding, targetRect.left - tooltipWidth - padding),
        };
      case 'right':
        return {
          top: Math.min(Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2), window.innerHeight - tooltipHeight - padding),
          left: Math.min(targetRect.right + padding, window.innerWidth - tooltipWidth - padding),
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const tooltipStyle = getTooltipPosition();

  const content = (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop with pulse */}
          <motion.div
            className="fixed inset-0 z-[9998] pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onSkip}
            style={{ background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }}
          />

          {/* Pulse ring around target */}
          {targetRect && (
            <motion.div
              className="fixed z-[9999] pointer-events-none rounded-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                top: targetRect.top - 6,
                left: targetRect.left - 6,
                width: targetRect.width + 12,
                height: targetRect.height + 12,
                boxShadow: `0 0 0 3px ${neonCyan}, 0 0 0 6px ${neonCyan}40`,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ border: `2px solid ${neonCyan}` }}
                animate={{ scale: [1, 1.04, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          )}

          {/* Tooltip Card */}
          <motion.div
            className="fixed z-[10000] pointer-events-auto"
            style={{
              ...tooltipStyle,
              width: isMobile ? 'calc(100vw - 32px)' : 340,
              maxWidth: isMobile ? 'calc(100vw - 32px)' : 340,
              background: bgCard,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: 'clamp(16px, 4vw, 24px)',
              boxShadow: isDark
                ? `0 0 40px rgba(0,0,0,0.6), 0 0 20px ${neonCyan}15`
                : '0 12px 40px rgba(0,0,0,0.15)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            {/* Top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0',
              background: `linear-gradient(90deg, ${neonPurple}, ${neonCyan})`,
            }} />

            {/* Close button */}
            <button
              onClick={onSkip}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 28, height: 28, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: `1px solid ${border}`,
                color: textMuted, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Step indicator */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 6, marginBottom: 12,
              background: `${neonCyan}15`,
              border: `1px solid ${neonCyan}30`,
            }}>
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' as const,
                color: neonCyan, fontWeight: 700,
              }}>
                Paso {currentStepIndex + 1} de {totalSteps}
              </span>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 18, fontWeight: 700,
              color: textPrimary,
              margin: '0 0 8px', paddingRight: 24,
            }}>
              {currentStep.title}
            </h3>

            {/* Description */}
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 14, lineHeight: 1.5,
              color: textSecondary,
              margin: '0 0 20px',
            }}>
              {currentStep.description}
            </p>

            {/* Progress dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 16 }}>
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    height: 4, borderRadius: 4, transition: 'all 0.3s',
                    width: idx === currentStepIndex ? 20 : 4,
                    background: idx === currentStepIndex
                      ? neonCyan
                      : idx < currentStepIndex
                        ? `${neonCyan}80`
                        : (isDark ? '#333' : '#ddd'),
                  }}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <button
                onClick={onPrev}
                disabled={isFirstStep}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 14px', borderRadius: 10,
                  background: 'none',
                  border: `1px solid ${isFirstStep ? (isDark ? '#333' : '#ddd') : border}`,
                  color: isFirstStep ? textMuted : textSecondary,
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "'Rajdhani', sans-serif",
                  cursor: isFirstStep ? 'not-allowed' : 'pointer',
                  opacity: isFirstStep ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <button
                onClick={onNext}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 20px', borderRadius: 10,
                  background: neonCyan,
                  border: 'none',
                  color: isDark ? '#0a0a0a' : '#fff',
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  cursor: 'pointer',
                  boxShadow: `0 0 16px ${neonCyan}40`,
                  transition: 'all 0.2s',
                }}
              >
                {isLastStep ? '¡Listo!' : 'Siguiente'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Skip link */}
            <button
              onClick={onSkip}
              style={{
                display: 'block', width: '100%', marginTop: 10,
                background: 'none', border: 'none',
                fontSize: 11, color: textMuted,
                fontFamily: "'Rajdhani', sans-serif",
                cursor: 'pointer', textAlign: 'center',
              }}
            >
              Saltar tour
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
