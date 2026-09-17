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

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ContratoStep } from '../kyc/steps/ContratoStep';
import { SubmitOverlay, type PasoOverlay } from '../components/solicitar/submit/SubmitOverlay';
import { useAceptarContrato } from '../kyc/useAceptarContrato';
import { guardarConstancia } from '../kyc/constanciaStorage';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { completarKyc, getKycProgress } from '@/app/prototipos/0.6/services/kycApi';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import {
  clearEnvioAnticipadoContratoAceptado,
  markEnvioAnticipadoContratoAceptado,
  type EnvioAnticipadoHandoff,
} from '../utils/envioAnticipadoHandoff';

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

/**
 * Con la entrega prendida en la landing hay un paso más, y conviene anunciarlo:
 * la pantalla siguiente le va a pedir a dónde mandar el equipo, y llegar ahí sin
 * aviso se lee como un formulario que aparece de la nada.
 */
const PASO_ENTREGA: PasoOverlay = {
  // `success` es el ultimo de la escala del overlay: con la firma en curso
  // (`processing`) queda pendiente, que es justo como tiene que verse — es lo
  // que viene despues, no algo que este pasando ahora.
  id: 'success',
  icon: 'Truck',
  // Corto a propósito: el overlay es angosto y dos líneas largas lo
  // desbordaban en alto.
  title: 'Datos de entrega',
  description: 'A dónde enviamos tu equipo',
};

