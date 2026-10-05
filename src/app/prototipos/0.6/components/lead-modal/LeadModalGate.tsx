'use client';

import React, { useEffect, useRef, useState } from 'react';
import LeadCouponModal, { type LeadModalConfig } from './LeadCouponModal';
import { getDocumentFromModal } from '../../utils/leadModalStorage';

interface Props {
  landingSlug: string;
  /**
   * La config ya resuelta de la landing (namespace `lead_modal`, extendido
   * en el mismo fetch que ya trae `features`/`layout` en `CatalogoClient`).
   * No dispara ninguna petición nueva.
   */
  config?: Record<string, unknown>;
  /**
   * Se llama UNA vez que ya no hay nada más que este gate vaya a mostrar:
   * de inmediato si el modal está apagado, sin configurar, o el visitante ya
   * dejó sus datos antes; o recién cuando el usuario cierra el modal (lo
   * haya enviado o descartado).
   *
   * `CatalogoClient` usa esta señal para no abrir `OnboardingWelcomeModal`
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
 */
export default function LeadModalGate({ landingSlug, config, onSettled }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [cerrado, setCerrado] = useState(false);
  const avisado = useRef(false);

  // `undefined` significa "la config todavia no llego": `CatalogoClient` la
  // pide por red y hasta que responda no se puede afirmar nada. Distinguirlo
  // de "llego y el modal esta apagado" es lo que evita avisar de mas: el
  // aviso es IRREVERSIBLE (ver `avisado`), asi que hacerlo antes de tiempo
  // abria el welcome del onboarding y despues el cupon se montaba ENCIMA.
  const configResuelta = config !== undefined;
  const modal = (config?.['lead_modal'] as LeadModalConfig | undefined) ?? undefined;
  const activo = !!modal?.enabled;
  // Si ya dejo su documento en esta landing, no se lo volvemos a pedir. Es la
  // misma clave que usa el autoseteo del formulario (BAL-1806).
  const yaContestado = !!getDocumentFromModal(landingSlug);
  const nadaQueMostrar = configResuelta && (!activo || yaContestado);

  useEffect(() => {
    if (!configResuelta || nadaQueMostrar || cerrado) return;
    const t = setTimeout(() => setAbierto(true), DEMORA_MS);
    return () => clearTimeout(t);
  }, [configResuelta, nadaQueMostrar, cerrado]);

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
        setAbierto(false);
        setCerrado(true);
      }}
    />
  );
}
