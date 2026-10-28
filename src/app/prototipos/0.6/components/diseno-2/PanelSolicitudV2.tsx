'use client';

/**
 * "Tu solicitud" de Diseño 2 (BAL-4959).
 *
 * - Escritorio (`PanelSolicitudV2`): panel fijo a la derecha con imagen,
 *   nombre, plazo e inicial, regalo, cuota y "Cambiar plazo o inicial", y
 *   debajo "Registrados en la SBS · Envío gratis".
 * - Celular (`CabeceraSolicitudV2`): cabecera fija con el equipo y la cuota.
 *   Al tocarla se despliega el mismo selector. Al costado, "Paso X de N".
 *
 * NO calcula nada: la cuota de cada plazo e inicial sale de los planes del
 * backend que ya trae el producto (`paymentPlans`), y cambiar plazo o inicial
 * pasa por `useCondicionesDelPlan`, la misma regla de `SelectedProductBar`
 * (analytics, recálculo del contexto y condiciones fijas). Respeta
 * `term-selector-off` (`puedeCambiarPlazo`) y `product-image-off`
 * (`mostrarImagenProducto`).
 *
 * El regalo del combo y "1.ª cuota en {mes}" salen de las mismas fuentes que
 * el modal "Lo quiero": los regalos que el modal guardó en el producto y
 * `useMesPrimeraCuota`.
 *
 * `useDatosDelPanel` la llama `ShellV2` UNA sola vez y pasa `datos` a los dos
 * (escritorio y celular): los dos lo montan a la vez —uno escondido con CSS,
 * no desmontado— y llamar el hook en cada uno pedía "1.ª cuota en {mes}" al
 * backend por duplicado en cada paso (BAL-4959, hallazgo de la revisión).
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown, Gift, Laptop, Lock, Package, ShieldCheck, Tag, AlertTriangle, X } from 'lucide-react';

import { useProduct, type SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { useCondicionesDelPlan } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/useCondicionesDelPlan';
import { TermSelect } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/TermSelect';
import { getTermUnit } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/etiquetaDePlazo';
import { formatCuotaDeLanding, sufijoDeFrecuencia } from '@/app/prototipos/0.6/utils/formatCuota';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import {
  COUPON_PENDING_DOCUMENT_SHORT,
  couponPendingDocument,
} from '@/app/prototipos/0.6/utils/couponDocument';
import { CouponInput, useCuponVisible, useQuitarCupon } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon';
import { useMesPrimeraCuota } from '../lo-quiero/useMesPrimeraCuota';
import { ProgresoMovilV2 } from './ProgresoV2';
import { transicionFlecha, useMenosMovimiento, usePulsoAlCambiar } from './movimiento';
import { PlegableV2 } from './PlegableV2';
import { PRESION_V2 } from './campos/estilosV2';
import { EVENTO_ABRIR_PLAZO_V2 } from './guardasV2';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';

/** Escritorio (`lg`): ahí manda el panel; abajo de eso, la cabecera. */
function esEscritorio(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 1024px)').matches;
}

/**
 * El aviso de tope de cuota pide abrir "Cambiar plazo o inicial" (BAL-4969,
 * casuísticas). Solo responde el que se ve: el panel en escritorio, la
 * cabecera en celular (los dos están montados a la vez).
 */
function useAbrirAlPedirPlazo(enEscritorio: boolean, abrir: () => void) {
  useEffect(() => {
    const alPedir = () => {
      if (esEscritorio() === enEscritorio) abrir();
    };
    window.addEventListener(EVENTO_ABRIR_PLAZO_V2, alPedir);
    return () => window.removeEventListener(EVENTO_ABRIR_PLAZO_V2, alPedir);
  }, [enEscritorio, abrir]);
}

/** Con más plazos que esto, o con armadas, el selector es una lista. */
const MAX_BOTONES_DE_PLAZO = 6;

/**
 * La cuota de un plazo con la inicial que ya tiene elegida: del plan del
 * backend. Si ese plazo no tiene una opción para esa inicial, no hay cuota
 * que mostrar: `null`, nunca la del primer plan disponible —mostrar la
 * cuota de OTRA inicial sería mentir el número (BAL-4959, hallazgo de la
 * revisión)—.
 */
export function cuotaDelPlazo(producto: SelectedProduct, term: number): number | null {
  const plan = producto.paymentPlans?.find((p) => p.term === term);
  const opcion = plan?.options?.find((o) => o.initialPercent === producto.initialPercent);
  return typeof opcion?.monthlyQuota === 'number' ? opcion.monthlyQuota : null;
}

