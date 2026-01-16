'use client';

/**
 * FeedbackModal - Modal/Drawer híbrido para enviar feedback
 * - Desktop: Modal centrado (NextUI)
 * - Mobile: Bottom Sheet con drag to close (patrón sección 20)
 */

import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { MessageCircle, Send, AlertCircle, Check, CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { SelectInput } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields';
import { useIsMobile } from '../hooks/useIsMobile';

const RESPONSABLE_STORAGE_KEY = 'baldecash-feedback-responsable';

const FEEDBACK_API_URL = 'https://ws.baldecash.com/api/feedback';
const FEEDBACK_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3IiwianRpIjoiMmMyZWE0ZDc3OTQwZWY2ZTdmMzJlOGRkMjUwNjRhYTdhNjIyNDRmMzUzMDBkOTcyMGFjY2FhMWQxZmU4OTE2MzUxOGEwMDkzMGViZTc2NGQiLCJpYXQiOjE3NDIzMzc0OTEuMjExMzUsIm5iZiI6MTc0MjMzNzQ5MS4yMTEzNTMsImV4cCI6MTc3Mzg3MzQ5MS4xOTQ0NTUsInN1YiI6IjEiLCJzY29wZXMiOlsiKiJdfQ.GmljQKk_hSEzVFlRfZMYRpt1jtBc_Fl27Vt2UEeMT5lwN4ms1w84f-dJOObRDUyzh4--DONHc7O1WZ36SjttIqmPotbSw9UWRlrA0cDrhGzmwt6nQGAAqCth1g8pkgu5tXb737wbDq8hTHtu5FU05nLrs2bYqxtbjgp500VoQB23_xEi-5FybCX0pM3i38F6VeyPoduIiY7-FRiUq6tw153uSIcCjNpZGwkffBqw6hxQ0rgGe8G_ytFbMxha_Z0zuDL5oqXtEE2U2w4mIG2_cKygysbyPOd3Qkq_LLD_lRpOWHPASrxLdVQGpLkayCBXzHb4B-Qr0Z7zQz9LqZADqojck5J8R4ZitmPpGwHbQvh6t6IbsJuXRq9mFE37VPpqxvmHyJzo_4uM5Rm0K-jKvZ4WggUddAjDn8untElx1ncMjCmFs_kOcpnoUStv3aOQGk75635_WImjTStt05BQ_EmDoRZizUqZ2zVhlrxjmgnv1SxEiPL4jDK9jaLJWUnS2MPQX4yzhd6xwhFk0LI677xpMOiag-kFU5nC3naIc9bZBKj_Ekt1UyMejPL4KqMQsBk6g40eD6ju8qVEjNEZxYCLtgD6Qr8_dheXfXiDTQQltgrG-qSzio888E_ygdq2cawS73zf5edQiau_p_wpodbCl1O6r5BzZhRuaFF0zAA';

const RESPONSABLES = [
  'GERARDO AGUIRRE',
  'CECILIA ALIAGA',
  'ANTONELLA ARELLANO',
  'JULIO AVILA',
  'JHAHAYRA CACHAY',
  'YOSMAR CADENAS',
  'JUAN CARLOS CHAVEZ',
  'JORGE CORDOVA',
  'LIDYMAR DELLAN',
  'MARCO DEL RIO',
  'PAMELA ESPINOZA',
  'ANA ESTELA',
  'ALESSANDRA FLORES',
  'GENESIS GAMBOA',
  'MILENA GARCIA',
  'GRETCHEN GARRATT',
  'EMILIO GONZALES',
  'THIAGO GUTIERREZ',
  'VANIA HAGEL',
  'CAROLINA LEDESMA',
  'INGRID LEON',
  'BENNY LIU',
  'CONSUELO MARISCAL',
  'STEFANIA MC GREGOR',
  'FRANK MEDINA',
  'LEONARDO MEDINA',
  'EDWARD MENDOZA',
  'RUBEN MONTENEGRO',
  'JORGE MORALES',
  'MONICA OBANDO',
  'ANDERSON PALOMINO',
  'MAYRA PEREIRA',
  'JORGE PUMATANCA',
  'ALBERTO RAMOS',
  'JUAN ROJAS',
  'ANTONI SANCHEZ',
  'ALMENDRA SANTAMARIA',
  'JUDITH TAGLE',
  'PAUL VARGAS',
  'YADIRA YOVERA',
  'MIGUEL ZAVALA',
] as const;

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const RESPONSABLES_OPTIONS = RESPONSABLES.map((name) => ({
  value: name,
  label: name,
}));

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  pageUrl: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error' | 'validation';

export function FeedbackModal({
  isOpen,
  onClose,
  sectionId,
  pageUrl,
}: FeedbackModalProps) {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();

  const [responsable, setResponsable] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [responsableTouched, setResponsableTouched] = useState(false);
  const [feedbackTouched, setFeedbackTouched] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filesTouched, setFilesTouched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper para manejar focus en inputs (iOS keyboard fix)
  const handleInputFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsInputFocused(true);
    // Scroll al input después de que el teclado aparezca
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    setFeedbackTouched(true);
  };

  /// OBLIGATORIO: Bloquear scroll del body cuando está abierto (iOS Safari fix)
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
    if (status === 'validation') {
      setStatus('idle');
      setValidationMessage('');
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedbackText(value);
    if (status === 'validation') {
      setStatus('idle');
      setValidationMessage('');
    }
  };

  const handleFilesAdd = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      if (files.some(f => f.name === file.name && f.size === file.size)) continue;
      validFiles.push(file);
    }

    const combined = [...files, ...validFiles].slice(0, MAX_FILES);
    setFiles(combined);
    setFilesTouched(true);

    if (status === 'validation') {
      setStatus('idle');
      setValidationMessage('');
    }
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesAdd(e.dataTransfer.files);
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
    // Validar primero - solo marcar como touched si hay error
    if (!validateForm()) {
      setResponsableTouched(true);
      setFeedbackTouched(true);
      setFilesTouched(true);
      return;
    }

    // Si pasa validación, continuar directamente sin re-render previo
    setStatus('loading');

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`attachment${index > 0 ? index + 1 : ''}`, file);
      });
      formData.append('user', responsable);
      formData.append('comments', feedbackText);
      formData.append('url', pageUrl);
      formData.append('section', sectionId);

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
          resetForm();
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const resetForm = () => {
    setFeedbackText('');
    setFiles([]);
    setStatus('idle');
    setValidationMessage('');
    setFeedbackTouched(false);
    setFilesTouched(false);
  };

  const handleClose = () => {
    if (status !== 'loading') {
      onClose();
      resetForm();
    }
  };

  const isFormDisabled = status === 'loading' || status === 'success';

  // Field states
  const responsableHasError = status === 'validation' && !responsable;
  const responsableIsValid = responsableTouched && responsable.length > 0 && status !== 'validation';
  const feedbackHasError = status === 'validation' && !feedbackText.trim();
  const feedbackIsValid = feedbackTouched && feedbackText.trim().length > 0 && status !== 'validation';

  const getFeedbackBorderColor = () => {
    if (feedbackHasError) return 'border-[#ef4444]';
    if (feedbackIsValid) return 'border-[#22c55e]';
    return 'border-neutral-300';
  };

  // Footer buttons JSX (inline para evitar re-render issues)
  const footerButtonsJSX = status !== 'success' && (
    <div className="flex gap-3 justify-end">
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
    </div>
  );

  // ========== MOBILE: Bottom Sheet (sección 20) ==========
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - touch-action:none previene scroll en iOS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              onTouchMove={(e) => e.preventDefault()}
              className="fixed inset-0 bg-black/50 z-[149]"
              style={{ touchAction: 'none' }}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag={isInputFocused ? false : "y"}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  handleClose();
                }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[150] max-h-[calc(100vh-12rem)] flex flex-col"
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Drag Handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              >
                <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-3">
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
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={handleClose}
                  className="cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Body - scrollable (contenido inline para evitar re-renders en iOS) */}
              <div
                className="flex-1 overflow-y-auto p-4"
                style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
              >
                {status === 'success' ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                      ¡Gracias por tu feedback!
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Tu opinión ha sido enviada correctamente
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* File Upload Area */}
                    <div className="mb-5">
                      <p className="text-sm font-medium text-neutral-700 mb-2">
                        Adjuntar imágenes <span className="text-neutral-400 font-normal">(opcional, máx. 10)</span>
                      </p>
                      <div
                        onClick={() => !isFormDisabled && fileInputRef.current?.click()}
                        className={`
                          relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                          transition-all duration-200 border-neutral-300
                          ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                          ${files.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp"
                          multiple
                          onChange={(e) => e.target.files && handleFilesAdd(e.target.files)}
                          disabled={isFormDisabled || files.length >= MAX_FILES}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                        <p className="text-sm text-neutral-600">
                          {files.length >= MAX_FILES
                            ? 'Límite de archivos alcanzado'
                            : 'Toca para seleccionar imágenes'
                          }
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          JPG, PNG, GIF, WebP (máx. 5MB)
                        </p>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {files.map((file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                              {!isFormDisabled && (
                                <button
                                  onClick={() => handleFileRemove(index)}
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full
                                    flex items-center justify-center cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {files.length > 0 && (
                        <p className="text-xs text-neutral-500 mt-2">
                          {files.length} de {MAX_FILES} archivos
                        </p>
                      )}
                    </div>

                    {/* Campo Responsable */}
                    <div className="mb-5">
                      <SelectInput
                        id="responsable-mobile"
                        label="Responsable"
                        value={responsable}
                        onChange={handleResponsableChange}
                        options={RESPONSABLES_OPTIONS}
                        placeholder="Selecciona un responsable"
                        error={responsableHasError ? 'Este campo es requerido' : undefined}
                        success={responsableIsValid}
                        disabled={isFormDisabled}
                        required={true}
                        searchable={true}
                      />
                    </div>

                    {/* Textarea para feedback */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-700">Tu opinión</label>
                      <div
                        className={`
                          relative rounded-lg border-2 transition-colors bg-white
                          ${getFeedbackBorderColor()}
                          ${isFormDisabled ? 'opacity-50 bg-neutral-50' : ''}
                        `}
                      >
                        <textarea
                          id="feedback-textarea-mobile"
                          placeholder="¿Qué te parece este diseño?"
                          value={feedbackText}
                          onChange={(e) => handleFeedbackChange(e.target.value)}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          disabled={isFormDisabled}
                          maxLength={500}
                          rows={4}
                          style={{ fontSize: '16px' }}
                          className="w-full min-h-[120px] pl-3 pr-10 py-2.5 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 resize-none"
                        />
                        <div className="absolute top-3 right-3">
                          {feedbackIsValid && <Check className="w-5 h-5 text-[#22c55e]" />}
                          {feedbackHasError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {feedbackHasError ? (
                          <p className="text-sm text-[#ef4444] flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Este campo es requerido
                          </p>
                        ) : (
                          <span />
                        )}
                        <p className="text-xs text-neutral-400">{feedbackText.length}/500</p>
                      </div>
                    </div>

                    {/* Error de API */}
                    {status === 'error' && (
                      <div className="flex items-center gap-2 text-[#ef4444] text-sm mt-4 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>Error al enviar. Intenta de nuevo.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 bg-white p-4">
                {footerButtonsJSX}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ========== DESKTOP: Modal (NextUI) ==========
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      backdrop="blur"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        wrapper: 'z-[150]',
        base: 'bg-white rounded-2xl max-h-[90vh]',
        backdrop: 'bg-black/50 z-[149]',
        header: 'border-b border-neutral-100 pb-4',
        body: 'py-5 overflow-y-auto',
        footer: 'border-t border-neutral-100 pt-4',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
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
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* File Upload Area */}
                <div className="mb-5">
                  <p className="text-sm font-medium text-neutral-700 mb-2">
                    Adjuntar imágenes <span className="text-neutral-400 font-normal">(opcional, máx. 10)</span>
                  </p>

                  <div
                    onClick={() => !isFormDisabled && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                      transition-all duration-200
                      ${isDragging ? 'border-[#4654CD] bg-[#4654CD]/5' : 'border-neutral-300 hover:border-neutral-400'}
                      ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${files.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      multiple
                      onChange={(e) => e.target.files && handleFilesAdd(e.target.files)}
                      disabled={isFormDisabled || files.length >= MAX_FILES}
                      className="hidden"
                    />
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-[#4654CD]' : 'text-neutral-400'}`} />
                    <p className="text-sm text-neutral-600">
                      {files.length >= MAX_FILES
                        ? 'Límite de archivos alcanzado'
                        : 'Arrastra imágenes aquí o haz clic para seleccionar'
                      }
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      JPG, PNG, GIF, WebP (máx. 5MB por archivo)
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {!isFormDisabled && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileRemove(index);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full
                                flex items-center justify-center opacity-0 group-hover:opacity-100
                                transition-opacity cursor-pointer hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <p className="text-xs text-neutral-500 mt-2">
                      {files.length} de {MAX_FILES} archivos seleccionados
                    </p>
                  )}
                </div>

                {/* Campo Responsable */}
                <div className="mb-5">
                  <SelectInput
                    id="responsable"
                    label="Responsable"
                    value={responsable}
                    onChange={handleResponsableChange}
                    options={RESPONSABLES_OPTIONS}
                    placeholder="Selecciona un responsable"
                    error={responsableHasError ? 'Este campo es requerido' : undefined}
                    success={responsableIsValid}
                    disabled={isFormDisabled}
                    required={true}
                    searchable={true}
                  />
                </div>

                {/* Textarea para feedback */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                    Tu opinión
                  </label>
                  <div
                    className={`
                      relative rounded-lg border-2 transition-all duration-200 bg-white overflow-hidden
                      ${getFeedbackBorderColor()}
                      ${isFormDisabled ? 'opacity-50 bg-neutral-50' : ''}
                    `}
                  >
                    <textarea
                      placeholder="¿Qué te parece este diseño? ¿Qué mejorarías?"
                      value={feedbackText}
                      onChange={(e) => handleFeedbackChange(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      disabled={isFormDisabled}
                      maxLength={500}
                      rows={5}
                      style={{ fontSize: '16px' }}
                      className="w-full min-h-[140px] pl-3 pr-10 py-2.5 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 disabled:cursor-not-allowed resize-none"
                    />
                    <div className="absolute top-3 right-3">
                      {feedbackIsValid && <Check className="w-5 h-5 text-[#22c55e]" />}
                      {feedbackHasError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
                    </div>
                  </div>
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

                {/* Error de API */}
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

        <ModalFooter className="gap-3">
          {footerButtonsJSX}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
