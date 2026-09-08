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

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ContratoStep } from '../kyc/steps/ContratoStep';
import { useAceptarContrato } from '../kyc/useAceptarContrato';
import { guardarConstancia } from '../kyc/constanciaStorage';
import { completarKyc } from '@/app/prototipos/0.6/services/kycApi';
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
  const cerrandoRef = useRef(false);
  // Solo para que un segundo aviso del paso no re-dispare el cierre; la
  // pantalla no cambia: el propio paso ya deshabilita su boton al aceptar.
  const [cerrando, setCerrando] = useState(false);

  const { contratoRef, aceptar } = useAceptarContrato({
    applicationCode: handoff.applicationCode,
    resumeToken: handoff.resumeToken,
    documentNumber: handoff.documentNumber,
    onAceptado: () => { void cerrar(); },
  });

  /**
   * Cierra el KYC contra el backend, igual que la pantalla del KYC.
   *
   * Aceptar el contrato NO es el final: `/completar` es el momento en que
   * legacy registra la aceptación —`aceptado_at`, `aceptado_hash`—, emite la
   * constancia con el hash estampado y aplica la aprobación. Sin este llamado,
   * la aceptación quedaba viva solo en ws2: el cliente nunca recibía su copia y
   * legacy no se enteraba de nada.
   *
   * Un 409 `contrato_vencido` no avanza: legacy no aprobó porque lo aceptado ya
   * no es el contrato vigente. Se reabre el paso con el documento nuevo.
   *
   * Cualquier otro fallo degrada a la confirmación: si la solicitud igual quedó
   * aprobada, el seguimiento normal la recoge, y dejar a la persona atrapada en
   * esta pantalla sería peor.
   */
  async function cerrar() {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    setCerrando(true);

    const veredicto = await completarKyc(
      handoff.applicationCode, handoff.documentNumber, handoff.resumeToken);

    if (veredicto?.motivo === 'contrato_vencido') {
      contratoRef.current?.marcarVencido();
      cerrandoRef.current = false;
      setCerrando(false);
      return;
    }

    // La copia, a disposición en el acto (§4 paso 12). Se guarda para la
    // pantalla siguiente porque acá mismo se navega.
    if (veredicto?.constancia_url) {
      guardarConstancia(landing, handoff.applicationCode, veredicto.constancia_url);
    }

    router.push(routes.solicitarConfirmacion(landing, handoff.applicationCode));
  }

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
