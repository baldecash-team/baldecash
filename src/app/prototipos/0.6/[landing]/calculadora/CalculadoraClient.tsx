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
import { AvisoLegal } from '@/app/prototipos/0.6/components/legal/AvisoLegal';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { routes } from '../../utils/routes';
import { simularCalculadora, type SimulacionFinanciamiento } from './api/simuladorApi';
import { DetalleFinanciamientoModal } from './components/DetalleFinanciamientoModal';
import { entregarASolicitar } from './utils/entrega';
import { useDatosMatricula } from './utils/useDatosMatricula';
import type { TipoInstitucion } from '../universidad/types/instituciones';
import {
  MONTOS_VACIOS,
  excedeTope,
  formatearSoles,
  montosValidos,
  totalAFinanciar,
  type MontosMatricula,
} from './types/calculadora';
import { CampoMonto } from './components/CampoMonto';
import { CampoTexto } from './components/CampoTexto';
import { perfilDe } from './perfiles';

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

  /**
   * Copia, cantidad de importes e institución de ESTA landing.
   *
   * Esta pantalla la comparten todas las landings que corren el riel, así que
   * lo que las diferencia no puede estar escrito acá adentro. La referencia es
   * estable entre renders: sale de una tabla del módulo, no se construye.
   */
  const perfil = perfilDe(landing);

  const [montosEscritos, setMontosEscritos] = useState<MontosMatricula>(MONTOS_VACIOS);
  /**
   * El código que la landing pide junto al importe, si pide alguno.
   *
   * Vive acá y no en el perfil: el perfil describe qué se pide, no lo que la
   * persona escribió.
   */
  const [textoCampo, setTextoCampo] = useState('');
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

  /**
   * Máximo que financia la landing. Sale de la configuración, nunca de una
   * constante acá: el mismo número lo valida el backend contra esa misma fuente,
   * y tenerlo escrito en dos lados garantiza que algún día digan cosas distintas.
   */
  const topeMaximo = calculadora?.amount.max ?? 0;

  /**
   * El importe cuando la configuración no deja nada que elegir, o `null`.
   *
   * Que un producto tenga monto único es una propiedad de su configuración —el
   * mínimo y el máximo son el mismo número—, no de su copia. Deducirlo de ahí y
   * no de un interruptor en el perfil evita el caso en que las dos fuentes
   * discrepan: la pantalla pidiendo un importe que el backend va a rechazar, o
   * mostrando como fijo un número que en realidad admite un rango.
   *
   * Como efecto útil, la pantalla sigue funcionando mientras la configuración
   * todavía no fija el monto: dibuja el campo de siempre.
   */
  const montoFijado =
    calculadora && calculadora.amount.min > 0 && calculadora.amount.min === calculadora.amount.max
      ? calculadora.amount.min
      : null;

  /**
   * Los importes que se simulan: los escritos, o el fijo de la configuración.
   *
   * El fijo va al primer importe que declara el perfil y el otro queda en cero,
   * que es un valor válido del modelo: lo que se financia es la suma.
   */
  const montos = useMemo<MontosMatricula>(() => {
    if (montoFijado === null) return montosEscritos;
    const clave = perfil.campos[0]?.clave ?? 'matricula';
    return { ...MONTOS_VACIOS, [clave]: montoFijado };
  }, [montoFijado, montosEscritos, perfil]);

  const total = useMemo(() => totalAFinanciar(montos), [montos]);
  const hayMontos = montosValidos(montos);
  const excedido = excedeTope(montos, topeMaximo);

  /**
   * El dato de texto está completo, o la landing no pide ninguno.
   *
   * Bloquea el paso a la solicitud pero NO la simulación: la cuota no depende de
   * él, y esconder el resultado hasta tenerlo obliga a ir a buscar un código
   * antes de saber si el financiamiento conviene.
   */
  const textoCompleto = !perfil.campoTexto || textoCampo.length > 0;

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
    // Una landing con institución fija no pasa por la pantalla de selección, así
    // que no hay nada guardado que leer: el dato lo pone el perfil. Al continuar
    // se persiste igual que si lo hubiera elegido la persona, porque es lo que
    // el paso académico lee después para setear y bloquear el campo.
    if (perfil.institucionFija) return perfil.institucionFija;

    if (!datosMatricula) return INSTITUCION_VACIA;
    return {
      id: datosMatricula.institucionId ?? null,
      nombre: datosMatricula.institucionNombre ?? null,
      tipo: datosMatricula.institucionTipo ?? null,
    };
  }, [datosMatricula, perfil]);

  /**
   * Guarda de institución.
   *
   * Sin institución elegida no hay financiamiento que armar: el producto se paga
   * a una institución concreta. Se devuelve a la pantalla de selección, igual que
   * el paso de solicitar devuelve al catálogo cuando se limpia el almacenamiento.
   *
   * No hace falta exceptuar a las landings de institución fija: su perfil ya
   * devolvió un identificador, así que la condición no se cumple nunca. Que la
   * guarda dependa del dato y no de la landing evita una segunda regla que
   * después se desincroniza de la primera.
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
    // Sin montos no se simula. Tampoco por encima del tope: esa combinación ya
    // se sabe rechazada, y pedirla igual gasta una llamada para volver con un
    // 422 que en pantalla se leería como una falla pasajera.
    //
    // El estado no se limpia acá: lo que se muestra se deriva más abajo, así el
    // efecto no dispara renders en cascada. Lo que sí se cancela es la petición
    // en vuelo, porque su respuesta llegaría tarde para un monto que ya no es el
    // de la pantalla — y eso es hablarle a un sistema externo, no mover estado.
    //
    // Cancelar deja `simulando` en true, porque el aborto no pasa por el camino
    // que lo baja. No se corrige seteándolo desde acá: el indicador de carga
    // también se deriva, y así queda apagado sin tocar estado.
    if (!hayMontos || plazo === null || excedido) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }

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
  }, [total, plazo, landing, hayMontos, excedido]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Lo que se muestra se deriva de si hay montos, en vez de limpiarse dentro del
  // efecto. Si el solicitante borra los montos, el resultado anterior queda en
  // estado pero deja de mostrarse, y vuelve solo cuando hay algo que simular.
  //
  // Por encima del tope vale lo mismo, y por una razón más fuerte: una cuota
  // calculada para 1400 al lado de un total de 4000 es una cifra que no le
  // corresponde a nada de lo que hay en pantalla.
  const mostrarResultado = hayMontos && !excedido;
  const simulacionVisible = mostrarResultado ? simulacion : null;
  const errorVisible = mostrarResultado ? error : null;
  // Cancelar una simulación no baja la bandera —el aborto sale por otro camino—,
  // así que el indicador de carga se deriva igual que el resto.
  const simulandoVisible = mostrarResultado && simulando;

  const puedeContinuar =
    mostrarResultado &&
    !simulandoVisible &&
    !!simulacionVisible &&
    !errorVisible &&
    !!calculadora &&
    textoCompleto;

  const alContinuar = useCallback(() => {
    if (!puedeContinuar || !simulacion || !calculadora) return;

    const guardado = entregarASolicitar({
      landing,
      productoId: calculadora.productId,
      varianteId: calculadora.variantId,
      productoSlug: perfil.productoSlug,
      productoNombre: perfil.productoNombre,
      montos,
      campos: perfil.campos,
      campoTexto: perfil.campoTexto
        ? { codigoFormulario: perfil.campoTexto.codigoFormulario, valor: textoCampo }
        : undefined,
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
  }, [
    puedeContinuar,
    simulacion,
    calculadora,
    landing,
    montos,
    textoCampo,
    institucion,
    perfil,
    router,
  ]);

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

  const titulo = perfil.titulo(institucion.nombre);

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
            {perfil.encabezado}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-2 sm:mb-3 font-['Baloo_2',_sans-serif] leading-tight">
            {titulo}
          </h1>
          <p className="mx-auto max-w-xl px-2 text-sm sm:text-base md:text-lg text-neutral-600">
            {perfil.subtitulo}
          </p>

          {/*
            El aviso se repite acá aunque la franja del pie ya lo lleve: esta es
            la pantalla donde se elige el financiamiento, y el descargo tiene
            que estar a la vista al elegirlo, no a un scroll de distancia.
          */}
          <div className="mt-3">
            <AvisoLegal landing={landing} variante="suelto" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-neutral-800">
                {montoFijado !== null && perfil.montoFijo
                  ? perfil.montoFijo.titulo
                  : perfil.preguntaMontos}
              </h2>

              {montoFijado !== null ? (
                /*
                  Sin nada que elegir, el importe se muestra y no se pide. Un
                  campo de solo lectura con el número adentro invita a tocarlo y
                  a preguntarse por qué no responde.
                */
                <div className="rounded-xl border border-indigo-100 bg-[#eef0ff] px-5 py-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                    {perfil.montoFijo?.etiqueta ?? 'Monto a financiar'}
                  </p>
                  <p className="mt-1 text-4xl font-bold text-neutral-800 font-['Baloo_2',_sans-serif] sm:text-5xl">
                    {formatearSoles(montoFijado)}
                  </p>
                  {perfil.montoFijo?.nota && (
                    <p className="mt-1.5 text-xs text-neutral-500">{perfil.montoFijo.nota}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/*
                    El perfil decide cuántos importes se piden. El que no se pide
                    queda en cero, que es un valor válido del modelo: lo que se
                    financia es la suma, y el backend valida esa suma.
                  */}
                  {perfil.campos.map((campo) => (
                    <CampoMonto
                      key={campo.clave}
                      etiqueta={campo.etiqueta}
                      valor={montos[campo.clave]}
                      placeholder={campo.placeholder}
                      ayuda={campo.ayuda}
                      onCambio={(valor) =>
                        setMontosEscritos((previo) => ({ ...previo, [campo.clave]: valor }))
                      }
                    />
                  ))}

                  <div
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                      excedido ? 'bg-red-50' : 'bg-neutral-50'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        excedido ? 'text-red-700' : 'text-neutral-700'
                      }`}
                    >
                      Monto total a financiar
                    </span>
                    <span
                      className={`text-lg font-bold ${excedido ? 'text-red-700' : 'text-neutral-800'}`}
                    >
                      {formatearSoles(total)}
                    </span>
                  </div>

                  {excedido && (
                    <p className="flex gap-2 text-xs leading-relaxed text-red-700" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        El total supera el máximo de
                        <strong className="font-semibold"> {formatearSoles(topeMaximo)} </strong>
                        que podemos financiar. Ajusta los montos para continuar.
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/*
                El dato de texto se pide en la misma tarjeta que el importe: los
                dos salen del mismo trámite y se copian de la misma pantalla.
              */}
              {perfil.campoTexto && (
                <div className="mt-5">
                  <CampoTexto
                    campo={perfil.campoTexto}
                    valor={textoCampo}
                    onCambio={setTextoCampo}
                  />
                </div>
              )}

              {/* La ayuda explica cómo llegar al importe exacto. Con el importe
                  fijo no hay a qué llegar. */}
              {montoFijado === null && (
                <p className="mt-4 flex gap-2 text-xs leading-relaxed text-neutral-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <span>{perfil.ayudaMontos}</span>
                </p>
              )}
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
                {simulandoVisible ? (
                  <Loader2 className="mx-auto h-9 w-9 animate-spin text-[var(--color-primary)] opacity-60" />
                ) : (
                  formatearSoles(simulacionVisible?.cuotaMensual ?? 0)
                )}
              </p>
              <p
                className={`mt-1 text-center text-xs ${
                  excedido ? 'font-medium text-red-700' : 'text-neutral-500'
                }`}
              >
                {excedido
                  ? `Financiamos hasta ${formatearSoles(topeMaximo)}`
                  : hayMontos
                    ? `durante ${plazo} meses`
                    : 'Ingresa un monto para calcular tu cuota'}
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
                {perfil.soloCronograma ? 'Ver cronograma' : 'Ver detalles'}
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
                onClick={() => router.push(perfil.rutaVolver(landing))}
                className="w-full flex items-center justify-center gap-2 mt-4 py-3 text-neutral-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/*
        Sin la franja del pie: esta pantalla ya muestra el descargo bajo el
        título, al lado de la decisión, que es donde tiene que estar. Dejar las
        dos lo repite en la misma vista.
      */}
      <Footer
        data={footerData}
        landing={landing}
        agreementData={agreementData}
        mostrarAvisoLegal={false}
      />

      <DetalleFinanciamientoModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        simulacion={simulacionVisible}
        montos={montos}
        campos={perfil.campos}
        notaCronograma={perfil.notaCronograma}
        soloCronograma={perfil.soloCronograma}
      />
    </div>
  );
}

export default CalculadoraClient;
