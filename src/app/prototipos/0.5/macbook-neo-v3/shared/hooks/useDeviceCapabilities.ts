'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type ExperienceTier = 'enhanced' | 'base';

interface DeviceCapabilities {
  /** 'enhanced' for full animations, 'base' for static/reduced */
  tier: ExperienceTier;
  /** User prefers reduced motion */
  reducedMotion: boolean;
  /** Device is in low power / battery saver mode */
  lowPowerMode: boolean;
  /** Viewport too small for rich animations (<480px width) */
  smallViewport: boolean;
  /** Touch-only device (no hover) */
  isTouch: boolean;
}

/**
 * Apple-inspired PageExperienceManager (PEM) pattern.
 * Detects device capabilities and returns an experience tier.
 * Components can use `tier` to decide animation complexity.
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const reducedMotion = useReducedMotion();
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [smallViewport, setSmallViewport] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Low Power Mode detection via Battery API
    if ('getBattery' in navigator) {
      (navigator as Navigator & { getBattery: () => Promise<{ charging: boolean; level: number }> })
        .getBattery()
        .then((battery) => {
          // Consider low power when battery < 20% and not charging
          setLowPowerMode(!battery.charging && battery.level < 0.2);
        })
        .catch(() => {
          // Battery API not available, assume normal
        });
    }

    // Small viewport detection
    const checkViewport = () => {
      setSmallViewport(window.innerWidth <= 480);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);

    // Touch detection
    setIsTouch(
      'ontouchstart' in window || navigator.maxTouchPoints > 0,
    );

    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, []);

  // Determine experience tier
  const tier: ExperienceTier =
    reducedMotion || lowPowerMode || smallViewport ? 'base' : 'enhanced';

  return {
    tier,
    reducedMotion,
    lowPowerMode,
    smallViewport,
    isTouch,
  };
}
