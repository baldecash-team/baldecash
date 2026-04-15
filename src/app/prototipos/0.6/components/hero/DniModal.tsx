'use client';

/**
 * DniModal - Modal de ingreso de DNI para landings personalizadas
 *
 * Feature específico para landing "liderman-baldecash":
 * - Aparece automáticamente al cargar la página
 * - Input de DNI de 8 dígitos con contador de caracteres
 * - Guarda el DNI en localStorage
 * - Mensaje de confirmación al completar
 * - No es obligatorio (se puede cerrar)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DNI_MAX_LENGTH = 8;

interface DniModalProps {
  /** Landing slug para generar la key de localStorage */
  landingSlug: string;
  /** Callback al cerrar el modal */
  onClose: () => void;
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Permite cerrar/omitir sin ingresar DNI (default: true) */
  allowSkip?: boolean;
}

/** Genera la key de localStorage para este landing */
function getStorageKey(slug: string) {
  return `baldecash-dni-${slug}`;
}

/** Verifica si ya hay un DNI guardado para este landing */
export function hasSavedDni(slug: string): boolean {
  try {
    return localStorage.getItem(getStorageKey(slug)) !== null;
  } catch {
    return false;
  }
}

export const DniModal: React.FC<DniModalProps> = ({
  landingSlug,
  onClose,
  isOpen,
  allowSkip = true,
}) => {
  const [dni, setDni] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Validación
  const isComplete = dni.length === DNI_MAX_LENGTH;
  const isValid = isComplete && /^\d{8}$/.test(dni);
  const showError = dni.length > 0 && dni.length === DNI_MAX_LENGTH && !isValid;

  const handleChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, DNI_MAX_LENGTH);
    setDni(cleaned);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isValid) return;

    try {
      localStorage.setItem(getStorageKey(landingSlug), dni);
    } catch {
      // Silently fail if localStorage is not available
    }

    if (!allowSkip) {
      // Cierre inmediato sin mensaje de confirmación
      onClose();
      return;
    }

    setIsConfirmed(true);

    setTimeout(() => {
      onClose();
    }, 2000);
  }, [isValid, dni, landingSlug, onClose, allowSkip]);

  // Cerrar con Escape (solo si allowSkip)
  useEffect(() => {
    if (!allowSkip) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, allowSkip]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

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
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={allowSkip ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-10">
                <AnimatePresence mode="wait">
                  {!isConfirmed ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      {/* Icono centrado */}
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                        style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                      >
                        <CreditCard className="w-8 h-8 text-white" />
                      </div>

                      {/* Título */}
                      <h2 className="text-xl font-bold text-neutral-900 font-['Baloo_2'] mb-2 text-center">
                        Ingresa tu DNI
                      </h2>

                      {/* Subtítulo */}
                      <p className="text-sm text-neutral-500 text-center mb-6">
                        Para personalizar tu experiencia y acceder
                        <br />
                        a las ofertas disponibles para ti.
                      </p>

                      {/* Input DNI */}
                      <div className="w-full space-y-1.5">
                        <div
                          className={`
                            flex items-center gap-2 h-11 px-3
                            rounded-lg border-2 transition-all duration-200 bg-white
                            ${showError ? 'border-[#ef4444]' : isValid ? 'border-[#22c55e]' : 'border-neutral-300 focus-within:border-[var(--color-primary,#4654CD)]'}
                          `}
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            value={dni}
                            onChange={(e) => handleChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && isValid) handleSubmit();
                            }}
                            placeholder="Ingresa tu DNI de 8 dígitos"
                            maxLength={DNI_MAX_LENGTH}
                            autoFocus
                            className="flex-1 bg-transparent outline-none text-base text-neutral-800 placeholder:text-neutral-400 text-center"
                            style={{
                              WebkitBoxShadow: '0 0 0 1000px white inset',
                              ...(dni ? { WebkitTextFillColor: '#262626' } : {}),
                            }}
                          />
                          {isValid && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
                          {showError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
                        </div>

                        {/* Error & Character counter */}
                        <div className="flex items-center justify-between gap-2">
                          {showError ? (
                            <p className="text-sm text-[#ef4444] flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              El DNI debe contener solo números
                            </p>
                          ) : (
                            <span />
                          )}
                          <p className="text-xs text-neutral-400 flex-shrink-0">
                            {dni.length}/{DNI_MAX_LENGTH}
                          </p>
                        </div>
                      </div>

                      {/* Submit button */}
                      <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`
                          w-full mt-5 h-12 rounded-lg text-base font-semibold
                          transition-all duration-150 cursor-pointer
                          ${isValid
                            ? 'text-white hover:opacity-90 active:scale-[0.98]'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          }
                        `}
                        style={isValid ? { backgroundColor: 'var(--color-primary, #4654CD)' } : undefined}
                      >
                        Confirmar
                      </button>

                      {/* Skip link */}
                      {allowSkip && (
                        <button
                          onClick={onClose}
                          className="mt-4 text-sm text-neutral-400 hover:text-neutral-600 transition-colors duration-150 cursor-pointer"
                        >
                          No, omitir por ahora
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="confirmed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center py-4"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                        style={{ backgroundColor: '#22c55e20' }}
                      >
                        <Check className="w-8 h-8 text-[#22c55e]" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 font-['Baloo_2'] mb-2 text-center">
                        DNI registrado
                      </h3>
                      <p className="text-sm text-neutral-500 text-center">
                        Tu DNI ha sido guardado correctamente
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DniModal;
