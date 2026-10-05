'use client';

/**
 * Campo de texto de la calculadora.
 *
 * Existe porque hay landings que necesitan un dato que no es un importe para
 * armar el financiamiento. En titulación es el número de ticket: sin él la
 * solicitud no se puede cruzar con el trámite en SENATI, y pedirlo recién en el
 * formulario obliga a ir a buscarlo cuando la persona ya se comprometió con una
 * cuota.
 *
 * El dato no entra en la simulación: no cambia la cuota ni el cronograma. Lo
 * único que hace es viajar al formulario y bloquear el paso a la solicitud
 * mientras falte.
 *
 * Lo que pide es un CÓDIGO que la institución emite y la persona copia de otra
 * pantalla, no texto libre. De ahí que lo pase a mayúsculas y le saque los
 * espacios: pegar el código con un espacio al final es lo más común que pasa, y
 * un código que difiere en un espacio no cruza contra nada.
 */

import React, { useId } from 'react';
import { ExternalLink } from 'lucide-react';
import { AyudaDesplegable } from './AyudaDesplegable';
import type { CampoTextoPerfil } from '../perfiles';

interface Props {
  campo: CampoTextoPerfil;
  valor: string;
  onCambio: (valor: string) => void;
}

/**
 * Deja el código como lo emite la institución: en mayúsculas y sin espacios.
 *
 * Solo eso. NO descarta otros caracteres: la forma exacta del código la define
 * quien lo emite, y filtrar de más significaría comerse en silencio un guion
 * que mañana la institución decida usar. Lo que sí es seguro es que un espacio
 * no forma parte de un código.
 */
function sanearCodigo(texto: string): string {
  return texto.replace(/\s/g, '').toUpperCase();
}

export function CampoTexto({ campo, valor, onCambio }: Props) {
  const idCampo = useId();

  return (
    <div>
      <AyudaDesplegable idCampo={idCampo} etiqueta={campo.etiqueta} tituloAyuda={campo.ayuda?.titulo}>
        <p className="text-xs leading-relaxed text-neutral-600">{campo.ayuda?.cuerpo}</p>

        {campo.ayuda?.enlace && (
          /*
            Se abre en otra pestaña y con `noreferrer`: es un documento largo que
            se consulta MIENTRAS se completa el campo, y llevarse la pestaña de
            paseo vacía la calculadora a medio llenar.
          */
          <a
            href={campo.ayuda.enlace.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition-[filter] hover:brightness-90"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {campo.ayuda.enlace.texto}
          </a>
        )}
      </AyudaDesplegable>

      <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 transition-colors focus-within:border-[var(--color-primary)]">
        <input
          id={idCampo}
          type="text"
          inputMode="text"
          placeholder={campo.placeholder}
          value={valor}
          maxLength={campo.maxLongitud}
          // El código se dicta en mayúsculas y el teclado del teléfono arranca
          // en minúscula. `autoCapitalize` acomoda lo que se escribe sin tocar
          // el valor: el saneo de verdad lo hace quien recibe el cambio.
          autoCapitalize="characters"
          spellCheck={false}
          onChange={(evento) => onCambio(sanearCodigo(evento.target.value))}
          className="w-full bg-transparent py-3 text-base tracking-wide text-neutral-800 outline-none placeholder:tracking-normal placeholder:text-neutral-400"
        />
      </div>

      <div className="mt-1.5 flex items-start justify-between gap-3">
        <p className="text-xs leading-relaxed text-neutral-500">{campo.nota}</p>
        {/*
          El contador acompaña a un límite que se alcanza de verdad: el código es
          corto y quien lo copia de otra pantalla necesita ver que entró entero.
        */}
        <span className="flex-shrink-0 text-xs text-neutral-400">
          {valor.length}/{campo.maxLongitud}
        </span>
      </div>
    </div>
  );
}

export default CampoTexto;
