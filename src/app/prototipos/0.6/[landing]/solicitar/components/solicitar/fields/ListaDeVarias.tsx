'use client';

/**
 * ListaDeVarias — una lista donde el cliente puede marcar varias (BAL-4354).
 *
 * Las mismas cinco formas de la lista de una respuesta, en versión de varias:
 * - Casillas: ☑/☐ una debajo de otra.
 * - Tarjetas y Botones: como las de una respuesta, pero tocar otra NO
 *   desmarca la anterior y el marcador es un cuadradito.
 * - Desplegable: el cuadro muestra «Deportes, Tecnología» y al abrirse,
 *   casillas.
 * - Buscador: chips de lo elegido con «×» y un buscador que filtra.
 *
 * El valor es siempre `string[]` (así se guarda en `form_data`).
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, ChevronDown, Search, X } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import type { Forma } from './formaDeLista';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

export interface OpcionDeVarias {
  value: string;
  label: string;
  description?: string;
}

interface ListaDeVariasProps {
  id: string;
  label: string;
  forma: Forma;
  value: string[];
  onChange: (values: string[], labels: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options: OpcionDeVarias[];
  placeholder?: string;
  error?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

/** Texto fijo bajo la pregunta: avisa que no es de una sola respuesta. */
export const AYUDA_VARIAS = 'Puedes marcar varias';

/** Lo que haya guardado (un texto viejo, una lista o nada) como lista. */
export function comoLista(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.filter((v): v is string => typeof v === 'string' && v !== '');
  if (typeof valor === 'string' && valor !== '') return [valor];
  return [];
}

/** «Deportes, Tecnología»: los textos de las marcadas, en el orden de la lista. */
export function textosDeMarcadas(marcadas: string[], opciones: { value: string; label: string }[]): string {
  const orden = opciones.filter((o) => marcadas.includes(o.value)).map((o) => o.label);
  const sueltas = marcadas.filter((v) => !opciones.some((o) => o.value === v));
  return [...orden, ...sueltas].join(', ');
}

