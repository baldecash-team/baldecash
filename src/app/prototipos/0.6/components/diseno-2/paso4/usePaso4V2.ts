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
  /**
   * Este es el resumen que envía y la solicitud ya se creó antes (envío
   * anticipado, D5): los seguros elegidos no tienen cómo llegar al backend.
   */
  creadaAntes?: boolean;
  /** Código del paso: al cambiar, se vuelve a la vista 1. */
  codigoPaso: string | null;
}

export function usePaso4V2({ activo, conSeguros, creadaAntes = false, codigoPaso }: OpcionesPaso4V2) {
  const seguros = usePlanesDeSeguro(activo && conSeguros);
  const { selectedInsurances, clearInsurance } = useProduct();
  // La vista va atada al paso: al cambiar de paso se vuelve a la 1 sin un
  // efecto que la resetee.
  const [estadoVista, setEstadoVista] = useState<{ paso: string | null; vista: VistaPaso4 }>({ paso: codigoPaso, vista: 1 });
  const vista: VistaPaso4 = estadoVista.paso === codigoPaso ? estadoVista.vista : 1;
  const setVista = useCallback((v: VistaPaso4) => setEstadoVista({ paso: codigoPaso, vista: v }), [codigoPaso]);

  // Seguros elegidos que este paso no puede mandar: se sueltan para que el
  // total del panel no cobre algo que nunca llega al backend. SOLO en dos
  // casos (revisión de F7, I-2/M-3/M-4):
  // - la solicitud ya se creó antes (envío anticipado, D5);
  // - el pedido de planes TERMINÓ y no trajo ninguno (`cargado`, no
  //   "no está cargando": en el primer render todavía no se pidió nada).
  // No se sueltan en un resumen que no envía, ni cuando la sección de seguros
  // está en otra pantalla (antes del wizard o en `/complementos`). Tampoco si
  // el pedido FALLÓ: un error no es "no hay planes" (`cargado` queda en
  // false) y `ProductContext` persiste, así que soltarlos sería borrarlos para
  // siempre por un corte pasajero. Con error se avisa y se pide confirmación
  // antes de enviar sin ellos (`pideConfirmarEnvio`).
  const sinPlanes = conSeguros && seguros.cargado && seguros.planes.length === 0;
  const haySueltos = activo && (creadaAntes || sinPlanes) && selectedInsurances.length > 0;
  useEffect(() => {
    if (haySueltos) clearInsurance();
  }, [haySueltos, clearInsurance]);

  const conPlanes = activo && conSeguros && seguros.planes.length > 0;
  const protecciones = conPlanes ? selectedInsurances.length : 0;
  /** Los planes no cargaron y hay seguros elegidos que este envío no llevaría. */
  const errorDeCarga = activo && conSeguros && seguros.error;
  const pideConfirmarEnvio = errorDeCarga && selectedInsurances.length > 0;

  // Celular: si "Reintentar" trae los planes, aparece la vista 2. Se va a
  // ella para que la persona vea sus protecciones donde las dejó, en vez de
  // que la sección desaparezca detrás de un "Continuar".
  // (Ajuste de estado durante el render, no en un efecto.)
  const [irAVista2AlCargar, setIrAVista2AlCargar] = useState(false);
  const { reintentar: reintentarPedido } = seguros;
  const reintentar = useCallback(() => {
    setIrAVista2AlCargar(true);
    reintentarPedido();
  }, [reintentarPedido]);
  if (irAVista2AlCargar && (conPlanes || seguros.cargado || seguros.error || !activo)) {
    setIrAVista2AlCargar(false);
    if (conPlanes) setEstadoVista({ paso: codigoPaso, vista: 2 });
  }

  /** Seguros que no se pudieron cargar: la persona confirmó enviar sin ellos. */
  const soltarParaEnviarSinProtecciones = useCallback(() => clearInsurance(), [clearInsurance]);

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
    seguros: { ...seguros, reintentar },
    /** El pedido de planes falló (se avisa y se ofrece "Reintentar"). */
    errorDeCarga,
    /**
     * Enviar ahora mandaría la solicitud sin los seguros elegidos: el botón de
     * enviar pide confirmación explícita en vez de mandar `[]` en silencio.
     */
    pideConfirmarEnvio,
    soltarParaEnviarSinProtecciones,
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
