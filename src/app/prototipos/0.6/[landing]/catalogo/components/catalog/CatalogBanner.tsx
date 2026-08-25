"use client";

import React, { useState } from "react";
import { safeLinkUrl } from "../../../../utils/safeLinkUrl";

interface CatalogBannerProps {
  desktopImageUrl: string;
  mobileImageUrl: string;
  /** Enlace opcional. Sin él el banner es decorativo y no se envuelve en <a>. */
  linkUrl?: string;
  /** `_blank` abre en pestaña nueva. Por defecto, misma pestaña. */
  linkTarget?: string;
  /** Texto alternativo. Cuando el banner es enlace, además hace de texto del enlace. */
  altText?: string;
}

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

export default function CatalogBanner({
  desktopImageUrl,
  mobileImageUrl,
  linkUrl,
  linkTarget,
  altText,
}: CatalogBannerProps) {
  const [loaded, setLoaded] = useState(false);

  // La URL viene de BD (`home_component.config.link_url`), un campo de texto
  // libre del admin: sin validar, un `javascript:` guardado ahí se ejecuta al
  // hacer clic. safeLinkUrl acepta internas --que es el caso de uso: llevar a
  // otra sección del sitio-- y descarta cualquier esquema peligroso.
  const href = safeLinkUrl(linkUrl);
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
