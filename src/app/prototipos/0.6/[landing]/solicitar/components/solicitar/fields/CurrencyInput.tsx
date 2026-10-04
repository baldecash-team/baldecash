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
 *
 * Decimales (BAL-4400): con `decimales = 0` («sin decimales» en el panel) el
 * teclado es numérico, el punto o la coma tecleados no entran, y pegar un
 * monto con céntimos («2.500,50») no se redondea en silencio: el valor queda
 * como estaba y el campo avisa. Con 2 o sin definir, como siempre.
 */

import React, { useCallback, useRef, useState } from 'react';
import { TextInput, TextInputProps } from './TextInput';
import {
  limpiarMonto,
  formatearMonto,
  contarSignificativos,
  posicionEnFormateado,
  normalizarPegado,
  tieneCentimos,
  maxDecimalesDe,
  MAX_DECIMALES,
  DecimalesMonto,
} from './montoFormato';

type CurrencyInputProps = Omit<
  TextInputProps,
  'type' | 'inputMode' | 'inputRef' | 'onKeyDown' | 'onPaste' | 'maxLength' | 'showCounter'
> & {
  /** 0 = solo soles enteros, 2 = hasta 2 decimales, null/ausente = como hoy. */
  decimales?: DecimalesMonto;
};

/** Aviso al teclear el punto o la coma en un campo «sin decimales». */
export const AVISO_SIN_DECIMALES = 'Este monto va en soles enteros, sin céntimos.';

