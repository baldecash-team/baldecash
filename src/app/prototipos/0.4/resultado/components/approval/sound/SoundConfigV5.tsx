'use client';

/**
 * SoundConfigV5 - Adaptativo
 * Sonido en desktop, silencio en mobile
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

interface SoundConfigProps {
  autoPlay?: boolean;
  onSoundToggle?: (isMuted: boolean) => void;
}

export const SoundConfigV5: React.FC<SoundConfigProps> = ({
  autoPlay = true,
  onSoundToggle
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Detectar si es mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsMuted(mobile); // Silenciar en mobile por defecto
      return mobile;
    };

    const mobile = checkMobile();

    if (autoPlay && !mobile) {
      audioRef.current = new Audio('/sounds/celebration.mp3');
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {
        setIsMuted(true);
      });
    }

    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [autoPlay]);

  const handleToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onSoundToggle?.(newMuted);

    if (!newMuted && !audioRef.current) {
      audioRef.current = new Audio('/sounds/celebration.mp3');
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-full shadow-md px-3 py-2">
        {isMobile ? (
          <Smartphone className="w-4 h-4 text-neutral-400" />
        ) : (
          <Monitor className="w-4 h-4 text-neutral-400" />
        )}
        <span className="text-xs text-neutral-500">
          {isMobile ? 'Modo silencioso' : 'Con sonido'}
        </span>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          radius="full"
          className="cursor-pointer"
          onPress={handleToggle}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-neutral-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#4654CD]" />
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default SoundConfigV5;
