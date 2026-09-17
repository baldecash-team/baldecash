"use client";

import React, { useEffect, useState } from "react";
import { safeLinkUrl } from "../../../../utils/safeLinkUrl";
import { transformConfigHref } from "../../../../utils/routes";

interface CatalogBannerProps {
  desktopImageUrl: string;
  mobileImageUrl: string;
  /**
   * Enlace opcional. Sin él el banner es decorativo y no se envuelve en <a>.
   *
   * Campo anterior a los destinos por viewport: lo siguen usando los banners
   * guardados antes de esa función. Solo manda si no hay ninguno de los dos
   * campos nuevos.
   */
  linkUrl?: string;
  /** Destino al hacer clic en pantalla ancha. */
  desktopLinkUrl?: string;
  /** Destino al hacer clic en móvil. Vacío = se usa el de desktop. */
  mobileLinkUrl?: string;
  /**
   * Slug de la landing. Los hrefs del admin se guardan sin barra inicial
   * (`catalogo?device=laptop`), así que hay que resolverlos contra ella.
   */
  landing?: string;
  /** `_blank` abre en pestaña nueva. Por defecto, misma pestaña. */
  linkTarget?: string;
  /** Texto alternativo. Cuando el banner es enlace, además hace de texto del enlace. */
  altText?: string;
  /**
   * Discriminador del layout. `'tira_remate'` pinta la tira compacta;
   * cualquier otro valor (incluido `undefined`) pinta la imagen de siempre.
   *
   * CRÍTICO: se resuelve por AUSENCIA, no por igualdad a `'imagen'`. Las
   * landings con banner en producción antes de esta clave tienen
   * `banner_type` undefined, no `'imagen'`. Comparar con `=== 'imagen'`
   * apagaría esos banners.
   */
  bannerType?: string;
  /** Título de la tira, ej. "Gran remate laptop seminuevas". */
  stripTitle?: string;
  /** Texto de precio de la tira, ej. "Desde S/45 al mes". */
  stripPriceText?: string;
  /** Texto del botón de la tira, ej. "Ver". */
  stripCtaText?: string;
  /** Destino al hacer clic en la tira. Mismo contrato de link que el tipo imagen. */
  stripCtaUrl?: string;
  /**
   * PNG recortado con fondo transparente.
   *
   * OBSOLETO desde el rediseño de la tira: el diseño nuevo no lleva imagen.
   * Se mantiene en la interfaz porque las landings guardadas antes del
   * rediseño siguen teniendo la clave en su config; simplemente se ignora.
   */
  stripImageUrl?: string;
  /** Inicio del degradado de fondo. Default azul de marca. */
  stripBgColor?: string;
  /**
   * Fin del degradado de fondo. Default aqua de marca.
   *
   * Vacío = degradado plano (arranca y termina en `stripBgColor`), que es lo
   * que ven las landings guardadas antes del rediseño: conservan su color
   * sólido en vez de estrenar un degradado que nadie eligió.
   */
  stripBgColor2?: string;
  /** Color del texto de la tira. Default blanco. */
  stripTextColor?: string;
}

const STRIP_BG_DEFAULT = '#4654CD';
const STRIP_BG2_DEFAULT = '#03DBD0';
const STRIP_TEXT_DEFAULT = '#FFFFFF';

// El mismo corte que usan el <picture> y el skeleton de abajo.
const MEDIA_MOVIL = "(max-width: 768px)";

// Proporciones recomendadas del banner (declaradas en admin2, CatalogBannerSection):
// desktop 1920×400, mobile 700×400. El skeleton las usa para reservar el alto
// correcto y evitar el salto de layout al cargar la imagen.
//
// Se resuelve en CSS (no en JS) para que el alto ya sea el correcto en el primer
// render: con useState/useEffect el server y el primer paint usarían siempre la
// proporción desktop y en móvil se vería el salto que queremos evitar.
// El corte coincide con el <picture> de abajo.
const SKELETON_ASPECT_STYLE = `
  .catalog-banner-skeleton { aspect-ratio: 1920 / 400; }
  @media (max-width: 768px) {
    .catalog-banner-skeleton { aspect-ratio: 700 / 400; }
  }
`;

