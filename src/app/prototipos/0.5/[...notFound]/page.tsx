/**
 * Catch-all 404 Page
 * Captura todas las rutas no definidas en /prototipos/0.5/
 */

import { Suspense } from 'react';
import { NotFoundContent } from './NotFoundContent';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

// Required for static export - pre-generate common missing routes
export function generateStaticParams() {
  return [
    { notFound: ['legal', 'privacidad'] },
    { notFound: ['legal', 'terminos'] },
    { notFound: ['404'] },
  ];
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function NotFoundCatchAll() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotFoundContent />
    </Suspense>
  );
}
