'use client';

/**
 * Franja "Haz sido referido por Marco".
 *
 * Aparece arriba de todo cuando la landing se abre con un link de activación
 * (`?promotor=` + el token en `utm_term`). Los datos llegan resueltos desde el
 * server component — acá no se consulta nada: el teléfono no debe pedirse desde
 * el navegador después de pintar.
 *
 * Notas de diseño que vienen del spec y conviene no perder:
 *
 * - NO es `sticky`. Una franja fija le roba altura permanente al viewport móvil,
 *   y la mayor parte del tráfico entra por celular desde el QR.
 *
 *   Eso tiene una consecuencia que costó ver: el navbar y el banner promocional
 *   SÍ son `fixed` y arrancan en `top: 0`, así que tapaban esta franja por
 *   completo. Estaba en el HTML, con el nombre correcto, y no se veía nunca.
 *   Por eso `--referral-banner-offset`: la franja publica cuánto de ella queda
 *   por debajo del borde superior del viewport, el header fijo arranca ahí, y
 *   el valor llega solo a 0 cuando la franja termina de salir con el scroll.
 *   La franja se va, el header sube, y nada queda robando altura.
 * - El descarte se recuerda en `sessionStorage`, no en `localStorage`: si el
 *   usuario vuelve mañana desde otro flyer, con otra promotora, tiene que
 *   volver a verlo. La clave incluye el código de la promotora por el mismo
 *   motivo, para el caso de dos links distintos en la misma sesión.
 * - Sin teléfono usable no se arma el botón. Un `wa.me` sin destinatario válido
 *   abre WhatsApp en blanco y es peor que no tener el botón.
 *
 * Sobre "Haz sido referido": es el copy pedido y así queda. La ortografía
 * estándar sería "Has sido referido" (del verbo *haber*); "haz" es de *hacer*.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';
import type { ReferralBanner as ReferralBannerData } from '../../services/referralBannerApi';
import { safeExternalUrl } from '../../utils/safeExternalUrl';

/** Sage de la paleta de marca: información amable, no una alerta. */
const FONDO = '#006b65';
const TEXTO = '#f2fbfa';
/** Aqua, para el chip de WhatsApp — el único elemento que pide ser tocado. */
const CHIP_FONDO = '#03dbd0';
const CHIP_TEXTO = '#04302e';

function claveDescarte(promoterCode: string | null): string {
  return `baldecash-referral-banner-dismissed-${promoterCode ?? 'anon'}`;
}

function leerDescarte(promoterCode: string | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(claveDescarte(promoterCode)) === '1';
  } catch {
    // sessionStorage tira en algunos WebView y en modo privado de WebKit.
    return false;
  }
}

/**
 * Suscriptores del descarte.
 *
 * `sessionStorage` es un sistema externo a React, así que el estado se lee con
 * `useSyncExternalStore` en vez de con `useState` + `useEffect`. Además de ser
 * lo que corresponde, evita el render en cascada: el valor del cliente entra
 * durante la hidratación, no en un efecto posterior. El emisor existe porque el
 * evento `storage` del navegador NO se dispara en la pestaña que escribe.
 */
const suscriptores = new Set<() => void>();

function suscribir(cb: () => void): () => void {
  suscriptores.add(cb);
  return () => {
    suscriptores.delete(cb);
  };
}

function guardarDescarte(promoterCode: string | null): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(claveDescarte(promoterCode), '1');
    } catch {
      // Sin storage el descarte dura lo que dure la página. Es aceptable.
    }
  }
  suscriptores.forEach((cb) => cb());
}

/**
 * Cuánto de la franja sigue visible, en px, publicado como `--referral-banner-offset`.
 *
 * Lo lee el header fijo (`components/hero/Navbar.tsx`) para saber dónde empezar.
 * Se recalcula en scroll y resize porque la altura cambia sola: en móvil el texto
 * puede pasar a dos líneas, y al hacer scroll la franja se va saliendo.
 *
 * El scroll va con `passive` y coalescido por frame: es la landing que convierte,
 * y acá no se puede pagar un reflow por evento de rueda.
 */
function useOffsetDeFranja(visible: boolean) {
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = document.documentElement;
    const limpiar = () => raiz.style.removeProperty('--referral-banner-offset');

    // Descartada o sin montar: el header tiene que volver a `top: 0`. Sin esto,
    // cerrar la franja dejaría una banda transparente permanente arriba.
    if (!visible) {
      limpiar();
      return;
    }

    let pendiente = 0;
    const medir = () => {
      pendiente = 0;
      const el = contenedorRef.current;
      if (!el) return;
      // `bottom` del rect ya viene en coordenadas del viewport: mientras la
      // franja baja del borde vale su alto, y llega a 0 sola cuando termina de
      // salir. No hace falta leer scrollY ni saber cuánto mide.
      raiz.style.setProperty(
        '--referral-banner-offset',
        `${Math.max(0, el.getBoundingClientRect().bottom)}px`,
      );
    };

    const alFrame = () => {
      if (pendiente) return;
      pendiente = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener('scroll', alFrame, { passive: true });
    window.addEventListener('resize', alFrame);
    return () => {
      if (pendiente) cancelAnimationFrame(pendiente);
      window.removeEventListener('scroll', alFrame);
      window.removeEventListener('resize', alFrame);
      limpiar();
    };
  }, [visible]);

  return contenedorRef;
}

