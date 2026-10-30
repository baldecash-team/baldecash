/**
 * «Probar en la web» (BAL-5367): abrir el link firmado que genera el panel y
 * avisar el envío simulado. Los dos quedan en la bitácora del formulario.
 */
import * as Sentry from '@sentry/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface LinkDePruebaAbierto {
  link: string;
  landing_id: number;
  landing_slug: string;
  preview_key: string;
  form_id: number;
  borrador: boolean;
  version: number | null;
  equipo: {
    product_id: number;
    combo_id: number | null;
    variant_id: number | null;
    term: number;
    initial: number;
    frequency: string;
    nombre?: string | null;
  };
  dni: string;
  expires_at: string;
  vence_texto: string;
  creado_por: string | null;
}

export type ResultadoDeApertura =
  | { ok: true; datos: LinkDePruebaAbierto }
  | { ok: false; mensaje: string };

const MENSAJE_GENERICO = 'No pudimos abrir este link de prueba. Genera otro desde el panel.';

export async function abrirLinkDePrueba(token: string): Promise<ResultadoDeApertura> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/form-test-link/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });
    const cuerpo = await r.json().catch(() => null);
    if (!r.ok) {
      return { ok: false, mensaje: cuerpo?.detail?.message || MENSAJE_GENERICO };
    }
    return { ok: true, datos: cuerpo as LinkDePruebaAbierto };
  } catch (error) {
    Sentry.captureException(error, { tags: { modulo: 'vista_de_prueba', accion: 'abrir' } });
    return { ok: false, mensaje: MENSAJE_GENERICO };
  }
}

/**
 * Registra el envío simulado. No bloquea nada: si falla, la confirmación
 * simulada se muestra igual y se avisa a Sentry.
 */
export async function avisarEnvioSimulado(token: string): Promise<void> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/form-test-link/simulated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });
    if (!r.ok) {
      Sentry.captureMessage(`vista de prueba: no se registró el envío simulado (${r.status})`, {
        level: 'warning', tags: { modulo: 'vista_de_prueba', accion: 'simulado' },
      });
    }
  } catch (error) {
    Sentry.captureException(error, { tags: { modulo: 'vista_de_prueba', accion: 'simulado' } });
  }
}
