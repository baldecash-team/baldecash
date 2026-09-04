'use client';

/**
 * La espera del contrato del KYC.
 *
 * El PDF lo emite legacy —cronograma, plantilla, mPDF— y tarda unos segundos.
 * ws2 lo pide al arrancar el KYC, así que cuando la persona llega al paso casi
 * siempre está; cuando no, este hook espera, reintenta y sabe rendirse.
 *
 * Por qué un tope y no un polling infinito: si legacy no puede emitirlo (un
 * producto sin contrato vigente, la solicitud ya aprobada, mPDF caído) esperar
 * para siempre deja al solicitante mirando un skeleton. A los 90 s se muestra
 * el error con «Reintentar», que es una acción que sí puede tomar.
 *
 * `modo` viene del backend y decide qué puede exigir el paso: `aceptacion` es
 * el flujo nuevo (documento obligatorio), `emitido` es el de siempre (el
 * contrato nace con la aprobación y su ausencia no puede trabar nada).
 *
 * `sinRegistro` es el único error que NO se resuelve reintentando: la solicitud
 * no llegó a legacy, así que nadie puede emitirle un contrato.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getContrato,
  type ContratoEstado,
  type ContratoKyc,
} from '@/app/prototipos/0.6/services/kycApi';
import type { KycTrack } from './useKycTracker';

export const POLL_MS = 3000;
export const TOPE_MS = 90000;

export interface EstadoContratoKyc {
  contrato: ContratoKyc | null;
  /** `generando` incluye la primera carga. */
  estado: ContratoEstado | 'outdated';
  /** El documento se puede leer: hay html o url. */
  hayDocumento: boolean;
  /** `modo === 'aceptacion'`: sin documento no se puede continuar. */
  exigeAceptar: boolean;
  /** El error es "la solicitud no llegó a legacy": reintentar no lo arregla. */
  sinRegistro: boolean;
  reintentar: () => void;
  /** Lo llama el paso cuando el backend dice 409: vuelve a pedir y marca `outdated`. */
  marcarVencido: () => void;
}

export function useContratoKyc({
  applicationCode, documentNumber, resumeToken, track,
}: {
  applicationCode?: string;
  documentNumber?: string;
  resumeToken?: string;
  track: KycTrack;
}): EstadoContratoKyc {
  const [contrato, setContrato] = useState<ContratoKyc | null>(null);
  const [estado, setEstado] = useState<ContratoEstado | 'outdated'>('generando');
  // Sube en cada reintento/vencimiento: es lo que relanza el efecto.
  const [intento, setIntento] = useState(0);
  const forzarRef = useRef(false);
  const desdeRef = useRef(0);

  useEffect(() => {
    if (!applicationCode) return;

    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const forzar = forzarRef.current;
    forzarRef.current = false;
    desdeRef.current = Date.now();

    const pedir = async () => {
      const r = await getContrato({
        applicationCode, documentNumber, resumeToken,
        // Solo el PRIMER pedido de esta tanda fuerza: los del polling no
        // tienen que volver a dispararle una generación a legacy.
        reintentar: forzar,
      });
      if (cancelado) return;

      setContrato(r);

      // `null` es error de red o de permisos: se trata como el error del
      // backend — esperar sin fin sería peor, y el documento nunca se
      // reemplaza por uno genérico.
      const actual: ContratoEstado = r?.estado ?? 'error';

      if (actual === 'listo') {
        setEstado('listo');
        track('kyc_contract_ready', {
          application_code: applicationCode,
          external_id: r?.external_id,
          wait_ms: Date.now() - desdeRef.current,
        });
        return;
      }

      if (actual === 'error') {
        setEstado('error');
        track('kyc_contract_generation_failed', {
          application_code: applicationCode,
          reason: r?.motivo === 'sin_registro' ? 'sin_registro' : 'legacy_error',
        });
        return;
      }

      if (Date.now() - desdeRef.current >= TOPE_MS) {
        setEstado('error');
        track('kyc_contract_generation_failed', {
          application_code: applicationCode, reason: 'timeout',
        });
        return;
      }

      setEstado((previo) => (previo === 'outdated' ? 'outdated' : 'generando'));
      timer = setTimeout(() => { void pedir(); }, POLL_MS);
    };

    void pedir();

    return () => {
      cancelado = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationCode, documentNumber, resumeToken, intento]);

  const reintentar = useCallback(() => {
    track('kyc_contract_generation_requested', {
      application_code: applicationCode, reason: 'retry',
    });
    forzarRef.current = true;
    setEstado('generando');
    setIntento((n) => n + 1);
  }, [applicationCode, track]);

  const marcarVencido = useCallback(() => {
    track('kyc_contract_outdated', { application_code: applicationCode });
    forzarRef.current = true;
    setContrato(null);
    setEstado('outdated');
    setIntento((n) => n + 1);
  }, [applicationCode, track]);

  const hayDocumento = !!(contrato?.html || contrato?.url) && contrato?.estado === 'listo';

  return {
    contrato,
    estado,
    hayDocumento,
    // Un `modo` que este cliente no conozca cae en "no exige": es el
    // comportamiento que nunca deja a nadie trabado.
    exigeAceptar: contrato?.modo === 'aceptacion',
    sinRegistro: contrato?.motivo === 'sin_registro',
    reintentar,
    marcarVencido,
  };
}
