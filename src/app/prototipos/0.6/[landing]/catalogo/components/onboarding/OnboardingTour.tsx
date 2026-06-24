'use client';

/**
 * OnboardingTour - Componente principal del tour guiado
 * Renderiza el paso actual según el estilo de highlight configurado
 * Soporta 2 estilos: spotlight, pulse
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { OnboardingStep, OnboardingHighlightStyle } from '../../types/catalog';
import { useIsMobile } from '@/app/prototipos/_shared';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

interface OnboardingTourProps {
  isActive: boolean;
  currentStep: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  highlightStyle: OnboardingHighlightStyle;
  isHelpOnlyMode?: boolean;
  theme?: 'gamer';
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

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  highlightStyle,
  isHelpOnlyMode = false,
  theme,
  onNext,
  onPrev,
  onSkip,
}) => {
  const isGamer = theme === 'gamer';
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  const analytics = useAnalytics();
  const tourStartTsRef = React.useRef<number | null>(null);
  const wasActiveRef = React.useRef(false);

  // Wrap onSkip para emitir tour_skip con posición actual.
  const onSkipTracked = useCallback(() => {
    analytics.trackTourSkip({ step: currentStepIndex + 1, total: totalSteps });
    onSkip();
  }, [analytics, currentStepIndex, totalSteps, onSkip]);

  // Fire tour_start when the tour becomes active for the first time.
  // Fire tour_finish when it deactivates after reaching the last step.
  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      wasActiveRef.current = true;
      tourStartTsRef.current = Date.now();
      analytics.trackTourStart({ step_count: totalSteps, style: highlightStyle });
    }
    if (!isActive && wasActiveRef.current) {
      wasActiveRef.current = false;
      const duration = tourStartTsRef.current ? Date.now() - tourStartTsRef.current : undefined;
      // Si llegó al final, es finish; si saltó antes, handled in onSkip handler below.
      if (currentStepIndex >= totalSteps - 1) {
        analytics.trackTourFinish({ total: totalSteps, duration_ms: duration });
      }
      tourStartTsRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Emit tour_step_view cuando cambia de paso (sólo si el tour está activo).
  useEffect(() => {
    if (!isActive || !currentStep) return;
    analytics.trackTourStepView({
      step: currentStepIndex + 1,
      step_id: currentStep.id,
      total: totalSteps,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStepIndex]);

  // Mount check for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Find and track target element (without scrolling - just updates position)
  const updateTargetRect = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const targetId = isMobile && currentStep.targetIdMobile
      ? currentStep.targetIdMobile
      : currentStep.targetId;

    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isMobile]);

  // Scroll to element only when step changes (not on every scroll event)
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const targetId = isMobile && currentStep.targetIdMobile
      ? currentStep.targetIdMobile
      : currentStep.targetId;

    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      // Only scroll if element is outside visible area
      if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep?.id, isMobile]); // Only trigger on step change (using id)

  useEffect(() => {
    if (isActive && currentStep) {
      // Initial update with slight delay for animations
      const timeout = setTimeout(updateTargetRect, 100);

      // Update on scroll/resize (position only, no scrolling)
      window.addEventListener('scroll', updateTargetRect, true);
      window.addEventListener('resize', updateTargetRect);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('scroll', updateTargetRect, true);
        window.removeEventListener('resize', updateTargetRect);
      };
    }
  }, [isActive, currentStep, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkipTracked();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onNext, onPrev, onSkipTracked]);

  // Don't render until we have a valid target position (prevents flicker on start)
  if (!isMounted || !isActive || !currentStep || !targetRect) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Gamer palette (only used when theme="gamer")
  const gamerCyan = '#00ffd5';
  const gamerPurple = '#6366f1';

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const position = isMobile && currentStep.positionMobile
      ? currentStep.positionMobile
      : currentStep.position;

    const padding = 16;
    const tooltipWidth = isMobile ? window.innerWidth - 32 : 320;
    // Smaller height for help-only mode (no step indicator, dots, prev button, skip link)
    const tooltipHeight = isHelpOnlyMode ? (isMobile ? 180 : 200) : (isMobile ? 260 : 280);

    // For mobile, always center horizontally
    if (isMobile) {
      // Check if element is near bottom of screen - force tooltip above it
      const isNearBottom = targetRect.bottom > window.innerHeight - tooltipHeight - 100;

      let top: number;
      if (isNearBottom || position === 'top') {
        // Position above the element - closer in help-only mode
        top = targetRect.top - tooltipHeight - padding;
      } else {
        // Position below the element
        top = Math.min(targetRect.bottom + padding, window.innerHeight - tooltipHeight - padding);
      }

      // Ensure tooltip doesn't go below viewport
      top = Math.min(top, window.innerHeight - tooltipHeight - padding);
      // Ensure tooltip doesn't go above viewport
      top = Math.max(top, padding);

      return {
        top,
        left: padding,
      };
    }

    // Desktop positioning
    // Check if element is near bottom of screen - force tooltip above it
    const isNearBottom = targetRect.bottom > window.innerHeight - 150;
    const effectivePosition = isNearBottom && (position === 'bottom' || position === 'right' || position === 'left')
      ? 'top'
      : position;

    switch (effectivePosition) {
      case 'top':
        return {
          top: Math.max(padding, targetRect.top - tooltipHeight - padding),
          left: Math.min(
            Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
            window.innerWidth - tooltipWidth - padding
          ),
        };
      case 'bottom':
        return {
          top: Math.min(targetRect.bottom + padding, window.innerHeight - tooltipHeight - padding),
          left: Math.min(
            Math.max(padding, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
            window.innerWidth - tooltipWidth - padding
          ),
        };
      case 'left':
        return {
          top: Math.min(
            Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2),
            window.innerHeight - tooltipHeight - padding
          ),
          left: Math.max(padding, targetRect.left - tooltipWidth - padding),
        };
      case 'right':
        return {
          top: Math.min(
            Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2),
            window.innerHeight - tooltipHeight - padding
          ),
          left: Math.min(targetRect.right + padding, window.innerWidth - tooltipWidth - padding),
        };
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  const content = (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop / Spotlight */}
          {highlightStyle === 'spotlight' && (
            <motion.div
              className="fixed inset-0 z-[9998] pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onSkipTracked}
              style={{
                background: targetRect
                  ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20}px, rgba(0,0,0,0.75) ${Math.max(targetRect.width, targetRect.height) / 2 + 60}px)`
                  : 'rgba(0,0,0,0.75)',
              }}
            />
          )}

          {/* Pulse Highlight */}
          {highlightStyle === 'pulse' && targetRect && (
            <>
              {/* Semi-transparent backdrop */}
              <motion.div
                className="fixed inset-0 z-[9998] bg-black/50 pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onSkipTracked}
              />
              {/* Pulse ring */}
              <motion.div
                className="fixed z-[9999] pointer-events-none rounded-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  top: targetRect.top - (isGamer ? 6 : 8),
                  left: targetRect.left - (isGamer ? 6 : 8),
                  width: targetRect.width + (isGamer ? 12 : 16),
                  height: targetRect.height + (isGamer ? 12 : 16),
                  boxShadow: isGamer
                    ? `0 0 0 3px ${gamerCyan}, 0 0 0 6px ${gamerCyan}40`
                    : '0 0 0 4px var(--color-primary), 0 0 0 8px rgba(var(--color-primary-rgb), 0.3)',
                }}
              >
                {/* Animated pulse */}
                <motion.div
                  className={`absolute inset-0 rounded-xl border-2 ${isGamer ? '' : 'border-[var(--color-primary)]'}`}
                  style={isGamer ? { border: `2px solid ${gamerCyan}` } : undefined}
                  animate={{
                    scale: [1, isGamer ? 1.04 : 1.05, 1],
                    opacity: [1, isGamer ? 0.4 : 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </>
          )}

          {/* Tooltip Card */}
          <motion.div
            className="fixed z-[10000] pointer-events-auto"
            style={{
              ...tooltipStyle,
              width: isMobile ? 'calc(100vw - 32px)' : (isGamer ? 340 : 320),
              maxWidth: isMobile ? 'calc(100vw - 32px)' : (isGamer ? 340 : 320),
              background: isGamer ? '#1a1a1a' : 'var(--surface, #fff)',
              border: isGamer ? '1px solid #2a2a2a' : '1px solid var(--border-soft, #e5e7eb)',
              borderRadius: 16,
              padding: 'clamp(16px, 4vw, 20px)',
              boxShadow: isGamer
                ? `0 0 40px rgba(0,0,0,0.6), 0 0 20px ${gamerCyan}15`
                : '0 20px 60px rgba(0,0,0,0.15)',
              fontFamily: isGamer ? "'Rajdhani', sans-serif" : undefined,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            {/* Gamer accent top line */}
            {isGamer && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '16px 16px 0 0',
                background: `linear-gradient(90deg, ${gamerPurple}, ${gamerCyan})`,
              }} />
            )}

            {/* Skip button */}
            <button
              onClick={onSkipTracked}
              style={isGamer ? {
                position: 'absolute', top: 12, right: 12,
                width: 28, height: 28, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: '1px solid #2a2a2a',
                color: '#707070', cursor: 'pointer',
              } : undefined}
              className={isGamer ? '' : 'absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--surface-2,#f3f4f6)] transition-colors cursor-pointer'}
            >
              <X className="w-3.5 h-3.5" style={isGamer ? { color: '#707070' } : { color: 'var(--text-faint, #9ca3af)' }} />
            </button>

            {/* Step indicator - hidden in help only mode */}
            {!isHelpOnlyMode && (
              isGamer ? (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '3px 10px', borderRadius: 6, marginBottom: 12,
                  background: `${gamerCyan}15`, border: `1px solid ${gamerCyan}30`,
                }}>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' as const,
                    color: gamerCyan, fontWeight: 700,
                  }}>
                    Paso {currentStepIndex + 1} de {totalSteps}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] px-2 py-1 rounded-full">
                    Paso {currentStepIndex + 1} de {totalSteps}
                  </span>
                </div>
              )
            )}

            {/* Content */}
            {isGamer ? (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', margin: '0 0 8px', paddingRight: 24 }}>
                  {currentStep.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: '#a0a0a0', margin: '0 0 20px' }}>
                  {currentStep.description}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-[var(--text-strong,#1f2937)] mb-2 pr-6">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-[var(--text-muted,#4b5563)] mb-5">
                  {currentStep.description}
                </p>
              </>
            )}

            {/* Progress dots - hidden in help only mode */}
            {!isHelpOnlyMode && (
              <div className={isGamer ? '' : 'flex items-center justify-center gap-1.5 mb-4'}
                style={isGamer ? { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 16 } : undefined}
              >
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div
                    key={idx}
                    style={isGamer ? {
                      height: 4, borderRadius: 4, transition: 'all 0.3s',
                      width: idx === currentStepIndex ? 20 : 4,
                      background: idx === currentStepIndex ? gamerCyan : idx < currentStepIndex ? `${gamerCyan}80` : '#333',
                    } : undefined}
                    className={isGamer ? '' : `h-1.5 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-6 bg-[var(--color-primary)]'
                        : idx < currentStepIndex
                          ? 'w-1.5 bg-[rgba(var(--color-primary-rgb),0.5)]'
                          : 'w-1.5 bg-[var(--surface-2,#e5e7eb)]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Navigation buttons */}
            {isGamer ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <button
                  onClick={onPrev}
                  disabled={isFirstStep}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 14px', borderRadius: 10,
                    background: 'none', border: `1px solid ${isFirstStep ? '#333' : '#2a2a2a'}`,
                    color: isFirstStep ? '#707070' : '#a0a0a0',
                    fontSize: 13, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif",
                    cursor: isFirstStep ? 'not-allowed' : 'pointer',
                    opacity: isFirstStep ? 0.4 : 1,
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
                    background: gamerCyan, border: 'none',
                    color: '#0a0a0a', fontSize: 13, fontWeight: 700,
                    fontFamily: "'Rajdhani', sans-serif", cursor: 'pointer',
                    boxShadow: `0 0 16px ${gamerCyan}40`,
                  }}
                >
                  {isLastStep ? '¡Listo!' : 'Siguiente'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-3 ${isHelpOnlyMode ? 'justify-center' : 'justify-between'}`}>
                {!isHelpOnlyMode && (
                  <Button
                    size="sm"
                    variant="light"
                    isDisabled={isFirstStep}
                    onPress={onPrev}
                    startContent={<ChevronLeft className="w-4 h-4" />}
                    className="cursor-pointer"
                  >
                    Anterior
                  </Button>
                )}
                <Button
                  size="sm"
                  className={`bg-[var(--color-primary)] text-white font-semibold cursor-pointer hover:brightness-90 ${isHelpOnlyMode ? 'px-8' : ''}`}
                  style={{ borderRadius: '10px' }}
                  onPress={onNext}
                  endContent={!isLastStep && !isHelpOnlyMode && <ChevronRight className="w-4 h-4" />}
                >
                  {isHelpOnlyMode ? 'Entendido' : isLastStep ? '¡Listo!' : 'Siguiente'}
                </Button>
              </div>
            )}

            {/* Skip link - hidden in help only mode */}
            {!isHelpOnlyMode && (
              isGamer ? (
                <button
                  onClick={onSkipTracked}
                  style={{
                    display: 'block', width: '100%', marginTop: 10,
                    background: 'none', border: 'none',
                    fontSize: 11, color: '#707070', fontFamily: "'Rajdhani', sans-serif",
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  Saltar tour
                </button>
              ) : (
                <button
                  onClick={onSkipTracked}
                  className="w-full text-center text-xs text-[var(--text-faint,#9ca3af)] hover:text-[var(--text-muted,#4b5563)] mt-3 cursor-pointer"
                >
                  Saltar tour
                </button>
              )
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default OnboardingTour;
