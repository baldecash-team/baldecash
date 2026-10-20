'use client';

/**
 * Modal de "Lo quiero" (BAL-4852, rediseño de Brenda).
 *
 * Reemplaza la pantalla intermedia de /solicitar cuando la landing trae el
 * ingrediente `lo-quiero-modal-on`: encima del catálogo o de la ficha se
 * ofrecen los accesorios sugeridos, la casilla de términos y el cupón, y de
 * ahí se pasa DIRECTO al primer paso del formulario.
 *
 * No calcula precios: la cuota del equipo es la que ya armó la card o la ficha
 * (la misma que llega hoy a /solicitar) y la de cada accesorio sale del mismo
 * endpoint que usa la sección de accesorios de /solicitar. El total es la suma
 * de esas cuotas, igual que el "Cuota total" de la intro.
 *
 * Todo lo que guarda va a las mismas claves que la intro de /solicitar
 * (producto, accesorios, cupón y casillas), así que el formulario no distingue
 * por dónde entró la persona. /solicitar sigue vivo para links directos y para
 * "retoma tu solicitud".
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, ArrowRight, CalendarClock, Check, ChevronDown, Package, Tag, X } from 'lucide-react';

import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { getLandingAccessories, resolveEcosistema } from '@/app/prototipos/0.6/services/landingApi';
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import {
  ProductProvider,
  useProduct,
  useProductOptional,
  type SelectedProduct,
} from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { WizardConfigProvider, useWizardConfig } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext';
import { useSessionOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/SessionContext';
import { CouponInput } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon';
import { AccessoryDetailModal } from '@/app/prototipos/0.6/[landing]/solicitar/components/upsell';
import { getTermUnit } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/etiquetaDePlazo';
import type { Accessory } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import { formatMoneyNoDecimals } from '@/app/prototipos/0.6/[landing]/solicitar/utils/formatMoney';
import { readConsentStorage, saveConsentStorage } from '@/app/prototipos/0.6/[landing]/solicitar/utils/consentStorage';
import { primerPasoRegular, slugDelPaso } from '@/app/prototipos/0.6/[landing]/solicitar/utils/primerPaso';
import { obtenerPrimeraFechaPago } from '@/app/prototipos/0.6/[landing]/solicitar/utils/primeraFechaPago';

export type LoQuieroOrigen = 'catalogo' | 'ficha';

interface LoQuieroModalProps {
  isOpen: boolean;
  onClose: () => void;
  origen: LoQuieroOrigen;
}

/** Cuántos accesorios se ven antes de "Ver todos". Pendiente de confirmar con Brenda. */
const ACCESORIOS_VISIBLES = 8;

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Plazo en cuotas literales, que es lo que espera el endpoint de accesorios.
 * Misma regla que `AccessoriesSection`: si el producto no trae `term` (la card
 * del catálogo a veces solo trae meses), se deriva por la frecuencia.
 */
function plazoEnCuotas(p: SelectedProduct | null): number {
  if (!p) return 24;
  if (p.term) return p.term;
  if (p.months) {
    if (p.paymentFrequency === 'semanal') return p.months * 4;
    if (p.paymentFrequency === 'quincenal') return p.months * 2;
    return p.months;
  }
  return 24;
}

/** La misma variante A/B de accesorios que asigna `AccessoriesSection`. */
function varianteAbAccesorios(): string {
  try {
    const guardada = sessionStorage.getItem('ab_accessories_variant');
    if (guardada) return guardada;
    const asignada = Math.random() < 0.5 ? 'A' : 'B';
    sessionStorage.setItem('ab_accessories_variant', asignada);
    return asignada;
  } catch {
    return 'A';
  }
}

function sufijoDeFrecuencia(freq?: string): string {
  if (freq === 'semanal') return '/sem';
  if (freq === 'quincenal') return '/qcn';
  return '/mes';
}

