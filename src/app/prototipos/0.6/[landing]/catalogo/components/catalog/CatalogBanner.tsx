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
  /** PNG recortado con fondo transparente. Opcional: sin ella la tira igual se ve bien. */
  stripImageUrl?: string;
  /** Fondo de la tira. Default aqua. */
  stripBgColor?: string;
  /** Color de texto de la tira. Default navy. */
  stripTextColor?: string;
}

const STRIP_BG_DEFAULT = '#03DBD0';
const STRIP_TEXT_DEFAULT = '#151744';

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
        imageUrl={props.stripImageUrl}
        bgColor={props.stripBgColor}
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
  imageUrl?: string;
  bgColor?: string;
  textColor?: string;
  landing?: string;
  linkTarget?: string;
}

// A sangre: sin márgenes ni border-radius, de borde a borde. `min-height`
// 72px en móvil, 84px desde 768px; imagen desbordada por abajo/izquierda
// (spec del bloque `.bcr` del HTML de Haru). Se resuelve en CSS puro -no
// clases utilitarias- porque las medidas (76px/88px bajo 340px, 120px/136px
// desde 768px) no tienen equivalente directo en la escala de Tailwind.
const STRIP_STYLE = `
  .catalog-banner-strip {
    display: flex;
    align-items: center;
    min-height: 72px;
    width: 100%;
    text-decoration: none;
    overflow: hidden;
  }
  .catalog-banner-strip__media {
    position: relative;
    flex: 0 0 auto;
    align-self: stretch;
    overflow: hidden;
    width: 92px;
  }
  .catalog-banner-strip__media img {
    position: absolute;
    left: -4px;
    bottom: -10px;
    width: 104px;
    max-width: none;
  }
  .catalog-banner-strip__body {
    flex: 1 1 auto;
    min-width: 0;
    padding: 8px 10px;
  }
  .catalog-banner-strip__title {
    font-size: 14px;
    font-weight: 800;
    line-height: 1.15;
    margin: 0;
  }
  .catalog-banner-strip__price {
    font-size: 11.5px;
    font-weight: 600;
    color: rgba(21, 23, 68, .7);
    margin: 2px 0 0;
  }
  .catalog-banner-strip__price b {
    font-size: 16px;
    font-weight: 800;
    color: inherit;
  }
  .catalog-banner-strip__cta {
    flex: 0 0 auto;
    margin: 0 12px 0 8px;
    padding: 10px 13px;
    border-radius: 10px;
    font-size: 12.5px;
    font-weight: 700;
    white-space: nowrap;
    color: #fff;
  }
  .catalog-banner-strip:focus-visible {
    outline: 3px solid var(--azul, #5a63e0);
    outline-offset: -3px;
  }
  @media (max-width: 340px) {
    .catalog-banner-strip__media { width: 76px; }
    .catalog-banner-strip__media img { width: 88px; }
    .catalog-banner-strip__title { font-size: 13px; }
  }
  @media (min-width: 768px) {
    .catalog-banner-strip { min-height: 84px; justify-content: center; gap: 16px; }
    .catalog-banner-strip__media { width: 120px; }
    .catalog-banner-strip__media img { width: 136px; }
    .catalog-banner-strip__title { font-size: 17px; }
    .catalog-banner-strip__price b { font-size: 19px; }
  }
`;

/**
 * Tira compacta de remate: piezas separadas (imagen desbordada, título,
 * precio, botón) en vez de una sola imagen full-width. A sangre -sin el
 * padding del wrapper del catálogo-, ver CatalogLayoutV4 donde se neutraliza
 * ese padding solo para este tipo.
 */
function CatalogBannerStrip({
  title,
  priceText,
  ctaText,
  ctaUrl,
  imageUrl,
  bgColor,
  textColor,
  landing,
  linkTarget,
}: CatalogBannerStripProps) {
  // Mismo pipeline que el tipo imagen (ver `resolveHref`): mismo orden,
  // misma sanitización, mismos dos casos de seguridad cubiertos.
  const href = resolveHref(ctaUrl || '', landing);
  const nuevaPestana = linkTarget === '_blank';
  const bg = bgColor || STRIP_BG_DEFAULT;
  const color = textColor || STRIP_TEXT_DEFAULT;

  const contenido = (
    <>
      <style>{STRIP_STYLE}</style>
      {/* Si falta la imagen, el contenedor queda vacío pero el layout no se
          rompe: no hay <img> que dispare un ícono de "rota". */}
      <div className="catalog-banner-strip__media">
        {imageUrl && <img src={imageUrl} alt="" loading="lazy" />}
      </div>
      <div className="catalog-banner-strip__body">
        {title && <p className="catalog-banner-strip__title">{title}</p>}
        {priceText && <p className="catalog-banner-strip__price">{priceText}</p>}
      </div>
      {ctaText && (
        <span className="catalog-banner-strip__cta" style={{ backgroundColor: color }}>
          {ctaText}
        </span>
      )}
    </>
  );

  const style: React.CSSProperties = { backgroundColor: bg, color };

  if (!href) {
    return (
      <div data-testid="catalog-banner" className="catalog-banner-strip" style={style}>
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
    >
      {contenido}
    </a>
  );
}