/** Aviso al pegar un monto con céntimos en un campo «sin decimales». */
export const avisoPegadoConCentimos = (pegado: string) =>
  `Pegaste «${pegado}», que tiene céntimos. Este monto va en soles enteros: escríbelo sin céntimos.`;

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
  error,
  decimales,
  ...resto
}) => {
  const sinDecimales = decimales === 0;
  const maxDecimales = maxDecimalesDe(decimales);
  // Aviso propio del campo (no es un error de validación): se va al salir.
  const [aviso, setAviso] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ultimaTecla = useRef<string | null>(null);
  // El último cambio convirtió un punto en separador de miles («1.234»): el
  // siguiente «.567» también lo es aunque el entero ya tenga 4 cifras.
  const venimosDeMiles = useRef(false);
  // Texto que el cliente acaba de pegar (para ubicarlo aunque reemplace a
  // otro monto seleccionado, donde comparar textos no basta).
  const pegado = useRef<string | null>(null);

  const limpio = limpiarMonto(value);
  const mostrado = formatearMonto(limpio);

  const handleChange = useCallback(
    (crudoDom: string) => {
      const input = inputRef.current;
      const tecla = ultimaTecla.current;
      ultimaTecla.current = null;
      const textoPegado = pegado.current;
      pegado.current = null;
      const cursorDom = input?.selectionStart ?? crudoDom.length;

      // Qué cambió respecto de lo que se veía: prefijo y sufijo comunes, y en
      // medio lo que el cliente tecleó o pegó.
      const antes = mostrado;
      let p = 0;
      while (p < antes.length && p < crudoDom.length && antes[p] === crudoDom[p]) p++;
      let sfx = 0;
      while (
        sfx < antes.length - p &&
        sfx < crudoDom.length - p &&
        antes[antes.length - 1 - sfx] === crudoDom[crudoDom.length - 1 - sfx]
      ) sfx++;
      if (
        textoPegado &&
        cursorDom >= textoPegado.length &&
        crudoDom.slice(cursorDom - textoPegado.length, cursorDom) === textoPegado
      ) {
        p = cursorDom - textoPegado.length;
        sfx = crudoDom.length - cursorDom;
      }
      const insertado = crudoDom.slice(p, crudoDom.length - sfx);
      const alFinal = sfx === 0 && p === antes.length;

      // Campo «sin decimales»: lo rechazado no toca el valor. El DOM ya tiene
      // lo tecleado/pegado, así que se devuelve a lo que se veía a mano
      // (React no vuelve a pintar si el valor no cambia).
      const rechazar = (mensaje: string) => {
        if (input) {
          input.value = antes;
          if (document.activeElement === input) input.setSelectionRange(p, p);
        }
        setAviso(mensaje);
      };

      let crudo = crudoDom;
      let cursor = cursorDom;
      let reemplazo = insertado;
      if (sinDecimales && (insertado === '.' || insertado === ',')) {
        rechazar(AVISO_SIN_DECIMALES);
        return;
      }
      if (sinDecimales && insertado.length > 1) {
        // Pegado: «2.500» (punto de miles) entra; «2.500,50» no se redondea.
        const comoMonto = limpiarMonto(normalizarPegado(insertado));
        if (tieneCentimos(comoMonto)) {
          rechazar(avisoPegadoConCentimos(insertado.trim()));
          return;
        }
        reemplazo = comoMonto.split('.')[0];
      } else if (insertado === ',') {
        // Teclado decimal en español (iOS/Android): la coma tecleada es el
        // separador decimal. Sin esto «2500,5» se guardaba «25005».
        reemplazo = '.';
      } else if (insertado.length > 1) {
        // Pegado: «2.500» o «2.500,50» son formato peruano (punto de miles).
        reemplazo = normalizarPegado(insertado);
      }
      if (reemplazo !== insertado) {
        crudo = crudoDom.slice(0, p) + reemplazo + crudoDom.slice(crudoDom.length - sfx);
        cursor = p + reemplazo.length;
      }

      let nuevo = limpiarMonto(crudo, maxDecimales);
      let n = contarSignificativos(crudo, cursor);

      // Tercer dígito tras el punto: el cliente escribía «2.500» con punto de
      // miles. En vez de perder el dígito en silencio («2.50»), el punto pasa
      // a ser de miles. Solo si el entero tiene 1-3 cifras («2.500»,
      // «250.000») o viene de otro punto de miles («1.234» -> «1.234.567»);
      // un «1500.50» seguido de otro dígito se queda como estaba.
      const [enteroAntes, decAntes] = limpio.split('.');
      if (
        alFinal &&
        /^\d$/.test(insertado) &&
        decAntes !== undefined &&
        decAntes.length === MAX_DECIMALES &&
        (enteroAntes.length <= 3 || venimosDeMiles.current)
      ) {
        nuevo = limpiarMonto(enteroAntes + decAntes + insertado);
        n = nuevo.length;
        venimosDeMiles.current = true;
      } else if (!alFinal || nuevo === '') {
        venimosDeMiles.current = false;
      }

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
    [limpio, mostrado, onChange, sinDecimales, maxDecimales]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      ultimaTecla.current = e.key;
      // Las flechas suben/bajan según `step` como en el input numérico de antes,
      // sin salirse de min/max ni bajar de cero.
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        venimosDeMiles.current = false;
        const paso = step && step > 0 ? step : 1;
        let siguiente = (Number(limpio) || 0) + (e.key === 'ArrowUp' ? paso : -paso);
        siguiente = Math.max(min ?? 0, siguiente);
        if (max !== undefined && max !== null) siguiente = Math.min(max, siguiente);
        siguiente = sinDecimales ? Math.round(siguiente) : Math.round(siguiente * 100) / 100;
        onChange(String(siguiente));
      }
    },
    [limpio, min, max, step, onChange, sinDecimales]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    pegado.current = e.clipboardData?.getData('text') || null;
  }, []);

  const handleBlur = useCallback(() => {
    // «2500.» a medio escribir se guarda como «2500».
    if (limpio.endsWith('.')) onChange(limpio.slice(0, -1));
    setAviso(null);
    onBlur?.();
  }, [limpio, onChange, onBlur]);

  return (
    <TextInput
      {...resto}
      error={error || aviso || undefined}
      type="text"
      inputMode={sinDecimales ? 'numeric' : 'decimal'}
      value={mostrado}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      inputRef={inputRef}
    />
  );
};

export default CurrencyInput;
