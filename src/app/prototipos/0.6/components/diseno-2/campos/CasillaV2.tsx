'use client';

/**
 * Casilla simple de Diseño 2 (BAL-4960): "Autorizo a BaldeCash a verificar…".
 *
 * Decisión de Emilio (revisión F2): neutra al inicio, sea obligatoria u
 * opcional — fondo blanco, borde gris `#C9CEF0`, sin ámbar y sin una etiqueta
 * "Obligatorio" resaltada. Es la misma regla que la casilla de términos de
 * `LoQuieroModal` (`border-[var(--d2-borde-gris-2)] bg-[var(--d2-tarjeta)]` cuando no hay error):
 * - neutra: fondo blanco, borde gris;
 * - al intentar continuar sin marcarla (llega `error`): roja, se sacude una
 *   vez y dice el mensaje (el del validador: `required_message` o el genérico);
 * - marcada: verde suave con "¡Listo!".
 *
 * La sacudida respeta `prefers-reduced-motion` (keyframes en `globals.css`,
 * una sola vez para toda la página). El valor y el toggle son los de
 * `CheckboxField` ("true"/"false"): esto solo pinta.
 */

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { FieldTooltip } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/fields/FieldTooltip';

interface CasillaV2Props {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
  error?: string;
  helpText?: string;
  tooltip?: { title: string; description: string; recommendation?: string };
  disabled?: boolean;
  required?: boolean;
}

export function CasillaV2({ id, label, checked, onToggle, error, helpText, tooltip, disabled = false, required = true }: CasillaV2Props) {
  const conError = !!error && !checked;

  // Cada vez que aparece el error se vuelve a sacudir (la clase sale y entra
  // con otra `key` para reiniciar la animación).
  // (Ajuste de estado durante el render, el patrón de React para "cuando
  // cambia una prop": sin efecto ni render de más.)
  const [sacudidas, setSacudidas] = useState(conError ? 1 : 0);
  const [errorAntes, setErrorAntes] = useState(conError);
  if (conError !== errorAntes) {
    setErrorAntes(conError);
    if (conError) setSacudidas((n) => n + 1);
  }

  // Neutra al inicio (obligatoria u opcional, es la misma caja): decisión de
  // Emilio en la revisión F2. Sin ámbar, sin distinguir `required` acá.
  const caja = checked
    ? 'border-[var(--d2-ok)] bg-[var(--d2-ok-suave-3)]'
    : conError
      ? 'border-[var(--d2-error)] bg-[var(--d2-error-suave)]'
      : 'border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)]';
  // La caja chica de la izquierda (la casilla en sí), como en `LoQuieroModal`.
  const cuadro = checked
    ? 'bg-[var(--d2-ok-relleno)] border-[var(--d2-ok)]'
    : conError
      ? 'bg-[var(--d2-tarjeta)] border-[var(--d2-error)]'
      : 'bg-[var(--d2-tarjeta)] border-[var(--d2-borde-casilla)]';

  // Sin badge "Obligatorio": la caja no adelanta nada hasta que haya un error
  // o se marque. `helpText` sigue siendo libre (lo trae el banco de campos).
  const subtitulo = checked ? '¡Listo!' : conError ? error : helpText;

  const colorSubtitulo = checked
    ? 'font-semibold text-[var(--d2-ok-texto)]'
    : conError
      ? 'font-bold text-[var(--d2-error-texto)]'
      : 'text-[var(--d2-texto-suave)]';

  return (
    <div id={id} data-casilla-v2={checked ? 'marcada' : conError ? 'error' : 'neutra'}>
      <label
        key={sacudidas}
        htmlFor={`${id}-casilla`}
        className={`flex items-center gap-3 rounded-[14px] border-2 px-3 py-[11px] sm:px-4 sm:py-3 transition-colors duration-150 focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-2 ${caja} ${
          conError && sacudidas > 0 ? 'casilla-v2-sacudida' : ''
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        {/*
          El input nativo queda solo para la semántica (teclado, lector de
          pantalla, `label`): pintado con `accentColor`, Chromium lo dejaba con
          el borde casi negro sin marcar. La caja que se ve es el `span` de al
          lado, con los mismos tokens que las casillas de `LoQuieroModal`.
        */}
        <input
          id={`${id}-casilla`}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={disabled}
          aria-invalid={conError || undefined}
          aria-required={required || undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          data-caja-casilla
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2 sm:h-[22px] sm:w-[22px] ${cuadro}`}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white d2-check-in" strokeWidth={3} />}
        </span>
        {/*
          El label y el subtítulo NO van en `aria-describedby`: el <label>
          envuelve el input, así que su texto completo ya es el nombre
          accesible del checkbox. Repetirlo en `aria-describedby` lo anuncia
          dos veces. El error sigue llegando por `role="alert"`, que se
          anuncia solo con aparecer, sin depender de `aria-describedby`.
        */}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[14px] font-bold leading-[1.35] text-[var(--d2-texto)] sm:text-[15px]">
            {label}
            {tooltip && (
              // En línea con el texto: con etiquetas largas el globo queda al
              // final de la frase y no flotando en una columna aparte.
              <span className="ml-1.5 inline-flex align-[-3px]" onClick={(e) => e.preventDefault()}>
                <FieldTooltip tooltip={tooltip} />
              </span>
            )}
          </span>
          {subtitulo && (
            <span
              role={conError ? 'alert' : undefined}
              className={`text-[12.5px] leading-[1.35] sm:text-[13px] ${colorSubtitulo}`}
            >
              {subtitulo}
            </span>
          )}
        </span>
      </label>
    </div>
  );
}

export default CasillaV2;
