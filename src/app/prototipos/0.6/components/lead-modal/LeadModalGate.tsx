'use client';

import React, { useEffect, useState } from 'react';
import LeadCouponModal from './LeadCouponModal';
import { getDocumentFromModal } from '../../utils/leadModalStorage';

interface LeadModalConfig {
  enabled?: boolean;
  title?: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  countdown_enabled?: boolean;
  countdown_minutes?: number;
}

interface Props {
  landingSlug: string;
  /**
   * La config ya resuelta de la landing. Viene del server component
   * (`[[...slug]]/page.tsx`), que la trae junto con el hero, asi que aca no
   * hace falta ningun fetch.
   */
  config?: Record<string, unknown>;
}

/** Segundos que espera el modal antes de salir. */
const DEMORA_MS = 3000;

/**
 * Monta el modal de captura en el INDEX de la landing.
 *
 * Vive dentro de `[[...slug]]/LandingPageClient` a proposito: en el arbol de
 * rutas, el index NO pasa por `[landing]/layout.tsx` — esa rama solo cubre las
 * subrutas (catalogo, producto, solicitar, legal). Montarlo alla lo dejaba
 * fuera del index y presente en todo lo demas, que es justo al reves de lo
 * pedido.
 *
 * Por eso tampoco hay guard de pathname: este componente solo existe en el
 * index.
 */
export default function LeadModalGate({ landingSlug, config }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [cerrado, setCerrado] = useState(false);

  const modal = (config?.['lead_modal'] as LeadModalConfig | undefined) ?? undefined;
  const activo = !!modal?.enabled;

  useEffect(() => {
    if (!activo || cerrado) return;
    // Si ya dejo su documento en esta landing, no se lo volvemos a pedir. Es
    // la misma clave que usa el autoseteo del formulario (BAL-1806).
    if (getDocumentFromModal(landingSlug)) return;

    const t = setTimeout(() => setAbierto(true), DEMORA_MS);
    return () => clearTimeout(t);
  }, [activo, cerrado, landingSlug]);

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
