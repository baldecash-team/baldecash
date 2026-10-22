'use client';

/**
 * Casilla simple de Diseño 2 (BAL-4960): "Autorizo a BaldeCash a verificar…".
 *
 * Copia `bcConsent` del prototipo de Brenda:
 * - obligatoria sin marcar: caja ámbar con la etiqueta "Obligatorio" (se nota
 *   sin ser un error);
 * - al intentar continuar sin marcarla (llega `error`): roja, se sacude una
 *   vez y dice el mensaje (el del validador: `required_message` o el genérico);
 * - marcada: verde suave con "¡Listo!".
 * Opcional: caja neutra, verde al marcarla, sin etiqueta.
 *
 * La sacudida respeta `prefers-reduced-motion`. El valor y el toggle son los
 * de `CheckboxField` ("true"/"false"): esto solo pinta.
 */

import React, { useState } from 'react';
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

const ESTILOS = `
  @keyframes casillaV2Sacudida {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(7px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(3px); }
  }
  .casilla-v2-sacudida { animation: casillaV2Sacudida 0.5s ease-in-out; }
  @media (prefers-reduced-motion: reduce) {
    .casilla-v2-sacudida { animation: none; }
  }
`;

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

  const caja = checked
    ? 'border-[#0E8C78] bg-[#E8F7F2]'
    : conError
      ? 'border-[#C2410C] bg-[#FFF1EB]'
      : required
        ? 'border-[#F2B632] bg-[#FFF6D8]'
        : 'border-[#C9CEF0] bg-white';

  const subtitulo = checked
    ? '¡Listo!'
    : conError
      ? error
      : required
        ? helpText || 'Necesario para continuar con tu solicitud.'
        : helpText;

  const colorSubtitulo = checked
    ? 'font-semibold text-[#0B6B5C]'
    : conError
      ? 'font-bold text-[#B23C0A]'
      : required
        ? 'text-[#6B4E00]'
        : 'text-[#5B6275]';

  return (
    <div id={id} data-casilla-v2={checked ? 'marcada' : conError ? 'error' : 'neutra'}>
      <style>{ESTILOS}</style>
      <label
        key={sacudidas}
        htmlFor={`${id}-casilla`}
        className={`flex items-center gap-3 rounded-[14px] border-2 px-3 py-[11px] sm:px-4 sm:py-3 transition-colors duration-150 ${caja} ${
          conError && sacudidas > 0 ? 'casilla-v2-sacudida' : ''
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <input
          id={`${id}-casilla`}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={disabled}
          aria-invalid={conError || undefined}
          aria-describedby={subtitulo ? `${id}-sub` : undefined}
          className="m-0 h-6 w-6 flex-shrink-0 cursor-pointer sm:h-[22px] sm:w-[22px]"
          style={{ accentColor: checked ? '#0E8C78' : '#4654CD' }}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[14px] font-bold leading-[1.35] text-[#1E2230] sm:text-[15px]">
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
              id={`${id}-sub`}
              role={conError ? 'alert' : undefined}
              className={`text-[12.5px] leading-[1.35] sm:text-[13px] ${colorSubtitulo}`}
            >
              {subtitulo}
            </span>
          )}
        </span>
        {required && !checked && (
          <span
            className={`flex-shrink-0 rounded-full px-[9px] py-1 text-[11.5px] font-bold tracking-[0.02em] ${
              conError ? 'bg-[#FFD9C7] text-[#8A2E08]' : 'bg-[#FFE7A0] text-[#6B4E00]'
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
