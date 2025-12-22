'use client';

/**
 * SoundConfigV1 - Activo por defecto
 * Sonido con botón visible para silenciar
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundConfigProps {
  autoPlay?: boolean;
  onSoundToggle?: (isMuted: boolean) => void;
}

export const SoundConfigV1: React.FC<SoundConfigProps> = ({
  autoPlay = true,
  onSoundToggle
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay && !isMuted) {
      // Simular reproducción de sonido (en producción sería un archivo real)
      audioRef.current = new Audio('/sounds/celebration.mp3');
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Autoplay bloqueado por el navegador
        setIsMuted(true);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [autoPlay, isMuted]);

  const handleToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onSoundToggle?.(newMuted);

    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        isIconOnly
        variant="flat"
        radius="full"
        className="bg-white/90 backdrop-blur shadow-md cursor-pointer"
        onPress={handleToggle}
        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-neutral-600" />
        ) : (
          <Volume2 className="w-5 h-5 text-[#4654CD]" />
        )}
      </Button>
    </div>
  );
};

export default SoundConfigV1;