/** Cuadradito de marcado (☑/☐): con varias nunca se usa el circulito. */
const Cuadradito: React.FC<{ marcado: boolean; error?: boolean }> = ({ marcado, error }) => (
  <span
    aria-hidden="true"
    className={`
      w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0
      ${marcado
        ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
        : error
          ? 'border-red-300 bg-white'
          : 'border-neutral-300 bg-white'
      }
    `}
  >
    {marcado && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
  </span>
);

export const ListaDeVarias: React.FC<ListaDeVariasProps> = ({
  id,
  label,
  forma,
  value,
  onChange,
  onFocus,
  onBlur,
  options,
  placeholder = 'Selecciona una o más opciones',
  error,
  tooltip,
  disabled = false,
  required = true,
}) => {
  const uid = useId();
  const labelId = `${id}-label-${uid}`;
  const ayudaId = `${id}-ayuda-${uid}`;
  const marcadas = value;
  const hayError = !!error;

  const cambiar = (siguientes: string[]) => {
    // Se guarda en el orden de la lista, no en el del clic.
    const ordenadas = options.map((o) => o.value).filter((v) => siguientes.includes(v));
    const sueltas = siguientes.filter((v) => !ordenadas.includes(v));
    const final = [...ordenadas, ...sueltas];
    onChange(final, textosDeMarcadas(final, options));
  };

  const alternar = (valor: string) => {
    if (disabled) return;
    onFocus?.();
    cambiar(marcadas.includes(valor) ? marcadas.filter((v) => v !== valor) : [...marcadas, valor]);
    onBlur?.();
  };

  const encabezado = (
    <div className="space-y-0.5">
      <label id={labelId} className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>
      <p id={ayudaId} className="text-xs text-neutral-500">{AYUDA_VARIAS}</p>
    </div>
  );

  const pie = (
    <>
      {!hayError && marcadas.length > 0 && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {marcadas.length === 1 ? '1 marcada' : `${marcadas.length} marcadas`}
        </p>
      )}
      {hayError && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </>
  );

  const grupoProps = {
    role: 'group' as const,
    'aria-labelledby': labelId,
    'aria-describedby': ayudaId,
  };

  let cuerpo: React.ReactNode;
  if (forma === 'buttons') {
    cuerpo = (
      <div {...grupoProps} className={`flex flex-wrap gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {options.map((o) => {
          const marcado = marcadas.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={marcado}
              disabled={disabled}
              onClick={() => alternar(o.value)}
              className={`
                flex-1 min-w-[calc(50%-0.25rem)] sm:min-w-0 flex items-center justify-center gap-2
                px-3 py-2.5 min-h-[44px] rounded-xl border-2 text-sm font-medium cursor-pointer transition-colors
                ${marcado
                  ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.08)] text-[var(--color-primary)]'
                  : hayError
                    ? 'border-red-200 bg-white text-neutral-700'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-[rgba(var(--color-primary-rgb),0.5)]'
                }
              `}
            >
              <Cuadradito marcado={marcado} error={hayError} />
              <span className="break-words">{o.label}</span>
            </button>
          );
        })}
      </div>
    );
  } else if (forma === 'cards') {
    cuerpo = (
      <div {...grupoProps} className="space-y-2">
        {options.map((o) => {
          const marcado = marcadas.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={marcado}
              disabled={disabled}
              onClick={() => alternar(o.value)}
              className={`
                w-full p-4 rounded-xl text-left border-2 flex items-start gap-3 cursor-pointer transition-all duration-200
                ${marcado
                  ? 'bg-[rgba(var(--color-primary-rgb),0.05)] border-[var(--color-primary)]'
                  : hayError
                    ? 'bg-white border-red-200'
                    : 'bg-white border-neutral-200 hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="mt-0.5"><Cuadradito marcado={marcado} error={hayError} /></span>
              <span className="min-w-0">
                <span className={`block font-medium text-sm sm:text-base break-words ${marcado ? 'text-[var(--color-primary)]' : 'text-neutral-800'}`}>
                  {o.label}
                </span>
                {o.description && (
                  <span className={`block text-xs sm:text-sm mt-0.5 break-words ${marcado ? 'text-[rgba(var(--color-primary-rgb),0.7)]' : 'text-neutral-500'}`}>
                    {o.description}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  } else if (forma === 'dropdown') {
    cuerpo = (
      <Desplegable
        id={id}
        labelId={labelId}
        ayudaId={ayudaId}
        options={options}
        marcadas={marcadas}
        alternar={alternar}
        placeholder={placeholder}
        disabled={disabled}
        hayError={hayError}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  } else if (forma === 'search') {
    cuerpo = (
      <Buscador
        id={id}
        labelId={labelId}
        ayudaId={ayudaId}
        options={options}
        marcadas={marcadas}
        alternar={alternar}
        disabled={disabled}
        hayError={hayError}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  } else {
    // Casillas: una debajo de otra.
    cuerpo = (
      <div {...grupoProps} className="space-y-1">
        {options.map((o) => {
          const marcado = marcadas.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={marcado}
              disabled={disabled}
              onClick={() => alternar(o.value)}
              className={`flex items-start gap-3 w-full text-left py-2 min-h-[44px] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="mt-px"><Cuadradito marcado={marcado} error={hayError} /></span>
              <span className="min-w-0">
                <span className="block text-sm text-neutral-700 break-words">{o.label}</span>
                {o.description && <span className="block text-xs text-neutral-500 mt-0.5">{o.description}</span>}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div id={id} className="space-y-3" data-forma-varias={forma}>
      {encabezado}
      {cuerpo}
      {pie}
    </div>
  );
};

interface SubProps {
  id: string;
  labelId: string;
  ayudaId: string;
  options: OpcionDeVarias[];
  marcadas: string[];
  alternar: (valor: string) => void;
  disabled: boolean;
  hayError: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

function bordeDelCuadro(hayError: boolean, abierto: boolean, conValor: boolean): string {
  if (hayError) return 'border-[#ef4444] bg-[#ef4444]/5';
  if (abierto) return 'border-[var(--color-primary)] bg-white';
  if (conValor) return 'border-[#22c55e] bg-white';
  return 'border-neutral-300 hover:border-neutral-400 bg-white';
}

/** Desplegable con casillas: el cuadro muestra lo marcado separado por comas. */
const Desplegable: React.FC<SubProps & { placeholder: string }> = ({
  id, labelId, ayudaId, options, marcadas, alternar, placeholder, disabled, hayError, onFocus, onBlur,
}) => {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const panelId = `${id}-opciones`;
  const resumen = textosDeMarcadas(marcadas, options);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) {
        setAbierto(false);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto, onBlur]);

  return (
    <div
      ref={caja}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && abierto) {
          e.preventDefault();
          setAbierto(false);
          onBlur?.();
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={abierto}
        aria-controls={panelId}
        aria-labelledby={labelId}
        aria-describedby={ayudaId}
        disabled={disabled}
        onClick={() => {
          const abrir = !abierto;
          setAbierto(abrir);
          if (abrir) onFocus?.();
          else onBlur?.();
        }}
        className={`
          w-full h-11 px-3 flex items-center justify-between gap-2 rounded-lg border-2 transition-all text-left cursor-pointer
          ${bordeDelCuadro(hayError, abierto, marcadas.length > 0)}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className={`truncate ${resumen ? 'text-neutral-800' : 'text-neutral-400'}`}>{resumen || placeholder}</span>
        <ChevronDown className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div
          id={panelId}
          role="group"
          aria-labelledby={labelId}
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-[min(15rem,50vh)] overflow-y-auto p-1 overscroll-contain"
        >
          {options.map((o) => {
            const marcado = marcadas.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                role="checkbox"
                aria-checked={marcado}
                onClick={() => alternar(o.value)}
                className="w-full px-3 py-2 min-h-[44px] flex items-center gap-3 text-left text-sm rounded-md text-neutral-700 hover:bg-[rgba(var(--color-primary-rgb),0.08)] cursor-pointer"
              >
                <Cuadradito marcado={marcado} />
                <span className="break-words">{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Buscador con chips: lo elegido arriba con «×»; escribir filtra; tocar agrega. */
const Buscador: React.FC<SubProps> = ({
  id, labelId, ayudaId, options, marcadas, alternar, disabled, hayError, onFocus, onBlur,
}) => {
  const [texto, setTexto] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const listaId = `${id}-resultados`;

  const libres = useMemo(() => {
    const t = sinTildes(texto.trim());
    return options.filter((o) => !marcadas.includes(o.value) && (!t || sinTildes(o.label).includes(t)));
  }, [options, marcadas, texto]);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) {
        setAbierto(false);
        onBlur?.();
      }
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto, onBlur]);

  const agregar = (valor: string) => {
    alternar(valor);
    setTexto('');
    setActiva(0);
    entrada.current?.focus();
  };

  const elegidas = options.filter((o) => marcadas.includes(o.value));
  const sueltas = marcadas.filter((v) => !options.some((o) => o.value === v)).map((v) => ({ value: v, label: v }));

  return (
    <div ref={caja} className="relative space-y-2">
      {elegidas.length + sueltas.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Lo que marcaste">
          {[...elegidas, ...sueltas].map((o) => (
            <li
              key={o.value}
              className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)] text-sm font-medium"
            >
              {o.label}
              <button
                type="button"
                aria-label={`Quitar ${o.label}`}
                disabled={disabled}
                onClick={() => alternar(o.value)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(var(--color-primary-rgb),0.15)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        className={`
          h-11 px-3 flex items-center gap-2 rounded-lg border-2 transition-all
          ${bordeDelCuadro(hayError, abierto, marcadas.length > 0)}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <input
          ref={entrada}
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-labelledby={labelId}
          aria-describedby={ayudaId}
          aria-activedescendant={abierto && libres[activa] ? `${listaId}-${activa}` : undefined}
          disabled={disabled}
          placeholder="Escribe para buscar"
          value={texto}
          style={{ fontSize: '16px' }}
          className="flex-1 min-w-0 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
          onFocus={() => {
            setAbierto(true);
            onFocus?.();
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActiva(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setAbierto(true);
              setActiva((i) => Math.min(i + 1, Math.max(libres.length - 1, 0)));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiva((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              if (abierto && libres[activa]) {
                e.preventDefault();
                agregar(libres[activa].value);
              }
            } else if (e.key === 'Escape') {
              setAbierto(false);
            } else if (e.key === 'Backspace' && !texto && marcadas.length > 0) {
              alternar(marcadas[marcadas.length - 1]);
            }
          }}
        />
      </div>
      {abierto && (
        <ul
          id={listaId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={labelId}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-[min(15rem,50vh)] overflow-y-auto p-1 overscroll-contain"
        >
          {libres.length === 0 ? (
            <li className="py-6 text-center text-neutral-400 text-sm">
              {texto ? 'No se encontraron resultados' : 'Ya marcaste todas'}
            </li>
          ) : (
            libres.map((o, i) => (
              <li
                key={o.value}
                id={`${listaId}-${i}`}
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => agregar(o.value)}
                className={`px-3 py-2 min-h-[44px] flex items-center text-sm rounded-md cursor-pointer ${
                  i === activa ? 'bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)]' : 'text-neutral-700'
                }`}
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ListaDeVarias;
