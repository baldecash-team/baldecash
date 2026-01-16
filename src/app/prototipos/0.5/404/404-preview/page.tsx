/**
 * 404 Preview Page
 * Para previsualizar el diseño del 404
 */

import { Suspense } from 'react';
import { NotFoundContent } from '../../[...notFound]/NotFoundContent';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function NotFoundPreview() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotFoundContent />
    </Suspense>
  );
}
