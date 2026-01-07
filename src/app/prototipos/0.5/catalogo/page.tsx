'use client';

/**
 * Catálogo v0.5 - Auto-redirect al preview configurable
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CatalogoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/prototipos/0.5/catalogo/catalog-preview');
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
