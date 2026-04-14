"use client";

import React from "react";

interface CatalogBannerProps {
  desktopImageUrl: string;
  mobileImageUrl: string;
}

export default function CatalogBanner({
  desktopImageUrl,
  mobileImageUrl,
}: CatalogBannerProps) {
  return (
    <picture>
      <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
      <source media="(min-width: 769px)" srcSet={desktopImageUrl} />
      <img
        src={desktopImageUrl}
        alt="Banner promocional"
        className="w-full rounded-xl object-cover"
        loading="lazy"
      />
    </picture>
  );
}
