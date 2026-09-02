'use client';

/**
 * Franja "Te refirió Cynthia, si tienes dudas escríbele aquí".
 *
 * Aparece debajo del header cuando la visita llega por un link de activación
 * (`?promotor=` o `?ref=`). Los datos llegan resueltos —del server component en
 * la landing, de lo guardado en el resto del recorrido (`ReferralBannerGate`)—:
 * acá no se consulta nada.
 *
 * Notas de diseño que vienen del spec y conviene no perder:
 *
 * - TODA la franja es el link. No es un cartel con un botón al costado: es un
 *   solo blanco de ~44 px de alto y del ancho de la pantalla, que en móvil es la
 *   diferencia entre un canal que se usa y uno que se mira. El ícono circular
 *   está para que se lea qué va a abrir, no para ser lo único tocable.
 * - Va DEBAJO del header fijo —el promo de la institución y la barra de logos—,
 *   no arriba de todo. Lo primero que tiene que leerse al entrar es de quién es
 *   la landing; quién refirió la visita viene después.
 * - Se queda pegada ahí al hacer scroll: es `fixed`, parte del stack de arriba
 *   junto con el promo y el navbar. Antes se iba con el scroll para no gastar
 *   altura de viewport en móvil —la mayor parte del tráfico entra por celular
 *   desde el QR—, y se cambió a pedido: el canal tiene que estar a mano en el
 *   momento en que aparece la duda, que es leyendo el precio o llenando el
 *   formulario, no en los primeros 44 px de scroll. El costo es real y conocido:
 *   ~44 px menos de pantalla en todo el recorrido.
 *
 *   Ser `fixed` la saca del flujo, y el contenido de las páginas reserva el alto
 *   del header con su propio padding sin saber nada de ella. Por eso el hueco:
 *   un div vacío del alto de la franja, arriba de todo —detrás del header, donde
 *   no se ve—, que devuelve al flujo los píxeles que la franja ya no ocupa. Así
 *   ninguna página necesita tocar su padding.
 *
 *   Y lo que se cuelga del header por debajo de ella —la barra secundaria del
 *   catálogo, las columnas sticky— sigue leyendo `--referral-banner-offset`, que
 *   ahora vale su alto de forma permanente en vez de bajar con el scroll.
 * - No se puede cerrar. Antes tenía una X que recordaba el descarte en
 *   `sessionStorage`; se quitó cuando la franja pasó a acompañar todo el
 *   recorrido, porque un descarte en la landing la apagaba también en el
 *   catálogo y en el formulario, que es donde aparecen las dudas que este canal
 *   existe para resolver. Además, una X adentro de un blanco que ocupa la franja
 *   entera es un conflicto de toque, no un control.
 * - Sin número usable no se arma link: la franja se pinta igual, pero como un
 *   aviso. Un `wa.me` sin destinatario abre WhatsApp en blanco y es peor que no
 *   llevar a ningún lado.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';
import type { ReferralBanner as ReferralBannerData } from '../../services/referralBannerApi';
import { safeExternalUrl } from '../../utils/safeExternalUrl';
import { guardarFranja } from './referralBannerCache';

/** Sage de la paleta de marca: información amable, no una alerta. */
const FONDO = '#006b65';
const TEXTO = '#f2fbfa';
/** Aqua, para el ícono — la señal de qué abre el toque. */
const ICONO_FONDO = '#03dbd0';
const ICONO_COLOR = '#04302e';

/**
 * Dónde se pega la franja: al borde de abajo del header fijo.
 *
 * `--header-total-height` la publica `Navbar` (preview + promo + navbar) y se
 * actualiza sola, así que si cierran el promo de la institución la franja sube
 * con él. El fallback `6.5rem` es el mismo que usan los demás consumidores de la
 * variable en el proyecto.
 *
 * Se exporta para poder probarlo: jsdom descarta `var()` en `style.top`, así que
 * el valor no se puede leer del DOM en un test (mismo motivo que `topDeLaBarra`
 * en `CatalogSecondaryNavbar`).
 */
export const TOP_DE_LA_FRANJA = 'var(--header-total-height, 6.5rem)';

/** Lo que mide la franja de una línea; el hueco arranca con esto hasta medirla. */
const ALTO_POR_DEFECTO = 44;

/**
 * El alto de la franja, publicado en `--referral-banner-offset` y devuelto para
 * el hueco que la reserva en el flujo.
 *
 * Siendo fija, el valor ya no baja con el scroll: la franja no se va nunca, así
 * que lo que hay debajo del header queda corrido ese alto de forma permanente.
 * Lo leen la barra secundaria del catálogo (`CatalogSecondaryNavbar`), la
 * columna de filtros y la caja de compra del detalle, que se cuelgan del header
 * y quedan por debajo de ella.
 *
 * El hueco es la otra mitad del asunto. Al ser `fixed`, la franja no ocupa lugar
 * en el flujo, y el contenido de la página reserva el alto del header con su
 * propio padding pero no sabe nada de ella: sin el hueco, los primeros 44 px del
 * contenido quedan tapados. El hueco los devuelve —arriba de todo, detrás del
 * header, donde no se ve— y así ninguna página necesita tocar su padding.
 *
 * `ResizeObserver` y no un listener de resize: en móvil el texto pasa a dos
 * líneas y la franja cambia de alto sin que la ventana cambie de tamaño.
 */
