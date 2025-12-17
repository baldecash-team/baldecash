'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/prototipos/0.3/hero/hero-preview');
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#4654CD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Redirigiendo...</p>
      </div>
    </div>
  );
}
