'use client';

/**
 * «Probar en la web» (BAL-5367): `/preview/{landing}?t=TOKEN`.
 *
 * Valida el link con ws2 (que lo deja en la bitácora), deja el equipo elegido
 * en el panel como si la persona hubiera apretado «Lo quiero», marca la vista
 * de prueba (el envío se simula) y entra al formulario. Las respuestas de
 * prueba se siembran ya adentro, cuando el config del wizard está cargado
 * (`SembrarVistaDePrueba`).
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { usePreview } from '../../context/PreviewContext';
import { abrirLinkDePrueba } from '../../services/linkDePruebaApi';
import { fetchAllCardsByIds } from '../../services/catalogApi';
import { clearProductStorage, getStorageKey } from '../../[landing]/solicitar/context/ProductContext';
import { clearWizardFormStorage } from '../../[landing]/solicitar/context/WizardContext';
import { clearEnvioAnticipadoHandoff } from '../../[landing]/solicitar/utils/envioAnticipadoHandoff';
import { clearDemoApplication } from '../../[landing]/solicitar/utils/demoApplication';
import { armarEquipoDePrueba, cardDelEquipo } from '../../utils/equipoDePrueba';
import { guardarVistaDePrueba } from '../../utils/vistaDePrueba';

/** Saca el token de la barra: la URL completa viaja en cada hit de analítica. */
function quitarTokenDeLaBarra(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('t')) return;
    url.searchParams.delete('t');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // no-op
  }
}

export function AbrirLinkDePrueba({ token }: { token: string }) {
  const router = useRouter();
  const { setPreviewMode } = usePreview();
  const [error, setError] = useState<string | null>(null);
  // Una sola apertura por montaje: en desarrollo React monta dos veces y
  // cada apertura queda en la bitácora.
  const abierto = useRef(false);

  useEffect(() => {
    if (abierto.current) return;
    abierto.current = true;
    quitarTokenDeLaBarra();

    (async () => {
      const r = await abrirLinkDePrueba(token);
      if (!r.ok) {
        setError(r.mensaje);
        return;
      }
      const d = r.datos;
      const slug = d.landing_slug;

      // De cero: nada de una prueba o una solicitud anterior en esta landing.
      clearWizardFormStorage(slug);
      clearProductStorage(slug);
      clearEnvioAnticipadoHandoff(slug);
      clearDemoApplication(slug);

      const cards = await fetchAllCardsByIds(slug, [String(d.equipo.product_id)], d.preview_key);
      const card = cardDelEquipo(cards || [], d.equipo);
      if (!card) {
        setError('El equipo de este link ya no se muestra en esa landing. Genera otro desde el panel.');
        return;
      }
      try {
        localStorage.setItem(getStorageKey(slug), JSON.stringify(armarEquipoDePrueba(card, d.equipo)));
      } catch {
        setError('Este navegador no deja guardar datos (modo privado). Abre el link en una ventana normal.');
        return;
      }

      guardarVistaDePrueba({
        slug,
        token,
        venceEn: Date.parse(d.expires_at),
        sembrar: true,
        creadoPor: d.creado_por,
        venceTexto: d.vence_texto,
      });
      setPreviewMode(d.landing_id, d.preview_key, slug, {
        formId: d.form_id,
        borrador: d.borrador,
        version: d.borrador ? null : d.version,
      });
      router.replace(routes.solicitar(slug));
    })();
  }, [token, router, setPreviewMode]);

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div role="alert" className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-[#4654CD] mx-auto mb-3" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-neutral-900 mb-2">No se pudo abrir la vista de prueba</h1>
          <p className="text-sm text-neutral-600" data-testid="vista-de-prueba-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
      <CubeGridSpinner />
      <p className="text-sm text-neutral-600">Preparando la vista de prueba…</p>
    </div>
  );
}
