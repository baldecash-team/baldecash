'use client';

/**
 * Modal "Detalle de tu financiamiento".
 *
 * Muestra el desglose, el cronograma y las condiciones. Todo lo numérico sale de
 * la simulación del backend; acá no se calcula nada.
 *
 * La disposición sigue el maquetado entregado por producto: dos columnas en
 * escritorio —detalles y cronograma—, el total a pagar en un recuadro propio con
 * filete de acento, las cláusulas en dos columnas y la nota de fechas en
 * otro recuadro al pie.
 *
 * El cronograma va en UNA sola columna. Se había partido en dos, pero el
 * maquetado lo muestra entero.
 *
 * Con `soloCronograma` queda nada más que la tabla de cuotas. Es lo que pidió
 * producto para titulación, y por eso el desglose y las cláusulas viven en
 * componentes propios: esconderlos tiene que ser una condición de una línea.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { SimulacionFinanciamiento } from '../api/simuladorApi';
import type { MontosMatricula } from '../types/calculadora';
import { formatearSoles, formatearTasa } from '../types/calculadora';
import type { CampoMontoPerfil } from '../perfiles';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  simulacion: SimulacionFinanciamiento | null;
  montos: MontosMatricula;
  /** Los importes que pide la landing, en el mismo orden que en el formulario. */
  campos: CampoMontoPerfil[];
  /** Nota al pie sobre cuándo se fija el cronograma. */
  notaCronograma: string;
  /**
   * Deja solo el cronograma: sin desglose, sin tasas, sin cláusulas y sin nota.
   *
   * Lo pidió producto para titulación. Va como bandera y no como componente
   * aparte porque la tabla de cuotas es la misma, y duplicarla para recortarle
   * lo de alrededor deja dos cronogramas que hay que corregir de a dos.
   *
   * Lo que se esconde NO desaparece del financiamiento: la TEA, la TCEA y las
   * cláusulas siguen viajando en la simulación y se firman en el contrato.
   */
  soloCronograma?: boolean;
}

const MESES_ABREVIADOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'set', 'oct', 'nov', 'dic',
];

/** Formato del maquetado: "19 set 2026", no "19/09/2026". */
function formatearFecha(iso: string): string {
  if (!iso) return '—';
  const partes = iso.split('-');
  if (partes.length !== 3) return iso;
  const [anio, mes, dia] = partes;
  const indice = Number.parseInt(mes, 10) - 1;
  const nombreMes = MESES_ABREVIADOS[indice] ?? mes;
  return `${Number.parseInt(dia, 10)} ${nombreMes} ${anio}`;
}

function Fila({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="py-2.5 pr-4 text-neutral-600">{etiqueta}</td>
      <td
        className={`py-2.5 text-right ${
          destacado ? 'font-extrabold text-[var(--color-primary)]' : 'font-semibold text-neutral-800'
        }`}
      >
        {valor}
      </td>
    </tr>
  );
}

function Clausula({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <strong className="mb-1.5 block text-[0.8rem] font-bold text-neutral-800">{titulo}</strong>
      <div className="text-[0.76rem] leading-relaxed text-neutral-500">{children}</div>
    </div>
  );
}

/**
 * Desglose del financiamiento: importes, cuotas y tasas.
 *
 * Sale del cuerpo del modal para que esconderlo sea una condición de una línea
 * y no un bloque de cuarenta indentado un nivel más adentro.
 */
function SeccionDetalles({
  simulacion,
  montos,
  campos,
}: Pick<Props, 'simulacion' | 'montos' | 'campos'>) {
  return (
    <section>
      <h4 className="mb-3 text-[1.05rem] font-extrabold text-neutral-800 font-['Baloo_2',_sans-serif]">
        Detalles
      </h4>
      <table className="w-full border-collapse text-[0.84rem]">
        <tbody>
          {campos.map((campo) => (
            <Fila
              key={campo.clave}
              etiqueta={campo.etiquetaResumen}
              valor={formatearSoles(montos[campo.clave])}
            />
          ))}
          {/*
            Con un solo importe, el total financiado es esa misma cifra:
            la fila repetiria el numero de arriba y se leeria como si
            fueran dos conceptos distintos.
          */}
          {campos.length > 1 && (
            <Fila
              etiqueta="Monto total financiado"
              valor={formatearSoles(simulacion?.montoFinanciado)}
              destacado
            />
          )}
          <Fila
            etiqueta="Número de cuotas"
            valor={simulacion ? String(simulacion.plazoMeses) : '—'}
          />
          <Fila etiqueta="Cuota mensual" valor={formatearSoles(simulacion?.cuotaMensual)} destacado />
          <Fila etiqueta="TEA" valor={formatearTasa(simulacion?.tea)} />
          <Fila etiqueta="TCEA" valor={formatearTasa(simulacion?.tcea)} />
        </tbody>
      </table>

      <p className="mt-4 rounded-[10px] border-l-4 border-[#05DAD3] bg-[#eef0ff] px-4 py-3 text-[0.88rem] font-bold text-neutral-800">
        *Cantidad total a pagar: {formatearSoles(simulacion?.totalAPagar)}
      </p>
    </section>
  );
}

