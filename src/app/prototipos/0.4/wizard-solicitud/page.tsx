'use client';

/**
 * Wizard Solicitud - Redirect a preview
 * PROMPT_18: Meta-prompt que integra todo el flujo
 */

import { redirect } from 'next/navigation';

export default function WizardSolicitudPage() {
  redirect('/prototipos/0.4/wizard-solicitud/wizard-preview');
}
