'use client';

/**
 * 404 Preview Page
 * Para previsualizar el diseño del 404
 */

import { NotFoundContent } from '../../[...notFound]/NotFoundContent';
import { useScrollToTop } from '@/app/prototipos/_shared';

export default function NotFoundPreview() {
  // Scroll to top on page load
  useScrollToTop();

  return <NotFoundContent />;
}
