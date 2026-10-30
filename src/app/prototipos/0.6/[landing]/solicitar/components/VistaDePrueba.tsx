'use client';

/**
 * «Probar en la web» dentro de /solicitar (BAL-5367):
 *
 * - `SembrarVistaDePrueba`: una vez, con el config del wizard ya cargado, llena
 *   las respuestas de prueba (`armarDatosDePrueba`).
 * - `FranjaVistaDePrueba`: la franja «Vista de prueba · no se envía nada», en
 *   los dos diseños (vive en el layout de /solicitar, que envuelve a ambos y a
 *   la confirmación), con «Salir» para volver a la landing normal.
 */

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { FlaskConical } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { useWizardConfig } from '../context/WizardConfigContext';
import { useWizard } from '../context/WizardContext';
import { armarDatosDePrueba, type CargarOpciones } from '../utils/datosDePrueba';
import {
  fetchCascadingOptions,
  fetchOptionsFromSource,
  fetchOptionsWithSearch,
} from '../../../services/wizardApi';
import { parametrosDeFiltro } from '../../../services/filtroDeOpciones';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import {
  leerVistaDePrueba,
  marcarSembrada,
  salirDeVistaDePrueba,
  type VistaDePrueba,
} from '@/app/prototipos/0.6/utils/vistaDePrueba';

/** Términos para las listas que solo cargan buscando (centros, carreras). */
const BUSQUEDAS = ['universidad', 'instituto', 'ingenieria', 'administracion', 'lima'];

const cargarOpciones: CargarOpciones = async (field, valores) => {
  const fuente = field.options_source as string;
  if (field.cascade_from) {
    const padre = valores[field.cascade_from];
    if (!padre || Array.isArray(padre)) return [];
    return fetchCascadingOptions(fuente, field.cascade_param || 'parent_id', padre);
  }
  const extra = parametrosDeFiltro(field.options_filter, {
    valorDe: (code) => {
      const v = valores[code];
      return Array.isArray(v) ? v[0] : v;
    },
  });
  if ((field.min_search_length || 0) > 0 && !(field.options?.length)) {
    for (const termino of BUSQUEDAS) {
      const opciones = await fetchOptionsWithSearch(fuente, termino, extra);
      if (opciones.length) return opciones;
    }
    return [];
  }
  // Las sedes necesitan el convenio de la landing: se dejan para llenar a mano.
  if (fuente === 'agreement-branches') return [];
  return fetchOptionsFromSource(fuente, Object.fromEntries(extra));
};

export function SembrarVistaDePrueba({ landing }: { landing: string }) {
  const { config } = useWizardConfig();
  const { updateFieldBatch, updateField } = useWizard();
  const enCurso = useRef(false);

  useEffect(() => {
    if (!config?.steps?.length || enCurso.current) return;
    const vista = leerVistaDePrueba(landing);
    if (!vista?.sembrar) return;
    enCurso.current = true;
    (async () => {
      try {
        const { respuestas, omitidos } = await armarDatosDePrueba(config.steps, cargarOpciones);
        const textos = respuestas
          .filter((r) => !Array.isArray(r.value))
          .map((r) => ({ fieldId: r.fieldId, value: r.value as string, label: r.label }));
        updateFieldBatch(textos);
        for (const r of respuestas) {
          if (Array.isArray(r.value)) updateField(r.fieldId, r.value, r.label);
        }
        if (omitidos.length) {
          console.info('[vista de prueba] campos para llenar a mano:', omitidos.join(', '));
        }
      } catch (error) {
        Sentry.captureException(error, { tags: { modulo: 'vista_de_prueba', accion: 'sembrar' } });
      } finally {
        marcarSembrada();
      }
    })();
  }, [config, landing, updateFieldBatch, updateField]);

  return null;
}

export function FranjaVistaDePrueba() {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const { clearPreviewMode } = usePreview();
  const [vista, setVista] = useState<VistaDePrueba | null>(null);

  // Se lee del storage después de montar (en el servidor no existe).
  useEffect(() => {
    setVista(leerVistaDePrueba(landing));
  }, [landing]);

  if (!vista) return null;

  return (
    <div
      role="status"
      data-testid="franja-vista-de-prueba"
      className="fixed top-0 left-0 right-0 z-[10001] bg-[#4654CD] text-white text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 flex-wrap text-center"
    >
      <FlaskConical className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>
        Vista de prueba · no se envía nada
        {vista.venceTexto ? ` · vence ${vista.venceTexto}` : ''}
      </span>
      <button
        type="button"
        onClick={() => {
          salirDeVistaDePrueba();
          clearPreviewMode();
          window.location.href = routes.landingHome(landing);
        }}
        className="underline underline-offset-2 hover:no-underline cursor-pointer min-h-[24px]"
      >
        Salir
      </button>
    </div>
  );
}
