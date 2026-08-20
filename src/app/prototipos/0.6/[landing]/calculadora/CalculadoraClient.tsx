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
 *
 * Monta la barra superior y el pie igual que el resto de las pantallas: el
 * layout de `[landing]` no los pone, es una capa de control de acceso.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Landmark, Info, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { routes } from '../../utils/routes';
import { simularCalculadora, type SimulacionFinanciamiento } from './api/simuladorApi';
import { DetalleFinanciamientoModal } from './components/DetalleFinanciamientoModal';
import { entregarASolicitar } from './utils/entrega';
import { useDatosMatricula } from './utils/useDatosMatricula';
import type { TipoInstitucion } from '../universidad/types/instituciones';
import {
  MONTOS_VACIOS,
  formatearSoles,
  montosValidos,
  totalAFinanciar,
  type MontosMatricula,
} from './types/calculadora';
import { CampoMonto } from './components/CampoMonto';

/**
 * Textos del producto en pantalla.
 *
 * El identificador, la variante y el tipo ya NO viven acá: los resuelve la
 * configuración de la landing, junto con el rango del monto, los plazos, la
 * tasa y la comisión. Lo que queda es copia visible, que no es configuración de
 * negocio: cambiarla es un cambio de texto, no de condiciones.
 */
const PRODUCTO_NOMBRE = 'Financiamiento de Matrícula';
const PRODUCTO_SLUG = 'prestamo-matricula-1186';

/** Milisegundos de espera antes de simular, para no pedir en cada tecla. */
const ESPERA_SIMULACION_MS = 450;

interface InstitucionElegida {
  id: number | null;
  nombre: string | null;
  tipo: TipoInstitucion | null;
}

const INSTITUCION_VACIA: InstitucionElegida = { id: null, nombre: null, tipo: null };

