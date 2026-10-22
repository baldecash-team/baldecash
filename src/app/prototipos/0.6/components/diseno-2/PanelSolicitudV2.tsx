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

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Gift, Laptop, Package, ShieldCheck, Tag, AlertTriangle } from 'lucide-react';

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
import { useMesPrimeraCuota } from '../lo-quiero/useMesPrimeraCuota';
import { ProgresoMovilV2 } from './ProgresoV2';

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
  const leyenda = principal
    ? [
        `${plazo} ${getTermUnit(plazo, frecuencia)}`,
        inicialTotal > 0 ? `Inicial ${precio(inicialTotal)}` : 'Sin inicial',
      ].join(' · ')
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
    nombre,
    total: product.getTotalMonthlyPayment(),
    cuotaEquipo: productos.reduce((s, p) => s + (p.monthlyPayment || 0), 0),
    cuotaAccesorios: product.selectedAccessories.reduce((s, a) => s + a.monthlyQuota, 0),
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

function ImagenEquipo({ datos, tam }: { datos: DatosDelPanel; tam: number }) {
  const { principal, productos } = datos;
  if (!principal) return null;
  if (productos.length === 1 && principal.image) {
    return <Image src={principal.image} alt={principal.name} width={tam} height={tam} className="object-contain" style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }} />;
  }
  return <Package className="w-1/2 h-1/2 text-neutral-300" aria-hidden />;
}

function ChipsDelPanel({ datos }: { datos: DatosDelPanel }) {
  const { regalos, appliedCoupon, mesPrimeraCuota } = datos;
  if (regalos.length === 0 && !appliedCoupon && !mesPrimeraCuota) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {regalos.map((r) => (
        <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F7F1] px-2.5 py-1 text-xs font-semibold text-[#0B6B5C]">
          <Gift className="h-3.5 w-3.5" aria-hidden />
          {r.name} de regalo
        </span>
      ))}
      {mesPrimeraCuota && (
        <span className="inline-flex items-center rounded-full bg-[#E6F7F1] px-2.5 py-1 text-xs font-semibold text-[#0B6B5C]">
          1.ª cuota en {mesPrimeraCuota}
        </span>
      )}
      {appliedCoupon && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
          <Tag className="h-3.5 w-3.5" aria-hidden />
          {appliedCoupon.code}
          <span className="font-normal">
            {couponPendingDocument(appliedCoupon) ? COUPON_PENDING_DOCUMENT_SHORT : appliedCoupon.label}
          </span>
        </span>
      )}
    </div>
  );
}

