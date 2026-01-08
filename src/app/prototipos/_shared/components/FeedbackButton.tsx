'use client';

/**
 * FeedbackButton - Botón flotante para enviar feedback en mode=clean
 * Captura screenshot al hacer click y abre modal para comentarios
 */

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { FeedbackModal } from './FeedbackModal';
import { useScreenshot } from '../hooks/useScreenshot';

interface FeedbackButtonProps {
  sectionId: string;
  config: Record<string, unknown>;
  /** Clases adicionales para el contenedor del botón (ej: para ajustar posición en mobile) */
  className?: string;
}

export function FeedbackButton({ sectionId, config, className }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const { captureScreenshot, isCapturing } = useScreenshot();

  const handleOpenFeedback = async () => {
    const captured = await captureScreenshot();
    if (captured) {
      setScreenshot(captured);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Overlay de captura */}
      {isCapturing && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm
            flex items-center justify-center"
          data-feedback-overlay
        >
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-4 border-[#4654CD] border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-neutral-800 text-lg font-semibold">
                Capturando pantalla
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                Esto puede tomar unos segundos...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <div
        className={`fixed right-6 z-[100] ${className || 'bottom-6'}`}
        data-feedback-button
      >
        <Button
          isIconOnly
          radius="full"
          isDisabled={isCapturing}
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3]
            transition-all hover:scale-105 w-12 h-12"
          onPress={handleOpenFeedback}
          aria-label="Enviar feedback"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Modal de feedback */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        screenshot={screenshot}
        sectionId={sectionId}
        pageUrl={typeof window !== 'undefined' ? window.location.href : ''}
        config={config}
      />
    </>
  );
}
