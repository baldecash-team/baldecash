'use client';

/**
 * Confirmá tus datos antes del contrato (§5, pantalla 1).
 *
 * Los cuatro campos van bloqueados. Nombre y DNI porque corresponden a la
 * identidad ya validada, y el §2 es explícito en que querer cambiarlos deriva
 * al proceso reforzado, no se resuelve acá. Celular y correo porque el wizard
 * los acaba de pedir, dos pantallas antes: ofrecer editarlos de nuevo justo
 * acá agregaba un formulario a la pantalla más cargada del recorrido para
 * corregir algo que se escribió hace treinta segundos.
 *
 * El bloqueo no es cosmético: el endpoint tampoco tiene forma de tocar la
 * identidad. Pintarlos es para que la persona vea con qué datos firma.
 *
 * Va plegado por la misma razón que el resumen de la operación: entre el
 * contacto y el documento había dieciséis renglones que empujaban el PDF fuera
 * de la primera pantalla en móvil. Sigue estando ANTES de la casilla.
 */
import React, { useEffect, useState } from 'react';

import {
  getContacto,
  type ContactoKyc,
} from '@/app/prototipos/0.6/services/kycApi';

export interface ConfirmarDatosCardProps {
  applicationCode?: string;
  documentNumber?: string;
  resumeToken?: string;
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
  if (!valor) return null;

  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-xs text-[#6b7280]">{etiqueta}</span>
      <span className="text-sm font-medium text-[#1f2937] text-right">{valor}</span>
    </div>
  );
}

export function ConfirmarDatosCard({
  applicationCode,
  documentNumber,
  resumeToken,
}: ConfirmarDatosCardProps) {
  const [datos, setDatos] = useState<ContactoKyc | null>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!applicationCode) return;
    let vivo = true;
    getContacto({ applicationCode, documentNumber, resumeToken }).then((d) => {
      if (!vivo || !d) return;
      setDatos(d);
    });

    return () => { vivo = false; };
  }, [applicationCode, documentNumber, resumeToken]);

  if (!datos) return null;

  return (
    <div
      data-testid="confirmar-datos"
      className="rounded-xl border border-[#e5e7eb] bg-white p-4"
    >
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="confirmar-datos-detalle"
        className="flex w-full items-center justify-between gap-2 cursor-pointer"
      >
        <span className="text-sm font-semibold text-[#1f2937]">
          Confirma tus datos para continuar
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-4 w-4 flex-shrink-0 text-[#4654CD] transition-transform ${abierto ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* `hidden` y no desmontar: son cuatro renglones y así el navegador los
          encuentra al buscar en la página aunque estén plegados. */}
      <div
        id="confirmar-datos-detalle"
        hidden={!abierto}
        className="mt-2 divide-y divide-[#F1F1F6]"
      >
        <Campo etiqueta="Nombre completo" valor={datos.nombre} />
        <Campo etiqueta="DNI" valor={datos.documento} />
        <Campo etiqueta="Celular" valor={datos.telefono} />
        <Campo etiqueta="Correo" valor={datos.email} />
      </div>
    </div>
  );
}

export default ConfirmarDatosCard;
