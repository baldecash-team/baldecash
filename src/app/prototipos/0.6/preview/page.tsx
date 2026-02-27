/**
 * Landing Preview Page - BaldeCash v0.6
 * Ruta escalable para preview de landing por ID usando query params
 *
 * Rutas:
 * - /prototipos/0.6/preview/?id=16&preview_key=abc123 → Landing ID 16 en modo preview
 *
 * Esta ruta NO requiere pre-generación de IDs, funciona con cualquier ID.
 * El preview_key es un hash único por landing que valida el acceso al preview.
 */

import { PreviewPageClient } from './PreviewPageClient';

export default function PreviewPage() {
  return <PreviewPageClient />;
}
