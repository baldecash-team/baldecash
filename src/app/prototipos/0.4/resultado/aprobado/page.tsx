import { redirect } from 'next/navigation';

/**
 * Aprobación Page - Redirect to preview
 */

export default function AprobadoPage() {
  redirect('/prototipos/0.4/resultado/aprobado-preview');
}
