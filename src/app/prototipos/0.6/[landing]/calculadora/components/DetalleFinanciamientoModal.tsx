'use client';

/**
 * Modal "Detalle de tu financiamiento".
 *
 * Muestra el desglose, el cronograma y las condiciones. Todo lo numérico sale de
 * la simulación del backend; acá no se calcula nada.
 *
 * La disposición sigue el maquetado: en escritorio los detalles y el cronograma
 * van lado a lado, y el cronograma se parte en dos tablas para que doce cuotas
 * no obliguen a desplazarse. En móvil todo se apila y el cronograma vuelve a ser
 * una sola tabla.
 */

import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { CuotaCronograma, SimulacionFinanciamiento } from '../api/simuladorApi';
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
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="py-2 pr-4 text-sm text-neutral-600">{etiqueta}</td>
      <td
        className={`py-2 text-right text-sm ${
          destacado ? 'font-semibold text-neutral-800' : 'text-neutral-800'
        }`}
      >
        {valor}
      </td>
    </tr>
  );
}

function TablaCronograma({ cuotas }: { cuotas: CuotaCronograma[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
          <th className="py-2 font-medium">Fecha</th>
          <th className="py-2 text-right font-medium">Cuota</th>
        </tr>
      </thead>
      <tbody>
        {cuotas.map((cuota) => (
          <tr key={cuota.numero} className="border-b border-neutral-100 last:border-0">
            <td className="py-2 text-neutral-600">{formatearFecha(cuota.fechaVencimiento)}</td>
            <td className="py-2 text-right text-neutral-800">{formatearSoles(cuota.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatearFecha(iso: string): string {
  if (!iso) return '—';
  const partes = iso.split('-');
  if (partes.length !== 3) return iso;
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
}

function Clausula({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <strong className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {titulo}
      </strong>
      <p className="mt-1 text-xs leading-relaxed text-neutral-600">{children}</p>
    </div>
  );
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

  // El cronograma se parte al medio para las dos tablas de escritorio. Cuando el
  // total es impar, la primera columna se queda con la cuota de más.
  const [mitadIzquierda, mitadDerecha] = useMemo(() => {
    const cuotas = simulacion?.cronograma ?? [];
    const corte = Math.ceil(cuotas.length / 2);
    return [cuotas.slice(0, corte), cuotas.slice(corte)];
  }, [simulacion]);

  if (!abierto) return null;

  const hayCronograma = (simulacion?.cronograma.length ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/50 p-0 sm:p-4"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-white shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalle-financiamiento"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-neutral-100 bg-white px-5 py-4">
          <div>
            <h3 id="titulo-detalle-financiamiento" className="text-base font-semibold text-neutral-800">
              Detalle de tu financiamiento
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              {simulacion
                ? `${formatearSoles(simulacion.montoFinanciado)} en ${simulacion.plazoMeses} cuotas mensuales`
                : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
            className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-[var(--color-primary)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="px-5 py-4">
          {/* Detalles y cronograma lado a lado en escritorio, apilados en móvil. */}
          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Detalles
              </h4>
              <table className="w-full">
                <tbody>
                  <Fila etiqueta="Monto de matrícula" valor={formatearSoles(montos.matricula)} />
                  <Fila etiqueta="Monto primera cuota" valor={formatearSoles(montos.primeraCuota)} />
                  <Fila
                    etiqueta="Monto total financiado"
                    valor={formatearSoles(simulacion?.montoFinanciado)}
                    destacado
                  />
                  <Fila
                    etiqueta="Número de cuotas"
                    valor={simulacion ? String(simulacion.plazoMeses) : '—'}
                  />
                  <Fila etiqueta="Cuota mensual" valor={formatearSoles(simulacion?.cuotaMensual)} destacado />
                  <Fila etiqueta="TEA" valor={formatearTasa(simulacion?.tea)} />
                  <Fila etiqueta="TCEA" valor={formatearTasa(simulacion?.tcea)} />
                </tbody>
              </table>
              <p className="mt-3 text-sm font-semibold text-neutral-800">
                *Cantidad total a pagar:{' '}
                <span className="text-[var(--color-primary)]">
                  {formatearSoles(simulacion?.totalAPagar)}
                </span>
              </p>
            </section>

            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Cronograma
              </h4>
              {hayCronograma ? (
                <>
                  {/* Móvil: una sola tabla. */}
                  <div className="md:hidden">
                    <TablaCronograma cuotas={simulacion!.cronograma} />
                  </div>
                  {/* Escritorio: partido en dos para no alargar el modal. */}
                  <div className="hidden gap-4 md:grid md:grid-cols-2">
                    <TablaCronograma cuotas={mitadIzquierda} />
                    {mitadDerecha.length > 0 && <TablaCronograma cuotas={mitadDerecha} />}
                  </div>
                </>
              ) : (
                <p className="text-sm text-neutral-500">—</p>
              )}
            </section>
          </div>

          <div className="mt-6 grid gap-4 border-t border-neutral-100 pt-4 md:grid-cols-3">
            <Clausula titulo="Cláusulas de penalidad">
              Ante el retraso de pago de una cuota, existirá un interés moratorio de S/ 1 por cada día
              de atraso en el que incurra el cliente.
            </Clausula>
            <Clausula titulo="Gastos incluidos en la cuota">
              La cuota mensual incluye las comisiones operativas del financiamiento.
            </Clausula>
            <Clausula titulo="Pagos anticipados">
              El cliente tendrá derecho a pagar por adelantado sus cuotas sin ningún tipo de
              penalidad. Si el cliente paga todas las cuotas restantes en una sola transacción,
              accederá a un descuento de 20% sobre el valor de las cuotas.
            </Clausula>
          </div>

          <p className="mt-4 border-t border-neutral-100 pt-4 text-xs leading-relaxed text-neutral-500">
            Las fechas son referenciales y se calculan desde hoy. El cronograma definitivo se genera
            con la fecha real en que BaldeCash pague tu matrícula a la universidad.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DetalleFinanciamientoModal;