/** Los botones de plazo (cada uno con su cuota) y los de cuota inicial. */
function SelectorPlazoInicial({ datos }: { datos: DatosDelPanel }) {
  const { principal, puedePlazo, puedeInicial, termOptions, termLabels, plazo, frecuencia, handleTermChange, handleInitialChange, opcionesInicial, precio } = datos;
  if (!principal) return null;
  const conBotones = termLabels.size === 0 && termOptions.length <= MAX_BOTONES_DE_PLAZO;

  return (
    <div className="space-y-3">
      {puedePlazo && (
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-bold text-[#1E2230]">Plazo</legend>
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
                    onClick={() => handleTermChange(t)}
                    className={`flex min-h-[48px] flex-col items-center justify-center rounded-lg border px-1 py-1 leading-tight transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                      elegido
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : 'border-[#D5D9E6] bg-white text-[#1E2230] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    <span className="text-sm font-bold">{t}</span>
                    <span className={`text-[10px] ${elegido ? 'text-white/90' : 'text-[#5B6275]'}`}>{getTermUnit(t, frecuencia)}</span>
                    {cuota !== null && (
                      <span className={`text-[10px] font-semibold ${elegido ? 'text-white' : 'text-[var(--color-primary)]'}`}>{precio(cuota)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <TermSelect
              value={plazo}
              options={termOptions}
              onChange={handleTermChange}
              frequency={frecuencia}
              labels={termLabels}
            />
          )}
        </fieldset>
      )}
      {puedeInicial && (
        <fieldset>
          <legend className="mb-1.5 text-[13px] font-bold text-[#1E2230]">
            Cuota inicial <span className="font-normal text-[#5B6275]">(opcional)</span>
          </legend>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(opcionesInicial.length, 3)}, minmax(0, 1fr))` }}>
            {opcionesInicial.map((o) => {
              const elegido = principal.initialPercent === o.percent;
              return (
                <button
                  key={o.percent}
                  type="button"
                  aria-pressed={elegido}
                  onClick={() => handleInitialChange(principal.id, principal.initialPercent, o.percent)}
                  className={`min-h-[44px] rounded-lg border px-2 text-sm font-semibold transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 ${
                    elegido
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'border-[#D5D9E6] bg-white text-[#1E2230] hover:border-[var(--color-primary)]'
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
    <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>La cuota supera el límite de S/{datos.maxMonthlyQuota}/mes.</span>
    </div>
  );
}

function Confianza() {
  return (
    <p className="mt-3 flex items-center gap-2 px-1 text-[13px] text-[#5B6275]">
      <ShieldCheck className="h-4 w-4 shrink-0 text-[#0B8A6B]" aria-hidden />
      Registrados en la SBS · Envío gratis a todo el Perú
    </p>
  );
}

/**
 * "Ver detalle" (Paso 4, BAL-4966): el repaso de los datos ya llenados, con
 * su "Editar" que lleva a cada paso. Sin `detalle` (otro paso, o la landing
 * con `summary-off`) no se pinta nada.
 */
function VerDetalle({ detalle, className = '' }: { detalle?: React.ReactNode; className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  if (!detalle) return null;
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={abierto ? id : undefined}
        onClick={() => setAbierto((v) => !v)}
        data-ver-detalle-v2
        className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-bold text-[var(--color-primary)] cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        Ver detalle
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 motion-reduce:transition-none ${abierto ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {abierto && (
        <div id={id} role="region" aria-label="Detalle de tu solicitud" className="mt-2 space-y-3 text-left">
          {detalle}
        </div>
      )}
    </div>
  );
}

// ─── Escritorio ─────────────────────────────────────────────────────────────

export function PanelSolicitudV2({ datos, detalle }: { datos: DatosDelPanel; detalle?: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const idSelector = useId();
  if (!datos.principal) {
    // Sin producto principal no hay equipo ni cuota que mostrar, pero el
    // repaso del Paso 4 sigue: es lo que permite revisar y "Editar".
    if (!detalle) return null;
    return (
      <aside aria-label="Tu solicitud">
        <div className="rounded-2xl border border-[#AEB6EE] bg-[#F3F5FD] px-5 py-4" style={{ boxShadow: 'inset 0 4px 0 0 var(--color-primary)' }}>
          <div className="flex flex-wrap items-center justify-between gap-x-2 [&_[role=region]]:max-h-[60vh] [&_[role=region]]:overflow-y-auto [&_[role=region]]:basis-full">
            <p className="text-xs font-bold uppercase tracking-wide text-[#3A4052]">Tu solicitud</p>
            <VerDetalle detalle={detalle} className="contents" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Tu solicitud">
      <div className="overflow-hidden rounded-2xl border border-[#AEB6EE] bg-white shadow-md" style={{ boxShadow: 'inset 0 4px 0 0 var(--color-primary), 0 10px 28px rgba(30,34,48,0.06)' }}>
        <div className="bg-[#F3F5FD] px-5 pt-5 pb-4">
          {detalle ? (
            // Con "Ver detalle" el panel puede crecer más que la pantalla
            // (va fijo): el repaso abierto se desplaza dentro de su caja.
            <div className="flex flex-wrap items-center justify-between gap-x-2 [&_[role=region]]:max-h-[45vh] [&_[role=region]]:overflow-y-auto [&_[role=region]]:basis-full">
              <p className="text-xs font-bold uppercase tracking-wide text-[#3A4052]">Tu solicitud</p>
              <VerDetalle detalle={detalle} className="contents" />
            </div>
          ) : (
            <p className="text-xs font-bold uppercase tracking-wide text-[#3A4052]">Tu solicitud</p>
          )}
          {datos.mostrarImagen && (
            <div className="mx-auto mt-3 flex h-28 w-36 items-center justify-center">
              <ImagenEquipo datos={datos} tam={140} />
            </div>
          )}
          <p className="mt-3 text-[17px] font-bold leading-tight text-[#1E2230]">{datos.nombre}</p>
          <p className="mt-1 text-[13px] text-[#5B6275]">{datos.leyenda}</p>
          <ChipsDelPanel datos={datos} />
        </div>
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[15px] font-bold text-[#1E2230]">{datos.frecuencia === 'semanal' ? 'Cuota semanal' : datos.frecuencia === 'quincenal' ? 'Cuota quincenal' : 'Cuota mensual'}</span>
            <span className={`font-['Baloo_2',_sans-serif] text-2xl font-bold ${datos.isOverQuotaLimit ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>
              {datos.precio(datos.total)}
              <span className="text-sm font-semibold">{sufijoDeFrecuencia(datos.frecuencia)}</span>
            </span>
          </div>
          {datos.cuotaAccesorios > 0 && (
            <p className="mt-0.5 text-right text-xs text-[#5B6275]">
              Equipo {datos.precio(datos.cuotaEquipo)} + accesorios {datos.precio(datos.cuotaAccesorios)}
            </p>
          )}
          <AvisoTope datos={datos} />
          {datos.hayQueElegir && (
            <>
              <button
                type="button"
                aria-expanded={abierto}
                aria-controls={idSelector}
                onClick={() => setAbierto((v) => !v)}
                className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-bold text-[var(--color-primary)] cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                Cambiar plazo o inicial
                <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${abierto ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {abierto && (
                <div id={idSelector} className="mt-1 border-t border-[#E3E6EE] pt-3">
                  <SelectorPlazoInicial datos={datos} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Confianza />
    </aside>
  );
}

// ─── Celular ────────────────────────────────────────────────────────────────

export function CabeceraSolicitudV2({
  datos,
  indiceActual,
  totalPasos,
  landing,
  detalle,
}: {
  datos: DatosDelPanel;
  indiceActual: number;
  totalPasos: number;
  landing: string;
  /** "Ver detalle" del Paso 4 dentro del desplegable. */
  detalle?: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const idSelector = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape cierra el desplegable.
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto]);

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
        <div className="fixed inset-0 bg-black/20" aria-hidden onClick={() => setAbierto(false)} />
      )}
      <div className="relative border-b border-[#E3E6EE] bg-[#F3F5FD] shadow-[0_2px_10px_rgba(30,34,48,0.06)]">
        <div className="flex items-center pr-3.5">
          {datos.principal || detalle ? (
            <button
              type="button"
              aria-expanded={abierto}
              // Cerrado, el panel no está en el DOM: apuntar a su id sería
              // una referencia rota (BAL-4959, hallazgo de la revisión).
              aria-controls={abierto ? idSelector : undefined}
              onClick={() => setAbierto((v) => !v)}
              disabled={!datos.hayQueElegir && datos.regalos.length === 0 && !detalleEquipo && !detalle}
              className="flex min-h-[58px] min-w-0 flex-1 items-center gap-3 py-2 pl-4 pr-1.5 text-left cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] text-white">
                {datos.mostrarImagen && datos.principal?.image && datos.productos.length === 1 ? (
                  <span className="flex h-full w-full items-center justify-center bg-white">
                    <ImagenEquipo datos={datos} tam={36} />
                  </span>
                ) : (
                  <Laptop className="h-5 w-5" aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold text-[#1E2230]">{datos.principal ? datos.nombre : 'Tu solicitud'}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                  <span className="truncate">
                    {datos.principal
                      ? <>{datos.precio(datos.total)}{sufijoDeFrecuencia(datos.frecuencia)} · {datos.leyenda}</>
                      : 'Revisa tus datos'}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${abierto ? 'rotate-180' : ''}`} aria-hidden />
                </span>
              </span>
            </button>
          ) : (
            <span className="flex-1" />
          )}
          <span className="shrink-0 text-xs text-[#5B6275]">
            Paso <strong className="font-bold text-[#1E2230]">{numero}</strong> de {totalPasos}
          </span>
        </div>
        <ProgresoMovilV2 indiceActual={indiceActual} total={totalPasos} />

        {abierto && (datos.principal || detalle) && (
          <div
            ref={panelRef}
            id={idSelector}
            tabIndex={-1}
            className="max-h-[70vh] overflow-y-auto border-t border-[#E3E6EE] bg-white px-4 pt-3 pb-4"
          >
            {datos.principal && (<>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {detalleEquipo && <p className="text-xs text-[#5B6275]">{detalleEquipo}</p>}
                {datos.regalos.map((r) => (
                  <p key={r.id} className="text-xs font-semibold text-[#0B6B5C]">+ {r.name} de regalo</p>
                ))}
                {datos.mesPrimeraCuota && (
                  <p className="text-xs font-semibold text-[#0B6B5C]">1.ª cuota en {datos.mesPrimeraCuota}</p>
                )}
              </div>
              <Link href={routes.catalogo(landing)} className="shrink-0 text-xs font-semibold text-[var(--color-primary)] underline min-h-[44px] inline-flex items-start">
                Cambiar equipo
              </Link>
            </div>
            <AvisoTope datos={datos} />
            <div className="mt-2">
              <SelectorPlazoInicial datos={datos} />
            </div>
            </>)}
            <VerDetalle detalle={detalle} className={datos.principal ? 'mt-2 border-t border-[#E3E6EE] pt-1' : ''} />
          </div>
        )}
      </div>
    </header>
  );
}

/** Alto que ocupa la cabecera fija de celular (58 + 3 de la barra + borde). */
export const ALTO_CABECERA_MOVIL = 62;

export default PanelSolicitudV2;
