'use client';

/**
 * Modal "Detalle de tu financiamiento".
 *
 * Muestra el desglose, el cronograma y las condiciones. Todo lo numérico sale de
 * la simulación del backend; acá no se calcula nada.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { SimulacionFinanciamiento } from '../api/simuladorApi';
import type { MontosMatricula } from '../types/calculadora';
import { formatearSoles, formatearTasa } from '../types/calculadora';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  simulacion: SimulacionFinanciamiento | null;
  montos: MontosMatricula;
}

function Fila({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-neutral-100 last:border-0">
      <span className="text-sm text-neutral-600">{etiqueta}</span>
      <span className={destacado ? 'text-sm font-semibold text-neutral-800' : 'text-sm text-neutral-800'}>
        {valor}
      </span>
    </div>
  );
}

function formatearFecha(iso: string): string {
  if (!iso) return '—';
  const partes = iso.split('-');
  if (partes.length !== 3) return iso;
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
}

export function DetalleFinanciamientoModal({ abierto, onCerrar, simulacion, montos }: Props) {
  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPresionar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/50 p-0 sm:p-4"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-white shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalle-financiamiento"
      >
        <header className="sticky top-0 flex items-center justify-between gap-4 border-b border-neutral-100 bg-white px-5 py-4">
          <h3 id="titulo-detalle-financiamiento" className="text-base font-semibold text-neutral-800">
            Detalle de tu financiamiento
          </h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
            className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="px-5 py-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Detalles</h4>
          <Fila etiqueta="Monto de matrícula" valor={formatearSoles(montos.matricula)} />
          <Fila etiqueta="Monto primera cuota" valor={formatearSoles(montos.primeraCuota)} />
          <Fila etiqueta="Monto total financiado" valor={formatearSoles(simulacion?.montoFinanciado)} destacado />
          <Fila etiqueta="Número de cuotas" valor={simulacion ? String(simulacion.plazoMeses) : '—'} />
          <Fila etiqueta="Cuota mensual" valor={formatearSoles(simulacion?.cuotaMensual)} destacado />
          <Fila etiqueta="TEA" valor={formatearTasa(simulacion?.tea)} />
          <Fila etiqueta="TCEA" valor={formatearTasa(simulacion?.tcea)} />
          <Fila etiqueta="Cantidad total a pagar" valor={formatearSoles(simulacion?.totalAPagar)} destacado />
        </div>

        {simulacion && simulacion.cronograma.length > 0 && (
          <div className="px-5 py-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Cronograma</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                    <th className="py-2 font-medium">Fecha</th>
                    <th className="py-2 text-right font-medium">Cuota</th>
                  </tr>
                </thead>
                <tbody>
                  {simulacion.cronograma.map((cuota) => (
                    <tr key={cuota.numero} className="border-b border-neutral-100 last:border-0">
                      <td className="py-2 text-neutral-600">{formatearFecha(cuota.fechaVencimiento)}</td>
                      <td className="py-2 text-right text-neutral-800">{formatearSoles(cuota.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              Las fechas son referenciales y se calculan desde hoy. El cronograma definitivo se genera
              con la fecha real en que BaldeCash pague tu matrícula a la universidad.
            </p>
          </div>
        )}

        <div className="space-y-4 border-t border-neutral-100 px-5 py-4">
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Cláusulas de penalidad
            </h4>
            <p className="text-xs leading-relaxed text-neutral-600">
              Ante el retraso de pago de una cuota, existirá un interés moratorio de S/ 1 por cada día
              de atraso en el que incurra el cliente.
            </p>
          </section>

          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Gastos incluidos en la cuota
            </h4>
            <p className="text-xs leading-relaxed text-neutral-600">
              La cuota mensual incluye las comisiones operativas del financiamiento.
            </p>
          </section>

          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Pagos anticipados
            </h4>
            <p className="text-xs leading-relaxed text-neutral-600">
              El cliente tendrá derecho a pagar por adelantado sus cuotas sin ningún tipo de penalidad.
              Si el cliente paga todas las cuotas restantes en una sola transacción, accederá a un
              descuento de 20% sobre el valor de las cuotas.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DetalleFinanciamientoModal;
