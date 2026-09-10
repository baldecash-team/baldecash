'use client';

/**
 * Los números de la operación, arriba del contrato.
 *
 * Lo pide el §5 de la propuesta de aceptación electrónica: equipo, precio,
 * cuota inicial, número y monto de cuotas, tasas, seguro y total a pagar,
 * juntos y antes de aceptar. El contrato los tiene, pero repartidos entre el
 * cuerpo y la Hoja Resumen del Anexo 2, y a esa altura la persona ya está
 * leyendo un PDF de diecisiete hojas.
 *
 * El detalle —precio, cuotas, TEA, TCEA, seguro, entrega— va plegado. Son ocho
 * filas entre el contacto y el documento, y empujaban el PDF fuera de la
 * primera pantalla en móvil. Lo que queda siempre a la vista es el equipo y el
 * total: lo demás está a un toque, y sigue estando ANTES de la casilla, que es
 * lo que el §5 exige.
 *
 * La regla: no se inventa nada. Una fila cuyo dato la solicitud no tiene
 * directamente no se pinta. Mostrar «S/ 0.00» donde en realidad no hay dato es
 * peor que no mostrar la fila, porque se lee como una condición pactada.
 */
import { useState } from 'react';

import type { ResumenOperacion } from '@/app/prototipos/0.6/services/kycApi';

/** `3899.00` -> `S/ 3,899.00`. Se formatea, no se recalcula. */
function soles(valor?: string | null): string | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  if (!Number.isFinite(n)) return null;

  return `S/ ${n.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** `39.900` -> `39.90 %`. Las tasas vienen con la escala de la columna. */
function porcentaje(valor?: string | null): string | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  if (!Number.isFinite(n)) return null;

  return `${n.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

/** `2026-09-15` -> `15/09/2026`. Sin `Date`: un ISO de solo fecha lo interpreta
 *  en UTC y en Lima puede correrse un dia para atras. */
function fecha(valor?: string | null): string | null {
  if (!valor) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);

  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

function Fila({ etiqueta, valor, fuerte }: {
  etiqueta: string;
  valor: string | null;
  fuerte?: boolean;
}) {
  if (!valor) return null;

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-xs text-[#6b7280]">{etiqueta}</span>
      <span
        className={
          fuerte
            ? 'text-sm font-bold text-[#1f2937] text-right'
            : 'text-sm text-[#374151] text-right'
        }
      >
        {valor}
      </span>
    </div>
  );
}

export function ResumenOperacionCard({ resumen }: { resumen: ResumenOperacion | null }) {
  const [abierto, setAbierto] = useState(false);

  if (!resumen) return null;

  const cuotas =
    resumen.cuotas && resumen.monto_cuota
      ? `${resumen.cuotas} × ${soles(resumen.monto_cuota)}`
      : null;

  const filas = [
    { etiqueta: 'Precio del equipo', valor: soles(resumen.precio) },
    { etiqueta: 'Cuota inicial', valor: soles(resumen.cuota_inicial) },
    { etiqueta: 'Cuotas', valor: cuotas },
    { etiqueta: 'Frecuencia de pago', valor: resumen.frecuencia ?? null },
    { etiqueta: 'TEA', valor: porcentaje(resumen.tea) },
    { etiqueta: 'TCEA', valor: porcentaje(resumen.tcea) },
    { etiqueta: 'Seguro', valor: soles(resumen.seguro) },
    { etiqueta: 'Entrega estimada', valor: fecha(resumen.fecha_entrega) },
  ].filter((f) => f.valor);

  // Sin ninguna fila la tarjeta no aporta nada y ocupa lugar arriba del
  // documento, que es lo que la persona vino a leer.
  if (filas.length === 0 && !resumen.equipo && !resumen.total) return null;

  return (
    <div
      data-testid="resumen-operacion"
      className="rounded-xl border border-[#DDDFF7] bg-[#F9F9FE] p-4"
    >
      {resumen.equipo && (
        <div className="mb-2">
          <p className="text-sm font-semibold text-[#1f2937]">{resumen.equipo}</p>
          {resumen.sku && <p className="text-xs text-[#9ca3af]">{resumen.sku}</p>}
        </div>
      )}

      {filas.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="resumen-operacion-detalle"
            className="flex w-full items-center justify-between gap-2 py-1 text-xs font-semibold text-[#4654CD] cursor-pointer"
          >
            <span>{abierto ? 'Ocultar el detalle' : 'Ver el detalle'}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`h-4 w-4 flex-shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* `hidden` y no desmontar: el detalle es corto y así el navegador lo
              encuentra al buscar en la página aunque esté plegado. */}
          <div
            id="resumen-operacion-detalle"
            hidden={!abierto}
            className="divide-y divide-[#EDEDF7]"
          >
            {filas.map((f) => (
              <Fila key={f.etiqueta} etiqueta={f.etiqueta} valor={f.valor} />
            ))}
          </div>
        </>
      )}

      {soles(resumen.total) && (
        <div className="mt-2 border-t-2 border-[#DDDFF7] pt-2">
          <Fila etiqueta="Total a pagar" valor={soles(resumen.total)} fuerte />
        </div>
      )}
    </div>
  );
}