function useAltoDeFranja() {
  // `HTMLElement` y no un tipo concreto: la franja es un <a> cuando hay numero y
  // un <div> cuando no, y este hook solo necesita medirla.
  const franjaRef = useRef<HTMLElement>(null);
  const [alto, setAlto] = useState(ALTO_POR_DEFECTO);

  useEffect(() => {
    const el = franjaRef.current;
    if (!el) return;
    const raiz = document.documentElement;

    const medir = () => {
      const medido = el.offsetHeight || ALTO_POR_DEFECTO;
      setAlto(medido);
      raiz.style.setProperty('--referral-banner-offset', `${medido}px`);
    };

    medir();
    const observador =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(medir);
    observador?.observe(el);
    window.addEventListener('resize', medir);
    return () => {
      observador?.disconnect();
      window.removeEventListener('resize', medir);
      // Al desmontar se suelta la variable: si no, al navegar a una página sin
      // franja la barra secundaria arrancaría 44 px más abajo, dejando una banda
      // vacía entre ella y el navbar.
      raiz.style.removeProperty('--referral-banner-offset');
    };
  }, []);

  return { franjaRef, alto };
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
  /** Slug de la landing — viaja como propiedad del evento y es la clave del guardado. */
  landingSlug: string;
}

export function ReferralBanner({ data, landingSlug }: ReferralBannerProps) {
  const tracker = useEventTrackerOptional();
  const pathname = usePathname();
  const { firstName, whatsappUrl: rawWhatsappUrl, promoterCode, reason } = data;
  // La URL viene de un backend y va directo a un href: se valida el esquema para
  // que un `javascript:...` no se ejecute al hacer clic (BAL-3292).
  const whatsappUrl = safeExternalUrl(rawWhatsappUrl) || null;

  // Quien pinta la franja la guarda. Así el catálogo, el detalle y el wizard la
  // encuentran resuelta sin volver a preguntarle a nadie — ver
  // `referralBannerCache` y `ReferralBannerGate`.
  useEffect(() => {
    guardarFranja(landingSlug, data);
  }, [landingSlug, data]);

  const { franjaRef, alto } = useAltoDeFranja();

  /**
   * Qué estaba diciendo la franja, en las dos puntas del embudo.
   *
   * Va idéntico en la impresión y en el clic para que el click-through se saque
   * restando, sin joins y segmentado por cualquiera de estas propiedades:
   *
   * - `promoter_code` — quién refirió. Es la LLAVE, no el adorno: con `?ref=` es
   *   el código del hub y con `?promotor=` el `Promoter.code` de ws2, y contra
   *   cualquiera de los dos se recupera el nombre del otro lado.
   * - `reason` — por qué camino se resolvió: `ok` (ws2, con teléfono),
   *   `sin_telefono`, `ref` (el hub) o `guardado` (recuperada de la sesión en un
   *   paso posterior). Es la diferencia entre "la franja anda" y "la franja anda
   *   sólo en la landing".
   * - `variant` — cómo se pintó: `link` cuando toda la franja abre WhatsApp,
   *   `aviso` cuando no hay número usable y es sólo texto. Sin esto, un
   *   click-through bajo se lee como "el copy no funciona" cuando la mitad de
   *   las impresiones no tenían a dónde llevar.
   * - `page` — en qué paso. La franja acompaña landing, catálogo, detalle y
   *   wizard: sin esta propiedad las cuatro se suman en un número que no dice
   *   nada.
   *
   * ── LO QUE NO VIAJA, Y NO ES UN OLVIDO ──
   *
   * El nombre de la promotora y su celular NO se mandan, ni sueltos ni adentro
   * de la `whatsapp_url`. No es sólo la regla de privacidad: `nombre` y
   * `phone_value` están en `FORBIDDEN_PROPERTIES` de ws2 y `is_valid_event`
   * descarta el evento ENTERO si aparece alguna, con 200 OK y cero filas. O sea
   * que mandarlos no logra "medir de más": logra no medir nada, en silencio.
   * `promoter_code` es la llave con la que se recupera todo eso.
   */
  const datosDelEvento = useMemo(
    () => ({
      promoter_code: promoterCode,
      landing_slug: landingSlug,
      reason,
      has_whatsapp: Boolean(whatsappUrl),
      variant: whatsappUrl ? 'link' : 'aviso',
      page: pathname,
    }),
    [promoterCode, landingSlug, reason, whatsappUrl, pathname],
  );

  const handleWhatsApp = useCallback(() => {
    tracker?.track('referral_banner_whatsapp_click', datosDelEvento);
  }, [tracker, datosDelEvento]);

  /**
   * Impresión — `referral_banner_shown`, emitido cuando la franja está DE VERDAD
   * a la vista.
   *
   * Se conserva el nombre del evento aunque ahora signifique "visible" y no
   * "montado": `REFERRAL_BANNER_EVENT_TYPES` de ws2 es una allowlist y un tipo
   * que no esté ahí lo descarta `is_valid_event` en silencio —200 OK, cero
   * filas—. Estrenar `referral_banner_visible` costaba un deploy de ws2 para
   * medir peor mientras tanto, y de paso rompía la serie histórica.
   *
   * Montar no era ver: cuando la franja se iba con el scroll, al navegar entre
   * pasos con la página ya scrolleada podía montar completamente fuera del
   * viewport. Siendo `fixed` eso ya no pasa y el observer confirma en el primer
   * frame; se queda igual porque cuesta nada y es el que avisaría si alguna vez
   * vuelve a montar donde no se ve.
   *
   * OJO con lo que esto NO cubre: `IntersectionObserver` mide contra el viewport,
   * no oclusión. La franja tapada por el navbar fijo —el bug que ya tuvo, con el
   * nombre correcto en el HTML y cero pixeles visibles— sigue contando como
   * visible acá. Contra eso lo que protege es `--referral-banner-offset`, no
   * este evento; si alguna vez hace falta detectarlo desde el dato, el camino es
   * `elementFromPoint` sobre el centro de la franja, no subir el threshold.
   *
   * Un cuarto de la franja alcanza: es una tira de ~44 px y con eso ya se lee.
   *
   * Una por página: `pathname` en las dependencias es a propósito —la franja
   * acompaña todo el recorrido y queremos saber en qué paso se vio— y el ref
   * cubre el doble montaje de React en modo estricto.
   */
  const pathnameVisto = useRef<string | null>(null);
  useEffect(() => {
    const el = franjaRef.current;
    if (!tracker || !el || pathnameVisto.current === pathname) return;

    const emitir = () => {
      if (pathnameVisto.current === pathname) return;
      pathnameVisto.current = pathname;
      tracker.track('referral_banner_shown', datosDelEvento);
    };

    // Sin soporte (WebView viejo) se emite igual: perder la impresión es peor
    // que contarla sin la confirmación de visibilidad.
    if (typeof IntersectionObserver === 'undefined') {
      emitir();
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          emitir();
          observador.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [tracker, pathname, datosDelEvento, franjaRef]);

  const contenido = (
    <div className="mx-auto flex min-h-[44px] max-w-7xl items-center justify-center gap-2 px-3 py-2 sm:gap-3 sm:px-6">
      <p className="text-center text-[13px] leading-tight sm:text-sm">
        Te refirió <strong className="font-semibold">{firstName}</strong>
        {whatsappUrl ? ', si tienes dudas escríbele aquí' : ''}
      </p>
      {whatsappUrl && (
        <span
          aria-hidden="true"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: ICONO_FONDO, color: ICONO_COLOR }}
        >
          <WhatsAppIcon className="h-4 w-4" />
        </span>
      )}
    </div>
  );

  /**
   * La franja, pegada al borde de abajo del header.
   *
   * `z-45` la deja por encima del contenido que le pasa por debajo al scrollear
   * y de la barra secundaria del catálogo (z-40), y por debajo del header
   * (z-50/z-60) y del backdrop del menú móvil, a los que nunca tiene que
   * taparles nada. En la práctica no se pisa con ninguno —cada uno arranca donde
   * termina el otro—, pero el orden importa el día que un alto cambie.
   */
  const estiloDeLaFranja: React.CSSProperties = {
    position: 'fixed',
    top: TOP_DE_LA_FRANJA,
    left: 0,
    right: 0,
    zIndex: 45,
    backgroundColor: FONDO,
    color: TEXTO,
  };

  /**
   * El hueco: reserva en el flujo los píxeles que la franja, siendo `fixed`, ya
   * no ocupa. Va arriba de todo, detrás del header, donde no se ve.
   *
   * Arranca en el alto de una línea y se corrige al medir (ver `useAltoDeFranja`).
   */
  const hueco: React.CSSProperties = { height: alto };

  // Sin número no hay a dónde ir: se pinta como aviso y no como link. Un <a> sin
  // href no es enfocable ni se anuncia como link, así que sería un botón falso.
  if (!whatsappUrl) {
    return (
      <div style={hueco}>
        <div
          ref={franjaRef as React.RefObject<HTMLDivElement>}
          data-testid="referral-banner"
          style={estiloDeLaFranja}
        >
          {contenido}
        </div>
      </div>
    );
  }

  return (
    <div style={hueco}>
      <a
        ref={franjaRef as React.RefObject<HTMLAnchorElement>}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsApp}
        data-testid="referral-banner"
        // El testid del link ya no cuelga de un chip: ahora el link ES la franja.
        data-referral-banner-whatsapp="true"
        className="block transition-opacity hover:opacity-95"
        style={estiloDeLaFranja}
      >
        {contenido}
      </a>
    </div>
  );
}
