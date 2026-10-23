'use client';

/**
 * SelectInput - Estilo 0.3 con búsqueda
 * Dropdown con bordes redondeados y búsqueda
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Check, AlertCircle, ChevronDown, X } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import {
  useCamposV2,
  ETIQUETA_V2,
  CAJA_V2,
  bordeV2,
  MarcaOpcionalV2,
  ErrorCampoV2,
} from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import {
  coincide,
  eleccionAutomatica,
  minimoDeLetras,
  MAX_SUGERENCIAS_V2,
} from '@/app/prototipos/0.6/components/diseno-2/campos/busquedaV2';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, selectedLabel?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  /**
   * Callback for remote search (lazy loading). If provided, disables local filtering.
   * Devuelve `false` si no va a buscar (no hay resultados que esperar).
   */
  onSearch?: (searchTerm: string) => boolean | void;
  /** Whether remote search is in progress */
  isSearching?: boolean;
  /** Minimum characters required before searching (for lazy loading) */
  minSearchLength?: number;
  /** Message to show when user hasn't typed enough characters */
  searchPrompt?: string;
  /** Saved label from localStorage (for lazy-loaded fields after refresh) */
  savedLabel?: string;
  /** Smaller height variant for tight layouts (h-9 instead of h-11) */
  small?: boolean;
  /** Suppress error text below the field (border stays red) */
  hideErrorText?: boolean;
  /** Compact: no reserva alto para el error (solo aparece al haber error) — evita gaps desiguales */
  compact?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  placeholder = 'Selecciona una opción',
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  searchable = true,
  onSearch,
  isSearching = false,
  minSearchLength = 0,
  searchPrompt,
  savedLabel,
  small = false,
  hideErrorText = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Diseño 2 (BAL-4960): mismo desplegable, otro vestido.
  const v2 = useCamposV2();

  const showError = !!error;
  const showSuccess = success && !error && value;

  // Determine if we're using remote search
  const isRemoteSearch = !!onSearch;

  // For remote search, use options directly (they come from API)
  // For local search, filter the options
  const filteredOptions = useMemo(() => {
    if (isRemoteSearch) {
      // Remote search: options are already filtered by API
      return options;
    }
    // Local search: filter options by search term
    if (!searchTerm) return options;
    // Diseño 2 (BAL-4964): sin tildes ni mayúsculas ("pacifico" encuentra
    // "Pacífico"). Diseño 1, como siempre.
    if (v2) return options.filter((option) => coincide(option.label, searchTerm));
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, isRemoteSearch, v2]);

  // Diseño 2: como máximo 5 sugerencias mientras se busca.
  const visibleOptions = v2 && (isRemoteSearch || searchTerm)
    ? filteredOptions.slice(0, MAX_SUGERENCIAS_V2)
    : filteredOptions;

  // Check if user needs to type more characters for remote search
  const needsMoreChars = isRemoteSearch && minSearchLength > 0 && searchTerm.length < minSearchLength;

  // ── Diseño 2: al salir del buscador, una sola coincidencia se elige sola ──
  // El dedo (o el mouse) dentro del desplegable no cuenta como salir: en
  // Safari un botón no toma el foco al tocarlo y el blur llega sin destino.
  const contenedorRef = useRef<HTMLDivElement>(null);
  const punteroDentroRef = useRef(false);
  // Búsqueda remota: los resultados del término actual todavía no llegan
  // (debounce de 300 ms + la red). Si la persona sale en ese rato, se decide
  // cuando lleguen.
  const esperandoResultadosRef = useRef(false);
  const vioBuscandoRef = useRef(false);
  const elegirAlLlegarRef = useRef<string | null>(null);

  // Una búsqueda nueva (o abrir otra vez) deja sin efecto la decisión
  // pendiente de antes: no se elige con un término viejo.
  const olvidarPendiente = () => {
    elegirAlLlegarRef.current = null;
    esperandoResultadosRef.current = false;
    vioBuscandoRef.current = false;
  };

  const elegirSolaSiHayUna = (termino: string, candidatas: SelectOption[]) => {
    const unica = eleccionAutomatica(candidatas, termino, minimoDeLetras(minSearchLength));
    if (unica && unica.value !== value) onChange(unica.value, unica.label);
  };

  const salirDelBuscador = () => {
    const termino = searchTerm;
    setIsOpen(false);
    setSearchTerm('');
    onBlur?.();
    if (!v2 || !termino) return;
    if (isRemoteSearch && (esperandoResultadosRef.current || isSearching)) {
      elegirAlLlegarRef.current = termino;
      return;
    }
    elegirSolaSiHayUna(termino, filteredOptions);
  };

  useEffect(() => {
    if (!v2 || !isRemoteSearch) return;
    if (isSearching) {
      vioBuscandoRef.current = true;
      return;
    }
    if (!vioBuscandoRef.current || !esperandoResultadosRef.current) return;
    esperandoResultadosRef.current = false;
    vioBuscandoRef.current = false;
    const pendiente = elegirAlLlegarRef.current;
    elegirAlLlegarRef.current = null;
    if (pendiente) elegirSolaSiHayUna(pendiente, options);
    // Solo cuando termina una búsqueda; `options` llega en el mismo render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, v2, isRemoteSearch]);

  const selectedOption = options.find((opt) => opt.value === value);
  // Use savedLabel as fallback when options aren't loaded (lazy search after refresh)
  const displayLabel = selectedOption?.label || savedLabel;

  const handleSelect = (optionValue: string) => {
    // Find the selected option to get its label
    const selected = options.find((opt) => opt.value === optionValue);
    onChange(optionValue, selected?.label);
    setIsOpen(false);
    setSearchTerm('');
    onBlur?.();
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444] bg-[#ef4444]/5';
    if (showSuccess) return 'border-[#22c55e] bg-white';
    if (isOpen) return 'border-[var(--color-primary)] bg-white';
    return 'border-neutral-300 hover:border-neutral-400 bg-white';
  };

  return (
    <div
      id={id}
      className={v2 ? 'flex flex-col gap-1.5' : small ? 'space-y-1' : 'space-y-1.5'}
      {...(v2
        ? {
            ref: contenedorRef,
            onPointerDownCapture: () => {
              punteroDentroRef.current = true;
              window.setTimeout(() => {
                punteroDentroRef.current = false;
              }, 400);
            },
            // Diseño 2: el foco sale del campo entero (Tab desde el buscador
            // o desde una opción) con la lista abierta: se cierra y, con una
            // sola coincidencia, la elige.
            onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
              if (!isOpen || punteroDentroRef.current) return;
              const destino = e.relatedTarget as Node | null;
              if (destino && contenedorRef.current?.contains(destino)) return;
              salirDelBuscador();
            },
          }
        : {})}
    >
      {/* Label */}
      {v2 ? (
        <label htmlFor={`${id}-trigger`} className={ETIQUETA_V2}>
          {label}
          {!required && <MarcaOpcionalV2 />}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
      ) : (
        <label className={`flex items-center gap-1.5 font-medium text-neutral-700 ${small ? 'text-xs' : 'text-sm'}`}>
          {label}
          {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
      )}

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Select trigger */}
      <div className="relative">
        <div
          id={v2 ? `${id}-trigger` : undefined}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-describedby={v2 && showError && error ? `${id}-error` : undefined}
          onClick={() => {
            if (disabled) return;
            const willOpen = !isOpen;
            if (willOpen && v2) olvidarPendiente();
            setIsOpen(willOpen);
            if (willOpen) onFocus?.();
            else onBlur?.();
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isOpen && v2) olvidarPendiente();
              setIsOpen(!isOpen);
            } else if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              setIsOpen(false);
              onBlur?.();
            }
          }}
          className={v2 ? `
            w-full px-3.5 flex items-center justify-between gap-2 cursor-pointer text-left text-base
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2
            ${CAJA_V2} ${bordeV2({ error: showError, foco: isOpen, correcto: !!showSuccess })}
            ${disabled ? 'bg-[#F7F8FA] opacity-70 cursor-not-allowed' : ''}
          ` : `
            w-full px-3 flex items-center justify-between gap-2
            rounded-lg border-2 transition-all cursor-pointer text-left
            ${small ? 'h-9' : 'h-11'}
            ${getBorderColor()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className={v2 ? `truncate ${displayLabel ? 'text-[#1E2230]' : 'text-[#8A90A2]'}` : `truncate ${displayLabel ? 'text-neutral-800' : 'text-neutral-400'}`}>
            {displayLabel || placeholder}
          </span>

          <div className="flex items-center gap-1">
            {value && !disabled && options.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="w-5 h-5 rounded-full hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3 text-neutral-500" />
              </button>
            )}
            {showSuccess && <Check className={v2 ? 'w-5 h-5 text-[#0E8C78]' : 'w-5 h-5 text-[#22c55e]'} />}
            {showError && !v2 && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
            <ChevronDown className={`w-5 h-5 ${v2 ? 'text-[var(--color-primary)]' : 'text-neutral-400'} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-neutral-100">
                <div className="flex items-center gap-2 h-9 px-3 bg-neutral-50 rounded-md">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={minSearchLength > 0 ? `Escribe al menos ${minSearchLength} letras...` : 'Buscar...'}
                    value={searchTerm}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSearchTerm(newValue);
                      if (v2) olvidarPendiente();
                      // For remote search, call onSearch when user types enough characters
                      if (onSearch && newValue.length >= minSearchLength) {
                        const buscara = onSearch(newValue) !== false;
                        // Diseño 2: hay resultados que esperar solo si de verdad
                        // se lanzó una búsqueda.
                        if (v2) esperandoResultadosRef.current = buscara;
                      }
                    }}
                    style={{ fontSize: '16px' }}
                    className="flex-1 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
                  />
                  {isSearching && (
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  )}
                </div>
              </div>
            )}

            {/* Options list — extra pb on mobile so the last options stay
                visible above the iOS virtual keyboard when it is open. */}
            <div className="max-h-[min(15rem,50vh)] overflow-y-auto p-1 pb-16 sm:pb-1 overscroll-contain">
              {needsMoreChars ? (
                <div className="py-8 text-center text-neutral-400 text-sm">
                  {searchPrompt || `Escribe al menos ${minSearchLength} caracteres para buscar`}
                </div>
              ) : isSearching ? (
                <div className="py-8 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  Buscando...
                </div>
              ) : visibleOptions.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-sm">
                  No se encontraron resultados
                </div>
              ) : (
                visibleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-3 py-2 text-left text-sm rounded-md
                      transition-colors cursor-pointer
                      ${value === option.value
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-neutral-700 hover:bg-[rgba(var(--color-primary-rgb),0.1)] hover:text-[var(--color-primary)]'
                      }
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {option.label}
                    {option.description && (
                      <span className="block text-xs opacity-70 mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close - z-30 keeps it below navbar (z-50) and product bar (z-40),
          so those elements remain interactive even when the dropdown is open. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            if (v2) {
              salirDelBuscador();
              return;
            }
            setIsOpen(false);
            onBlur?.();
          }}
          aria-hidden="true"
        />
      )}

      {/* Diseño 2: el error solo cuando hay; sin alto reservado. */}
      {v2 && !hideErrorText && error && <ErrorCampoV2 id={`${id}-error`}>{error}</ErrorCampoV2>}

      {/* Error message - reserva alto para alinear en grids, salvo en modo compact */}
      {!v2 && !hideErrorText && (!compact || error) && (
        <div className={compact ? '' : 'min-h-[20px]'}>
          {error && (
            <p className="text-sm text-[#ef4444] flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
