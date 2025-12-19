'use client';

/**
 * Hero Section Landing Page
 * Auto-redirects to hero-preview page
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/prototipos/0.4/hero/hero-preview');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Redirigiendo a Hero Preview...</p>
      </div>
    </div>
  );
}