/** Penalidades y comisiones. Sale acá por el mismo motivo que `SeccionDetalles`. */
function SeccionClausulas({ simulacion }: Pick<Props, 'simulacion'>) {
  const comisionDesglose = simulacion?.comisionDesglose ?? [];

  return (
    <div className="mt-7 grid gap-6 border-t border-[#eef0f8] pt-6 md:grid-cols-2">
      <Clausula titulo="Cláusulas de penalidad">
        Ante el retraso de pago de una cuota, existirá un interés moratorio de{' '}
        {formatearSoles(simulacion?.moraDiaria)} por cada día de atraso en el que incurra el
        cliente.
      </Clausula>
      <Clausula titulo="Gastos incluidos en la cuota">
        {comisionDesglose.length > 0 ? (
          <>
            La cuota mensual incluye {formatearSoles(simulacion?.comisionMensual)} de comisiones
            operativas:
            <ul className="mt-1.5 space-y-0.5">
              {comisionDesglose.map((concepto) => (
                <li key={concepto.concepto} className="flex justify-between gap-3">
                  <span>{concepto.concepto}</span>
                  <span className="font-semibold text-neutral-700">
                    {formatearSoles(concepto.monto)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          'La cuota mensual incluye las comisiones operativas del financiamiento.'
        )}
      </Clausula>
    </div>
  );
}

export function DetalleFinanciamientoModal({
  abierto,
  onCerrar,
  simulacion,
  montos,
  campos,
  notaCronograma,
  soloCronograma = false,
}: Props) {
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

  const cronograma = simulacion?.cronograma ?? [];
  const primerVencimiento = cronograma[0]?.fechaVencimiento;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/40 p-0 sm:p-4"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        className="flex w-full sm:max-w-[880px] max-h-[88vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-[18px] bg-white shadow-[0_20px_60px_rgba(20,22,50,0.3)]"
        onClick={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-detalle-financiamiento"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eef0f8] px-6 pb-5 pt-6 sm:px-8">
          <div>
            <h3
              id="titulo-detalle-financiamiento"
              className="text-xl font-extrabold text-neutral-800 font-['Baloo_2',_sans-serif]"
            >
              {soloCronograma ? 'Cronograma de pagos' : 'Detalle de tu financiamiento'}
            </h3>
            <p className="mt-0.5 text-[0.8rem] text-neutral-500">
              {simulacion
                ? `${formatearSoles(simulacion.montoFinanciado)} en ${simulacion.plazoMeses} cuotas mensuales`
                : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
            className="shrink-0 rounded-full bg-neutral-100 p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          {/* Sin el desglose al lado, el cronograma no tiene con quién compartir
              la fila y ocupa el ancho entero. */}
          <div className={soloCronograma ? '' : 'grid gap-8 md:grid-cols-2 md:gap-10'}>
            {!soloCronograma && (
              <SeccionDetalles simulacion={simulacion} montos={montos} campos={campos} />
            )}

            <section>
              <h4 className="mb-3 text-[1.05rem] font-extrabold text-neutral-800 font-['Baloo_2',_sans-serif]">
                Cronograma
              </h4>

              {primerVencimiento && (
                <p className="mb-2.5 text-[0.74rem] leading-relaxed text-neutral-500">
                  Calculado con desembolso hoy. Tu primera cuota vence el{' '}
                  {formatearFecha(primerVencimiento)}.
                </p>
              )}

              {cronograma.length > 0 ? (
                <table className="w-full border-collapse text-[0.79rem]">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-[0.7rem] uppercase tracking-wide text-neutral-500">
                      <th className="py-2 font-medium">Fecha</th>
                      <th className="py-2 text-right font-medium">Cuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronograma.map((cuota) => (
                      <tr key={cuota.numero} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2.5 text-neutral-600">
                          {formatearFecha(cuota.fechaVencimiento)}
                        </td>
                        <td className="py-2.5 text-right font-bold text-neutral-800">
                          {formatearSoles(cuota.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-neutral-500">—</p>
              )}
            </section>
          </div>

          {!soloCronograma && <SeccionClausulas simulacion={simulacion} />}

          {!soloCronograma && (
            <p className="mt-4 rounded-[10px] bg-[#eef0ff] px-3.5 py-3 text-[0.74rem] leading-relaxed text-[#3a3f9e]">
              {notaCronograma}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleFinanciamientoModal;