export function ContratoEnWizard({
  landing,
  handoff,
  onBack,
  stepSlug,
  onContratoVencido,
}: {
  landing: string;
  handoff: EnvioAnticipadoHandoff;
  onBack?: () => void;
  /**
   * Slug del paso donde `StepClient` monta este componente (`step.url_slug ||
   * step.code`). Es a dónde vuelve el control "← Volver al contrato" del
   * formulario de entrega si la persona se arrepiente antes de coordinarla
   * (gate G1): SIN ESTO no habría forma de decirle a `entregaPorToken` a
   * dónde apunta ese "atrás".
   */
  stepSlug: string;
  /**
   * El contrato que se había marcado "aceptado" dejó de valer (409, en
   * cualquiera de los dos momentos en que puede pasar: al aceptar, o recién
   * en `/completar`) y la marca ya se limpió en `sessionStorage`.
   *
   * `StepClient` lee ese handoff en su PROPIO estado (una vez por montaje,
   * vía `readEnvioAnticipadoHandoff`), así que limpiar la marca acá adentro
   * no alcanza para que sus gates (Atrás, indicador de pasos, redirect por
   * URL) se enteren — ese estado no se re-deriva solo. Este callback es la
   * forma de avisarle que vuelva a leer. Opcional: sin él, la limpieza sigue
   * sucediendo (la corrobora `/progress` en el próximo montaje real), solo
   * que un poco más tarde.
   */
  onContratoVencido?: () => void;
}) {
  const router = useRouter();
  const { entregaEnElCierre } = useSolicitarFlow({ slug: landing });
  const pasosFirma = useMemo(
    () => (entregaEnElCierre ? [...PASOS_FIRMA, PASO_ENTREGA] : PASOS_FIRMA),
    [entregaEnElCierre],
  );
  const cerrandoRef = useRef(false);
  // Enciende el overlay de carga y evita que un segundo aviso del paso
  // re-dispare el cierre. Arranca con el clic, no con la respuesta de
  // `aceptar`: entre las dos cosas hay un viaje al backend, y dejarlo sin
  // pintar era la unica parte del recorrido donde el boton parecia muerto.
  const [cerrando, setCerrando] = useState(false);

  /**
   * Fuente de verdad de "firmó" para esta pantalla (gates G1/G2).
   *
   * Arranca del handoff —inmediata, misma pestaña— y se corrobora contra
   * `/progress` para que sobreviva a un refresh sin ese handoff (limpiado, o
   * de otro dispositivo). Es la MISMA condición que usa el KYC por ruta
   * dedicada (`kycClient.tsx`): `steps.find(contract).status === 'completed'`.
   * Sin esto, la variante wizard —que nunca la tuvo— pintaba el contrato como
   * si no se hubiera aceptado al volver acá desde el resumen.
   */
  const [contratoYaAceptado, setContratoYaAceptado] = useState(Boolean(handoff.contratoAceptado));

  useEffect(() => {
    if (contratoYaAceptado) return; // ya se sabe; no hace falta preguntar
    let vivo = true;
    getKycProgress(handoff.applicationCode).then((progreso) => {
      if (!vivo || !progreso) return;
      const aceptado = progreso.steps.some(
        (paso) => paso.type === 'contract' && paso.status === 'completed',
      );
      if (aceptado) setContratoYaAceptado(true);
    });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handoff.applicationCode]);

  const { contratoRef, aceptar } = useAceptarContrato({
    applicationCode: handoff.applicationCode,
    resumeToken: handoff.resumeToken,
    documentNumber: handoff.documentNumber,
    onAceptado: () => {
      // Se prende ANTES de cerrar: `cerrar` puede navegar (entrega o
      // confirmación) y el handoff tiene que quedar marcado antes de que la
      // persona pueda volver acá desde cualquier lado.
      markEnvioAnticipadoContratoAceptado(landing);
      setContratoYaAceptado(true);
      void cerrar();
    },
    // 409: el paso se reabre con el documento nuevo, asi que el overlay se
    // apaga. Sin esto se quedaba tapando una pantalla que pide releer.
    //
    // Este es el PRIMER momento en que puede descubrirse "vencido": el propio
    // accept devuelve `outdated`. La marca "firmó" nunca llegó a confirmarse
    // acá (recién se prende en `onAceptado`), pero por si la pantalla venía de
    // un "Continuar" sobre `yaAceptado` (contrato re-emitido entre medio), se
    // limpia igual — no hacerlo dejaría un `true` de una sesión previa.
    onVencido: () => {
      clearEnvioAnticipadoContratoAceptado(landing);
      setContratoYaAceptado(false);
      onContratoVencido?.();
      setCerrando(false);
    },
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
      // SEGUNDO momento en que puede descubrirse "vencido": `onAceptado` ya
      // prendió la marca (asumiendo que el accept alcanzaba) antes de llamar
      // a `cerrar`, y acá `/completar` dice que no. Sin limpiarla, la marca
      // quedaría en `true` con el contrato en realidad reabierto — exactamente
      // el "stale-true encierra a quien tiene que volver a aceptar".
      clearEnvioAnticipadoContratoAceptado(landing);
      setContratoYaAceptado(false);
      onContratoVencido?.();
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

    const confirmacion = routes.solicitarConfirmacion(landing, handoff.applicationCode);
    // A dónde vuelve "← Volver al contrato" en la entrega (gate G1): este
    // mismo paso, que con el handoff ya marcado (`contratoYaAceptado`) se ve
    // en modo "Ya aceptaste este contrato" — no una firma nueva.
    const atras = routes.solicitarStep(landing, stepSlug);

    // Coordinar la entrega es un paso más del flujo, no un anexo de la
    // confirmación: firmado y sin inicial que pagar, lo único que falta es
    // decir a dónde va el equipo. Va en su propia pantalla —con su layout y su
    // marca— y al terminar sí cae en la confirmación.
    router.push(
      veredicto?.entrega_token
        ? routes.entregaPorToken(veredicto.entrega_token, confirmacion, atras)
        : confirmacion,
    );
  }

  return (
    <>
      <SubmitOverlay
        isOpen={cerrando}
        stage="processing"
        pasos={pasosFirma}
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
        yaAceptado={contratoYaAceptado}
      />
    </>
  );
}

export default ContratoEnWizard;
