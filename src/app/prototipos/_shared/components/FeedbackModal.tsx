'use client';

/**
 * FeedbackModal - Modal para enviar feedback con screenshot
 * Muestra preview de la captura y textarea para comentarios
 */

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { MessageCircle, Send, Check, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshot: string | null;
  sectionId: string;
  pageUrl: string;
  config: Record<string, unknown>;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function FeedbackModal({
  isOpen,
  onClose,
  screenshot,
  sectionId,
  pageUrl,
  config,
}: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const handleSubmit = async () => {
    if (!feedbackText.trim() || !screenshot) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshot,
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
        }, 1500);
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
    }
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

          {/* Textarea para feedback */}
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Tu opinión
            </p>
            <textarea
              placeholder="¿Qué te parece este diseño? ¿Qué mejorarías?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              rows={5}
              className="w-full min-h-[140px] px-4 py-3 text-sm
                border-2 border-neutral-200 bg-neutral-50 rounded-xl
                hover:border-neutral-300
                focus:border-[#4654CD] focus:bg-white focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                placeholder:text-neutral-400
                transition-all resize-none"
            />
          </div>

          {/* Mensaje de error */}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-3 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Error al enviar. Intenta de nuevo.</span>
            </div>
          )}
        </ModalBody>

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
            isDisabled={!feedbackText.trim() || status === 'success'}
            startContent={
              status === 'success' ? (
                <Check className="w-4 h-4" />
              ) : status !== 'loading' ? (
                <Send className="w-4 h-4" />
              ) : null
            }
            className={`cursor-pointer font-medium ${
              status === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
            }`}
          >
            {status === 'success' ? '¡Enviado!' : 'Enviar Feedback'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