/**
 * Todo lo que necesitan el panel y la cabecera. `ShellV2` la llama una sola
 * vez (no cada uno de los dos) y pasa el resultado por prop.
 */
export function useDatosDelPanel(condicionesFijas: boolean) {
  const product = useProduct();
  const layout = useLayout();
  const condiciones = useCondicionesDelPlan(condicionesFijas);
  const { landingSlug } = condiciones;
  const productos = product.getAllProducts();
  const principal = productos[0] ?? null;
  const mesPrimeraCuota = useMesPrimeraCuota(landingSlug, !!layout.deferredPayment?.enabled);

  const precio = (n: number) => `S/${formatCuotaDeLanding(n, landingSlug)}`;
  const plazo = principal ? (principal.term ?? principal.months) : 0;
  const frecuencia = principal?.paymentFrequency;
  const inicialTotal = productos.reduce((s, p) => s + (p.initialAmount || 0), 0);
  // Plazo e inicial por separado: el panel de escritorio los pone en su fila
  // (BAL-5203); la cabecera de celular, juntos en la leyenda.
  const textoPlazo = principal ? `${plazo} ${getTermUnit(plazo, frecuencia)}` : '';
  const textoInicial = inicialTotal > 0 ? precio(inicialTotal) : 'Sin inicial';
  const leyenda = principal
    ? [textoPlazo, inicialTotal > 0 ? `Inicial ${textoInicial}` : textoInicial].join(' · ')
    : '';
  const nombre = productos.length > 1 ? `${productos.length} equipos` : principal?.shortName || principal?.name || '';

  const opcionesInicial = principal ? product.getInitialOptionsForProduct(principal.id) : [];
  const puedePlazo = layout.puedeCambiarPlazo && !condiciones.congelada && condiciones.termOptions.length > 1;
  const puedeInicial = !condiciones.congelada && opcionesInicial.length > 1;

  return {
    ...product,
    ...condiciones,
    landingSlug,
    productos,
    principal,
    precio,
    plazo,
    frecuencia,
    leyenda,
    textoPlazo,
    textoInicial,
    nombre,
    total: product.getTotalMonthlyPayment(),
    cuotaEquipo: productos.reduce((s, p) => s + (p.monthlyPayment || 0), 0),
    cuotaAccesorios: product.selectedAccessories.reduce((s, a) => s + a.monthlyQuota, 0),
    extras: extrasDeLaCuota(product.selectedAccessories, product.selectedInsurances),
    regalos: principal?.regalos ?? [],
    mesPrimeraCuota,
    mostrarImagen: layout.mostrarImagenProducto,
    opcionesInicial,
    puedePlazo,
    puedeInicial,
    hayQueElegir: puedePlazo || puedeInicial,
  };
}

type DatosDelPanel = ReturnType<typeof useDatosDelPanel>;

export interface ExtraDeLaCuota {
  clave: string;
  nombre: string;
  cuota: number;
}

/**
 * Lo que se suma a la cuota del equipo (prototipo de Brenda, Paso 4: "Cuota de
 * tu laptop" y debajo cada extra con su "+S/x/mes"): los accesorios pagados y
 * las protecciones elegidas. Sin esto el panel daba un total que no cuadraba
 * con nada de lo que listaba (BAL-4969, E2E bug 5).
 */
export function extrasDeLaCuota(
  accesorios: { id: string; name: string; monthlyQuota: number }[] | undefined,
  seguros: { id: string; name: string; monthlyPrice: number }[] | undefined,
): ExtraDeLaCuota[] {
  return [
    ...(accesorios ?? [])
      .filter((a) => (a.monthlyQuota || 0) > 0)
      .map((a) => ({ clave: `acc-${a.id}`, nombre: a.name, cuota: a.monthlyQuota })),
    ...(seguros ?? [])
      .filter((p) => (p.monthlyPrice || 0) > 0)
      .map((p) => ({ clave: `seg-${p.id}`, nombre: p.name, cuota: p.monthlyPrice })),
  ];
}

