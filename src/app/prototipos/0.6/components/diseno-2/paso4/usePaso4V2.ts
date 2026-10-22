'use client';

/**
 * El estado del Paso 4 de Diseño 2 (BAL-4966) que no es del flujo de siempre:
 *
 * - los seguros (con `usePlanesDeSeguro`, la misma lógica de `/complementos`);
 * - las dos vistas de celular: (1) los campos del paso → "Continuar";
 *   (2) las protecciones → "Enviar…". En escritorio todo va junto (el CSS
 *   muestra las dos), así que esto no necesita saber el ancho de pantalla;
 * - los ids de seguros que viajan en el submit.
 *
 * Lo llama `StepClient` siempre (es un hook), con `activo` en `false` fuera
 * del resumen de Diseño 2: ahí no pide nada ni toca nada.
 */

import { useCallback, useEffect, useState } from 'react';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { usePlanesDeSeguro } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/sections/usePlanesDeSeguro';
import { buildSubmitInsuranceIds } from '@/app/prototipos/0.6/[landing]/solicitar/utils/submitInsuranceIds';
import { abrirSeccionDe } from '../SeccionPlegable';
import { resaltar } from '../useGuiaDeCampos';
import { prefiereMenosMovimiento } from '../movimiento';
import { textoDelEnvio } from './paso4';

export type VistaPaso4 = 1 | 2;

/** Espera para que la vista 1 se pinte antes de bajar al campo. */
const ESPERA_AL_CAMBIAR_VISTA_MS = 60;

/**
 * Baja al campo que falta y lo resalta (la guía de F1). Si está dentro de una
 * sección cerrada, primero la abre.
 */
export function irAlCampoV2(codigo: string) {
  const el = document.querySelector<HTMLElement>(`[data-campo="${CSS.escape(codigo)}"]`);
  if (!el) {
    document.getElementById(codigo)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (abrirSeccionDe(el)) window.setTimeout(() => resaltar(el), ESPERA_AL_CAMBIAR_VISTA_MS);
  else resaltar(el);
}

export interface OpcionesPaso4V2 {
  /** Diseño 2, paso resumen y config del flujo ya cargada. */
  activo: boolean;
  /** `segurosVanEnElPaso4`: la sección de seguros va en este paso. */
  conSeguros: boolean;
  /** Código del paso: al cambiar, se vuelve a la vista 1. */
  codigoPaso: string | null;
}

export function usePaso4V2({ activo, conSeguros, codigoPaso }: OpcionesPaso4V2) {
  const seguros = usePlanesDeSeguro(activo && conSeguros);
  const { selectedInsurances, clearInsurance } = useProduct();
  // La vista va atada al paso: al cambiar de paso se vuelve a la 1 sin un
  // efecto que la resetee.
  const [estadoVista, setEstadoVista] = useState<{ paso: string | null; vista: VistaPaso4 }>({ paso: codigoPaso, vista: 1 });
  const vista: VistaPaso4 = estadoVista.paso === codigoPaso ? estadoVista.vista : 1;
  const setVista = useCallback((v: VistaPaso4) => setEstadoVista({ paso: codigoPaso, vista: v }), [codigoPaso]);

  // Seguros elegidos que este paso no puede mandar (la landing no los tiene,
  // la solicitud ya se creó con el envío anticipado, o el backend no devolvió
  // planes para este equipo): se sueltan para que el total del panel no cobre
  // algo que nunca llega al backend.
  const sinPlanes = conSeguros && !seguros.cargando && seguros.planes.length === 0;
  const haySueltos = activo && (!conSeguros || sinPlanes) && selectedInsurances.length > 0;
  useEffect(() => {
    if (haySueltos) clearInsurance();
  }, [haySueltos, clearInsurance]);

  const conPlanes = activo && conSeguros && seguros.planes.length > 0;
  const protecciones = conPlanes ? selectedInsurances.length : 0;

  /** Pasa de la vista 1 a la 2 y sube al principio. */
  const irAVista2 = useCallback(() => {
    setVista(2);
    window.scrollTo({ top: 0, behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth' });
  }, [setVista]);

  /** Falta un campo al enviar: vuelve a la vista 1 y lleva al campo. */
  const volverAlCampo = useCallback((codigo: string) => {
    setVista(1);
    window.setTimeout(() => irAlCampoV2(codigo), ESPERA_AL_CAMBIAR_VISTA_MS);
  }, [setVista]);

  return {
    seguros,
    /** Hay protecciones que mostrar: en celular existe la vista 2. */
    hayVista2: conPlanes,
    vista,
    setVista,
    irAVista2,
    volverAlCampo,
    protecciones,
    textoEnviar: textoDelEnvio(protecciones),
    /** Los ids que viajan en el submit (vacío si este paso no lleva seguros). */
    insuranceIds: conPlanes ? buildSubmitInsuranceIds(selectedInsurances) : [],
  };
}
