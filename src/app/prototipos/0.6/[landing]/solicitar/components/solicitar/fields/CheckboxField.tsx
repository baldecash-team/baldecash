'use client';

/**
 * CheckboxField - Casilla de verificación
 * Soporta dos modos:
 * 1. Simple (sin opciones): Un solo checkbox para sí/no
 * 2. Múltiple (con opciones): Varias casillas donde se pueden seleccionar múltiples
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import { useCamposV2, ETIQUETA_V2, MarcaOpcionalV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import { CasillaV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/CasillaV2';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: CheckboxOption[];
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  /**
   * Alinea la casilla con la PRIMERA LÍNEA en vez de con el centro.
   *
   * Con etiquetas de una línea da igual, y por eso el default no cambia. Con
   * un texto largo —una declaración contractual, por ejemplo— centrar deja la
   * casilla flotando a mitad del párrafo, lejos de donde uno la busca.
   */
  alignTop?: boolean;
  /**
   * Reserva abajo EXACTAMENTE los mismos 36px que deja un TextInput bajo su
   * caja (10px de relleno vertical de su `h-11` + 6px de `space-y-1.5` + 20px
   * de su línea de contador/error), para que el salto al siguiente campo del
   * grid del wizard mida lo mismo en los dos casos: 40px con el gap del grid
   * (medido en prod: 4px checkbox→siguiente vs ~40px input→siguiente).
   *
   * Por eso el bloque de abajo usa `min-h-[30px]` y no 20px: el checkbox no
   * tiene el relleno vertical del `h-11` de TextInput (su botón abraza el
   * contenido), así que esos 10px que le faltan se agregan a la línea
   * reservada en vez de inventarle un padding al botón que movería la caja.
   *
   * Solo aplica en modo simple: en modo múltiple cada opción ya es una caja
   * con su propio padding y no necesita esta línea. Los usos de CheckboxField
   * fuera del grid del wizard (p. ej. ContratoStep, donde varias casillas se
   * apilan apretadas dentro de un mismo recuadro) no deben ganar espacio, así
   * que el default es `false`.
   */
  reserveBottomSpace?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  alignTop = false,
  reserveBottomSpace = false,
}) => {
  const v2 = useCamposV2();
  // Determinar si es modo simple (sin opciones) o múltiple (con opciones)
  const isSimpleMode = !options || options.length === 0;
  const useReservedBottomSlot = isSimpleMode && reserveBottomSpace;

  // Para modo simple, value es "true" o "false" como string
  const isCheckedSimple = value === 'true';

  // Para modo múltiple, value es un array de valores seleccionados
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const showSuccess = success && !error && (isSimpleMode ? isCheckedSimple : selectedValues.length > 0);

  // Handler para modo simple
  const handleSimpleChange = () => {
    if (disabled) return;
    onFocus?.();
    onChange(isCheckedSimple ? 'false' : 'true');
    onBlur?.();
  };

  // Handler para modo múltiple
  const handleMultipleChange = (optionValue: string) => {
    if (disabled) return;
    onFocus?.();
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newValues);
    onBlur?.();
  };

  // Renderizar checkbox individual
  const renderCheckbox = (
    checked: boolean,
    onToggle: () => void,
    checkboxLabel?: string,
    isDisabled?: boolean
  ) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled || disabled}
      className={`
        flex gap-3 w-full text-left py-2 min-h-[44px]
        ${alignTop ? 'items-start' : 'items-center'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className={`
          w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0
          ${alignTop ? 'mt-0.5' : ''}
          ${checked
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : error
              ? 'border-red-300 bg-white'
              : 'border-neutral-300 bg-white hover:border-neutral-400'
          }
        `}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      {checkboxLabel && (
        <span className={`text-sm text-neutral-700${alignTop ? ' leading-relaxed' : ''}`}>
          {checkboxLabel}
        </span>
      )}
    </button>
  );

  // Diseño 2 (BAL-4960): la casilla simple es una caja propia (neutra, roja
  // con sacudida al intentar seguir sin marcarla, verde con «¡Listo!»).
  if (v2 && isSimpleMode) {
    return (
      <CasillaV2
        id={id}
        label={label}
        checked={isCheckedSimple}
        onToggle={handleSimpleChange}
        error={error}
        helpText={helpText}
        tooltip={tooltip}
        disabled={disabled}
        required={required}
      />
    );
  }

  return (
    <div id={id} className={useReservedBottomSlot ? 'space-y-1.5' : 'space-y-3'}>
      {/* Label (solo para modo múltiple o como título) */}
      {!isSimpleMode && v2 && (
        <label className={ETIQUETA_V2}>
          {label}
          {!required && <MarcaOpcionalV2 />}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
      )}
      {!isSimpleMode && !v2 && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          {label}
          {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
      )}

      {/* Modo simple: un solo checkbox con el label inline */}
      {isSimpleMode && (
        <button
          type="button"
          onClick={handleSimpleChange}
          disabled={disabled}
          className={`
            flex items-start gap-3 w-full text-left
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/*
            Sin margen extra: w-5 h-5 (20px) es la misma altura que el
            line-height de text-sm (20px), así que `items-start` en el
            botón ya alinea el borde superior de la caja con el de la
            primera línea del label pixel a pixel. Un `mt-0.5` que había
            aquí antes desplazaba la caja 2px hacia abajo respecto al
            texto, rompiendo esa alineación (visible sobre todo con
            labels de una sola línea, como en ContratoStep).
          */}
          <div
            className={`
              w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0
              ${isCheckedSimple
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                : error
                  ? 'border-red-300 bg-white'
                  : 'border-neutral-300 bg-white hover:border-neutral-400'
              }
            `}
          >
            {isCheckedSimple && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
          {/*
            `alignTop` es para etiquetas largas —una declaración contractual—:
            ahí el texto se lee como párrafo (interlineado suelto, alineado
            arriba) y no como el nombre de un campo.
          */}
          <span
            className={`flex gap-1.5 text-sm font-medium text-neutral-700 ${
              alignTop ? 'items-start leading-relaxed' : 'items-center'
            }`}
          >
            {label}
            {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
            {tooltip && <span onClick={(e) => e.stopPropagation()}><FieldTooltip tooltip={tooltip} /></span>}
          </span>
        </button>
      )}

      {/* Modo múltiple: lista de checkboxes */}
      {!isSimpleMode && options && (
        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.value}
              className={`
                p-3 rounded-xl border transition-all
                ${selectedValues.includes(option.value)
                  ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                  : error
                    ? 'border-red-200 bg-white'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }
              `}
            >
              {renderCheckbox(
                selectedValues.includes(option.value),
                () => handleMultipleChange(option.value),
                option.label,
                option.disabled
              )}
            </div>
          ))}
        </div>
      )}

      {/*
        Línea reservada (patrón TextInput): min-h-[30px], no 20px, para que
        sumada a los 6px de space-y-1.5 de arriba dé 36px en total —lo mismo
        que TextInput reserva bajo su caja—. Vacía cuando no hay nada que
        mostrar para que el espacio de abajo sea constante en vez de aparecer
        solo con error. Reemplaza los tres bloques sueltos de más abajo —no
        se duplican— y nunca se usa en modo múltiple.
      */}
      {useReservedBottomSlot && (
        <div className="min-h-[30px] flex items-center">
          {error ? (
            <p className="text-sm text-[#ef4444] flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          ) : showSuccess ? (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Confirmado
            </p>
          ) : helpText ? (
            <p className="text-xs text-neutral-500">{helpText}</p>
          ) : null}
        </div>
      )}

      {!useReservedBottomSlot && (
        <>
          {/* Help text */}
          {helpText && !error && (
            <p className="text-xs text-neutral-500">{helpText}</p>
          )}

          {/* Success message */}
          {showSuccess && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {isSimpleMode ? 'Confirmado' : `${selectedValues.length} seleccionado${selectedValues.length > 1 ? 's' : ''}`}
            </p>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm text-[#ef4444] flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CheckboxField;
