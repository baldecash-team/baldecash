'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Catálogo Landing Page
 * Redirige automáticamente a catalog-preview
 */
export default function CatalogoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/prototipos/0.4/catalogo/catalog-preview/?layout=4&brand=3&techfilters=3&cols=3&skeleton=3&duration=default&loadmore=3&gallery=2&gallerysize=3');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Redirigiendo a Catálogo Preview...</p>
      </div>
    </div>
  );
}
