/**
 * El descargo legal de la landing, dibujado.
 *
 * Un solo componente para las tres apariciones porque el texto es el mismo y
 * tiene que seguir siéndolo: separarlos en tres bloques de JSX garantiza que
 * algún día se corrija uno y queden dos versiones de una frase legal.
 *
 * Lo que cambia entre apariciones es solo el fondo sobre el que cae, y por eso
 * la variante describe el lugar y no el color: quien lo monta sabe dónde está,
 * no qué gris le toca.
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { avisoLegalDe } from './avisos';

export type VarianteAvisoLegal =
  /** Franja oscura debajo del hero. Es la única que lleva el aviso completo. */
  | 'hero'
  /** Franja clara sobre el pie, en todas las pantallas del recorrido. */
  | 'pie'
  /** Párrafo suelto bajo un título, sin franja ni fondo propio. */
  | 'suelto';

interface Props {
  /** Segmento `[landing]` de la URL. Sin aviso para esa landing no se dibuja nada. */
  landing: string | undefined;
  variante: VarianteAvisoLegal;
}

export function AvisoLegal({ landing, variante }: Props) {
  const aviso = avisoLegalDe(landing);
  if (!aviso) return null;

  // El cierre solo va en el hero: ver `cierreHero` en avisos.ts.
  const cuerpo =
    variante === 'hero' && aviso.cierreHero ? `${aviso.cuerpo} ${aviso.cierreHero}` : aviso.cuerpo;

  if (variante === 'suelto') {
    /*
      Sin el destacado, a diferencia de las franjas.

      Esta variante va bajo el título de la calculadora, que ya dice de qué
      institución se habla. Abrir ahí con «El financiamiento no involucra a
      SENATI» encabeza la pantalla con una negación de la institución con la
      que la persona cree estar tratando, justo antes de pedirle que arme su
      financiamiento. El descargo dice lo mismo empezando por quién sí otorga
      el crédito.
    */
    return (
      <p className="mx-auto max-w-4xl px-2 text-[11px] leading-snug text-neutral-400">
        {cuerpo}
      </p>
    );
  }

  if (variante === 'pie') {
    return (
      <div className="border-t border-neutral-200 bg-neutral-100">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] leading-relaxed text-neutral-500">
            <span className="font-semibold text-neutral-700">{aviso.destacado}</span> {cuerpo}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/15 bg-neutral-900">
      {/*
        El icono se oculta en pantallas chicas. No es decorativo por gusto: en un
        teléfono se come una columna que el texto necesita, y el texto es el que
        tiene que leerse.
      */}
      <div className="mx-auto flex max-w-7xl gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <ShieldCheck
          className="mt-0.5 hidden h-5 w-5 flex-shrink-0 sm:block"
          style={{ color: 'var(--color-secondary, #03DBD0)' }}
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-white/75">
          <span className="font-semibold text-white">{aviso.destacado}</span> {cuerpo}
        </p>
      </div>
    </div>
  );
}

export default AvisoLegal;
