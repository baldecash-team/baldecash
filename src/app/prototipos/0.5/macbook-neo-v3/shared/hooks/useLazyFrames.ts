'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseLazyFramesOptions {
  /** Number of frames per chunk to load at once */
  chunkSize?: number;
  /** Priority frame indices to load first (e.g., [0]) */
  priorityIndices?: number[];
}

/**
 * Apple-inspired lazy loading for frame sequences.
 * Instead of loading ALL frames upfront, loads in chunks:
 * 1. Priority frames first (frame 0 for immediate display)
 * 2. Remaining frames in chunks sequentially in background
 *
 * Reduces initial load time significantly for 100+ frame sequences.
 */
export function useLazyFrames(
  frameUrls: string[],
  opts: UseLazyFramesOptions = {},
) {
  const { chunkSize = 20, priorityIndices = [0] } = opts;
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedSetRef = useRef<Set<number>>(new Set());
  const [priorityLoaded, setPriorityLoaded] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingRef = useRef(false);

  // Stabilize frameUrls — only change when the serialized value changes
  const frameUrlsKey = frameUrls.join('\n');
  const stableFrameUrls = useMemo(() => frameUrls, [frameUrlsKey]);
  const totalFrames = stableFrameUrls.length;

  // Stabilize priority indices
  const priorityKey = priorityIndices.join(',');
  const stablePriorityIndices = useMemo(() => priorityIndices, [priorityKey]);

  // Draw a frame to canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  // Get the nearest loaded frame to a given index
  const getNearestLoadedFrame = useCallback((targetIndex: number): number => {
    if (loadedSetRef.current.has(targetIndex)) return targetIndex;

    for (let offset = 1; offset < totalFrames; offset++) {
      const below = targetIndex - offset;
      const above = targetIndex + offset;
      if (below >= 0 && loadedSetRef.current.has(below)) return below;
      if (above < totalFrames && loadedSetRef.current.has(above)) return above;
    }
    return 0;
  }, [totalFrames]);

  // Load priority frames first, then remaining in background
  useEffect(() => {
    if (stableFrameUrls.length === 0 || loadingRef.current) return;
    loadingRef.current = true;

    // Reset state
    imagesRef.current = new Array(stableFrameUrls.length).fill(null);
    loadedSetRef.current = new Set();
    setPriorityLoaded(false);
    setTotalLoaded(0);

    let cancelled = false;

    function loadSingleFrame(index: number): Promise<void> {
      return new Promise((resolve) => {
        if (cancelled || loadedSetRef.current.has(index) || index >= stableFrameUrls.length) {
          resolve();
          return;
        }
        const img = new window.Image();
        img.src = stableFrameUrls[index];
        img.onload = () => {
          if (cancelled) { resolve(); return; }
          imagesRef.current[index] = img;
          loadedSetRef.current.add(index);
          setTotalLoaded((prev) => prev + 1);
          resolve();
        };
        img.onerror = () => resolve();
      });
    }

    async function loadAll() {
      // Step 1: Load priority frames
      await Promise.all(stablePriorityIndices.map((i) => loadSingleFrame(i)));
      if (cancelled) return;
      setPriorityLoaded(true);
      drawFrame(stablePriorityIndices[0] ?? 0);

      // Step 2: Load remaining in sequential chunks
      for (let i = 0; i < stableFrameUrls.length; i += chunkSize) {
        if (cancelled) return;
        const end = Math.min(i + chunkSize, stableFrameUrls.length);
        const promises: Promise<void>[] = [];
        for (let j = i; j < end; j++) {
          if (!loadedSetRef.current.has(j)) {
            promises.push(loadSingleFrame(j));
          }
        }
        await Promise.all(promises);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
      loadingRef.current = false;
    };
  }, [stableFrameUrls, stablePriorityIndices, chunkSize, drawFrame]);

  // Load frames around a specific scroll position
  const ensureFramesAround = useCallback(
    (index: number) => {
      const half = Math.floor(chunkSize / 2);
      const start = Math.max(0, index - half);
      const end = Math.min(stableFrameUrls.length, index + half);
      for (let i = start; i < end; i++) {
        if (!loadedSetRef.current.has(i) && !imagesRef.current[i]) {
          const img = new window.Image();
          img.src = stableFrameUrls[i];
          img.onload = () => {
            imagesRef.current[i] = img;
            loadedSetRef.current.add(i);
          };
        }
      }
    },
    [chunkSize, stableFrameUrls],
  );

  return {
    canvasRef,
    imagesRef,
    drawFrame,
    getNearestLoadedFrame,
    ensureFramesAround,
    priorityLoaded,
    totalLoaded,
    totalFrames,
    progress: totalFrames > 0 ? totalLoaded / totalFrames : 0,
  };
}
