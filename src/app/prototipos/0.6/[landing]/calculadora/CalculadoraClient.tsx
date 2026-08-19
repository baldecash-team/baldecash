'use client';

/**
 * Calculadora de matrícula.
 *
 * Reemplaza al catálogo y al detalle de producto en el recorrido de este
 * producto: acá se arma el financiamiento y se entrega directo a /solicitar.
 *
 * La cuota NO se calcula en el navegador. Cada cambio de monto o de plazo pide
 * una simulación a webservice2, que es el único camino que respeta la tasa del
 * convenio de la landing.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Landmark, Info, Loader2, AlertCircle } from 'lucide-react';
import { routes } from '../../utils/routes';
import { simularFinanciamiento, type SimulacionFinanciamiento } from './api/simuladorApi';
import { DetalleFinanciamientoModal } from './components/DetalleFinanciamientoModal';
import { entregarASolicitar, getMatriculaKey, type DatosMatricula } from './utils/entrega';
import {
  MONTOS_VACIOS,
  PLAZOS_MESES,
  PLAZO_POR_DEFECTO,
  formatearSoles,
  montosValidos,
  redondearSoles,
  totalAFinanciar,
  type MontosMatricula,
  type PlazoMeses,
} from './types/calculadora';

/**
 * Producto de matrícula en webservice2.
 *
 * Es un producto único y genérico: el mismo sirve para todas las instituciones,
 * porque lo que cambia entre ellas son los valores, no el producto. Su precio de
 * lista no se usa para calcular: el monto lo define quien solicita.
 */
const PRODUCTO_MATRICULA = {
  id: 1585,
  slug: 'prestamo-matricula-1186',
  nombre: 'Financiamiento de Matrícula',
};

/** Milisegundos de espera antes de simular, para no pedir en cada tecla. */
const ESPERA_SIMULACION_MS = 450;

/**
 * El dato guardado no cambia mientras la página vive: lo escribió la pantalla
 * anterior. No hay a qué suscribirse, pero `useSyncExternalStore` exige la
 * función igual.
 */
const sinSuscripcion = () => () => {};

const INSTITUCION_VACIA = { id: null, nombre: null } as const;

interface CampoMontoProps {
  etiqueta: string;
  valor: number;
  placeholder: string;
  onCambio: (valor: number) => void;
}

