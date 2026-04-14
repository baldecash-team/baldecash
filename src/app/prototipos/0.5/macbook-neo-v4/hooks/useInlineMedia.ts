'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../macbook-neo-v3/shared/hooks/useReducedMotion';

/**
 * Viewport-based video play/pause (Apple's InlineMedia pattern).
 * Auto-plays video when >50% visible, pauses when out of viewport.
 */
export function useInlineMedia() {
  const ref = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return { ref, isPlaying };
}
