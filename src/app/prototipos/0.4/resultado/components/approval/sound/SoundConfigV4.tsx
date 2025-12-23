'use client';

/**
 * SoundConfigV4 - Ding sutil
 * Sonido corto tipo "ding" estilo fintech
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface SoundConfigProps {
  autoPlay?: boolean;
  onSoundToggle?: (isMuted: boolean) => void;
}

export const SoundConfigV4: React.FC<SoundConfigProps> = ({
  autoPlay = true,
  onSoundToggle
}) => {
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay && !hasPlayed) {
      // Reproducir sonido corto tipo "ding"
      audioRef.current = new Audio('/sounds/ding.mp3');
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
      setHasPlayed(true);
      onSoundToggle?.(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [autoPlay, hasPlayed, onSoundToggle]);

  // Indicador visual sutil de que el sonido se reprodujo
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="w-10 h-10 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Bell className="w-5 h-5 text-[#4654CD]" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SoundConfigV4;
