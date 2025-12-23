import { redirect } from 'next/navigation';

/**
 * Resultado Section - Redirect to preview
 * Incluye: Aprobación (PROMPT_15) y Rechazo (PROMPT_16)
 */

export default function ResultadoPage() {
  redirect('/prototipos/0.4/resultado/aprobado-preview');
}
