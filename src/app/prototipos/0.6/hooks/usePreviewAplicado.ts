'use client';

import { useEffect, useState } from 'react';

/**
 * Si el backend efectivamente cotizo con el pricing propuesto (BAL-3008).
 *
 * Tener un token en la URL no significa que el preview este activo: un token
 * vencido o inexistente devuelve los precios REALES sin avisar. Solo el backend
 * conoce la diferencia, y la informa en `pricing_preview_applied`.
 *
 * Importa porque el link vence en una hora y se comparte: sin esta
 * confirmacion, el caso mas comun (link vencido) mostraria los precios de
 * produccion bajo un cartel que dice "precios propuestos", que es exactamente
 * lo contrario de lo que ese cartel tiene que prevenir.
 *
 * Devuelve null mientras no se sabe, para que el banner no parpadee entre
 * estados durante la verificacion.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export function usePreviewAplicado(
  landingSlug: string | null | undefined,
  token: string | null
): boolean | null {
  const [aplicado, setAplicado] = useState<boolean | null>(null);

  useEffect(() => {
    if (!landingSlug || !token) {
      setAplicado(null);
      return;
    }

    // Si el usuario navega o el token cambia mientras la consulta esta en
    // vuelo, la respuesta vieja no debe pisar el estado nuevo.
    let vigente = true;

    // limit=1: solo interesa el flag de la respuesta, no los productos.
    const url =
      `${API_BASE_URL}/public/landing/${landingSlug}/products` +
      `?limit=1&preview_key=${encodeURIComponent(token)}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (vigente) setAplicado(data?.pricing_preview_applied === true);
      })
      .catch(() => {
        // Ante un fallo de red no se puede afirmar que el preview este activo.
        // Callar el cartel es el error menos danino de los dos.
        if (vigente) setAplicado(false);
      });

    return () => {
      vigente = false;
    };
  }, [landingSlug, token]);

  return aplicado;
}