/**
 * Monta el modal solo cuando está abierto: así el producto que la card o la
 * ficha acaban de guardar ya está en storage cuando arrancan los providers.
 *
 * El catálogo ya trae su `ProductProvider` y se usa ese, para que el cupón de
 * campaña y el producto elegido sean los mismos que ve la página. La ficha no
 * tiene uno: el modal monta el suyo, que lee lo que la ficha guardó.
 */
export function LoQuieroModal({ isOpen, onClose, origen }: LoQuieroModalProps) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const productoExterno = useProductOptional();

  if (!isOpen) return null;

  const contenido = (
    <WizardConfigProvider slug={landing}>
      <LoQuieroModalContent onClose={onClose} origen={origen} landing={landing} />
    </WizardConfigProvider>
  );

  return productoExterno ? contenido : <ProductProvider landingSlug={landing}>{contenido}</ProductProvider>;
}

type EstadoAccesorios = 'cargando' | 'listo' | 'error';

function LoQuieroModalContent({
  onClose,
  origen,
  landing,
}: {
  onClose: () => void;
  origen: LoQuieroOrigen;
  landing: string;
}) {
  const router = useRouter();
  const analytics = useAnalytics();
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;
  const session = useSessionOptional();
  const { deferredPayment } = useLayout();
  const {
    selectedProduct,
    selectedAccessories,
    toggleAccessory,
    clearAccessories,
    appliedCoupon,
    isOverQuotaLimit,
    maxMonthlyQuota,
  } = useProduct();
  const { steps, isLoading: isConfigLoading, error: configError, badgeText } = useWizardConfig();
  const flujo = useSolicitarFlow({ slug: landing, previewKey });
  const { isCouponRequired } = flujo;
  const accesoriosHabilitados = !flujo.isLoading && flujo.isEnabled('accessories');

  const panelRef = useRef<HTMLDivElement>(null);
  const terminosRef = useRef<HTMLDivElement>(null);

  // ── Apertura: limpiar accesorios de un intento anterior + evento ──────────
  // La ficha guardaba el producto sin tocar los accesorios, así que un intento
  // abandonado los arrastraba al siguiente equipo.
  const productoId = selectedProduct?.id ?? null;
  useEffect(() => {
    clearAccessories();
    analytics.track('lo_quiero_modal_open', {
      product_id: productoId,
      origen,
      has_coupon: !!appliedCoupon,
    });
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Foco atrapado, Escape y scroll del fondo ──────────────────────────────
  const [detalle, setDetalle] = useState<Accessory | null>(null);
  const cerrarRef = useRef<(motivo: string) => void>(() => {});
  const detalleAbiertoRef = useRef(false);
  detalleAbiertoRef.current = !!detalle;

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      // Con el detalle del accesorio encima, el teclado es de ese modal.
      if (detalleAbiertoRef.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrarRef.current('escape');
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodos = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (nodos.length === 0) return;
      const primero = nodos[0];
      const ultimo = nodos[nodos.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && (activo === primero || activo === panelRef.current)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      } else if (!panelRef.current.contains(activo)) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflowPrevio;
      anterior?.focus?.();
    };
  }, []);

  // ── Accesorios: mismo endpoint y parámetros que /solicitar ────────────────
  const [accesorios, setAccesorios] = useState<Accessory[]>([]);
  const [estadoAcc, setEstadoAcc] = useState<EstadoAccesorios>('cargando');
  const [verTodos, setVerTodos] = useState(false);
  const plazo = plazoEnCuotas(selectedProduct);
  const frecuencia = selectedProduct?.paymentFrequency;

  useEffect(() => {
    if (flujo.isLoading) return;
    if (!accesoriosHabilitados || !selectedProduct) {
      setAccesorios([]);
      setEstadoAcc('listo');
      return;
    }
    let cancelado = false;
    setEstadoAcc('cargando');
    const tipo = selectedProduct.type?.toLowerCase() || 'laptop';
    getLandingAccessories(
      landing,
      [tipo],
      plazo,
      previewKey,
      frecuencia,
      varianteAbAccesorios(),
      resolveEcosistema(selectedProduct.brand, selectedProduct.type),
      session?.sessionUuid ?? null,
      true,
      selectedProduct.slug ?? null,
      selectedProduct.initialAmount ?? null,
      { lanzarError: true },
    )
      .then((api) => {
        if (cancelado) return;
        setAccesorios(
          api.map((acc) => ({
            id: acc.id,
            name: acc.name,
            description: acc.description || '',
            price: acc.price,
            monthlyQuota: acc.monthlyQuota,
            term: acc.term,
            image: acc.image || acc.thumbnail_url || '',
            thumbnailUrl: acc.image || acc.thumbnail_url,
            category: acc.category ?? { slug: 'otro', name: 'Otro' },
            isRecommended: acc.isRecommended || false,
            isMoltiTop: acc.isMoltiTop || false,
            compatibleWith: acc.compatibleWith || ['all'],
            specs: acc.specs || [],
            brand: acc.brand,
          })),
        );
        setEstadoAcc('listo');
      })
      .catch((error) => {
        if (cancelado) return;
        Sentry.captureException(error, {
          tags: { modulo: 'lo_quiero_modal', accion: 'cargar_accesorios', landing },
          extra: { product_id: selectedProduct.id, plazo, frecuencia },
        });
        setAccesorios([]);
        setEstadoAcc('error');
      });
    return () => {
      cancelado = true;
    };
    // El producto no cambia con el modal abierto: basta su id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landing, flujo.isLoading, accesoriosHabilitados, productoId, plazo, frecuencia, previewKey]);

  const hayAccesorios = accesoriosHabilitados && (estadoAcc === 'cargando' || accesorios.length > 0);
  const accesoriosVisibles = verTodos ? accesorios : accesorios.slice(0, ACCESORIOS_VISIBLES);

  const alternarAccesorio = useCallback(
    (acc: Accessory) => {
      const estaba = selectedAccessories.some((a) => a.id === acc.id);
      analytics.track('lo_quiero_modal_accessory_toggle', {
        accessory_id: String(acc.id),
        accessory_name: acc.name,
        action: estaba ? 'remove' : 'add',
        monthly_quota: acc.monthlyQuota,
        selected_count: selectedAccessories.length + (estaba ? -1 : 1),
        product_id: productoId,
      });
      // Los eventos de siempre, para que el embudo de accesorios no pierda
      // las altas que ahora pasan por el modal.
      if (estaba) {
        analytics.trackAccessoryRemove({ accessory_id: String(acc.id), source_product_id: productoId });
      } else {
        analytics.trackAccessoryAdd({
          accessory_id: String(acc.id),
          accessory_name: acc.name,
          price: acc.price ?? null,
          source_product_id: productoId,
        });
      }
      toggleAccessory(acc);
    },
    [selectedAccessories, analytics, productoId, toggleAccessory],
  );

  // ── Cupón ────────────────────────────────────────────────────────────────
  const [muestraCupon, setMuestraCupon] = useState(true);
  useEffect(() => {
    fetchLandingConfig(landing).then((cfg) => setMuestraCupon(cfg.features.has_coupon));
  }, [landing]);
  const [cuponAbierto, setCuponAbierto] = useState(false);
  const [errorCupon, setErrorCupon] = useState<string | null>(null);
  const cuponVisible = muestraCupon || isCouponRequired;
  const panelCuponAbierto = cuponVisible && (cuponAbierto || !!appliedCoupon || isCouponRequired);

  // Solo cuenta lo que se aplica DENTRO del modal: el de campaña que ya venía
  // del link lo reporta `CouponInput` con `source: 'url'`.
  const codigoAlAbrir = useRef(appliedCoupon?.code ?? null);
  useEffect(() => {
    const codigo = appliedCoupon?.code ?? null;
    if (!codigo) return;
    setErrorCupon(null);
    if (codigo === codigoAlAbrir.current) return;
    codigoAlAbrir.current = codigo;
    analytics.track('lo_quiero_modal_coupon_applied', {
      coupon_code: codigo,
      coupon_type: appliedCoupon?.couponType,
      product_id: productoId,
    });
  }, [appliedCoupon, analytics, productoId]);

  // ── Términos ─────────────────────────────────────────────────────────────
  // Arranca marcada si la persona ya había aceptado las dos en /solicitar.
  const [aceptaTerminos, setAceptaTerminos] = useState(() => {
    const c = readConsentStorage(landing);
    return c.acceptTerms && c.acceptPrivacy;
  });
  const [aceptaPromos, setAceptaPromos] = useState(false);
  const [errorTerminos, setErrorTerminos] = useState(false);

  // ── Cuota diferida: "1.ª cuota en <mes>" ─────────────────────────────────
  // El mes lo calcula ws2 (`first-payment-date`). Sin respuesta, no se muestra.
  const [mesPrimeraCuota, setMesPrimeraCuota] = useState<string | null>(null);
  const esDiferida = !!deferredPayment?.enabled;
  useEffect(() => {
    if (!esDiferida) return;
    let cancelado = false;
    obtenerPrimeraFechaPago(landing).then((iso) => {
      if (cancelado || !iso) return;
      const m = /^\d{4}-(\d{2})-\d{2}$/.exec(iso);
      const mes = m ? MESES[Number(m[1]) - 1] : undefined;
      if (mes) setMesPrimeraCuota(mes);
    });
    return () => {
      cancelado = true;
    };
  }, [esDiferida, landing]);

  // ── Totales (cuotas del backend, sin descuentos calculados acá) ───────────
  const cuotaEquipo = selectedProduct?.monthlyPayment ?? 0;
  const cuotaAccesorios = selectedAccessories.reduce((s, a) => s + a.monthlyQuota, 0);
  const total = cuotaEquipo + cuotaAccesorios;
  const n = selectedAccessories.length;
  const plazoVisible = selectedProduct?.term ?? selectedProduct?.months ?? plazo;
  const leyenda = [
    `${plazoVisible} ${getTermUnit(plazoVisible, frecuencia)}`,
    selectedProduct && selectedProduct.initialAmount > 0
      ? `inicial S/${formatMoneyNoDecimals(Math.floor(selectedProduct.initialAmount))}`
      : 'sin inicial',
    n > 0 ? `${n} ${n === 1 ? 'accesorio' : 'accesorios'}` : null,
    appliedCoupon ? 'con cupón' : null,
  ].filter(Boolean).join(' · ');

  // ── Primer paso del formulario ───────────────────────────────────────────
  const slugPrimerPaso = useMemo(() => slugDelPaso(primerPasoRegular(steps)), [steps]);
  const [navegando, setNavegando] = useState(false);
  const preparando = isConfigLoading || flujo.isLoading;

  const cerrar = useCallback(
    (motivo: string) => {
      analytics.track('lo_quiero_modal_close', {
        motivo,
        product_id: productoId,
        accessories_count: selectedAccessories.length,
        terms_checked: aceptaTerminos,
      });
      onClose();
    },
    [analytics, productoId, selectedAccessories.length, aceptaTerminos, onClose],
  );
  cerrarRef.current = cerrar;

  const continuar = () => {
    if (navegando) return;
    if (!aceptaTerminos) {
      setErrorTerminos(true);
      terminosRef.current?.focus();
      terminosRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (isCouponRequired && !appliedCoupon) {
      setErrorCupon('Debes ingresar un cupón válido para continuar');
      return;
    }
    if (isOverQuotaLimit) return;

    saveConsentStorage(landing, { acceptTerms: true, acceptPrivacy: true, acceptPromos: aceptaPromos });

    analytics.track('lo_quiero_modal_continue', {
      product_id: productoId,
      origen,
      accessories_count: n,
      accessory_ids: selectedAccessories.map((a) => String(a.id)).join(','),
      has_coupon: !!appliedCoupon,
      coupon_code: appliedCoupon?.code ?? null,
      accept_promos: aceptaPromos,
      monthly_total: Math.floor(total),
      first_step: slugPrimerPaso,
    });

    setNavegando(true);
    if (slugPrimerPaso) {
      router.push(routes.solicitarStep(landing, slugPrimerPaso));
      return;
    }
    // Sin primer paso resuelto (config caída o sin pasos): la intro de siempre
    // sabe manejarlo, y lo que la persona eligió ya quedó guardado.
    Sentry.captureMessage('lo_quiero_modal: sin primer paso del formulario', {
      level: 'warning',
      tags: { modulo: 'lo_quiero_modal', accion: 'resolver_primer_paso', landing },
      extra: { config_error: configError, steps: steps.length },
    });
    router.push(routes.solicitar(landing));
  };

  const textoBoton = n > 0 ? `Continuar con ${n} ${n === 1 ? 'accesorio' : 'accesorios'}` : 'Continuar a mis datos';
  const sufijo = sufijoDeFrecuencia(frecuencia);
  const botonDeshabilitado = preparando || navegando || isOverQuotaLimit;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center font-['Asap',_sans-serif]">
      <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-150" aria-hidden="true" onClick={() => cerrar('fondo')} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lo-quiero-titulo"
        aria-describedby="lo-quiero-subtitulo"
        tabIndex={-1}
        className="relative w-full md:mx-4 md:max-w-[860px] bg-white rounded-t-2xl md:rounded-2xl shadow-md flex flex-col max-h-[92dvh] md:max-h-[90vh] outline-none animate-in slide-in-from-bottom-6 md:slide-in-from-bottom-2 md:fade-in duration-300"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 px-4 md:px-6 pt-5 pb-3 border-b border-neutral-100 shrink-0">
          <div className="min-w-0">
            <h2 id="lo-quiero-titulo" className="font-['Baloo_2',_sans-serif] text-xl md:text-2xl font-bold text-neutral-800 leading-tight">
              {hayAccesorios ? '¿Quieres complementar tu equipo?' : 'Un paso más y empiezas tu solicitud'}
            </h2>
            <p id="lo-quiero-subtitulo" className="text-sm text-neutral-500 mt-0.5">
              {hayAccesorios
                ? 'Es opcional. Lo que agregues se suma a tu cuota.'
                : 'Acepta los términos para continuar con tus datos.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => cerrar('x')}
            aria-label="Cerrar"
            className="w-11 h-11 shrink-0 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-6 py-4">
          {selectedProduct && !hayAccesorios && (
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
              {selectedProduct.image && (
                <img src={selectedProduct.image} alt="" className="w-14 h-14 object-contain rounded-lg bg-neutral-50 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">{selectedProduct.brand}</p>
                <p className="text-sm font-semibold text-neutral-800 line-clamp-2">{selectedProduct.name}</p>
              </div>
            </div>
          )}

          {estadoAcc === 'error' && accesoriosHabilitados && (
            <div role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>No pudimos cargar los accesorios. Puedes continuar sin ellos.</span>
            </div>
          )}

          {hayAccesorios && (
            <section aria-labelledby="lo-quiero-accesorios">
              <h3 id="lo-quiero-accesorios" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                Accesorios sugeridos
              </h3>
              {estadoAcc === 'cargando' ? (
                <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3" aria-busy="true" aria-label="Cargando accesorios">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="h-24 md:h-56 rounded-xl border border-neutral-100 bg-neutral-50 animate-pulse" />
                  ))}
                </ul>
              ) : (
                <>
                  <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {accesoriosVisibles.map((acc) => {
                      const elegido = selectedAccessories.some((a) => a.id === acc.id);
                      const imagen = acc.thumbnailUrl || acc.image;
                      return (
                        <li
                          key={acc.id}
                          className={`relative flex md:flex-col items-center md:items-stretch gap-3 rounded-xl border p-3 transition-colors duration-150 ${
                            elegido
                              ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                              : 'border-neutral-200 bg-white'
                          }`}
                        >
                          {elegido && (
                            <span className="hidden md:flex absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--color-primary)] items-center justify-center" aria-hidden>
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </span>
                          )}
                          <div className="w-16 h-16 md:w-full md:h-24 rounded-lg bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
                            {imagen ? (
                              <img src={imagen} alt="" className="w-full h-full object-contain" loading="lazy" />
                            ) : (
                              <Package className="w-6 h-6 text-neutral-300" aria-hidden />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <p className="text-sm font-semibold text-neutral-800 line-clamp-2 md:min-h-[2.5rem]">{acc.name}</p>
                            <div className="mt-1 flex flex-col md:flex-row md:items-center md:justify-between gap-0.5 md:gap-2">
                              <span className="text-sm font-bold text-[var(--color-primary)] md:text-neutral-800">
                                +S/{formatMoneyNoDecimals(Math.floor(acc.monthlyQuota))}{sufijo}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  analytics.trackAccessoryView({ accessory_id: String(acc.id), accessory_name: acc.name });
                                  setDetalle(acc);
                                }}
                                className="self-start text-xs font-medium underline text-[var(--color-primary)] hover:opacity-80 cursor-pointer"
                              >
                                Ver detalle
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => alternarAccesorio(acc)}
                            aria-pressed={elegido}
                            aria-label={`${elegido ? 'Quitar' : 'Agregar'} ${acc.name}`}
                            className={`shrink-0 md:w-full min-h-[44px] px-4 rounded-full border-2 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                              elegido
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white hover:brightness-95'
                                : 'bg-white border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.06)]'
                            }`}
                          >
                            {elegido ? (
                              <>
                                Agregado <Check className="w-4 h-4" strokeWidth={3} aria-hidden />
                              </>
                            ) : (
                              'Agregar'
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {accesorios.length > ACCESORIOS_VISIBLES && (
                    <button
                      type="button"
                      onClick={() => setVerTodos((v) => !v)}
                      className="mt-3 w-full md:w-auto min-h-[44px] px-4 rounded-lg text-sm font-semibold text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.06)] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {verTodos ? 'Ver menos' : `Ver todos (${accesorios.length})`}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${verTodos ? 'rotate-180' : ''}`} aria-hidden />
                    </button>
                  )}
                </>
              )}
            </section>
          )}
        </div>

        {/* Pie fijo */}
        <div className="shrink-0 border-t border-neutral-100 px-4 md:px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-5 space-y-3 bg-white rounded-b-2xl">
          {/* Casilla única de Términos + Privacidad */}
          <div>
            <div
              ref={terminosRef}
              role="checkbox"
              aria-checked={aceptaTerminos}
              aria-invalid={errorTerminos && !aceptaTerminos}
              aria-describedby={errorTerminos && !aceptaTerminos ? 'lo-quiero-terminos-error' : undefined}
              tabIndex={0}
              onClick={() => {
                setAceptaTerminos((v) => !v);
                setErrorTerminos(false);
              }}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setAceptaTerminos((v) => !v);
                  setErrorTerminos(false);
                }
              }}
              className={`flex items-start gap-3 rounded-xl border-2 px-3 py-3 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                aceptaTerminos
                  ? 'border-neutral-200 bg-white'
                  : errorTerminos
                    ? 'border-red-500 bg-red-50'
                    : 'border-amber-300 bg-amber-50'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
                  aceptaTerminos
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                    : errorTerminos
                      ? 'bg-white border-red-500'
                      : 'bg-white border-neutral-400'
                }`}
                aria-hidden
              >
                {aceptaTerminos && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-neutral-800">
                  Acepto{' '}
                  <a
                    href={routes.legal(landing, 'terminos-y-condiciones')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-[var(--color-primary)] hover:opacity-80"
                  >
                    Términos
                  </a>{' '}
                  y{' '}
                  <a
                    href={routes.legal(landing, 'politica-de-privacidad')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-[var(--color-primary)] hover:opacity-80"
                  >
                    Política de privacidad
                  </a>
                </span>
                {errorTerminos && !aceptaTerminos && (
                  <span id="lo-quiero-terminos-error" role="alert" className="block text-xs font-semibold text-red-600 mt-0.5">
                    Marca la casilla para continuar.
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Promociones: opcional y sin marcar */}
          <div
            role="checkbox"
            aria-checked={aceptaPromos}
            tabIndex={0}
            onClick={() => setAceptaPromos((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setAceptaPromos((v) => !v);
              }
            }}
            className="flex items-center gap-3 px-3 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <span
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
                aceptaPromos ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-white border-neutral-400'
              }`}
              aria-hidden
            >
              {aceptaPromos && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </span>
            <span className="text-sm text-neutral-700">
              Quiero recibir promociones <span className="text-neutral-400">(opcional)</span>
            </span>
          </div>

          {isOverQuotaLimit && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>La cuota supera el límite de S/{maxMonthlyQuota}/mes. Quita algún accesorio para continuar.</span>
            </div>
          )}

          {/* Cupón plegable */}
          {panelCuponAbierto && (
            <div className={`relative rounded-xl ${errorCupon && !appliedCoupon ? 'ring-2 ring-red-500/30' : ''}`}>
              <CouponInput isRequired={isCouponRequired} />
              {errorCupon && !appliedCoupon && (
                <p role="alert" className="text-xs text-red-600 mt-1 ml-1">{errorCupon}</p>
              )}
            </div>
          )}

          {/* Total + acciones */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-end justify-between md:justify-start gap-3 md:flex-1 min-w-0">
              <div className="min-w-0">
                <p className="leading-none" aria-live="polite">
                  <span className="font-['Baloo_2',_sans-serif] text-3xl font-bold text-[var(--color-primary)]">
                    S/{formatMoneyNoDecimals(Math.floor(total))}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-primary)] ml-1">{sufijo}</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">{leyenda}</p>
                {esDiferida && mesPrimeraCuota && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#E3F5F1] px-2 py-0.5 text-xs font-semibold text-[#0B6B5C]">
                    <CalendarClock className="w-3.5 h-3.5" aria-hidden />
                    1.ª cuota en {mesPrimeraCuota}
                  </p>
                )}
              </div>
              {cuponVisible && !appliedCoupon && !isCouponRequired && (
                <button
                  type="button"
                  onClick={() => setCuponAbierto((v) => !v)}
                  aria-expanded={cuponAbierto}
                  className="shrink-0 min-h-[44px] px-3 rounded-full border border-dashed border-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.04)] hover:bg-[rgba(var(--color-primary-rgb),0.08)] inline-flex items-center gap-1.5 cursor-pointer transition-colors duration-150"
                >
                  <Tag className="w-4 h-4" aria-hidden />
                  {cuponAbierto ? 'Ocultar cupón' : 'Agregar cupón'}
                </button>
              )}
            </div>
            <div className="flex gap-3 md:shrink-0">
              <button
                type="button"
                onClick={() => cerrar('volver')}
                className="hidden md:inline-flex min-h-[48px] px-5 rounded-xl border border-neutral-300 bg-white text-neutral-800 font-semibold items-center justify-center hover:bg-neutral-50 cursor-pointer transition-colors duration-150"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={continuar}
                disabled={botonDeshabilitado}
                className={`flex-1 md:flex-none min-h-[48px] px-6 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                  botonDeshabilitado
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                    : 'bg-[var(--color-primary)] hover:brightness-90 cursor-pointer'
                }`}
              >
                {preparando || navegando ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-label="Cargando" />
                ) : (
                  <>
                    {textoBoton}
                    <ArrowRight className="w-5 h-5" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AccessoryDetailModal
        accessory={detalle}
        isOpen={!!detalle}
        onClose={() => setDetalle(null)}
        isSelected={detalle ? selectedAccessories.some((a) => a.id === detalle.id) : false}
        onToggle={() => {
          if (detalle) alternarAccesorio(detalle);
        }}
        badgeText={badgeText}
      />
    </div>
  );

  return createPortal(modal, document.body);
}

export default LoQuieroModal;
