'use client';

/**
 * FeedbackButton - Botón flotante para enviar feedback en mode=clean
 * Abre modal para adjuntar imágenes y comentarios
 */

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { FeedbackModal } from './FeedbackModal';

interface FeedbackButtonProps {
  sectionId: string;
  /** Clases adicionales para el contenedor del botón (ej: para ajustar posición en mobile) */
  className?: string;
}

export function FeedbackButton({ sectionId, className }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <div
        className={`fixed right-6 z-[100] ${className || 'bottom-6'}`}
        data-feedback-button
      >
        <Button
          isIconOnly
          radius="full"
          className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3]
            transition-all hover:scale-105 w-12 h-12"
          onPress={() => setIsModalOpen(true)}
          aria-label="Enviar feedback"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Modal de feedback */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectionId={sectionId}
        pageUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />
    </>
  );
}
