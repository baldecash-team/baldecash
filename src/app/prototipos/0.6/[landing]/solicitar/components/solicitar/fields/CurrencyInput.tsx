'use client';

/**
 * CurrencyInput — campo «Monto» del wizard (BAL-4395).
 *
 * El cliente ve la coma de miles mientras escribe («2,500»); por `onChange`
 * sale el número limpio de siempre («2500»), que es lo que se guarda en
 * form_data y lo que leen el legacy y ws2.
 *
 * Es un input de texto con teclado decimal (un `type="number"` no admite
 * comas). El cursor se recoloca a mano tras reformatear para que editar en
 * medio no lo mande al final.
 */

import React, { useCallback, useRef } from 'react';
import { TextInput, TextInputProps } from './TextInput';
import {
  limpiarMonto,
  formatearMonto,
  contarSignificativos,
  posicionEnFormateado,
} from './montoFormato';

type CurrencyInputProps = Omit<
  TextInputProps,
  'type' | 'inputMode' | 'inputRef' | 'onKeyDown' | 'maxLength' | 'showCounter'
>;

/** Quita el carácter `indice` del valor limpio y lo vuelve a limpiar. */
const quitarEn = (limpio: string, indice: number) =>
  limpiarMonto(limpio.slice(0, indice) + limpio.slice(indice + 1));

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  onBlur,
  min,
  max,
  step,
  ...resto
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const ultimaTecla = useRef<string | null>(null);

  const limpio = limpiarMonto(value);
  const mostrado = formatearMonto(limpio);

  const handleChange = useCallback(
    (crudo: string) => {
      const input = inputRef.current;
      const cursor = input?.selectionStart ?? crudo.length;
      const tecla = ultimaTecla.current;
      ultimaTecla.current = null;

      let nuevo = limpiarMonto(crudo);
      let n = contarSignificativos(crudo, cursor);

      // Borró solo una coma: el número no cambió. Se borra el dígito que el
      // cliente quería borrar (el anterior con retroceso, el siguiente con Supr).
      if (nuevo === limpio && crudo.length < mostrado.length) {
        if (tecla === 'Backspace' && n > 0) {
          nuevo = quitarEn(nuevo, n - 1);
          n -= 1;
        } else if (tecla === 'Delete') {
          nuevo = quitarEn(nuevo, n);
        }
      }

      const formateado = formatearMonto(nuevo);
      if (input) {
        // Se escribe en el DOM antes de que React vuelva a pintar: cuando lo
        // haga, el valor ya coincide y no toca el cursor.
        const pos = posicionEnFormateado(formateado, Math.min(n, nuevo.length));
        input.value = formateado;
        if (document.activeElement === input) {
          input.setSelectionRange(pos, pos);
        }
      }
      onChange(nuevo);
    },
    [limpio, mostrado, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      ultimaTecla.current = e.key;
      // Las flechas suben/bajan según `step` como en el input numérico de antes,
      // sin salirse de min/max ni bajar de cero.
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const paso = step && step > 0 ? step : 1;
        let siguiente = (Number(limpio) || 0) + (e.key === 'ArrowUp' ? paso : -paso);
        siguiente = Math.max(min ?? 0, siguiente);
        if (max !== undefined && max !== null) siguiente = Math.min(max, siguiente);
        siguiente = Math.round(siguiente * 100) / 100;
        onChange(String(siguiente));
      }
    },
    [limpio, min, max, step, onChange]
  );

  const handleBlur = useCallback(() => {
    // «2500.» a medio escribir se guarda como «2500».
    if (limpio.endsWith('.')) onChange(limpio.slice(0, -1));
    onBlur?.();
  }, [limpio, onChange, onBlur]);

  return (
    <TextInput
      {...resto}
      type="text"
      inputMode="decimal"
      value={mostrado}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
    />
  );
};

export default CurrencyInput;
