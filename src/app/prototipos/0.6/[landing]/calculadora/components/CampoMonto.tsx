'use client';

/**
 * Campo de importe de la calculadora.
 *
 * Es de texto y NO numérico a propósito. Un campo numérico responde a la rueda
 * del ratón mientras tiene el foco, así que desplazar la página con el puntero
 * encima sube o baja el importe sin que la persona lo advierta. Y el daño es
 * silencioso: la cuota se vuelve a simular con el monto nuevo, la pantalla
 * queda coherente consigo misma, y no queda rastro de que el número cambió.
 *
 * El precio de esa decisión es que el filtrado deja de hacerlo el navegador.
 * Lo hace `sanearMontoEscrito`.
 */

import React, { useState } from 'react';
import { redondearSoles, sanearMontoEscrito } from '../types/calculadora';

interface CampoMontoProps {
  etiqueta: string;
  valor: number;
  placeholder: string;
  onCambio: (valor: number) => void;
}

export function CampoMonto({ etiqueta, valor, placeholder, onCambio }: CampoMontoProps) {
  /**
   * El texto es estado propio del campo, no una proyección del importe.
   *
   * Hace falta porque un número no puede representar los estados intermedios
   * del tecleo: quien escribe 350.50 pasa por "350." antes de llegar, y ese
   * punto desaparecería en el viaje de ida y vuelta a número. Reescribirle el
   * campo a la mitad de una palabra es peor que dejarlo.
   */
  const [texto, setTexto] = useState(valor === 0 ? '' : String(valor));

  const alEscribir = (entrada: string) => {
    const saneado = sanearMontoEscrito(entrada);
    setTexto(saneado);

    // De un estado intermedio sale NaN, que acá se informa como cero: todavía
    // no hay importe que simular.
    const numero = Number.parseFloat(saneado);
    onCambio(Number.isFinite(numero) && numero >= 0 ? redondearSoles(numero) : 0);
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">{etiqueta}</span>
      <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 transition-colors focus-within:border-[var(--color-primary)]">
        <span className="mr-2 text-sm font-semibold text-[var(--color-primary)]">S/</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={texto}
          onChange={(evento) => alEscribir(evento.target.value)}
          className="w-full bg-transparent py-3 text-base text-neutral-800 outline-none placeholder:text-neutral-400"
        />
      </div>
    </label>
  );
}