/**
 * Resuelve + sanitiza un href de banner. Compartido por los dos tipos de
 * banner (imagen y tira), es el MISMO pipeline y el mismo orden que ya
 * probaban los tests de seguridad del tipo imagen.
 *
 * El ORDEN IMPORTA:
 * 1. `transformConfigHref` resuelve el href contra la landing. El admin los
 *    guarda sin barra inicial (`catalogo?device=laptop`), que no es una ruta
 *    navegable por sí sola.
 * 2. `safeLinkUrl` descarta esquemas peligrosos: la URL sale de un campo de
 *    texto libre del admin.
 *
 * Invertir los dos pasos no da error: `safeLinkUrl('catalogo')` devuelve ''
 * --no empieza con '/', '#', '?' ni 'http'-- y el banner se queda sin enlace
 * en silencio.
 *
 * El esquema se chequea ADEMÁS sobre el valor crudo. `transformConfigHref`
 * no conoce `javascript:`, así que le antepondría el home de la landing y
 * devolvería `/prototipos/0.6/x/javascript:alert(1)`: al empezar con '/' eso
 * pasa `safeLinkUrl` sin problema, y la sanitización quedaría anulada. No
 * llega a ser ejecutable --el navegador lo lee como ruta-- pero pintaría un
 * enlace roto donde no debería haber ninguno.
 * Lista blanca alineada con `safeLinkUrl`, que solo admite http(s) e
 * internas. `tel:`/`mailto:` quedan afuera igual que allá.
 */
function resolveHref(crudo: string, landing?: string): string {
  const esquemaProhibido = /^[a-z][a-z0-9+.-]*:/i.test(crudo)
    && !/^https?:/i.test(crudo);

  return esquemaProhibido
    ? ''
    : safeLinkUrl(landing ? transformConfigHref(crudo, landing) : crudo);
}

/**
 * Discrimina por AUSENCIA, no por igualdad a 'imagen': las 16 landings con
 * banner ya en producción tienen `banner_type` undefined, no `'imagen'`.
 * Comparar con `=== 'imagen'` apagaría esos banners.
 */
export default function CatalogBanner(props: CatalogBannerProps) {
  const tipo = props.bannerType ?? 'imagen';

  if (tipo === 'tira_remate') {
    return (
      <CatalogBannerStrip
        title={props.stripTitle}
        priceText={props.stripPriceText}
        ctaText={props.stripCtaText}
        ctaUrl={props.stripCtaUrl}
        bgColor={props.stripBgColor}
        bgColor2={props.stripBgColor2}
        textColor={props.stripTextColor}
        landing={props.landing}
        linkTarget={props.linkTarget}
      />
    );
  }

  return <CatalogBannerImage {...props} />;
}

function CatalogBannerImage({
  desktopImageUrl,
  mobileImageUrl,
  linkUrl,
  desktopLinkUrl,
  mobileLinkUrl,
  landing,
  linkTarget,
  altText,
}: CatalogBannerProps) {
  const [loaded, setLoaded] = useState(false);

  // Cuál de los dos destinos se usa depende del ancho de pantalla, no de cuál
  // imagen sirve el <picture>: el navegador no expone esa decisión al JS.
  // Ambos cortan en el mismo breakpoint, así que coinciden.
  //
  // Arranca en `false` --y no leyendo matchMedia-- porque en el render del
  // servidor no hay window: leerlo acá rompería la hidratación. En la práctica
  // no se nota, porque los dos destinos suelen ser el mismo hasta que alguien
  // configura uno distinto.
  const [esMovil, setEsMovil] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MEDIA_MOVIL);
    setEsMovil(mq.matches);
    const alCambiar = (e: MediaQueryListEvent) => setEsMovil(e.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  // Un banner clicable en desktop y muerto en móvil se leería como un bug, así
  // que sin destino propio de móvil se cae al de desktop.
  const elegido = esMovil
    ? (mobileLinkUrl || desktopLinkUrl)
    : desktopLinkUrl;

  // `linkUrl` es el campo anterior: solo manda si no hay ninguno de los nuevos.
  const crudo = elegido || linkUrl || '';

  // Resolver + sanitizar: ver docstring de `resolveHref` para el porqué del orden.
  const href = resolveHref(crudo, landing);
  const nuevaPestana = linkTarget === '_blank';
  const alt = altText?.trim() || 'Banner promocional';

  // Banner solo-móvil: hay pieza de móvil pero no de desktop. Se esconde de 769px
  // en adelante en vez de estirar una imagen vertical a todo el ancho.
  // `md:hidden` corta en 768px, el mismo punto que el <picture> de abajo.
  const soloMovil = !!mobileImageUrl && !desktopImageUrl;
  const claseVisibilidad = soloMovil ? 'md:hidden ' : '';

  // El skeleton reserva alto con la proporción del banner. Con una pieza
  // solo-móvil no se puede asumir 700×400: puede ser vertical, y reservar el
  // alto apaisado haría saltar el catálogo al cargar. En ese caso no se reserva
  // nada y la imagen define su propio alto.
  const reservaAlto = !soloMovil;

  const contenido = (
    <>
      {/* Skeleton placeholder */}
      {!loaded && reservaAlto && (
        <>
          <style>{SKELETON_ASPECT_STYLE}</style>
          <div
            className="catalog-banner-skeleton w-full rounded-xl animate-pulse"
            style={{ backgroundColor: '#e4e4e7' }}
          />
        </>
      )}

      {/* Actual image.
          El <source> de móvil solo se emite si HAY imagen de móvil: con un
          srcSet vacío el navegador no resuelve nada, `onLoad` no dispara y el
          skeleton se queda animando para siempre. Sin ella, el <img> de abajo
          sirve la de desktop en todos los tamaños, que se degrada bien.

          Al revés también vale: cuando solo hay imagen de móvil (una pieza
          vertical que estirada a 1920px se vería deforme), se omite el <source>
          de desktop y el `src` base pasa a ser la de móvil — el contenedor de
          arriba ya se encarga de no mostrar nada en pantallas grandes. */}
      <picture>
        {mobileImageUrl && (
          <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
        )}
        {desktopImageUrl && (
          <source media="(min-width: 769px)" srcSet={desktopImageUrl} />
        )}
        <img
          src={desktopImageUrl || mobileImageUrl}
          alt={alt}
          loading="lazy"
          className={`w-full rounded-xl object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={!loaded && reservaAlto ? { position: 'absolute', top: 0, left: 0 } : undefined}
          onLoad={() => setLoaded(true)}
        />
      </picture>
    </>
  );

  // Sin enlace el banner es decorativo: no se envuelve en <a> para no
  // anunciarlo como algo clicable que no lleva a ninguna parte.
  if (!href) {
    return (
      <div data-testid="catalog-banner" className={`${claseVisibilidad}relative w-full overflow-hidden rounded-xl`}>
        {contenido}
      </div>
    );
  }

  return (
    <a
      href={href}
      data-testid="catalog-banner-link"
      {...(nuevaPestana ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${claseVisibilidad}relative block w-full cursor-pointer overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul,#5a63e0)] focus-visible:ring-offset-2`}
    >
      {contenido}
    </a>
  );
}

