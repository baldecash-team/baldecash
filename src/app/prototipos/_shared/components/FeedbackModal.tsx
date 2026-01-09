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
import { MessageCircle, Send, Check, AlertCircle, User, CheckCircle2, Loader2, Link, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RESPONSABLE_STORAGE_KEY = 'baldecash-feedback-responsable';

const FEEDBACK_API_URL = 'https://ws.baldecash.com/api/feedback';
const FEEDBACK_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3IiwianRpIjoiMmMyZWE0ZDc3OTQwZWY2ZTdmMzJlOGRkMjUwNjRhYTdhNjIyNDRmMzUzMDBkOTcyMGFjY2FhMWQxZmU4OTE2MzUxOGEwMDkzMGViZTc2NGQiLCJpYXQiOjE3NDIzMzc0OTEuMjExMzUsIm5iZiI6MTc0MjMzNzQ5MS4yMTEzNTMsImV4cCI6MTc3Mzg3MzQ5MS4xOTQ0NTUsInN1YiI6IjEiLCJzY29wZXMiOlsiKiJdfQ.GmljQKk_hSEzVFlRfZMYRpt1jtBc_Fl27Vt2UEeMT5lwN4ms1w84f-dJOObRDUyzh4--DONHc7O1WZ36SjttIqmPotbSw9UWRlrA0cDrhGzmwt6nQGAAqCth1g8pkgu5tXb737wbDq8hTHtu5FU05nLrs2bYqxtbjgp500VoQB23_xEi-5FybCX0pM3i38F6VeyPoduIiY7-FRiUq6tw153uSIcCjNpZGwkffBqw6hxQ0rgGe8G_ytFbMxha_Z0zuDL5oqXtEE2U2w4mIG2_cKygysbyPOd3Qkq_LLD_lRpOWHPASrxLdVQGpLkayCBXzHb4B-Qr0Z7zQz9LqZADqojck5J8R4ZitmPpGwHbQvh6t6IbsJuXRq9mFE37VPpqxvmHyJzo_4uM5Rm0K-jKvZ4WggUddAjDn8untElx1ncMjCmFs_kOcpnoUStv3aOQGk75635_WImjTStt05BQ_EmDoRZizUqZ2zVhlrxjmgnv1SxEiPL4jDK9jaLJWUnS2MPQX4yzhd6xwhFk0LI677xpMOiag-kFU5nC3naIc9bZBKj_Ekt1UyMejPL4KqMQsBk6g40eD6ju8qVEjNEZxYCLtgD6Qr8_dheXfXiDTQQltgrG-qSzio888E_ygdq2cawS73zf5edQiau_p_wpodbCl1O6r5BzZhRuaFF0zAA';

const RESPONSABLES = [
  'RUBEN MONTENEGRO',
  'CONSUELO MARISCAL',
  'MARCO DEL RIO',
  'LEONARDO MEDINA',
  'EMILIO GONZALES',
] as const;

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
  const [responsable, setResponsable] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [responsableTouched, setResponsableTouched] = useState(false);
  const [feedbackTouched, setFeedbackTouched] = useState(false);

  // Load responsable from localStorage on mount
  useEffect(() => {
    const savedResponsable = localStorage.getItem(RESPONSABLE_STORAGE_KEY);
    if (savedResponsable && RESPONSABLES.includes(savedResponsable as typeof RESPONSABLES[number])) {
      setResponsable(savedResponsable);
      setResponsableTouched(true);
    }
  }, []);

  // Save responsable to localStorage when it changes
  const handleResponsableChange = (value: string) => {
    setResponsable(value);
    localStorage.setItem(RESPONSABLE_STORAGE_KEY, value);
    setResponsableTouched(true);
    // Clear validation when user selects
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
    if (!responsable && !feedbackText.trim()) {
      setValidationMessage('Por favor, selecciona un responsable y escribe tu opinión');
      setStatus('validation');
      return false;
    }
    if (!responsable) {
      setValidationMessage('Por favor, selecciona un responsable');
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
    setResponsableTouched(true);
    setFeedbackTouched(true);

    if (!validateForm() || !screenshot) return;

    setStatus('loading');

    try {
      // Convertir base64 a Blob
      const base64Data = screenshot.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const file = new File([blob], 'screenshot.jpg', { type: 'image/jpeg' });

      // Crear FormData
      const formData = new FormData();
      formData.append('attachment', file);
      formData.append('user', responsable);
      formData.append('comments', feedbackText);

      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FEEDBACK_API_TOKEN}`,
        },
        body: formData,
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
  const responsableHasError = status === 'validation' && !responsable;
  const responsableIsValid = responsableTouched && responsable.length > 0 && status !== 'validation';

  const feedbackHasError = status === 'validation' && !feedbackText.trim();
  const feedbackIsValid = feedbackTouched && feedbackText.trim().length > 0 && status !== 'validation';

  // Border colors siguiendo wizard-solicitud
  const getResponsableBorderColor = () => {
    if (responsableHasError) return 'border-[#ef4444]';
    if (responsableIsValid) return 'border-[#22c55e]';
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
        wrapper: 'z-[150]',
        base: 'bg-white rounded-2xl',
        backdrop: 'bg-black/50 z-[149]',
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

                {/* Campo Responsable - selector estilo wizard-solicitud */}
                <div className="mb-5 space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                    Responsable
                  </label>
                  <div
                    className={`
                      flex items-center gap-2 h-11 px-3
                      rounded-lg border-2 transition-all duration-200 bg-white
                      ${getResponsableBorderColor()}
                      ${isFormDisabled ? 'opacity-50 bg-neutral-50' : ''}
                    `}
                  >
                    <User className={`w-4 h-4 flex-shrink-0 ${responsableHasError ? 'text-[#ef4444]' : 'text-neutral-400'}`} />
                    <select
                      value={responsable}
                      onChange={(e) => handleResponsableChange(e.target.value)}
                      disabled={isFormDisabled}
                      className="flex-1 bg-transparent outline-none text-base text-neutral-800 disabled:cursor-not-allowed cursor-pointer appearance-none"
                    >
                      <option value="" disabled>
                        Selecciona un responsable
                      </option>
                      {RESPONSABLES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {responsableIsValid && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
                    {responsableHasError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
                    {!responsableIsValid && !responsableHasError && <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />}
                  </div>
                  {responsableHasError && (
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
