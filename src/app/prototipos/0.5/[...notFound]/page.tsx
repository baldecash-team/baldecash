/**
 * Catch-all 404 Page
 * Captura todas las rutas no definidas en /prototipos/0.5/
 */

import { NotFoundContent } from './NotFoundContent';

// Required for static export - pre-generate common missing routes
export function generateStaticParams() {
  return [
    { notFound: ['legal', 'privacidad'] },
    { notFound: ['legal', 'terminos'] },
    { notFound: ['404'] },
  ];
}

export default function NotFoundCatchAll() {
  return <NotFoundContent />;
}
