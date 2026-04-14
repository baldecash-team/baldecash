'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface UseCanvasScrubOptions {
  containerHeight?: string;
}

export function useCanvasScrub(
  frameUrls: string[],
  opts: UseCanvasScrubOptions = {},
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const reducedMotion = useReducedMotion();
  const { containerHeight = '400vh' } = opts;

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  useEffect(() => {
    if (frameUrls.length === 0) return;

    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    frameUrls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameUrls.length) {
          imagesRef.current = images;
          setLoaded(true);
          drawFrame(0);
        }
      };
      images[i] = img;
    });
  }, [frameUrls, drawFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loaded) return;

    // Show static first frame if user prefers reduced motion
    if (reducedMotion) {
      container.style.height = 'auto';
      drawFrame(0);
      return;
    }

    container.style.height = containerHeight;
    const totalFrames = frameUrls.length;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const frameIndex = Math.min(
          Math.floor(self.progress * totalFrames),
          totalFrames - 1,
        );
        drawFrame(frameIndex);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [loaded, frameUrls.length, containerHeight, drawFrame, reducedMotion]);

  return { canvasRef, containerRef, loaded };
}