export function CalculadoraClient() {
  const router = useRouter();
  const parametros = useParams();
  const landing = (parametros?.landing as string) || 'home';
  const { navbarProps, footerData, agreementData, calculadora } = useLayout();

  const [montos, setMontos] = useState<MontosMatricula>(MONTOS_VACIOS);
  /**
   * El plazo elegido, o null mientras la persona no toca nada.
   *
   * Los plazos ofrecidos los define la landing, y llegan después del primer
   * render. Por eso el elegido se deriva en vez de fijarse con un valor por
   * omisión: si la configuración cambia y el plazo elegido deja de existir, cae
   * al primero disponible en lugar de simular una combinación sin celda.
   */
  const [plazoElegido, setPlazoElegido] = useState<number | null>(null);
  const [simulacion, setSimulacion] = useState<SimulacionFinanciamiento | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const total = useMemo(() => totalAFinanciar(montos), [montos]);
  const hayMontos = montosValidos(montos);

  const plazos = calculadora?.terms ?? [];
  const plazo =
    plazoElegido !== null && plazos.includes(plazoElegido) ? plazoElegido : plazos[0] ?? null;

  /**
   * La institución la eligió la pantalla anterior y viaja por almacenamiento
   * local. La lectura vive en un hook aparte porque el paso académico del
   * formulario lee lo mismo para bloquear el campo de institución.
   */
  const datosMatricula = useDatosMatricula(landing);

  const institucion = useMemo<InstitucionElegida>(() => {
    if (!datosMatricula) return INSTITUCION_VACIA;
    return {
      id: datosMatricula.institucionId ?? null,
      nombre: datosMatricula.institucionNombre ?? null,
      tipo: datosMatricula.institucionTipo ?? null,
    };
  }, [datosMatricula]);

  /**
   * Guarda de institución.
   *
   * Sin institución elegida no hay financiamiento que armar: el producto se paga
   * a una universidad concreta. Se devuelve a la pantalla de selección, igual que
   * el paso de solicitar devuelve al catálogo cuando se limpia el almacenamiento.
   *
   * La instantánea es `null` durante el render de servidor, así que se espera a
   * estar en el navegador para no redirigir sobre una lectura vacía.
   */
  const sinInstitucion = typeof window !== 'undefined' && institucion.id === null;

  useEffect(() => {
    if (sinInstitucion) router.replace(routes.universidad(landing));
  }, [sinInstitucion, router, landing]);

  // Simula con retardo: el monto se escribe dígito a dígito y no tiene sentido
  // pedir una simulación por cada tecla.
  useEffect(() => {
    // Sin montos no se simula. No se limpia el estado acá: lo que se muestra se
    // deriva más abajo, así el efecto no dispara renders en cascada.
    if (!hayMontos || plazo === null) return;

    const temporizador = setTimeout(() => {
      abortRef.current?.abort();
      const controlador = new AbortController();
      abortRef.current = controlador;

      setSimulando(true);
      setError(null);

      simularCalculadora(total, plazo, landing, controlador.signal)
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

  const puedeContinuar =
    hayMontos && !simulando && !!simulacionVisible && !errorVisible && !!calculadora;

  const alContinuar = useCallback(() => {
    if (!puedeContinuar || !simulacion || !calculadora) return;

    const guardado = entregarASolicitar({
      landing,
      productoId: calculadora.productId,
      varianteId: calculadora.variantId,
      productoSlug: PRODUCTO_SLUG,
      productoNombre: PRODUCTO_NOMBRE,
      montos,
      plazoMeses: simulacion.plazoMeses,
      cuotaMensual: simulacion.cuotaMensual,
      institucionId: institucion.id,
      institucionNombre: institucion.nombre,
      institucionTipo: institucion.tipo,
    });

    if (!guardado) {
      setError('Tu navegador no permite guardar los datos. Revisa si estás en modo incógnito.');
      return;
    }

    router.push(routes.solicitar(landing));
  }, [puedeContinuar, simulacion, calculadora, landing, montos, institucion, router]);

  // Mientras la guarda redirige no se pinta nada: evita el parpadeo de la
  // pantalla vacía y el título sin universidad.
  if (sinInstitucion) return null;

  /**
   * Guarda de configuración.
   *
   * La calculadora es un ingrediente de la landing: sin su configuración no hay
   * producto sobre el que registrar la solicitud, ni plazos que ofrecer. No se
   * dibuja un control que después no puede entregar una cuota. Cubre también el
   * lapso previo a que llegue la configuración, que es null en el primer render.
   */
  if (!calculadora) return null;

  const titulo = institucion.nombre
    ? `Financiamiento de Matrícula — ${institucion.nombre}`
    : 'Financiamiento de Matrícula';

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <Navbar
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        logoClassName={navbarProps?.logoClassName}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        portalButtonText={navbarProps?.portalButtonText}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={navbarProps?.activeSections || []}
        institutionLogo={navbarProps?.institutionLogo}
        institutionName={navbarProps?.institutionName}
      />

      {/* Espaciador dinámico: sigue a --header-total-height, que expone el Navbar. */}
      <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14 pb-24 lg:pb-12">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)]">
            <Landmark className="h-4 w-4" />
            Pagamos directo a tu universidad
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-2 sm:mb-3 font-['Baloo_2',_sans-serif] leading-tight">
            {titulo}
          </h1>
          <p className="mx-auto max-w-xl px-2 text-sm sm:text-base md:text-lg text-neutral-600">
            Ingresa los montos exactos de tu matrícula y tu primera cuota, y elige cómo prefieres
            pagarlo. Evaluamos tu solicitud antes de confirmarla.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-neutral-800">
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

                <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
                  <span className="text-sm font-medium text-neutral-700">Monto total a financiar</span>
                  <span className="text-lg font-bold text-neutral-800">{formatearSoles(total)}</span>
                </div>
              </div>

              <p className="mt-4 flex gap-2 text-xs leading-relaxed text-neutral-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <span>
                  Escribe el monto exacto que te aparece al consultar tu código de alumno en el banco,
                  <strong className="font-semibold text-neutral-600"> incluyendo los céntimos </strong>
                  si los tuviera (por ejemplo, 350.50). Si ya pagaste uno de los dos por tu cuenta,
                  déjalo en cero.
                </span>
              </p>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-neutral-800">¿En cuántos meses pagas?</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {plazos.map((opcion) => {
                  const activo = opcion === plazo;
                  return (
                    <button
                      key={opcion}
                      type="button"
                      onClick={() => setPlazoElegido(opcion)}
                      aria-pressed={activo}
                      className={`rounded-xl border px-3 py-3 text-center font-semibold text-sm transition-colors cursor-pointer ${
                        activo
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-[var(--color-primary)]'
                      }`}
                    >
                      {opcion} meses
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-center text-sm text-neutral-600">Tu cuota mensual</p>
              <p className="mt-1 text-center text-4xl font-bold text-[var(--color-primary)] font-['Baloo_2',_sans-serif]">
                {simulando ? (
                  <Loader2 className="mx-auto h-9 w-9 animate-spin text-[var(--color-primary)] opacity-60" />
                ) : (
                  formatearSoles(simulacionVisible?.cuotaMensual ?? 0)
                )}
              </p>
              <p className="mt-1 text-center text-xs text-neutral-500">
                {hayMontos ? `durante ${plazo} meses` : 'Ingresa un monto para calcular tu cuota'}
              </p>

              <dl className="mt-5 space-y-2 border-t border-neutral-100 pt-4">
                <div className="flex justify-between text-sm">
                  <dt className="text-neutral-600">Monto financiado</dt>
                  <dd className="font-medium text-neutral-800">{formatearSoles(total)}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-neutral-600">Plazo</dt>
                  <dd className="font-medium text-neutral-800">{plazo} meses</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-neutral-600">Total a pagar</dt>
                  <dd className="font-medium text-neutral-800">
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
                className="mt-4 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Ver detalles
              </button>

              <button
                type="button"
                onClick={alContinuar}
                disabled={!puedeContinuar}
                className={`mt-3 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg ${
                  puedeContinuar
                    ? 'bg-[var(--color-primary)] text-white hover:brightness-90 cursor-pointer shadow-[rgba(var(--color-primary-rgb),0.25)]'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>

              <button
                type="button"
                onClick={() => router.push(routes.universidad(landing))}
                className="w-full flex items-center justify-center gap-2 mt-4 py-3 text-neutral-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Footer data={footerData} landing={landing} agreementData={agreementData} />

      <DetalleFinanciamientoModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        simulacion={simulacionVisible}
        montos={montos}
      />
    </div>
  );
}

export default CalculadoraClient;