interface CatalogBannerStripProps {
  title?: string;
  priceText?: string;
  ctaText?: string;
  ctaUrl?: string;
  bgColor?: string;
  bgColor2?: string;
  textColor?: string;
  landing?: string;
  linkTarget?: string;
}

// A sangre: sin márgenes ni border-radius, de borde a borde. `min-height`
// 54px en móvil, 70px desde 768px (spec del bloque `.bcr-tira`). Se resuelve
// en CSS puro -no clases utilitarias- porque las medidas (23px de título,
// 13.5px de bajada, botón pill) no tienen equivalente en la escala de Tailwind.
//
// El texto va sobre un degradado, así que el contenedor NO define `color`:
// lo define cada pieza, para que el botón pueda invertir (fondo blanco,
// letra del color de marca) sin heredar el blanco del título.
const STRIP_STYLE = `
  .catalog-banner-strip {
    display: block;
    width: 100%;
    text-decoration: none;
  }
  .catalog-banner-strip__inner {
    /* El padding lateral copia el del catálogo (12px, 16px desde sm, 24px
       desde lg) para que el título arranque en la misma vertical que
       "13 equipos" y que el borde de la card de filtros. La maqueta trae
       max-width 1400px mas 34px, que en una maqueta suelta se ve bien pero
       aca deja el texto 23px mas adentro que todo lo demas: se lee como un
       bloque desalineado. */
    margin: 0 auto;
    /* La maqueta trae 54px de alto y 7px de padding vertical. Acá va más
       holgado: con 7px el texto queda pegado a los bordes de la franja,
       que es lo que se ve en pantalla aunque el número coincida. */
    min-height: 68px;
    padding: 14px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .catalog-banner-strip__body {
    min-width: 0;
  }
  .catalog-banner-strip__title {
    display: block;
    font-family: 'Baloo 2', system-ui, sans-serif;
    font-size: 23px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -.005em;
    text-transform: uppercase;
    margin: 0;
    /* Una sola linea, como la bajada.
       El titulo lo escribe quien edita la landing y el diseño asume algo
       corto ("Gran remate"). Sin esto, "Gran remate laptops seminuevas"
       se parte en 3 lineas a 390px y la tira pasa de 54px a 100px:
       deja de ser una tira y empuja el catalogo hacia abajo. */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .catalog-banner-strip__price {
    display: block;
    font-size: 13.5px;
    font-weight: 500;
    line-height: 1.15;
    margin: 1px 0 0;
    /* La bajada va un punto por debajo del titulo, como en la maqueta
       (rgba blanco al 92%). Se aplica al COLOR y no con opacity: opacity
       afecta a todo el subarbol y abre un contexto de apilamiento, y ademas
       el color de la tira es configurable, asi que no se puede hardcodear el
       blanco. color-mix baja solo el color, sea cual sea. */
    color: color-mix(in srgb, currentColor 92%, transparent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .catalog-banner-strip__cta {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    font-family: 'Baloo 2', system-ui, sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    line-height: 1;
    padding: 9px 14px;
    border-radius: 999px;
    white-space: nowrap;
    /* despega el botón del extremo claro del degradado */
    box-shadow: 0 1px 3px rgba(21, 23, 68, .18);
  }
  .catalog-banner-strip__cta svg {
    width: 9px;
    height: 9px;
    flex: 0 0 auto;
  }
  .catalog-banner-strip:focus-visible {
    outline: 3px solid #151744;
    outline-offset: -3px;
  }
  @media (max-width: 339px) {
    .catalog-banner-strip__inner { padding: 12px 12px; gap: 8px; }
    .catalog-banner-strip__title { font-size: 20px; }
    .catalog-banner-strip__price { font-size: 12px; }
    .catalog-banner-strip__cta { padding: 8px 11px; font-size: 12.5px; }
  }
  @media (min-width: 768px) {
    .catalog-banner-strip__inner { min-height: 86px; padding: 18px 16px; }
    .catalog-banner-strip__title { font-size: 30px; }
    .catalog-banner-strip__price { font-size: 16px; }
    .catalog-banner-strip__cta { font-size: 15px; padding: 12px 20px; }
  }
  /* El catálogo pasa a 24px de margen desde lg; el banner lo sigue. */
  @media (min-width: 1024px) {
    .catalog-banner-strip__inner { padding-left: 24px; padding-right: 24px; }
  }
`;

