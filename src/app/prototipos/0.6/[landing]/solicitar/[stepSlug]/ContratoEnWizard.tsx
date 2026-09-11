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
import { SubmitOverlay, type PasoOverlay } from '../components/solicitar/submit/SubmitOverlay';
import { useAceptarContrato } from '../kyc/useAceptarContrato';
import { guardarConstancia } from '../kyc/constanciaStorage';
import { completarKyc } from '@/app/prototipos/0.6/services/kycApi';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import type { EnvioAnticipadoHandoff } from '../utils/envioAnticipadoHandoff';

/**
 * El progreso de la firma, con las palabras de lo que de verdad está pasando.
 *
 * Es el mismo overlay del envío de la solicitud —la espera se parece y no hay
 * motivo para inventarle otra pantalla—, pero sus pasos hablan de subir
 * archivos y enviar una solicitud, y acá no se sube nada: se registra una
 * firma y se emite una constancia.
 */
const PASOS_FIRMA: readonly PasoOverlay[] = [
  {
    id: 'validating',
    icon: 'FileSignature',
    title: 'Registrando tu firma',
    description: 'Sellando lo que aceptaste',
  },
  {
    id: 'processing',
    icon: 'Send',
    title: 'Emitiendo tu constancia',
    description: 'Preparando tu copia',
  },
];

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
  // Enciende el overlay de carga y evita que un segundo aviso del paso
  // re-dispare el cierre. Arranca con el clic, no con la respuesta de
  // `aceptar`: entre las dos cosas hay un viaje al backend, y dejarlo sin
  // pintar era la unica parte del recorrido donde el boton parecia muerto.
  const [cerrando, setCerrando] = useState(false);

  const { contratoRef, aceptar } = useAceptarContrato({
    applicationCode: handoff.applicationCode,
    resumeToken: handoff.resumeToken,
    documentNumber: handoff.documentNumber,
    onAceptado: () => { void cerrar(); },
    // 409: el paso se reabre con el documento nuevo, asi que el overlay se
    // apaga. Sin esto se quedaba tapando una pantalla que pide releer.
    onVencido: () => setCerrando(false),
  });

  /** El clic en aceptar: primero se pinta la espera, despues se registra. */
  function firmar(datos?: { contractHash?: string; externalId?: string }) {
    setCerrando(true);
    aceptar(datos);
  }

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
    <>
      <SubmitOverlay
        isOpen={cerrando}
        stage="processing"
        pasos={PASOS_FIRMA}
        titulo="Firmando tu solicitud"
        subtitulo="Estamos sellando tu firma. Esto solo toma unos segundos."
        tituloProgreso="Progreso de tu firma"
      />
      <ContratoStep
        ref={contratoRef}
        onDone={firmar}
        onBack={onBack}
        applicationCode={handoff.applicationCode}
        resumeToken={handoff.resumeToken}
        documentNumber={handoff.documentNumber}
        landing={landing}
      />
    </>
  );
}

export default ContratoEnWizard;
