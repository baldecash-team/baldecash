'use client';

/**
 * El contrato como pantalla del wizard, no como destino aparte.
 *
 * Con envío anticipado la solicitud se crea al terminar una pantalla del medio
 * y la siguiente muestra el contrato para leerlo y aceptarlo. Antes ese paso
 * mandaba a `/prototipos/0.6/kyc/<token>`: una URL distinta, sin los pasos del
 * wizard arriba y sin forma de volver — la persona sentía que se cayó del
 * formulario justo cuando le pedimos que firme.
 *
 * Reusa `ContratoStep` tal cual (el mismo resumen, el mismo aviso, el mismo
 * documento y las mismas casillas que el KYC) y `useAceptarContrato`, que es
 * donde vive la única regla delicada: un 409 significa que lo que la persona
 * aceptó ya no es el contrato vigente, así que no se avanza — se reabre el
 * paso con el documento nuevo.
 *
 * De dónde sale la solicitud: del handoff que dejó el submit. No de la URL: el
 * token es prueba de titularidad y no tiene por qué quedar en el historial.
 */

import { useRouter } from 'next/navigation';

import { ContratoStep } from '../kyc/steps/ContratoStep';
import { useAceptarContrato } from '../kyc/useAceptarContrato';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import type { EnvioAnticipadoHandoff } from '../utils/envioAnticipadoHandoff';

export function ContratoEnWizard({
  landing,
  handoff,
  onBack,
}: {
  landing: string;
  handoff: EnvioAnticipadoHandoff;
  onBack?: () => void;
}) {
  const router = useRouter();

  const { contratoRef, aceptar } = useAceptarContrato({
    applicationCode: handoff.applicationCode,
    resumeToken: handoff.resumeToken,
    documentNumber: handoff.documentNumber,
    onAceptado: () => {
      router.push(routes.solicitarConfirmacion(landing, handoff.applicationCode));
    },
  });

  return (
    <ContratoStep
      ref={contratoRef}
      onDone={aceptar}
      onBack={onBack}
      applicationCode={handoff.applicationCode}
      resumeToken={handoff.resumeToken}
      documentNumber={handoff.documentNumber}
      landing={landing}
    />
  );
}

export default ContratoEnWizard;