/**
 * Tira compacta de remate: título, bajada de precio y botón sobre un
 * degradado, a sangre -sin el padding del wrapper del catálogo-, ver
 * CatalogLayoutV4 donde se neutraliza ese padding solo para este tipo.
 *
 * El degradado sale de DOS colores editables. Con el segundo vacío arranca y
 * termina en el primero, o sea color sólido: así las landings guardadas antes
 * del rediseño conservan exactamente el fondo que eligieron, en vez de
 * estrenar un degradado que nadie configuró.
 */
function CatalogBannerStrip({
  title,
  priceText,
  ctaText,
  ctaUrl,
  bgColor,
  bgColor2,
  textColor,
  landing,
  linkTarget,
}: CatalogBannerStripProps) {
  // Mismo pipeline que el tipo imagen (ver `resolveHref`): mismo orden,
  // misma sanitización, mismos dos casos de seguridad cubiertos.
  const href = resolveHref(ctaUrl || '', landing);
  const nuevaPestana = linkTarget === '_blank';
  const desde = bgColor || STRIP_BG_DEFAULT;
  /**
   * Fin del degradado, en tres casos:
   *
   * - Segundo color elegido => se usa.
   * - Sin segundo pero CON primero => plano: la landing guardó un sólido
   *   antes del rediseño y tiene que conservarlo, no estrenar un aqua que
   *   nadie configuró.
   * - Sin ninguno de los dos => degradado de marca completo (azul -> aqua),
   *   que es el diseño por defecto de la tira.
   */
  const hasta = bgColor2 || (bgColor ? bgColor : STRIP_BG2_DEFAULT);
  const color = textColor || STRIP_TEXT_DEFAULT;

  const contenido = (
    <>
      <style>{STRIP_STYLE}</style>
      <span className="catalog-banner-strip__inner">
        <span className="catalog-banner-strip__body">
          {title && <strong className="catalog-banner-strip__title">{title}</strong>}
          {priceText && <span className="catalog-banner-strip__price">{priceText}</span>}
        </span>
        {ctaText && (
          <span className="catalog-banner-strip__cta" style={{ color: desde }}>
            {ctaText}
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 4l6 6-6 6" />
            </svg>
          </span>
        )}
      </span>
    </>
  );

  const style: React.CSSProperties = {
    background: `linear-gradient(90deg, ${desde} 0%, ${hasta} 100%)`,
    color,
  };

  /**
   * Las dos paradas del degradado, expuestas en el DOM.
   *
   * jsdom descarta `linear-gradient()` al parsear: no lo guarda ni en
   * `style.background`, ni en `style.backgroundImage`, ni en el atributo
   * `style` crudo. Sin esto no hay forma de verificar en un test que el
   * fondo salga de los colores configurados -- y el caso que más importa
   * (un solo color guardado => degradado plano, las landings de antes del
   * rediseño no cambian de fondo solas) quedaría sin cubrir.
   */
  const attrsFondo = { 'data-strip-from': desde, 'data-strip-to': hasta };

  if (!href) {
    return (
      <div data-testid="catalog-banner" className="catalog-banner-strip" style={style} {...attrsFondo}>
        {contenido}
      </div>
    );
  }

  return (
    <a
      href={href}
      data-testid="catalog-banner-link"
      {...(nuevaPestana ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="catalog-banner-strip"
      style={style}
      {...attrsFondo}
    >
      {contenido}
    </a>
  );
}
