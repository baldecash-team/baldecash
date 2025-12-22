'use client';

/**
 * SoundConfigV3 - Bajo demanda
 * Sonido solo si el usuario lo activa manualmente
 */

import React, { useState, useRef } from 'react';
import { Button } from '@nextui-org/react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundConfigProps {
  autoPlay?: boolean;
  onSoundToggle?: (isMuted: boolean) => void;
}

export const SoundConfigV3: React.FC<SoundConfigProps> = ({
  onSoundToggle
}) => {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (!hasPlayed) {
      audioRef.current = new Audio('/sounds/celebration.mp3');
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setIsPlaying(false);
      setHasPlayed(true);
      setIsPlaying(true);
      onSoundToggle?.(false);
    }
  };

  return (
    <AnimatePresence>
      {!hasPlayed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <Button
            variant="flat"
            radius="full"
            className="bg-white/90 backdrop-blur shadow-md cursor-pointer gap-2"
            onPress={handlePlay}
            startContent={<Play className="w-4 h-4 text-[#4654CD]" />}
          >
            <span className="text-sm text-neutral-700">Reproducir sonido</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoundConfigV3;
