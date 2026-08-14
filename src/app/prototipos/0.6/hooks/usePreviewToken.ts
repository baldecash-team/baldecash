'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePreview } from '../context/PreviewContext';

/**
 * Token de preview vigente para la landing en curso, venga de donde venga.
 *
 * Hay dos formas de estar previsualizando y el catalogo no deberia conocer la
 * diferencia:
 *
 *   1. Landing NO publicada: se entra por /preview/{id} y el token vive en
 *      PreviewContext. Es el flujo que ya existia.
 *   2. Landing PUBLICADA con un pricing propuesto: se entra con
 *      ?preview_key= en cualquier URL de la landing. Es lo que agrega BAL-3008.
 *
 * El segundo caso se persiste por landing en sessionStorage porque el usuario
 * navega (catalogo -> producto -> volver) y el parametro se pierde en el
 * camino; sin persistir, el preview se apaga solo al primer click.
 */

const STORAGE_KEY = 'baldecash-preview-pricing';

/**
 * Una hora, igual que el TTL del backend. El backend es la autoridad: si el
 * token vencio alla, la respuesta viene con los precios reales igual. Este
 * limite solo evita seguir mandando un token muerto en cada request.
 */
const TTL_MS = 60 * 60 * 1000;

interface TokenGuardado {
  slug: string;
  token: string;
  activatedAt: number;
}

function leerGuardado(): TokenGuardado | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: TokenGuardado = JSON.parse(raw);
    if (Date.now() - parsed.activatedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    // sessionStorage puede fallar (modo privado, JSON corrupto). Sin preview
    // se ve el catalogo real, que es el fallback correcto.
    return null;
  }
}

export function usePreviewToken(landingSlug: string): string | null {
  const searchParams = useSearchParams();
  const preview = usePreview();
  const [token, setToken] = useState<string | null>(null);

  const desdeUrl = searchParams?.get('preview_key') ?? null;

  useEffect(() => {
    if (desdeUrl) {
      const guardar: TokenGuardado = {
        slug: landingSlug,
        token: desdeUrl,
        activatedAt: Date.now(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(guardar));
      } catch {
        // Si no se puede persistir, el preview igual funciona en esta pagina.
      }
      setToken(desdeUrl);
      return;
    }
    const guardado = leerGuardado();
    setToken(guardado?.slug === landingSlug ? guardado.token : null);
  }, [desdeUrl, landingSlug]);

  // El flujo de landings no publicadas sigue mandando: si ese preview esta
  // activo para esta landing, su token gana.
  if (preview.isPreviewingLanding(landingSlug) && preview.previewKey) {
    return preview.previewKey;
  }
  return token;
}
