'use client';

/**
 * Aceptar el contrato: la única regla delicada del paso, en un solo lugar.
 *
 * El paso del contrato es el ÚNICO que espera la respuesta del backend. El
 * resto de los sub-pasos son fire-and-forget —un fallo se reconcilia en el
 * próximo montaje— pero acá un 409 (`contract_outdated`) significa que lo que
 * la persona acaba de aceptar ya no es el contrato vigente. Avanzar con eso
 * dejaría una aceptación que no corresponde a ningún documento: el paso se
 * reabre con el documento nuevo y se le pide que lo lea otra vez.
 *
 * Vive acá y no en la pantalla porque ahora hay dos pantallas que lo usan —el
 * KYC de siempre y la pantalla del contrato dentro del wizard— y esa regla no
 * puede quedar escrita dos veces.
 */

import { useCallback, useRef } from 'react';

import { completeKycStep, type KycProgressState } from '@/app/prototipos/0.6/services/kycApi';
import type { ContratoStepHandle } from './steps/ContratoStep';

export interface AceptarContratoArgs {
  applicationCode?: string;
  /** Prueba de titularidad por link. Gana sobre el DNI. */
  resumeToken?: string;
  documentNumber?: string;
  /** Se llama solo si la aceptación quedó registrada. */
  onAceptado: (state: KycProgressState | null) => void;
  /**
   * Ref del paso, para quien ya tiene uno propio (el KYC se lo pasa a
   * `renderStep`). Sin esto habría dos refs y el `marcarVencido` iría al que
   * no está montado.
   */
  ref?: React.RefObject<ContratoStepHandle | null>;
}

export function useAceptarContrato({
  applicationCode, resumeToken, documentNumber, onAceptado, ref,
}: AceptarContratoArgs) {
  const propio = useRef<ContratoStepHandle | null>(null);
  const contratoRef = ref ?? propio;

  const aceptar = useCallback(
    (datos?: { contractHash?: string; externalId?: string }) => {
      // Sin código o sin hash no hay nada que sellar. Pasa cuando el paso corre
      // en modo `emitido` (el contrato nace con la aprobación): ahí aceptar no
      // registra hash y el flujo simplemente sigue.
      if (!applicationCode || !datos?.contractHash) {
        onAceptado(null);
        return;
      }

      void completeKycStep({
        applicationCode,
        stepType: 'contract',
        // Con token no se manda el DNI: el token ya prueba titularidad y el DNI
        // es PII que no hace falta repetir.
        resumeToken,
        documentNumber: resumeToken ? undefined : documentNumber,
        contractHash: datos.contractHash,
      }).then(({ state, outdated }) => {
        if (outdated) {
          contratoRef.current?.marcarVencido();
          return;
        }
        onAceptado(state);
      });
    },
    [applicationCode, resumeToken, documentNumber, onAceptado],
  );

  return { contratoRef, aceptar };
}
