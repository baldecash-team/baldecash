'use client';

/**
 * Las filas del cronograma de una solicitud, tal como las manda el backend.
 *
 * A diferencia del cronograma del catálogo —que se calcula en el navegador
 * sobre el pricing— acá las filas vienen de `/public/kyc/cronograma`, que las
 * arma con `construir_cronograma`. La persona está por firmar: lo que ve tiene
 * que ser lo que el backend calculó, no una segunda cuenta hecha acá.
 *
 * Las armadas se distinguen de las cuotas por `es_armada` y llevan un estilo
 * propio: son parte de la inicial, no cuotas del financiamiento, y leerlas como
 * cuotas hace parecer que la inicial desapareció.
 */

export interface FilaCronogramaApi {
  numero: number;
  /** ISO `YYYY-MM-DD`. */
  fecha: string;
  /** Decimal como string, para no perder centavos en el JSON. */
  monto: string;
  es_armada: boolean;
  /** «Armada 1 de 4» / «Cuota 1 de 13». */
  etiqueta: string;
}

export interface FilasConArmadasProps {
  filas: FilaCronogramaApi[];
  /** Suma del cronograma completo, armadas incluidas. */
  total?: string;
}

/** `YYYY-MM-DD` → «21 de agosto de 2026», sin que el huso corra un día. */
function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  if (!anio || !mes || !dia) return iso;
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function montoLegible(monto: string): string {
  const n = Number(monto);
  return Number.isFinite(n) ? n.toFixed(2) : monto;
}

export function FilasConArmadas({ filas, total }: FilasConArmadasProps) {
  if (filas.length === 0) return null;

  const armadas = filas.filter((f) => f.es_armada).length;

  return (
    <div className="w-full space-y-3">
      {armadas > 0 && (
        <p className="text-xs text-[#6b7280]">
          Tu cuota inicial se paga en {armadas} armadas, y después siguen las
          cuotas del financiamiento.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#fafafa]">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-[#6b7280]">Pago</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-[#6b7280]">Fecha</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#6b7280]">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr
                key={`${fila.es_armada ? 'a' : 'c'}-${fila.numero}-${i}`}
                data-testid={fila.es_armada ? 'fila-armada' : 'fila-cuota'}
                className={`border-t border-[#f3f4f6] ${fila.es_armada ? 'bg-[#ECECFB]' : ''}`}
              >
                <td className="px-3 py-2">
                  <span className={fila.es_armada ? 'font-medium text-[#4654CD]' : 'text-[#374151]'}>
                    {fila.etiqueta}
                  </span>
                </td>
                <td className="px-3 py-2 capitalize text-[#4b5563]">{formatearFecha(fila.fecha)}</td>
                <td className="px-3 py-2 text-right font-semibold text-[#111827]">
                  S/{montoLegible(fila.monto)}
                </td>
              </tr>
            ))}
          </tbody>
          {total && (
            <tfoot>
              <tr className="border-t border-[#e5e7eb] bg-[#fafafa]">
                <td className="px-3 py-2 text-xs font-semibold uppercase text-[#6b7280]" colSpan={2}>
                  Total a pagar
                </td>
                <td className="px-3 py-2 text-right font-bold text-[#111827]">S/{montoLegible(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default FilasConArmadas;