function CampoMonto({ etiqueta, valor, placeholder, onCambio }: CampoMontoProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{etiqueta}</span>
      <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <span className="mr-2 text-sm font-semibold text-indigo-600">S/</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder={placeholder}
          value={valor === 0 ? '' : valor}
          onChange={(evento) => {
            const numero = Number.parseFloat(evento.target.value);
            onCambio(Number.isFinite(numero) && numero >= 0 ? redondearSoles(numero) : 0);
          }}
          className="w-full bg-transparent py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}

export function CalculadoraClient() {
  const router = useRouter();
  const parametros = useParams();
  const landing = (parametros?.landing as string) || 'home';

  const [montos, setMontos] = useState<MontosMatricula>(MONTOS_VACIOS);
  const [plazo, setPlazo] = useState<PlazoMeses>(PLAZO_POR_DEFECTO);
  const [simulacion, setSimulacion] = useState<SimulacionFinanciamiento | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const total = useMemo(() => totalAFinanciar(montos), [montos]);
  const hayMontos = montosValidos(montos);

  /**
   * La institución la eligió la pantalla anterior y viaja por almacenamiento
   * local. Se lee con `useSyncExternalStore` y no con un efecto: devuelve una
   * instantánea distinta en servidor y en cliente, así que React resuelve la
   * hidratación sin desajuste y sin renders en cascada.
   *
   * La instantánea devuelve la cadena cruda, no el objeto: tiene que ser
   * referencialmente estable entre llamadas o el componente entra en bucle.
   *
   * Si el dato no está, el recorrido sigue igual: el paso académico del
   * formulario vuelve a pedir la institución.
   */
  const matriculaCruda = useSyncExternalStore(
    sinSuscripcion,
    () => {
      try {
        return localStorage.getItem(getMatriculaKey(landing));
      } catch {
        return null;
      }
    },
    () => null
  );

  const institucion = useMemo<{ id: number | null; nombre: string | null }>(() => {
    if (!matriculaCruda) return INSTITUCION_VACIA;
    try {
      const datos = JSON.parse(matriculaCruda) as DatosMatricula;
      return { id: datos.institucionId ?? null, nombre: datos.institucionNombre ?? null };
    } catch {
      return INSTITUCION_VACIA;
    }
  }, [matriculaCruda]);

  // Simula con retardo: el monto se escribe dígito a dígito y no tiene sentido
  // pedir una simulación por cada tecla.
  useEffect(() => {
    // Sin montos no se simula. No se limpia el estado acá: lo que se muestra se
    // deriva más abajo, así el efecto no dispara renders en cascada.
    if (!hayMontos) return;

    const temporizador = setTimeout(() => {
      abortRef.current?.abort();
      const controlador = new AbortController();
      abortRef.current = controlador;

      setSimulando(true);
      setError(null);

      simularFinanciamiento(total, plazo, landing, controlador.signal)
        .then((resultado) => {
          setSimulacion(resultado);
          setSimulando(false);
        })
        .catch((causa: unknown) => {
          if (causa instanceof DOMException && causa.name === 'AbortError') return;
          setSimulacion(null);
          setSimulando(false);
          setError('No pudimos calcular tu cuota. Intenta de nuevo en unos segundos.');
        });
    }, ESPERA_SIMULACION_MS);

    return () => clearTimeout(temporizador);
  }, [total, plazo, landing, hayMontos]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Lo que se muestra se deriva de si hay montos, en vez de limpiarse dentro del
  // efecto. Si el solicitante borra los montos, el resultado anterior queda en
  // estado pero deja de mostrarse, y vuelve solo cuando hay algo que simular.
  const simulacionVisible = hayMontos ? simulacion : null;
  const errorVisible = hayMontos ? error : null;

  const puedeContinuar = hayMontos && !simulando && !!simulacionVisible && !errorVisible;

  const alContinuar = useCallback(() => {
    if (!puedeContinuar || !simulacion) return;

    const guardado = entregarASolicitar({
      landing,
      productoId: PRODUCTO_MATRICULA.id,
      productoSlug: PRODUCTO_MATRICULA.slug,
      productoNombre: PRODUCTO_MATRICULA.nombre,
      montos,
      plazoMeses: simulacion.plazoMeses,
      cuotaMensual: simulacion.cuotaMensual,
      institucionId: institucion.id,
      institucionNombre: institucion.nombre,
    });

    if (!guardado) {
      setError('Tu navegador no permite guardar los datos. Revisa si estás en modo incógnito.');
      return;
    }

    router.push(routes.solicitar(landing));
  }, [puedeContinuar, simulacion, landing, montos, institucion, router]);

  const titulo = institucion.nombre
    ? `Financiamiento de Matrícula — ${institucion.nombre}`
    : 'Financiamiento de Matrícula';

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600">
          <Landmark className="h-4 w-4" />
          Pagamos directo a tu universidad
        </p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{titulo}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
          Ingresa los montos exactos de tu matrícula y tu primera cuota, y elige cómo prefieres
          pagarlo. Evaluamos tu solicitud antes de confirmarla.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              ¿Cuánto necesitas para inscribirte?
            </h2>

            <div className="space-y-4">
              <CampoMonto
                etiqueta="Monto de matrícula"
                valor={montos.matricula}
                placeholder="Ej. 350.50"
                onCambio={(valor) => setMontos((previo) => ({ ...previo, matricula: valor }))}
              />
              <CampoMonto
                etiqueta="Monto primera cuota"
                valor={montos.primeraCuota}
                placeholder="Ej. 450.80"
                onCambio={(valor) => setMontos((previo) => ({ ...previo, primeraCuota: valor }))}
              />

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Monto total a financiar</span>
                <span className="text-lg font-bold text-slate-900">{formatearSoles(total)}</span>
              </div>
            </div>

            <p className="mt-4 flex gap-2 text-xs leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                Escribe el monto exacto que te aparece al consultar tu código de alumno en el banco,
                <strong className="font-semibold text-slate-600"> incluyendo los céntimos </strong>
                si los tuviera (por ejemplo, 350.50). Si ya pagaste uno de los dos por tu cuenta,
                déjalo en cero.
              </span>
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">¿En cuántos meses pagas?</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PLAZOS_MESES.map((opcion) => {
                const activo = opcion === plazo;
                return (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setPlazo(opcion)}
                    aria-pressed={activo}
                    className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                      activo
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{opcion} meses</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-center text-sm text-slate-600">Tu cuota mensual</p>
            <p className="mt-1 text-center text-4xl font-bold text-indigo-600">
              {simulando ? (
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-indigo-400" />
              ) : (
                formatearSoles(simulacionVisible?.cuotaMensual ?? 0)
              )}
            </p>
            <p className="mt-1 text-center text-xs text-slate-500">
              {hayMontos ? `durante ${plazo} meses` : 'Ingresa un monto para calcular tu cuota'}
            </p>

            <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm">
                <dt className="text-slate-600">Monto financiado</dt>
                <dd className="font-medium text-slate-900">{formatearSoles(total)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-slate-600">Plazo</dt>
                <dd className="font-medium text-slate-900">{plazo} meses</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-slate-600">Total a pagar</dt>
                <dd className="font-medium text-slate-900">
                  {formatearSoles(simulacionVisible?.totalAPagar ?? 0)}
                </dd>
              </div>
            </dl>

            {errorVisible && (
              <p className="mt-4 flex gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorVisible}</span>
              </p>
            )}

            <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Tasa y comisión referenciales, sujetas a confirmación en tu contrato final.</span>
            </p>

            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              disabled={!simulacionVisible}
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ver detalles
            </button>

            <button
              type="button"
              onClick={alContinuar}
              disabled={!puedeContinuar}
              className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Continuar
            </button>

            <button
              type="button"
              onClick={() => router.push(routes.universidad(landing))}
              className="mt-3 w-full rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              ← Volver
            </button>
          </div>
        </aside>
      </div>

      <DetalleFinanciamientoModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        simulacion={simulacionVisible}
        montos={montos}
      />
    </main>
  );
}

export default CalculadoraClient;
