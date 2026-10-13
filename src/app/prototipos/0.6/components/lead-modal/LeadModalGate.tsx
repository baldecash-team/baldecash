'use client';

import React, { useEffect, useRef, useState } from 'react';
import LeadCouponModal, { type LeadModalConfig } from './LeadCouponModal';
import {
  getDocumentFromModal,
  markLeadModalDismissed,
  wasLeadModalDismissed,
} from '../../utils/leadModalStorage';
import {
  peekLeadModalVariant,
  resolveLeadModalVariant,
  type LeadModalAssignment,
} from '../../utils/leadModalAb';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';
import { useSessionOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext';
import { patchTrackingSession } from '@/app/prototipos/0.6/services/sessionApi';

interface Props {
  landingSlug: string;
  /**
   * La config ya resuelta de la landing (namespace `lead_modal`). La pide
   * `CatalogoClient` una sola vez y es la misma que usa el catálogo estándar
   * para `features`/`layout`. No dispara ninguna petición nueva.
   */
  config?: Record<string, unknown>;
  /**
   * Se llama UNA vez que ya no hay nada más que este gate vaya a mostrar:
   * de inmediato si el modal está apagado, sin configurar, el visitante ya
   * dejó sus datos o ya lo descartó antes, o le tocó el grupo "control" del
   * A/B; o recién cuando el usuario cierra el modal (lo haya enviado o
   * descartado).
   *
   * El catálogo estándar usa esta señal para no abrir `OnboardingWelcomeModal`
   * hasta que el cupón termine su turno: los dos apuntan al mismo público
   * (todo visitante nuevo) y sin coordinarlos se apilan.
   */
  onSettled?: () => void;
}

/** Milisegundos que espera el modal antes de salir. */
const DEMORA_MS = 3000;

/**
 * Gate del modal de captura de leads — vive en el CATÁLOGO (BAL-3125 Tarea
 * 5). Antes vivía en el index (`[[...slug]]/LandingPageClient`); se mudó
 * porque el diseño definitivo ya no aparece ahí, aparece en el catálogo.
 *
 * Sin guard de pathname: a diferencia del index (que comparte layout con
 * subrutas donde el modal NO debía salir), en el catálogo este componente ya
 * está solo donde corresponde.
 *
 * Se monta UNA vez en `CatalogoClient`, por encima de las variantes de
 * catálogo (estándar, celular de `copia-home`, `zona-gamer`). Antes vivía
 * dentro del catálogo estándar y las otras variantes se quedaban sin modal:
 * por eso no salía en celular en `copia-home`. Una variante nueva NO tiene
 * que montarlo; si lo hace, sale dos veces.
 */
export default function LeadModalGate({ landingSlug, config, onSettled }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [cerrado, setCerrado] = useState(false);
  const [asignacion, setAsignacion] = useState<LeadModalAssignment | null>(null);
  const avisado = useRef(false);

  const tracker = useEventTrackerOptional();
  // En un ref: el evento se emite dentro del efecto del sorteo, y la
  // identidad del tracker no debe volver a dispararlo.
  const trackerRef = useRef(tracker);
  trackerRef.current = tracker;
  const sessionUuid = useSessionOptional()?.sessionUuid ?? null;

  // `undefined` significa "la config todavia no llego": `CatalogoClient` la
  // pide por red y hasta que responda no se puede afirmar nada. Distinguirlo
  // de "llego y el modal esta apagado" es lo que evita avisar de mas: el
  // aviso es IRREVERSIBLE (ver `avisado`), asi que hacerlo antes de tiempo
  // abria el welcome del onboarding y despues el cupon se montaba ENCIMA.
  const configResuelta = config !== undefined;
  const modal = (config?.['lead_modal'] as LeadModalConfig | undefined) ?? undefined;
  const activo = !!modal?.enabled;
  const showPercent = modal?.show_percent;
  // Si ya dejo su documento en esta landing, no se lo volvemos a pedir. Es la
  // misma clave que usa el autoseteo del formulario (BAL-1806).
  const yaContestado = !!getDocumentFromModal(landingSlug);
  // Una vez por visitante: si lo cerró sin dejar sus datos («No deseo canjear
  // cupón» o la «X»), no se le vuelve a ofrecer al recargar ni al volver.
  const yaDescartado = wasLeadModalDismissed(landingSlug);
  // Solo el visitante elegible entra al sorteo: sortear a quien de todos
  // modos no iba a ver el modal ensucia los dos grupos por igual.
  //
  // Quien lo DESCARTO se parte en dos:
  // - Sin sorteo guardado para este porcentaje: lo cerro antes de que
  //   existiera el test y nunca lo va a volver a ver. No entra.
  // - Con sorteo guardado: es gente del test que lo vio y lo cerro. Sigue en
  //   su grupo y sus visitas siguientes se reportan, igual que las del
  //   "control"; si no, el grupo "modal" perderia justo a los que volvieron.
  const descartadoFueraDelTest =
    yaDescartado && peekLeadModalVariant(landingSlug, showPercent) === null;
  const elegible = configResuelta && activo && !yaContestado && !descartadoFueraDelTest;

  // El sorteo escribe en localStorage, asi que va en un efecto y no en el
  // render. El evento se emite ACA y no desde el estado: asi sale una sola
  // vez, en la llamada que sorteo (`esNueva`).
  useEffect(() => {
    if (!elegible) return;
    const resultado = resolveLeadModalVariant(landingSlug, showPercent);
    if (resultado.esNueva) {
      trackerRef.current?.track('lead_modal_variant_assigned', {
        variant: resultado.variant,
        show_percent: resultado.percent,
      });
    }
    setAsignacion(resultado);
  }, [elegible, landingSlug, showPercent]);

  // El grupo tambien va a la fila de la sesion, en cada visita. En el evento
  // solo no sirve: el resultado del test (¿creo solicitud?) vive en la sesion,
  // y sin esto no hay como comparar "modal" contra "control". La sesion puede
  // llegar despues del sorteo, por eso depende de `sessionUuid`.
  useEffect(() => {
    if (!asignacion?.enTest) return;
    void patchTrackingSession(sessionUuid, { ab_lead_modal_variant: asignacion.variant });
  }, [asignacion, sessionUuid]);

  const enControl = asignacion?.variant === 'control';
  const nadaQueMostrar =
    configResuelta && (!activo || yaContestado || yaDescartado || enControl);

  useEffect(() => {
    if (!asignacion || nadaQueMostrar || cerrado) return;
    const t = setTimeout(() => setAbierto(true), DEMORA_MS);
    return () => clearTimeout(t);
  }, [asignacion, nadaQueMostrar, cerrado]);

  // Avisa una sola vez: de inmediato si no hay nada que mostrar, o cuando el
  // usuario cierra el modal (ver handleClose). Sin el `ref`, cada re-render
  // con `nadaQueMostrar` true volvería a llamar onSettled.
  useEffect(() => {
    if (avisado.current) return;
    if (nadaQueMostrar || cerrado) {
      avisado.current = true;
      onSettled?.();
    }
  }, [nadaQueMostrar, cerrado, onSettled]);

  if (!abierto || !modal) return null;

  return (
    <LeadCouponModal
      landingSlug={landingSlug}
      config={modal}
      onClose={() => {
        // El modal no sabe de almacenamiento al descartar: lo anota el gate,
        // que es quien decide si vuelve a salir.
        markLeadModalDismissed(landingSlug);
        setAbierto(false);
        setCerrado(true);
      }}
    />
  );
}