/** El desglose de la cuota; sin extras no se pinta (el total ya lo dice todo). */
function DesgloseDeCuota({ datos, className = '' }: { datos: DatosDelPanel; className?: string }) {
  const extras = datos.extras ?? [];
  if (extras.length === 0) return null;
  const sufijo = sufijoDeFrecuencia(datos.frecuencia);
  return (
    <dl className={`space-y-1.5 text-sm ${className}`} data-desglose-v2>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="text-[var(--d2-texto-2)]">Cuota de tu equipo</dt>
        <dd className="font-semibold text-[var(--d2-texto)] whitespace-nowrap">{datos.precio(datos.cuotaEquipo)}{sufijo}</dd>
      </div>
      {extras.map((e) => (
        <div key={e.clave} className="flex items-baseline justify-between gap-2">
          <dt className="min-w-0 text-[var(--d2-texto-2)]">{e.nombre}</dt>
          <dd className="font-semibold text-[var(--d2-texto)] whitespace-nowrap">+{datos.precio(e.cuota)}{sufijo}</dd>
        </div>
      ))}
      <div className="h-px bg-[var(--d2-borde)]" aria-hidden />
    </dl>
  );
}

function ImagenEquipo({ datos, tam }: { datos: DatosDelPanel; tam: number }) {
  const { principal, productos } = datos;
  if (!principal) return null;
  if (productos.length === 1 && principal.image) {
    return <Image src={principal.image} alt={principal.name} width={tam} height={tam} className="object-contain" style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }} />;
  }
  return <Package className="w-1/2 h-1/2 text-[var(--d2-icono-vacio)]" aria-hidden />;
}

function ChipsDelPanel({ datos }: { datos: DatosDelPanel }) {
  const { regalos, mesPrimeraCuota } = datos;
  if (regalos.length === 0 && !mesPrimeraCuota) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {regalos.map((r) => (
        <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--d2-ok-suave-2)] px-2.5 py-1 text-xs font-semibold text-[var(--d2-ok-texto)]">
          <Gift className="h-3.5 w-3.5" aria-hidden />
          {r.name} de regalo
        </span>
      ))}
      {mesPrimeraCuota && (
        <span className="inline-flex items-center rounded-full bg-[var(--d2-ok-suave-2)] px-2.5 py-1 text-xs font-semibold text-[var(--d2-ok-texto)]">
          1.ª cuota en {mesPrimeraCuota}
        </span>
      )}
    </div>
  );
}

/** Los botones de plazo (cada uno con su cuota) y los de cuota inicial. */
function SelectorPlazoInicial({ datos, codigoDelPaso }: { datos: DatosDelPanel; codigoDelPaso?: string }) {
  const { principal, puedePlazo, puedeInicial, termOptions, termLabels, plazo, frecuencia, handleTermChange, handleInitialChange, opcionesInicial, precio } = datos;
  const tracker = useEventTrackerOptional();
  if (!principal) return null;
  // Elegir en «Cambiar plazo o inicial» (BAL-5207). Solo si cambia: tocar lo
  // que ya está elegido no es elegir. El cambio en sí sigue siendo el de
  // siempre (`handleTermChange` / `handleInitialChange`).
  const elegirPlazo = (t: number) => {
    if (t !== plazo) tracker?.track('plan_term_change_panel', { term: t, step_code: codigoDelPaso });
    handleTermChange(t);
  };
  const elegirInicial = (percent: number) => {
    if (percent !== principal.initialPercent) {
      tracker?.track('plan_initial_change_panel', { initial_percent: percent, step_code: codigoDelPaso });
    }
    handleInitialChange(principal.id, principal.initialPercent, percent);
  };
  const conBotones = termLabels.size === 0 && termOptions.length <= MAX_BOTONES_DE_PLAZO;

  return (
    <div className="space-y-3">
      {puedePlazo && (
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-bold text-[var(--d2-texto)]">Plazo</legend>
          {conBotones ? (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${termOptions.length}, minmax(0, 1fr))` }}>
              {termOptions.map((t) => {
                const elegido = t === plazo;
                const cuota = cuotaDelPlazo(principal, t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={elegido}
                    onClick={() => elegirPlazo(t)}
                    className={`flex min-h-[48px] flex-col items-center justify-center rounded-lg border px-1 py-1 leading-tight transition-[color,background-color,border-color,transform] duration-150 ${PRESION_V2} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                      elegido
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                        : 'border-[var(--d2-borde-control)] bg-[var(--d2-tarjeta)] text-[var(--d2-texto)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    <span className="text-sm font-bold">{t}</span>
                    <span className={`text-[10px] ${elegido ? 'text-[var(--color-on-primary)] opacity-90' : 'text-[var(--d2-texto-suave)]'}`}>{getTermUnit(t, frecuencia)}</span>
                    {cuota !== null && (
                      <span className={`text-[10px] font-semibold ${elegido ? 'text-[var(--color-on-primary)]' : 'text-[var(--color-primary-text)]'}`}>{precio(cuota)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <TermSelect
              value={plazo}
              options={termOptions}
              onChange={elegirPlazo}
              frequency={frecuencia}
              labels={termLabels}
            />
          )}
        </fieldset>
      )}
      {puedeInicial && (
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-bold text-[var(--d2-texto)]">
            Cuota inicial <span className="font-normal text-[var(--d2-texto-suave)]">(opcional)</span>
          </legend>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(opcionesInicial.length, 3)}, minmax(0, 1fr))` }}>
            {opcionesInicial.map((o) => {
              const elegido = principal.initialPercent === o.percent;
              return (
                <button
                  key={o.percent}
                  type="button"
                  aria-pressed={elegido}
                  onClick={() => elegirInicial(o.percent)}
                  className={`min-h-[44px] rounded-lg border px-2 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-150 ${PRESION_V2} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                    elegido
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary-text)]'
                      : 'border-[var(--d2-borde-control)] bg-[var(--d2-tarjeta)] text-[var(--d2-texto)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}

function AvisoTope({ datos }: { datos: DatosDelPanel }) {
  if (!datos.isOverQuotaLimit) return null;
  return (
    <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--d2-ambar-borde)] bg-[var(--d2-ambar-suave)] px-3 py-2 text-xs text-[var(--d2-ambar-texto)]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>La cuota supera el límite de S/{datos.maxMonthlyQuota}/mes.</span>
    </div>
  );
}

