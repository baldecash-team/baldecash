'use client';

import { useVideoScroll } from '../hooks/useVideoScroll';

interface VideoScrollerProps {
  src: string;
  webmSrc?: string;
  poster?: string;
  height?: string;
}

export function VideoScroller({
  src,
  poster,
  height = '300vh',
}: VideoScrollerProps) {
  const { videoRef, containerRef } = useVideoScroll(src, { height });

  return (
    <div ref={containerRef} className="relative">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          poster={poster}
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
