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
import { CreditCard, Check, AlertCircle, ShieldX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DNI_MAX_LENGTH = 8;

/** Result from a successful whitelist validation */
export interface WhitelistValidationResult {
  firstName: string;
  lastName: string;
  accessToken: string;
}

interface DniModalProps {
  /** Landing slug para generar la key de localStorage */
  landingSlug: string;
  /** Callback al cerrar el modal */
  onClose: () => void;
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Permite cerrar/omitir sin ingresar DNI (default: true) */
  allowSkip?: boolean;
  /** Validate DNI against a server-side whitelist before accepting */
  validateWhitelist?: boolean;
  /** Called when whitelist validation succeeds (with token + name). Parent handles next step. */
  onWhitelistValidated?: (result: WhitelistValidationResult) => void;
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

/** VIP access token storage key */
function getVipTokenKey(slug: string) {
  return `baldecash-vip-token-${slug}`;
}

/** Get saved VIP access token for a landing */
export function getVipToken(slug: string): string | null {
  try {
    return localStorage.getItem(getVipTokenKey(slug));
  } catch {
    return null;
  }
}

/** Save VIP access token for a landing */
export function saveVipToken(slug: string, token: string): void {
  try {
    localStorage.setItem(getVipTokenKey(slug), token);
  } catch {
    // Silently fail
  }
}

/** VIP welcome name storage key */
function getVipNameKey(slug: string) {
  return `baldecash-vip-name-${slug}`;
}

/** Save VIP user name for welcome overlay */
export function saveVipName(slug: string, firstName: string): void {
  try {
    localStorage.setItem(getVipNameKey(slug), JSON.stringify({ firstName }));
  } catch {}
}

/** Get saved VIP user name */
export function getVipName(slug: string): { firstName: string } | null {
  try {
    const raw = localStorage.getItem(getVipNameKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export const DniModal: React.FC<DniModalProps> = ({
  landingSlug,
  onClose,
  isOpen,
  allowSkip = true,
  validateWhitelist = false,
  onWhitelistValidated,
}) => {
  const [dni, setDni] = useState('');
  // Modal view: 'form' | 'rejected' | 'confirmed'
  const [view, setView] = useState<'form' | 'rejected' | 'confirmed'>('form');
  const [isValidating, setIsValidating] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  // Validación
  const isComplete = dni.length === DNI_MAX_LENGTH;
  const isValid = isComplete && /^\d{8}$/.test(dni);
  const showError = dni.length > 0 && dni.length === DNI_MAX_LENGTH && !isValid;

  const handleChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, DNI_MAX_LENGTH);
    setDni(cleaned);
  }, []);

  const handleRetry = useCallback(() => {
    setDni('');
    setView('form');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid || isValidating) return;

    // Whitelist validation
    if (validateWhitelist) {
      setIsValidating(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/public/landing/${encodeURIComponent(landingSlug)}/validate-dni/${dni}`,
        );
        const data = await res.json();
        if (!data.valid) {
          setIsValidating(false);
          setView('rejected');
          return;
        }
        if (data.first_name) {
          setWelcomeName(data.first_name);
        }
        // Save token and name for welcome overlay
        if (data.access_token) {
          saveVipToken(landingSlug, data.access_token);
        }
        if (data.first_name || data.last_name) {
          saveVipName(landingSlug, data.first_name || '');
        }
        setIsValidating(false);
        // If parent handles the validated state (VIP flow), delegate to it
        if (onWhitelistValidated) {
          try { localStorage.setItem(getStorageKey(landingSlug), dni); } catch { /* */ }
          onWhitelistValidated({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            accessToken: data.access_token || '',
          });
          return;
        }
      } catch {
        setIsValidating(false);
        setView('rejected');
        return;
      }
      setIsValidating(false);
    }

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

    setView('confirmed');

    setTimeout(() => {
      onClose();
    }, 2000);
  }, [isValid, isValidating, validateWhitelist, dni, landingSlug, onClose, allowSkip, onWhitelistValidated]);

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
            className="fixed inset-0 z-[10002] bg-black/50 backdrop-blur-sm"
            onClick={allowSkip && !isValidating ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Validating overlay inside modal */}
              <AnimatePresence>
                {isValidating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl"
                  >
                    {/* Apple-style spinner */}
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-5">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full h-full"
                          style={{ transform: `rotate(${i * 30}deg)` }}
                        >
                          <div
                            className="mx-auto w-[3.5px] h-[22%] rounded-full"
                            style={{
                              background: '#E5A823',
                              animation: `spinFade 1.2s linear ${i * 0.1}s infinite`,
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-sm font-semibold text-neutral-700 mb-3">
                      Validando Identidad
                    </p>

                    {/* Indeterminate progress bar */}
                    <div className="w-32 sm:w-40 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: '40%',
                          background: 'linear-gradient(90deg, #E5A823, #D4972A)',
                          animation: 'progressSlide 1.5s ease-in-out infinite',
                        }}
                      />
                    </div>

                    <style jsx>{`
                      @keyframes spinFade {
                        0% { opacity: 1; }
                        100% { opacity: 0.1; }
                      }
                      @keyframes progressSlide {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(350%); }
                      }
                    `}</style>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="px-5 py-8 sm:px-8 sm:py-10">
                <AnimatePresence mode="wait">
                  {view === 'form' && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      {/* Icono centrado */}
                      <div
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                        style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                      >
                        <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>

                      {/* Título */}
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 font-['Baloo_2'] mb-2 text-center">
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
                        disabled={!isValid || isValidating}
                        className={`
                          w-full mt-5 h-12 rounded-lg text-base font-semibold
                          transition-all duration-150 cursor-pointer
                          ${isValid && !isValidating
                            ? 'text-white hover:opacity-90 active:scale-[0.98]'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          }
                        `}
                        style={isValid && !isValidating ? { backgroundColor: 'var(--color-primary, #4654CD)' } : undefined}
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
                  )}

                  {view === 'rejected' && (
                    <motion.div
                      key="rejected"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center py-4"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                        style={{ backgroundColor: '#fef2f2' }}
                      >
                        <ShieldX className="w-8 h-8 text-[#ef4444]" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 font-['Baloo_2'] mb-2 text-center">
                        Acceso restringido
                      </h3>
                      <p className="text-sm text-neutral-500 text-center mb-6 leading-relaxed">
                        Este DNI no está registrado para acceder
                        <br />
                        a esta promoción exclusiva.
                      </p>
                      <button
                        onClick={handleRetry}
                        className="w-full h-12 rounded-lg text-base font-semibold text-white transition-all duration-150 cursor-pointer hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                      >
                        Intentar con otro DNI
                      </button>
                    </motion.div>
                  )}

                  {view === 'confirmed' && (
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
                        {welcomeName ? `¡Hola, ${welcomeName}!` : 'DNI registrado'}
                      </h3>
                      <p className="text-sm text-neutral-500 text-center">
                        {welcomeName ? 'Tu acceso ha sido verificado' : 'Tu DNI ha sido guardado correctamente'}
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
