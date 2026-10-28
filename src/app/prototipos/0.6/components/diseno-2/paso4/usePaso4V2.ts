'use client';

/**
 * El estado del Paso 4 de Diseño 2 (BAL-4966) que no es del flujo de siempre:
 *
 * - los seguros (con `usePlanesDeSeguro`, la misma lógica de `/complementos`);
 * - el Resumen en dos pantallas como en el prototipo de Brenda (BAL-5204,
 *   27-oct): 1) día de pago + dirección → Continuar; 2) Protege tu laptop →
 *   Enviar. Sin seguros, una sola (como hasta BAL-4969);
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
import { textoDelEnvio } from './paso4';

/** Espera para que la sección se abra antes de bajar al campo. */
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
}

export function usePaso4V2({ activo, conSeguros, creadaAntes = false }: OpcionesPaso4V2) {
  const seguros = usePlanesDeSeguro(activo && conSeguros);
  const { selectedInsurances, clearInsurance } = useProduct();
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

  /** Seguros que no se pudieron cargar: la persona confirmó enviar sin ellos. */
  const soltarParaEnviarSinProtecciones = useCallback(() => clearInsurance(), [clearInsurance]);

  /**
   * Pantalla de seguros aparte (BAL-5204): hay planes para mostrar, todavía
   * cargan (ahí va el esqueleto), o fallaron con seguros elegidos (ahí están
   * «Reintentar» y la confirmación de «Enviar sin protecciones»). Sin planes,
   * con seguros apagados o con error sin elegidos: una sola pantalla.
   */
  const conPantallaDeSeguros =
    activo && conSeguros && !creadaAntes &&
    (seguros.planes.length > 0 || (!seguros.cargado && !seguros.error) || pideConfirmarEnvio);
  const [vista, setVista] = useState<'datos' | 'seguros'>('datos');
  const irASeguros = useCallback(() => setVista('seguros'), []);
  const volverADatos = useCallback(() => setVista('datos'), []);

  /**
   * Falta un campo al enviar: vuelve a la pantalla de datos (si estaba en la
   * de seguros) y lleva al campo (abre su sección si hace falta).
   */
  const volverAlCampo = useCallback((codigo: string) => {
    setVista('datos');
    window.setTimeout(() => irAlCampoV2(codigo), ESPERA_AL_CAMBIAR_VISTA_MS);
  }, []);

  return {
    seguros,
    /** El pedido de planes falló (se avisa y se ofrece "Reintentar"). */
    errorDeCarga,
    /**
     * Enviar ahora mandaría la solicitud sin los seguros elegidos: el botón de
     * enviar pide confirmación explícita en vez de mandar `[]` en silencio.
     */
    pideConfirmarEnvio,
    soltarParaEnviarSinProtecciones,
    volverAlCampo,
    /** El Resumen va en dos pantallas: datos → seguros (BAL-5204). */
    conPantallaDeSeguros,
    /** La pantalla del Resumen que se ve. Sin pantalla de seguros, siempre 'datos'. */
    vista: conPantallaDeSeguros ? vista : ('datos' as const),
    irASeguros,
    volverADatos,
    protecciones,
    textoEnviar: textoDelEnvio(protecciones),
    /** Los ids que viajan en el submit (vacío si este paso no lleva seguros). */
    insuranceIds: conPlanes ? buildSubmitInsuranceIds(selectedInsurances) : [],
  };
}