/** Icono real de WhatsApp, inline: sin imagen externa que pueda no cargar. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="currentColor"
    >
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.25-4.36c0-4.54 3.69-8.23 8.24-8.23a8.23 8.23 0 0 1 8.22 8.24c0 4.54-3.69 8.21-8.23 8.21z" />
    </svg>
  );
}

interface ReferralBannerProps {
  data: ReferralBannerData;
  /** Slug de la landing — viaja como propiedad del evento. */
  landingSlug: string;
}

export function ReferralBanner({ data, landingSlug }: ReferralBannerProps) {
  const tracker = useEventTrackerOptional();
  const { firstName, phoneDisplay, whatsappUrl: rawWhatsappUrl, promoterCode, reason } = data;
  // La URL viene del backend y va directo a un href: se valida el esquema para
  // que un `javascript:...` no se ejecute al hacer clic (BAL-3292).
  const whatsappUrl = safeExternalUrl(rawWhatsappUrl);

  // El snapshot del servidor es "no descartado" a propósito: la franja tiene que
  // venir en el HTML. Renderizarla recién en el cliente la haría aparecer a los
  // 300 ms empujando el hero hacia abajo, justo cuando el usuario va a tocar el
  // CTA — que es exactamente lo que este diseño evita.
  const descartado = useSyncExternalStore(
    suscribir,
    () => leerDescarte(promoterCode),
    () => false,
  );
  const eventoEmitido = useRef(false);

  // Impresión. Se emite una sola vez y sólo si la franja quedó visible: si el
  // usuario ya la había descartado, no hubo impresión que contar. El ref
  // protege del doble montaje de React en modo estricto, y la relectura del
  // storage cubre el instante de hidratación, cuando `descartado` todavía puede
  // traer el valor del servidor.
  useEffect(() => {
    if (descartado || eventoEmitido.current || !tracker) return;
    if (leerDescarte(promoterCode)) return;
    eventoEmitido.current = true;
    tracker.track('referral_banner_shown', {
      promoter_code: promoterCode,
      landing_slug: landingSlug,
      reason,
      has_whatsapp: Boolean(whatsappUrl),
    });
  }, [descartado, tracker, promoterCode, landingSlug, reason, whatsappUrl]);

  const handleDescartar = useCallback(() => {
    guardarDescarte(promoterCode);
    tracker?.track('referral_banner_dismiss', {
      promoter_code: promoterCode,
      landing_slug: landingSlug,
      has_whatsapp: Boolean(whatsappUrl),
    });
  }, [promoterCode, landingSlug, whatsappUrl, tracker]);

  const handleWhatsApp = useCallback(() => {
    tracker?.track('referral_banner_whatsapp_click', {
      promoter_code: promoterCode,
      landing_slug: landingSlug,
    });
  }, [promoterCode, landingSlug, tracker]);

  // Antes del early return: los hooks no pueden quedar detrás de una condición.
  const contenedorRef = useOffsetDeFranja(!descartado);

  if (descartado) return null;

  return (
    <div
      ref={contenedorRef}
      data-testid="referral-banner"
      className="w-full"
      style={{ backgroundColor: FONDO, color: TEXTO }}
    >
      <div className="mx-auto flex min-h-[44px] max-w-7xl items-center gap-2 px-3 py-2 sm:px-6">
        <p className="flex-1 text-[13px] leading-tight sm:text-sm">
          {/* Móvil: versión corta, para que entre en una línea. */}
          <span className="sm:hidden">
            Te refirió <strong className="font-semibold">{firstName}</strong>
          </span>
          <span className="hidden sm:inline">
            Haz sido referido por <strong className="font-semibold">{firstName}</strong>.
            {whatsappUrl ? ' Si tienes dudas, escríbele:' : ''}
          </span>
        </p>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            data-testid="referral-banner-whatsapp"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: CHIP_FONDO, color: CHIP_TEXTO }}
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="sm:hidden">Escríbele</span>
            <span className="hidden sm:inline">{phoneDisplay}</span>
          </a>
        )}

        <button
          type="button"
          onClick={handleDescartar}
          aria-label="Cerrar aviso de referido"
          data-testid="referral-banner-dismiss"
          className="shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
