'use client';

/**
 * FeedbackModal - Modal para enviar feedback con screenshot
 * Muestra preview de la captura, campo autor requerido y textarea para comentarios
 * Diseño de inputs basado en wizard-solicitud (success/error states)
 */

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { MessageCircle, Send, Check, AlertCircle, User, CheckCircle2, Loader2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTHOR_STORAGE_KEY = 'baldecash-feedback-author';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshot: string | null;
  sectionId: string;
  pageUrl: string;
  config: Record<string, unknown>;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error' | 'validation';

export function FeedbackModal({
  isOpen,
  onClose,
  screenshot,
  sectionId,
  pageUrl,
  config,
}: FeedbackModalProps) {
  const [author, setAuthor] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [authorTouched, setAuthorTouched] = useState(false);
  const [feedbackTouched, setFeedbackTouched] = useState(false);

  // Load author from localStorage on mount
  useEffect(() => {
    const savedAuthor = localStorage.getItem(AUTHOR_STORAGE_KEY);
    if (savedAuthor) {
      setAuthor(savedAuthor);
      setAuthorTouched(true);
    }
  }, []);

  // Save author to localStorage when it changes
  const handleAuthorChange = (value: string) => {
    setAuthor(value);
    localStorage.setItem(AUTHOR_STORAGE_KEY, value);
    // Clear validation when user types
    if (status === 'validation') {
      setStatus('idle');
      setValidationMessage('');
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedbackText(value);
    // Clear validation when user types
    if (status === 'validation') {
      setStatus('idle');
      setValidationMessage('');
    }
  };

  const validateForm = (): boolean => {
    if (!author.trim() && !feedbackText.trim()) {
      setValidationMessage('Por favor, ingresa tu nombre y tu opinión');
      setStatus('validation');
      return false;
    }
    if (!author.trim()) {
      setValidationMessage('Por favor, ingresa tu nombre');
      setStatus('validation');
      return false;
    }
    if (!feedbackText.trim()) {
      setValidationMessage('Por favor, ingresa tu opinión');
      setStatus('validation');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setAuthorTouched(true);
    setFeedbackTouched(true);

    if (!validateForm() || !screenshot) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot,
          author: author.trim(),
          feedbackText,
          pageUrl,
          sectionId,
          configSnapshot: config,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setFeedbackText('');
          setStatus('idle');
          setValidationMessage('');
          setFeedbackTouched(false);
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      onClose();
      setFeedbackText('');
      setStatus('idle');
      setValidationMessage('');
      setFeedbackTouched(false);
    }
  };

  const isFormDisabled = status === 'loading' || status === 'success';

  // Field states siguiendo patrón wizard-solicitud
  const authorHasError = status === 'validation' && !author.trim();
  const authorIsValid = authorTouched && author.trim().length > 0 && status !== 'validation';

  const feedbackHasError = status === 'validation' && !feedbackText.trim();
  const feedbackIsValid = feedbackTouched && feedbackText.trim().length > 0 && status !== 'validation';

  // Border colors siguiendo wizard-solicitud
  const getAuthorBorderColor = () => {
    if (authorHasError) return 'border-[#ef4444]';
    if (authorIsValid) return 'border-[#22c55e]';
    return 'border-neutral-300';
  };

  const getFeedbackBorderColor = () => {
    if (feedbackHasError) return 'border-[#ef4444]';
    if (feedbackIsValid) return 'border-[#22c55e]';
    return 'border-neutral-300';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      backdrop="blur"
      placement="center"
      hideCloseButton
      classNames={{
        base: 'bg-white rounded-2xl',
        backdrop: 'bg-black/50',
        header: 'border-b border-neutral-100 pb-4',
        body: 'py-5',
        footer: 'border-t border-neutral-100 pt-4',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-800">
              Enviar Feedback
            </p>
            <p className="text-xs text-neutral-500 font-normal">
              Tu opinión nos ayuda a mejorar
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="py-8 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-neutral-800 mb-2"
                >
                  ¡Gracias por tu feedback!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-neutral-500"
                >
                  Tu opinión ha sido enviada correctamente
                </motion.p>
              </motion.div>
            ) : (
              /* Form State */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Preview del screenshot */}
                {screenshot && (
                  <div className="mb-5">
                    <p className="text-sm font-medium text-neutral-700 mb-2">
                      Captura de pantalla adjunta
                    </p>
                    <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={screenshot}
                        alt="Captura de pantalla"
                        className="w-full h-44 object-cover object-top"
                      />
                    </div>
                  </div>
                )}

                {/* URL de la página */}
                {pageUrl && (
                  <div className="mb-5">
                    <p className="text-sm font-medium text-neutral-700 mb-2">
                      URL de la página
                    </p>
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5">
                      <Link className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      <p className="text-sm text-neutral-600 truncate flex-1" title={pageUrl}>
                        {pageUrl}
                      </p>
                    </div>
                  </div>
                )}

                {/* Campo Autor - estilo wizard-solicitud */}
                <div className="mb-5 space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                    Autor
                  </label>
                  <div
                    className={`
                      flex items-center gap-2 h-11 px-3
                      rounded-lg border-2 transition-all duration-200 bg-white
                      ${getAuthorBorderColor()}
                      ${isFormDisabled ? 'opacity-50 bg-neutral-50' : ''}
                    `}
                  >
                    <User className={`w-4 h-4 flex-shrink-0 ${authorHasError ? 'text-[#ef4444]' : 'text-neutral-400'}`} />
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={author}
                      onChange={(e) => handleAuthorChange(e.target.value)}
                      onBlur={() => setAuthorTouched(true)}
                      disabled={isFormDisabled}
                      className="flex-1 bg-transparent outline-none text-base text-neutral-800 placeholder:text-neutral-400 disabled:cursor-not-allowed"
                    />
                    {authorIsValid && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
                    {authorHasError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
                  </div>
                  {authorHasError && (
                    <p className="text-sm text-[#ef4444] flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Este campo es requerido
                    </p>
                  )}
                </div>

                {/* Textarea para feedback - estilo wizard-solicitud */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                    Tu opinión
                  </label>
                  <div
                    className={`
                      relative rounded-lg border-2 transition-all duration-200 bg-white
                      ${getFeedbackBorderColor()}
                      ${isFormDisabled ? 'opacity-50 bg-neutral-50' : ''}
                    `}
                  >
                    <textarea
                      placeholder="¿Qué te parece este diseño? ¿Qué mejorarías?"
                      value={feedbackText}
                      onChange={(e) => handleFeedbackChange(e.target.value)}
                      onBlur={() => setFeedbackTouched(true)}
                      disabled={isFormDisabled}
                      maxLength={500}
                      rows={5}
                      className="w-full min-h-[140px] px-3 py-2.5 text-base bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 disabled:cursor-not-allowed resize-none"
                    />
                    {/* Status icons - positioned at top right */}
                    <div className="absolute top-3 right-3">
                      {feedbackIsValid && <Check className="w-5 h-5 text-[#22c55e]" />}
                      {feedbackHasError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
                    </div>
                  </div>
                  {/* Character counter & Error message */}
                  <div className="flex items-center justify-between gap-2">
                    {feedbackHasError ? (
                      <p className="text-sm text-[#ef4444] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Este campo es requerido
                      </p>
                    ) : (
                      <span />
                    )}
                    <p className="text-xs text-neutral-400 flex-shrink-0">
                      {feedbackText.length}/500
                    </p>
                  </div>
                </div>

                {/* Mensaje de error de API */}
                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-[#ef4444] text-sm mt-4 bg-red-50 p-3 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Error al enviar. Intenta de nuevo.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalBody>

        {status !== 'success' && (
          <ModalFooter className="gap-3">
            <Button
              variant="flat"
              onPress={handleClose}
              isDisabled={status === 'loading'}
              className="cursor-pointer bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            >
              Cancelar
            </Button>
            <Button
              onPress={handleSubmit}
              isLoading={status === 'loading'}
              spinner={<Loader2 className="w-5 h-5 animate-spin" />}
              startContent={status !== 'loading' ? <Send className="w-4 h-4" /> : null}
              className="cursor-pointer font-medium bg-[#4654CD] text-white hover:bg-[#3a47b3]"
            >
              Enviar Feedback
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
