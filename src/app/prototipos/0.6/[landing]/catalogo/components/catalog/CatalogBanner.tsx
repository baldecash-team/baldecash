"use client";

import React, { useState } from "react";

interface CatalogBannerProps {
  desktopImageUrl: string;
  mobileImageUrl: string;
}

export default function CatalogBanner({
  desktopImageUrl,
  mobileImageUrl,
}: CatalogBannerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Skeleton placeholder */}
      {!loaded && (
        <div
          className="w-full rounded-xl animate-pulse"
          style={{
            backgroundColor: '#e4e4e7',
            aspectRatio: '4 / 1',
          }}
        />
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
