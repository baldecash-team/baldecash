'use client';

/**
 * «Lo quiero» según el formulario de la sesión (BAL-5296, decisión D1).
 *
 * En landings con `features.diseno_por_formulario` el diseño de la solicitud lo
 * decide el formulario que le toca a la visita. Al apretar «Lo quiero» se le
 * pide a ws2 que asigne el formulario (mismo sorteo que el wizard) y diga su
 * diseño: si es 2 se abre el modal; si es 1 se entra como en Diseño 1.
 *
 * Sin el flag `porFormulario` es `false` y quien llama sigue su camino de
 * siempre sin pasar por aquí (`resolverAbreModal` igual devuelve
 * `loQuieroModal` sin llamar a nada).
 *
 * Si ws2 falla o tarda más de 2,5 s: el diseño que ya se conocía (el de la
 * sesión si existe; si no, el de la landing).
 */
import { useCallback, useRef, useState } from 'react';
import { useLayoutOptional } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { useSessionOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { pedirDisenoDeLaSesion } from '@/app/prototipos/0.6/services/disenoApi';
import { admiteDiseno2 } from '@/app/prototipos/0.6/utils/theme';

export interface LoQuieroSegunFormulario {
  /** La landing reparte el diseño por formulario. */
  porFormulario: boolean;
  /** Esperando a ws2: el botón muestra la carga. */
  resolviendo: boolean;
  /** `true` = abrir el modal de Diseño 2; `false` = entrar como Diseño 1. */
  resolverAbreModal: (productId?: number | string | null) => Promise<boolean>;
}

export function useLoQuieroSegunFormulario(): LoQuieroSegunFormulario {
  // Opcional: la ficha también vive en `/oferta/[token]`, sin LayoutProvider.
  // Sin contexto no hay diseño por formulario.
  const layout = useLayoutOptional();
  const landing = layout?.landing ?? 'home';
  const loQuieroModal = layout?.loQuieroModal;
  const disenoSolicitud = layout?.disenoSolicitud ?? 1;
  const disenoPorFormulario = layout?.disenoPorFormulario;
  const fijarDisenoDeLaSesion = layout?.fijarDisenoDeLaSesion;
  const session = useSessionOptional();
  const analytics = useAnalytics();
  const [resolviendo, setResolviendo] = useState(false);
  const enCurso = useRef(false);

  const porFormulario = disenoPorFormulario === true;
  const sessionUuid = session?.sessionUuid ?? null;

  const resolverAbreModal = useCallback(
    async (productId?: number | string | null): Promise<boolean> => {
      const deHoy = !!loQuieroModal;
      if (!porFormulario) return deHoy;

      const id = productId == null || productId === '' ? undefined : Number(productId);
      const resultado = sessionUuid && !enCurso.current
        ? await (async () => {
            enCurso.current = true;
            setResolviendo(true);
            try {
              return await pedirDisenoDeLaSesion(landing, sessionUuid, Number.isFinite(id) ? id : undefined);
            } finally {
              enCurso.current = false;
              setResolviendo(false);
            }
          })()
        : null;

      if (resultado) {
        fijarDisenoDeLaSesion?.(resultado.disenoSolicitud);
        analytics.track('lo_quiero_diseno_resuelto', { diseno: resultado.disenoSolicitud, origen: 'formulario' });
        return resultado.disenoSolicitud === 2 && admiteDiseno2(landing);
      }
      analytics.track('lo_quiero_diseno_resuelto', { diseno: disenoSolicitud, origen: 'landing' });
      return deHoy;
    },
    [porFormulario, loQuieroModal, sessionUuid, landing, fijarDisenoDeLaSesion, analytics, disenoSolicitud],
  );

  return { porFormulario, resolviendo, resolverAbreModal };
}

/**
 * Punto único para los «Lo quiero» de catálogo y ficha.
 *
 * Sin diseño por formulario llama a `seguir(abreModalHoy)` en el acto, igual
 * que antes del cambio (mismo orden, mismo tick). Con diseño por formulario
 * espera a ws2 y sigue con lo que diga el formulario. Un segundo clic mientras
 * espera no hace nada.
 */
export function alApretarLoQuiero(
  loQuiero: LoQuieroSegunFormulario,
  abreModalHoy: boolean,
  productId: number | string | null | undefined,
  seguir: (abreModal: boolean) => void,
): void {
  if (!loQuiero.porFormulario) {
    seguir(abreModalHoy);
    return;
  }
  if (loQuiero.resolviendo) return;
  void loQuiero.resolverAbreModal(productId).then(seguir);
}
