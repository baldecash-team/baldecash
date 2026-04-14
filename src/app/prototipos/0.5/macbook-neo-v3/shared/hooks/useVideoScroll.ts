'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseVideoScrollOptions {
  height?: string;
}

export function useVideoScroll(videoSrc: string, opts: UseVideoScrollOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { height = '300vh' } = opts;

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    container.style.height = height;

    let ready = false;

    function onLoaded() {
      ready = true;
    }

    video.addEventListener('loadedmetadata', onLoaded);
    video.src = videoSrc;
    video.load();

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        if (ready && video.duration) {
          video.currentTime = self.progress * video.duration;
        }
      },
    });

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      trigger.kill();
    };
  }, [videoSrc, height]);

  return { videoRef, containerRef };
}
