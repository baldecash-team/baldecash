'use client';

/**
 * Quiz Preview Redirect - BaldeCash v0.4
 *
 * Redirige a la pagina principal del Quiz
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizPreviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/prototipos/0.4/quiz');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-500">Redirigiendo...</p>
    </div>
  );
}
