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
 * - NO es `sticky`. Una franja fija le roba altura permanente al viewport móvil,
 *   y la mayor parte del tráfico entra por celular desde el QR. Se ve al entrar
 *   —que es cuando importa— y se va con el scroll; al cambiar de página vuelve.
 * - Va DEBAJO del header fijo —el promo de la institución y la barra de logos—,
 *   no arriba de todo. Lo primero que tiene que leerse al entrar es de quién es
 *   la landing; quién refirió la visita viene después. Antes iba arriba y era el
 *   header el que bajaba para no taparla; ahora el header queda pegado al borde.
 *
 *   Eso obliga a un rodeo, porque el header es `fixed` y esta franja vive en el
 *   flujo del documento: su hueco en el flujo son los primeros ~44 px, que el
 *   header tapa enteros, y de ahí se la baja `--header-total-height` con un
 *   `transform`. Correr el flujo —un margen— no serviría: el contenido de la
 *   página ya reserva el alto del header con su propio padding, y sumarlo otra
 *   vez lo empujaría el doble. Con `transform` la franja se dibuja justo entre
 *   el header y el contenido sin tocarle el layout a nadie.
 *
 *   Lo que sí sigue empujando es lo que va por debajo de ella: la barra
 *   secundaria del catálogo y las columnas sticky se cuelgan del header y sin
 *   corrección la franja las taparía. Para eso está `--referral-banner-offset`,
 *   que publica cuánto de la franja sigue asomando por debajo del header y llega
 *   a 0 sola cuando termina de meterse detrás con el scroll.
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

import { useCallback, useEffect, useMemo, useRef } from 'react';
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
 * Cuánto de la franja sigue asomando por debajo del header, en px, publicado
 * como `--referral-banner-offset`.
 *
 * Lo leen las piezas que se cuelgan del header y quedan debajo de la franja: la
 * barra secundaria del catálogo (`CatalogSecondaryNavbar`), la columna de
 * filtros, la caja de compra del detalle. Mientras la franja está a la vista
 * arrancan esos píxeles más abajo, y vuelven solas cuando se va.
 *
 * El ref va en el HUECO que la franja ocupa en el flujo, no en la franja pintada.
 * El hueco está en los primeros píxeles del documento, así que su `bottom` en
 * coordenadas del viewport ya es exactamente lo que todavía asoma —su alto menos
 * el scroll— y llega a 0 solo. La franja pintada está bajada por `transform`, y
 * su rect daría ese mismo número corrido un alto de header.
 *
 * Se recalcula en scroll y resize porque la altura cambia sola: en móvil el texto
 * puede pasar a dos líneas, y al hacer scroll la franja se va saliendo.
 *
 * El scroll va con `passive` y coalescido por frame: es la landing que convierte,
 * y acá no se puede pagar un reflow por evento de rueda.
 */
function useOffsetDeFranja() {
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = document.documentElement;
    const limpiar = () => raiz.style.removeProperty('--referral-banner-offset');

    let pendiente = 0;
    const medir = () => {
      pendiente = 0;
      const el = contenedorRef.current;
      if (!el) return;
      // `bottom` del rect ya viene en coordenadas del viewport: mientras el
      // hueco baja del borde vale su alto, y llega a 0 solo cuando termina de
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
      // Al desmontar se suelta la variable: si no, al navegar a una página sin
      // franja la barra secundaria arrancaría 44 px más abajo, dejando una banda
      // vacía entre ella y el navbar.
      limpiar();
    };
  }, []);

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

  const contenedorRef = useOffsetDeFranja();

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
   * Montar no es ver: la franja no es sticky, así que al navegar entre pasos con
   * la página ya scrolleada puede montar completamente fuera del viewport. Con
   * `IntersectionObserver` la impresión sólo se cuenta cuando el navegador
   * confirma que entró en pantalla.
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
   * Una por página, no una por vez que entra al viewport: la franja sale y vuelve
   * con el scroll y no son impresiones nuevas. `pathname` en las dependencias es
   * a propósito —acompaña todo el recorrido y queremos saber en qué paso se vio—
   * y el ref cubre el doble montaje de React en modo estricto.
   */
  const pathnameVisto = useRef<string | null>(null);
  useEffect(() => {
    const el = contenedorRef.current;
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
  }, [tracker, pathname, datosDelEvento, contenedorRef]);

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
   * Lo que baja la franja hasta debajo del header.
   *
   * `--header-total-height` la publica `Navbar` (preview + promo + navbar) y se
   * actualiza sola: si cierran el promo de la institución, la franja sube con
   * él. El fallback `6.5rem` es el mismo que usan los demás consumidores de la
   * variable en el proyecto.
   *
   * `relative` + `z-30` la dejan por encima del fondo del contenido —que empieza
   * en el mismo lugar, detrás del padding con el que reserva el alto del header—
   * y por debajo del header (z-50/z-60) y de la barra secundaria del catálogo
   * (z-40), a los que nunca tiene que taparles nada.
   */
  const estiloDeLaFranja: React.CSSProperties = {
    backgroundColor: FONDO,
    color: TEXTO,
    transform: 'translateY(var(--header-total-height, 6.5rem))',
  };

  // Sin número no hay a dónde ir: se pinta como aviso y no como link. Un <a> sin
  // href no es enfocable ni se anuncia como link, así que sería un botón falso.
  if (!whatsappUrl) {
    return (
      <div ref={contenedorRef} className="w-full">
        <div
          data-testid="referral-banner"
          className="relative z-30 w-full"
          style={estiloDeLaFranja}
        >
          {contenido}
        </div>
      </div>
    );
  }

  return (
    // El div de afuera es el hueco en el flujo: no se pinta, se mide (ver
    // `useOffsetDeFranja`). El link es la franja, ya bajada a su lugar.
    <div ref={contenedorRef} className="w-full">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsApp}
        data-testid="referral-banner"
        // El testid del link ya no cuelga de un chip: ahora el link ES la franja.
        data-referral-banner-whatsapp="true"
        className="relative z-30 block w-full transition-opacity hover:opacity-95"
        style={estiloDeLaFranja}
      >
        {contenido}
      </a>
    </div>
  );
}
