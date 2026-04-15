'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Stale deployment: chunk or RSC payload failed to load.
    // Reload once so the browser fetches the current deployment assets.
    const isChunkError =
      error.message?.includes('Failed to load chunk') ||
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Loading chunk');

    if (isChunkError) {
      const key = 'chunk-error-reload';
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();

      // Prevent infinite reload loop: only auto-reload once per 30s
      if (!lastReload || now - Number(lastReload) > 30_000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
        return;
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-neutral-800 mb-2">
          Algo no carga bien
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          Hubo un problema al cargar la pagina. Intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[var(--color-primary,#4654CD)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
