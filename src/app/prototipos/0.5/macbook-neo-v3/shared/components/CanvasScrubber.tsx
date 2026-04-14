'use client';

import { useCanvasScrub } from '../hooks/useCanvasScrub';

interface CanvasScrubberProps {
  frameUrls: string[];
  height?: string;
}

export function CanvasScrubber({ frameUrls, height = '400vh' }: CanvasScrubberProps) {
  const { canvasRef, containerRef, loaded } = useCanvasScrub(frameUrls, {
    containerHeight: height,
  });

  return (
    <div ref={containerRef} className="relative">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        {!loaded && (
          <div className="flex items-center gap-2 text-[#86868b]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-sm">Cargando...</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="max-h-[80vh] w-full max-w-[1200px] object-contain"
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }}
        />
      </div>
    </div>
  );
}
