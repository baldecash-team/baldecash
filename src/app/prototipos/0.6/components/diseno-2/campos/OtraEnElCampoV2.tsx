'use client';

/**
 * «Otro» escrito en el mismo campo (BAL-5205, prototipo de Brenda): al elegir
 * la opción «Otr…» de una lista, en su lugar queda una caja de texto con
 * «Ver opciones» para volver. Lo escrito se guarda en el campo «¿Cuál…?» de
 * siempre (`other_*`): no hay datos nuevos.
 *
 * Viste igual que un `TextInput` de Diseño 2 (mismas clases del kit).
 */
import React, { useEffect, useRef, useState } from 'react';
import { CAJA_V2, ETIQUETA_V2, ErrorCampoV2, PLACEHOLDER_V2, PISTA_V2, bordeV2 } from './estilosV2';

interface Props {
  /** Código del campo pegado (`other_*`): id del input. */
  id: string;
  etiqueta: string;
  valor: string;
  placeholder?: string;
  /** Mensaje de error visible (el del campo pegado). */
  error?: string;
  pista?: string | null;
  /** `false` al volver a un paso que ya estaba en «Otro»: no abre el teclado solo. */
  enfocarAlMontar?: boolean;
  /**
   * La persona acaba de elegir «Otr…» y la caja apareció por eso (BAL-5207,
   * `form_field_other_open`). Se llama una vez al montar, solo con
   * `enfocarAlMontar`: al volver a un paso que ya estaba en «Otro» no.
   */
  onAbiertaPorLaPersona?: () => void;
  onCambiar: (v: string) => void;
  onVerOpciones: () => void;
  onEnfocar?: () => void;
  onSalir?: () => void;
}

export function OtraEnElCampoV2({
  id,
  etiqueta,
  valor,
  placeholder,
  error,
  pista,
  enfocarAlMontar = true,
  onAbiertaPorLaPersona,
  onCambiar,
  onVerOpciones,
  onEnfocar,
  onSalir,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [foco, setFoco] = useState(false);
  // StrictMode corre el efecto dos veces en desarrollo: el aviso sale una sola.
  const avisadaRef = useRef(false);
  useEffect(() => {
    if (enfocarAlMontar) ref.current?.focus();
    if (enfocarAlMontar && !avisadaRef.current) {
      avisadaRef.current = true;
      onAbiertaPorLaPersona?.();
    }
    // Solo al aparecer: la persona acaba de elegir «Otro».
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const idError = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5" data-otra-en-el-campo={id}>
      <label htmlFor={id} className={ETIQUETA_V2}>
        {etiqueta}
      </label>
      <div className={`relative flex items-center ${CAJA_V2} ${bordeV2({ error: !!error, foco, correcto: !error && !!valor.trim() && !foco })}`}>
        <input
          ref={ref}
          id={id}
          type="text"
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onCambiar(e.target.value)}
          onFocus={() => {
            setFoco(true);
            onEnfocar?.();
          }}
          onBlur={() => {
            setFoco(false);
            onSalir?.();
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? idError : undefined}
          className={`h-full min-w-0 flex-1 rounded-[10px] bg-transparent pl-3.5 pr-2 text-base text-[var(--d2-texto)] outline-none ${PLACEHOLDER_V2}`}
        />
        <button
          type="button"
          onClick={onVerOpciones}
          className="mr-2 h-8 flex-shrink-0 cursor-pointer rounded-lg bg-[var(--d2-gris-suave)] px-2.5 text-[13px] font-semibold text-[var(--color-primary-text)] transition-colors duration-150 hover:bg-[var(--d2-hover-gris)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          Ver opciones
        </button>
      </div>
      {error ? <ErrorCampoV2 id={idError}>{error}</ErrorCampoV2> : pista ? <p className={PISTA_V2} data-pista={id}>{pista}</p> : null}
    </div>
  );
}

export default OtraEnElCampoV2;
