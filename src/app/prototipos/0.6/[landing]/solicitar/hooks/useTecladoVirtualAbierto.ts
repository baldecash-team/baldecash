'use client';

/**
 * useTecladoVirtualAbierto - Detecta si el teclado virtual esta ocupando pantalla.
 *
 * Existe para que `MobileStickyCta` pueda esconderse mientras el usuario escribe.
 * Sin esto, un elemento `fixed bottom` en un paso con inputs termina detras del
 * teclado (iOS no encoge el layout viewport al abrirlo) o flotando en medio de
 * la pantalla, y encima puede tapar el campo que se esta llenando.
 *
 * POR QUE `visualViewport` Y NO UN HACK DE SCROLL:
 * este repo ya pago ese precio. `AddressAutocompleteField` usaba
 * `window.scrollBy({ behavior: 'smooth' })` para subir el input sobre el navbar,
 * y en iOS Safari eso se peleaba con el ciclo de vida del teclado: al cerrarse
 * (por ejemplo tras elegir una sugerencia) el motor de momentum-scroll quedaba
 * trabado y la pagina no volvia a scrollear hasta recargar. Se quito. Aca solo
 * LEEMOS el viewport, nunca lo empujamos.
 *
 * COMO SE DETECTA: `window.visualViewport.height` si reporta el alto realmente
 * visible, asi que al abrir el teclado se encoge. Comparamos contra
 * `window.innerHeight` (el layout viewport, que en iOS NO cambia). Si la
 * diferencia pasa el umbral, hay teclado.
 *
 * Devuelve `false` en SSR y en navegadores sin `visualViewport` (fallback
 * seguro: el CTA se comporta como antes de este cambio, siempre visible).
 */

import { useEffect, useState } from 'react';

/**
 * Un teclado de movil ocupa 260-350 px. La barra de URL de Safari al
 * contraerse/expandirse mueve ~60-100 px, y ese movimiento NO debe contar como
 * teclado. 150 px queda comodo entre ambos.
 */
const UMBRAL_PX = 150;

export function useTecladoVirtualAbierto(umbralPx: number = UMBRAL_PX): boolean {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : undefined;
    if (!vv) return;

    const medir = () => {
      // Solo `innerHeight - height`. Se probo restar tambien `offsetTop` y esta
      // MAL: ese offset es cuanto scrolleo el visual viewport dentro del layout
      // (iOS lo desplaza para dejar ver el input enfocado), no espacio comido
      // por el teclado. Restarlo subestima el teclado y con un scroll grande da
      // negativo -> el CTA reaparece justo debajo del teclado.
      const ocupado = window.innerHeight - vv.height;
      setAbierto(ocupado > umbralPx);
    };

    medir();
    vv.addEventListener('resize', medir);
    vv.addEventListener('scroll', medir);
    return () => {
      vv.removeEventListener('resize', medir);
      vv.removeEventListener('scroll', medir);
    };
  }, [umbralPx]);

  return abierto;
}

export default useTecladoVirtualAbierto;
