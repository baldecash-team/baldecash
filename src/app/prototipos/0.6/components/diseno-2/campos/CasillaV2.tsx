'use client';

/**
 * Casilla simple de Diseño 2 (BAL-4960): "Autorizo a BaldeCash a verificar…".
 *
 * Diseño de Brenda (`bcConsent` del prototipo del 20-oct, casilla «Autorizo»
 * del Paso 3). Emilio el 30-oct-2026 (BAL-5383) la pasó a este diseño; antes
 * era neutra (blanca, borde gris) por una decisión de la revisión F2.
 * Obligatoria:
 * - sin marcar: ámbar (`--d2-aviso-*`), con un brillo que se expande dos
 *   veces al llegar, «Necesario para continuar con tu solicitud.» y, en
 *   escritorio, la etiqueta «Obligatorio»;
 * - al intentar continuar sin marcarla (llega `error`): naranja, se sacude
 *   cada vez y dice «Marca la casilla para continuar.» con `role="alert"` (o
 *   el `required_message` del campo, si lo trae);
 * - marcada: verde suave con «¡Listo! Ya puedes continuar.».
 * Opcional (`required=false`): el prototipo no tiene una caja para la
 * opcional, así que se queda neutra (blanca, borde gris) y verde al marcar.
 *
 * Brillo y sacudida respetan `prefers-reduced-motion` (keyframes en
 * `globals.css`, una sola vez para toda la página). El valor y el toggle son
 * los de `CheckboxField` ("true"/"false"): esto solo pinta.
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

/** Los mensajes genéricos del validador (`validateField`) para la casilla vacía. */
const MENSAJES_GENERICOS = new Set(['Debes marcar esta casilla para continuar', 'Este campo es requerido']);
const MENSAJE_ERROR_V2 = 'Marca la casilla para continuar.';

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

  // Ámbar solo si es obligatoria; la opcional se queda neutra (BAL-5383).
  const aviso = required && !checked && !conError;
  const caja = checked
    ? 'border-[var(--d2-ok)] bg-[var(--d2-ok-suave-3)]'
    : conError
      ? 'border-[var(--d2-error)] bg-[var(--d2-error-suave)]'
      : aviso
        ? 'border-[var(--d2-aviso-borde)] bg-[var(--d2-aviso-suave)] d2-brillo-consentimiento'
        : 'border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)]';
  // La caja chica de la izquierda (la casilla en sí), como en `LoQuieroModal`.
  const cuadro = checked
    ? 'bg-[var(--d2-ok-relleno)] border-[var(--d2-ok)]'
    : conError
      ? 'bg-[var(--d2-tarjeta)] border-[var(--d2-error)]'
      : 'bg-[var(--d2-tarjeta)] border-[var(--d2-borde-casilla)]';

  // El texto de error: el `required_message` del campo si lo trae; si llega el
  // genérico del validador, el de Brenda.
  const textoError = error && MENSAJES_GENERICOS.has(error) ? MENSAJE_ERROR_V2 : error;
  const subtitulo = checked
    ? required ? '¡Listo! Ya puedes continuar.' : '¡Listo!'
    : conError
      ? textoError
      : required
        ? 'Necesario para continuar con tu solicitud.'
        : undefined;

  const colorSubtitulo = checked
    ? 'font-semibold text-[var(--d2-ok-texto)]'
    : conError
      ? 'font-bold text-[var(--d2-error-texto)]'
      : 'text-[var(--d2-aviso-texto)]';

  return (
    <div id={id} data-casilla-v2={checked ? 'marcada' : conError ? 'error' : aviso ? 'aviso' : 'neutra'}>
      <label
        key={sacudidas}
        htmlFor={`${id}-casilla`}
        className={`flex items-center gap-3 rounded-[14px] border-2 px-3 py-[11px] md:px-4 md:py-3 transition-colors duration-150 focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-2 ${caja} ${
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
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2 md:h-[22px] md:w-[22px] ${cuadro}`}
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
          <span className="text-[14px] font-bold leading-[1.35] text-[var(--d2-texto)] md:text-[15px]">
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
              className={`text-[12.5px] leading-[1.35] md:text-[13px] ${colorSubtitulo}`}
            >
              {subtitulo}
            </span>
          )}
          {/* La pista del banco de campos va debajo, como la nota gris de la casilla del prototipo. */}
          {helpText && <span className="text-[12px] text-[var(--d2-texto-suave)]">{helpText}</span>}
        </span>
        {/*
          Etiqueta «Obligatorio» (`tagStyle` del prototipo): solo en escritorio
          y mientras no esté marcada. Es decorativa: el input ya lleva
          `aria-required`.
        */}
        {required && !checked && (
          <span
            aria-hidden="true"
            data-etiqueta-obligatorio
            className={`hidden flex-shrink-0 rounded-full px-[9px] py-1 text-[11.5px] font-bold tracking-[0.02em] md:inline-flex ${
              conError
                ? 'bg-[var(--d2-error-etiqueta)] text-[var(--d2-error-etiqueta-texto)]'
                : 'bg-[var(--d2-aviso-etiqueta)] text-[var(--d2-aviso-texto)]'
            }`}
          >
            Obligatorio
          </span>
        )}
      </label>
    </div>
  );
}

export default CasillaV2;