/** "Envío gratis" solo donde hay envío (no en Locker Truck ni en préstamos). */
function Confianza({ conEnvio = true }: { conEnvio?: boolean }) {
  return (
    <p className="mt-3 flex items-center gap-2 px-1 text-[13px] text-[var(--d2-texto-suave)]">
      <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--d2-ok-acento)]" aria-hidden />
      {conEnvio ? 'Registrados en la SBS · Envío gratis a todo el Perú' : 'Registrados en la SBS'}
    </p>
  );
}

/**
 * Cupón en los pasos (BAL-5203, escritorio): "¿Tienes un cupón?" abre la caja
 * de siempre (`CouponInput`: valida, aplica y reporta igual que en el modal
 * "Lo quiero"); aplicado, el código con "Quitar" (`useQuitarCupon`, el mismo
 * evento `coupon_removed`). El cupón de campaña que llegó por el link va con
 * candado y sin "Quitar", como en el modal. Si la landing no ofrece cupón y no
 * hay ninguno aplicado, no se pinta nada.
 */
function CuponDelPanel({ datos, obligatorio }: { datos: DatosDelPanel; obligatorio: boolean }) {
  const { appliedCoupon, landingSlug } = datos;
  const visible = useCuponVisible(landingSlug, obligatorio);
  const quitarCupon = useQuitarCupon();
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const cajaRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const filaRef = useRef<HTMLDivElement>(null);
  const codigo = appliedCoupon?.code ?? null;
  const abiertoRef = useRef(abierto);
  useEffect(() => {
    abiertoRef.current = abierto;
  }, [abierto]);

  // Cupón válido: la caja desaparece con la fila "sin cupón" (como el modal
  // chico del "Lo quiero") y el foco, que estaba en el campo que se va, pasa
  // al "Quitar" (o a la fila, si es de campaña) en vez de caer al <body>.
  useEffect(() => {
    if (!codigo || !abiertoRef.current) return;
    requestAnimationFrame(() => {
      const fila = filaRef.current;
      (fila?.querySelector<HTMLElement>('button') ?? fila)?.focus({ preventScroll: true });
    });
  }, [codigo]);
  // Al abrir, el foco va al campo del código.
  useEffect(() => {
    if (abierto) cajaRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }, [abierto]);

  if (!appliedCoupon && !visible) return null;
  const pendiente = appliedCoupon ? couponPendingDocument(appliedCoupon) : false;

  return (
    // dt + dd (+ dd con la caja): lo único que un <div> puede llevar dentro de un <dl>.
    <div ref={filaRef} tabIndex={-1} data-cupon-panel-v2={appliedCoupon ? 'aplicado' : 'vacio'} className="flex flex-wrap items-start justify-between gap-x-2 outline-none">
        {/* Misma altura que la primera fila de la derecha (botón de 36 px o chip
            de 28 px) y centrado: así «Cupón» queda a la altura del botón. */}
        <dt className={`flex items-center text-[var(--d2-texto-suave)] ${appliedCoupon ? 'min-h-[28px]' : 'min-h-[36px]'}`}>Cupón</dt>
        <dd className="flex min-w-0 flex-col items-end gap-0.5 text-right">
          {appliedCoupon ? (
            <>
              <span role="status" className="inline-flex min-h-[28px] items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--d2-ok-suave)] px-2.5 text-[13px] font-bold text-[var(--d2-ok-texto)]">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                {appliedCoupon.code}
                {appliedCoupon.lockedFromUrl && <Lock className="h-3.5 w-3.5" aria-label="Cupón de campaña: no se puede quitar" />}
              </span>
              {(pendiente || appliedCoupon.label) && (
                <span className="text-xs text-[var(--d2-texto-suave)]">{pendiente ? COUPON_PENDING_DOCUMENT_SHORT : appliedCoupon.label}</span>
              )}
              {!appliedCoupon.lockedFromUrl && (
                <button
                  type="button"
                  onClick={() => {
                    // Sin cupón vuelve el "¿Tienes un cupón?", con la caja cerrada.
                    setAbierto(false);
                    quitarCupon();
                    requestAnimationFrame(() => botonRef.current?.focus());
                  }}
                  aria-label={`Quitar cupón ${appliedCoupon.code}`}
                  className="-my-2 inline-flex min-h-[40px] items-center rounded-sm px-1 text-xs font-bold text-[var(--d2-ok-texto)] underline underline-offset-2 hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  Quitar
                </button>
              )}
            </>
          ) : (
            <button
              ref={botonRef}
              type="button"
              aria-expanded={abierto}
              aria-controls={id}
              onClick={() => setAbierto((v) => !v)}
              className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-xl border-[1.5px] border-dashed border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.07)] px-3 text-[13px] font-bold text-[var(--color-primary-text)] cursor-pointer transition-colors duration-150 hover:bg-[rgba(var(--color-primary-rgb),0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              {abierto ? <X className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              ¿Tienes un cupón?
              {obligatorio && <span className="font-semibold opacity-80"> (obligatorio)</span>}
            </button>
          )}
        </dd>
      {!appliedCoupon && (
        <dd className="basis-full">
          <PlegableV2 abierto={abierto} id={id} role="region" aria-label="Ingresa tu cupón" contenidoRef={cajaRef} classNameContenido="mt-2">
            <CouponInput compacto isRequired={obligatorio} />
          </PlegableV2>
        </dd>
      )}
    </div>
  );
}

/**
 * Plazo, inicial y cupón del panel de escritorio (BAL-5203, pedido de Brenda):
 * cada uno en su fila, en vez de la leyenda "24 meses · Sin inicial".
 */
function CondicionesDelPanel({ datos, cuponObligatorio }: { datos: DatosDelPanel; cuponObligatorio: boolean }) {
  return (
    <dl data-condiciones-panel-v2 className="mt-2 space-y-1.5 text-[13px]">
      <div className="flex items-baseline justify-between gap-2">
        <dt className="text-[var(--d2-texto-suave)]">Plazo</dt>
        <dd className="font-semibold text-[var(--d2-texto)]">{datos.textoPlazo}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="text-[var(--d2-texto-suave)]">Inicial</dt>
        <dd className="font-semibold text-[var(--d2-texto)]">{datos.textoInicial}</dd>
      </div>
      <CuponDelPanel datos={datos} obligatorio={cuponObligatorio} />
    </dl>
  );
}

// ─── Escritorio ─────────────────────────────────────────────────────────────

/** "Día 3 de cada mes" para el panel del paso que envía; `null` sin elegir. */
export function textoDelDiaDePago(valor: unknown): string | null {
  const dia = Number(Array.isArray(valor) ? valor[0] : valor);
  return Number.isInteger(dia) && dia > 0 ? `Día ${dia} de cada mes` : null;
}

/**
 * Paso que envía (prototipo de Brenda, Paso 4): el panel cierra como un
 * ticket —línea punteada con muescas—, muestra la cuota mensual total y el
 * día de pago, y lleva su propio "Enviar solicitud".
 */
export interface EnvioDelPanel {
  texto: string;
  onEnviar: () => void;
  deshabilitado: boolean;
  ocupado: boolean;
  /** "Día 3 de cada mes", o `null` mientras no lo elige. */
  diaDePago: string | null;
  /** El formulario pide día de pago. Sin él, la fila no va (BAL-4969). */
  conDiaDePago?: boolean;
}

export function PanelSolicitudV2({
  datos,
  envio,
  conEnvio = true,
  cuponObligatorio = false,
  codigoDelPaso,
}: {
  datos: DatosDelPanel;
  envio?: EnvioDelPanel | null;
  conEnvio?: boolean;
  /** La landing pide el cupón para continuar: el botón lo dice. */
  cuponObligatorio?: boolean;
  /** `step.code` del paso: va como `step_code` en los eventos del panel (BAL-5207). */
  codigoDelPaso?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const tracker = useEventTrackerOptional();
  // «Cambiar plazo o inicial» por la persona (BAL-5207). La apertura que pide
  // el aviso de tope (`useAbrirAlPedirPlazo`) no pasa por acá.
  const alternarSelector = () => {
    const nuevo = !abierto;
    setAbierto(nuevo);
    tracker?.track('plan_change_panel_toggle', { step_code: codigoDelPaso, abierto: nuevo });
  };
  const idSelector = useId();
  const menos = useMenosMovimiento();
  const selectorRef = useRef<HTMLDivElement>(null);
  const abrirSelector = useCallback(() => {
    setAbierto(true);
    requestAnimationFrame(() => selectorRef.current?.scrollIntoView?.({ block: 'nearest' }));
  }, []);
  useAbrirAlPedirPlazo(true, abrirSelector);
  // La cuota cambió (plazo, inicial): pulso como el total del modal (`bcPulse`).
  const pulso = usePulsoAlCambiar(datos.total);
  // Sin producto principal no hay equipo ni cuota que mostrar.
  if (!datos.principal) return null;

  return (
    <aside aria-label="Tu solicitud">
      <div className="overflow-hidden rounded-2xl border border-[var(--d2-borde-tarjeta)] bg-[var(--d2-tarjeta)] shadow-md" style={{ boxShadow: 'inset 0 4px 0 0 var(--color-primary), 0 10px 28px rgba(30,34,48,0.06)' }}>
        <div className="bg-[var(--d2-marca-suave)] px-5 pt-5 pb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--d2-texto-2)]">Tu solicitud</p>
          {datos.mostrarImagen && (
            <div className="mx-auto mt-3 flex h-28 w-36 items-center justify-center">
              <ImagenEquipo datos={datos} tam={140} />
            </div>
          )}
          <p className="mt-3 text-[17px] font-bold leading-tight text-[var(--d2-texto)]">{datos.nombre}</p>
          <CondicionesDelPanel datos={datos} cuponObligatorio={cuponObligatorio} />
          <ChipsDelPanel datos={datos} />
        </div>
        {envio && (
          // Línea de ticket con muescas a los lados (prototipo, Paso 4).
          <div className="relative h-0 border-t-2 border-dashed border-[var(--d2-borde-campo)]" aria-hidden>
            <span className="absolute -left-[9px] -top-[9px] h-4 w-4 rounded-full border border-[var(--d2-borde-tarjeta)] bg-[var(--d2-fondo)] [clip-path:inset(0_0_0_50%)]" />
            <span className="absolute -right-[9px] -top-[9px] h-4 w-4 rounded-full border border-[var(--d2-borde-tarjeta)] bg-[var(--d2-fondo)] [clip-path:inset(0_50%_0_0)]" />
          </div>
        )}
        <div className="px-5 pt-4 pb-5">
          <DesgloseDeCuota datos={datos} className="mb-2" />
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[15px] font-bold text-[var(--d2-texto)]">{datos.frecuencia === 'semanal' ? 'Cuota semanal' : datos.frecuencia === 'quincenal' ? 'Cuota quincenal' : 'Cuota mensual'}{envio ? ' total' : ''}</span>
            <span className={`inline-block origin-right font-['Baloo_2',_sans-serif] text-2xl font-bold ${pulso} ${datos.isOverQuotaLimit ? 'text-[var(--d2-error-rojo)]' : 'text-[var(--color-primary-text)]'}`}>
              {datos.precio(datos.total)}
              <span className="text-sm font-semibold">{sufijoDeFrecuencia(datos.frecuencia)}</span>
            </span>
          </div>
          <AvisoTope datos={datos} />
          {envio && (
            <>
              {envio.conDiaDePago !== false && (
                <div className="mt-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-[var(--d2-texto-2)]">Día de pago</span>
                  {envio.diaDePago ? (
                    <span className="font-semibold text-[var(--d2-texto)]">{envio.diaDePago}</span>
                  ) : (
                    <span className="italic text-[var(--d2-texto-tenue)]">Por elegir</span>
                  )}
                </div>
              )}
              {/* En el resumen también se puede cambiar plazo o inicial, igual
                  que en los pasos anteriores (Emilio, 27-oct). El aviso de tope
                  lo abre solo. */}
              {datos.hayQueElegir && (
                <>
                  <button
                    type="button"
                    aria-expanded={abierto}
                    aria-controls={`${idSelector}-envio`}
                    onClick={alternarSelector}
                    className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-bold text-[var(--color-primary-text)] cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    Cambiar plazo o inicial
                    <ChevronDown className={`h-4 w-4 ${abierto ? 'rotate-180' : ''}`} style={transicionFlecha(abierto, menos)} aria-hidden />
                  </button>
                  <PlegableV2 abierto={abierto} id={`${idSelector}-envio`} contenidoRef={selectorRef} classNameContenido="mt-1 border-t border-[var(--d2-borde)] pt-3">
                    <SelectorPlazoInicial datos={datos} codigoDelPaso={codigoDelPaso} />
                  </PlegableV2>
                </>
              )}
              <button
                type="button"
                data-enviar-panel-v2
                onClick={envio.onEnviar}
                disabled={envio.deshabilitado}
                className={`mt-4 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl text-[17px] font-bold shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                  envio.deshabilitado
                    ? 'bg-[var(--d2-boton-apagado)] text-[var(--d2-boton-apagado-texto)] shadow-none cursor-not-allowed'
                    : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-90 cursor-pointer'
                }`}
              >
                {envio.ocupado && <span className="h-5 w-5 animate-spin motion-reduce:animate-none rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
                {envio.texto}
              </button>
            </>
          )}
          {!envio && datos.hayQueElegir && (
            <>
              <button
                type="button"
                aria-expanded={abierto}
                aria-controls={idSelector}
                onClick={alternarSelector}
                className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-bold text-[var(--color-primary-text)] cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                Cambiar plazo o inicial
                <ChevronDown className={`h-4 w-4 ${abierto ? 'rotate-180' : ''}`} style={transicionFlecha(abierto, menos)} aria-hidden />
              </button>
              <PlegableV2 abierto={abierto} id={idSelector} contenidoRef={selectorRef} classNameContenido="mt-1 border-t border-[var(--d2-borde)] pt-3">
                <SelectorPlazoInicial datos={datos} codigoDelPaso={codigoDelPaso} />
              </PlegableV2>
            </>
          )}
        </div>
      </div>
      <Confianza conEnvio={conEnvio} />
    </aside>
  );
}

// ─── Celular ────────────────────────────────────────────────────────────────

export function CabeceraSolicitudV2({
  datos,
  indiceActual,
  totalPasos,
  landing,
  codigoDelPaso,
}: {
  datos: DatosDelPanel;
  indiceActual: number;
  totalPasos: number;
  landing: string;
  /** `step.code` del paso: va como `step_code` en los eventos (BAL-5207). */
  codigoDelPaso?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const tracker = useEventTrackerOptional();
  // En celular «Cambiar plazo o inicial» es este desplegable (BAL-5207): se
  // registra cuando la persona lo abre o lo cierra —el botón, Escape o el
  // fondo—, no cuando lo abre el aviso de tope.
  const cambiarPorGesto = useCallback(
    (nuevo: boolean) => {
      setAbierto(nuevo);
      tracker?.track('plan_change_panel_toggle', { step_code: codigoDelPaso, abierto: nuevo });
    },
    [tracker, codigoDelPaso],
  );
  const idSelector = useId();
  const menos = useMenosMovimiento();
  const panelRef = useRef<HTMLDivElement>(null);
  const pulso = usePulsoAlCambiar(datos.total);
  const abrirDesplegable = useCallback(() => setAbierto(true), []);
  useAbrirAlPedirPlazo(false, abrirDesplegable);

  // Escape cierra el desplegable.
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cambiarPorGesto(false);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto, cambiarPorGesto]);

  // Al abrir: el foco entra al panel (el primer elemento enfocable, o el
  // panel mismo si no hay ninguno) y el scroll de fondo se bloquea — el
  // desplegable queda encima de la página, no adentro de un contenedor con
  // su propio scroll (BAL-4959, hallazgo de la revisión de accesibilidad).
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const nodo = panelRef.current;
    const primero = nodo?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (primero ?? nodo)?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierto]);

  const numero = totalPasos > 0 ? Math.min(Math.max(indiceActual, 0), totalPasos - 1) + 1 : 0;
  const detalleEquipo = datos.principal?.specs
    ? [datos.principal.specs.processor, datos.principal.specs.ram, datos.principal.specs.storage].filter(Boolean).join(' · ')
    : '';

  return (
    <header className="lg:hidden fixed inset-x-0 top-0 z-40" data-cabecera-v2>
      {abierto && (
        <div className="d2-fundido fixed inset-0 bg-black/20" aria-hidden onClick={() => cambiarPorGesto(false)} />
      )}
      <div className="relative border-b border-[var(--d2-borde)] bg-[var(--d2-marca-suave)] shadow-[0_2px_10px_rgba(30,34,48,0.06)]">
        <div className="flex items-center pr-3.5">
          {datos.principal ? (
            <button
              type="button"
              aria-expanded={abierto}
              // La caja del desplegable (`PlegableV2`) queda siempre en el
              // DOM, así que el id nunca es una referencia rota (BAL-4959).
              aria-controls={idSelector}
              onClick={() => cambiarPorGesto(!abierto)}
              disabled={!datos.hayQueElegir && datos.regalos.length === 0 && !datos.extras?.length && !detalleEquipo}
              className="flex min-h-[58px] min-w-0 flex-1 items-center gap-3 py-2 pl-4 pr-1.5 text-left cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
                {datos.mostrarImagen && datos.principal?.image && datos.productos.length === 1 ? (
                  <span className="flex h-full w-full items-center justify-center bg-[var(--d2-tarjeta)]">
                    <ImagenEquipo datos={datos} tam={36} />
                  </span>
                ) : (
                  <Laptop className="h-5 w-5" aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold text-[var(--d2-texto)]">{datos.nombre}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-text)]">
                  <span className="truncate">
                    <span className={`inline-block origin-left ${pulso}`}>{datos.precio(datos.total)}{sufijoDeFrecuencia(datos.frecuencia)}</span> · {datos.leyenda}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 ${abierto ? 'rotate-180' : ''}`} style={transicionFlecha(abierto, menos)} aria-hidden />
                </span>
              </span>
            </button>
          ) : (
            <span className="flex-1" />
          )}
          <span className="shrink-0 text-xs text-[var(--d2-texto-suave)]">
            Paso <strong className="font-bold text-[var(--d2-texto)]">{numero}</strong> de {totalPasos}
          </span>
        </div>
        <ProgresoMovilV2 indiceActual={indiceActual} total={totalPasos} />

        {datos.principal && (
          <PlegableV2 abierto={abierto} id={idSelector}>
          <div
            ref={panelRef}
            tabIndex={-1}
            className="max-h-[70vh] overflow-y-auto border-t border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] px-4 pt-3 pb-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {detalleEquipo && <p className="text-xs text-[var(--d2-texto-suave)]">{detalleEquipo}</p>}
                {datos.regalos.map((r) => (
                  <p key={r.id} className="text-xs font-semibold text-[var(--d2-ok-texto)]">+ {r.name} de regalo</p>
                ))}
                {datos.mesPrimeraCuota && (
                  <p className="text-xs font-semibold text-[var(--d2-ok-texto)]">1.ª cuota en {datos.mesPrimeraCuota}</p>
                )}
              </div>
              {/* Un préstamo de efectivo no tiene equipo que cambiar (BAL-4969). */}
              {String(datos.principal.type ?? '').toLowerCase() !== 'efectivo' && (
                <Link href={routes.catalogo(landing)} className="shrink-0 text-xs font-semibold text-[var(--color-primary-text)] underline min-h-[44px] inline-flex items-start">
                  Cambiar equipo
                </Link>
              )}
            </div>
            <DesgloseDeCuota datos={datos} className="mt-2" />
            <AvisoTope datos={datos} />
            <div className="mt-2">
              <SelectorPlazoInicial datos={datos} codigoDelPaso={codigoDelPaso} />
            </div>
          </div>
          </PlegableV2>
        )}
      </div>
    </header>
  );
}

/** Alto que ocupa la cabecera fija de celular (58 + 3 de la barra + borde). */
export const ALTO_CABECERA_MOVIL = 62;

export default PanelSolicitudV2;
