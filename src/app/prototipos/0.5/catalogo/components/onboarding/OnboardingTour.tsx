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

interface OnboardingTourProps {
  isActive: boolean;
  currentStep: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  highlightStyle: OnboardingHighlightStyle;
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
  onNext,
  onPrev,
  onSkip,
}) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

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
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onNext, onPrev, onSkip]);

  // Don't render until we have a valid target position (prevents flicker on start)
  if (!isMounted || !isActive || !currentStep || !targetRect) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const position = isMobile && currentStep.positionMobile
      ? currentStep.positionMobile
      : currentStep.position;

    const padding = 16;
    const tooltipWidth = isMobile ? window.innerWidth - 32 : 320;
    const tooltipHeight = isMobile ? 260 : 280;

    // For mobile, always center horizontally
    if (isMobile) {
      // Check if element is near bottom of screen - force tooltip above it
      const isNearBottom = targetRect.bottom > window.innerHeight - tooltipHeight - 100;

      let top: number;
      if (isNearBottom || position === 'top') {
        // Position above the element
        top = Math.max(padding, targetRect.top - tooltipHeight - padding);
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
              onClick={onSkip}
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
                onClick={onSkip}
              />
              {/* Pulse ring */}
              <motion.div
                className="fixed z-[9999] pointer-events-none rounded-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  top: targetRect.top - 8,
                  left: targetRect.left - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                  boxShadow: '0 0 0 4px #4654CD, 0 0 0 8px rgba(70, 84, 205, 0.3)',
                }}
              >
                {/* Animated pulse */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-[#4654CD]"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.5, 1],
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
            className="fixed z-[10000] bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 pointer-events-auto"
            style={{
              ...tooltipStyle,
              width: isMobile ? 'calc(100vw - 32px)' : 320,
              maxWidth: isMobile ? 'calc(100vw - 32px)' : 320,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            {/* Skip button */}
            <button
              onClick={onSkip}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-[#4654CD] bg-[#4654CD]/10 px-2 py-1 rounded-full">
                Paso {currentStepIndex + 1} de {totalSteps}
              </span>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-neutral-800 mb-2 pr-6">
              {currentStep.title}
            </h3>
            <p className="text-sm text-neutral-600 mb-5">
              {currentStep.description}
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#4654CD]'
                      : idx < currentStepIndex
                        ? 'w-1.5 bg-[#4654CD]/50'
                        : 'w-1.5 bg-neutral-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
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

              <Button
                size="sm"
                className="bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
                style={{ borderRadius: '10px' }}
                onPress={onNext}
                endContent={!isLastStep && <ChevronRight className="w-4 h-4" />}
              >
                {isLastStep ? '¡Listo!' : 'Siguiente'}
              </Button>
            </div>

            {/* Skip link */}
            <button
              onClick={onSkip}
              className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 mt-3 cursor-pointer"
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

export default OnboardingTour;
