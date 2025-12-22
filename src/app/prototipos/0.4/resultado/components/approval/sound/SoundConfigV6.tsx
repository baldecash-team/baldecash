'use client';

/**
 * SoundConfigV6 - Fanfarria
 * Música de celebración completa con controles
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button, Progress } from '@nextui-org/react';
import { Volume2, VolumeX, Music, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundConfigProps {
  autoPlay?: boolean;
  onSoundToggle?: (isMuted: boolean) => void;
}

export const SoundConfigV6: React.FC<SoundConfigProps> = ({
  autoPlay = true,
  onSoundToggle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoPlay) {
      audioRef.current = new Audio('/sounds/fanfare.mp3');
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        startProgress();
      }).catch(() => {
        setIsPlaying(false);
      });

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setProgress(100);
        setTimeout(() => setShowControls(false), 2000);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay]);

  const startProgress = () => {
    intervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(currentProgress);
      }
    }, 100);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      audioRef.current.play().catch(() => {});
      startProgress();
    }
    setIsPlaying(!isPlaying);
    onSoundToggle?.(!isPlaying);
  };

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white/95 backdrop-blur rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4654CD]/10 flex items-center justify-center">
              <Music className="w-4 h-4 text-[#4654CD]" />
            </div>

            <div className="flex flex-col min-w-[120px]">
              <span className="text-xs text-neutral-600 font-medium">Celebración</span>
              <Progress
                size="sm"
                value={progress}
                classNames={{
                  indicator: 'bg-[#4654CD]',
                  track: 'bg-neutral-200',
                }}
              />
            </div>

            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              className="cursor-pointer"
              onPress={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-[#4654CD]" />
              ) : (
                <Play className="w-4 h-4 text-[#4654CD]" />
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoundConfigV6;
