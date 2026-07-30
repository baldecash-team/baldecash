"use client";

import React, { useState } from "react";

interface CatalogBannerProps {
  desktopImageUrl: string;
  mobileImageUrl: string;
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
}: CatalogBannerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Skeleton placeholder */}
      {!loaded && (
        <>
          <style>{SKELETON_ASPECT_STYLE}</style>
          <div
            className="catalog-banner-skeleton w-full rounded-xl animate-pulse"
            style={{ backgroundColor: '#e4e4e7' }}
          />
        </>
      )}

      {/* Actual image */}
      <picture>
        <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
        <source media="(min-width: 769px)" srcSet={desktopImageUrl} />
        <img
          src={desktopImageUrl}
          alt="Banner promocional"
          className={`w-full rounded-xl object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={!loaded ? { position: 'absolute', top: 0, left: 0 } : undefined}
          onLoad={() => setLoaded(true)}
        />
      </picture>
    </div>
  );
}
