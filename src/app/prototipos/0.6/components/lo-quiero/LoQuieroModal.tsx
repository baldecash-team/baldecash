'use client';

/**
 * Modal de "Lo quiero" (BAL-4852, rediseño de Brenda).
 *
 * Reemplaza la pantalla intermedia de /solicitar cuando la landing está en
 * Diseño 2 (`features.solicitud_design === 2`): encima del catálogo o de la ficha se
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
import { AlertTriangle, ArrowRight, Check, ChevronDown, ChevronRight, Gift, Package, Tag, X } from 'lucide-react';

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
import { getTermUnit } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/etiquetaDePlazo';
import type { Accessory } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import { formatMoneyNoDecimals } from '@/app/prototipos/0.6/[landing]/solicitar/utils/formatMoney';
import { readConsentStorage, saveConsentStorage } from '@/app/prototipos/0.6/[landing]/solicitar/utils/consentStorage';
import { primerPasoRegular, slugDelPaso } from '@/app/prototipos/0.6/[landing]/solicitar/utils/primerPaso';
import { useMesPrimeraCuota } from './useMesPrimeraCuota';
import { guardarOrigenDiseno2 } from '@/app/prototipos/0.6/components/diseno-2/origenDiseno2';
import { datosUtiles, marcaVisible, nombreParaMostrar, ordenarPorCategoria } from './presentacionAccesorios';

export type LoQuieroOrigen = 'catalogo' | 'ficha';

/**
 * Accesorio que ya viene dentro del combo elegido (regalo). `id` es el id de
 * producto, el mismo que trae el endpoint de accesorios: con eso se saca de
 * la lista de "Agregar" y se muestra como incluido (BAL-4957).
 */
export interface RegaloDelCombo {
  id: string;
  name: string;
  image?: string;
  /** Sin costo para el cliente. */
  gratis: boolean;
}

interface LoQuieroModalProps {
  isOpen: boolean;
  onClose: () => void;
  origen: LoQuieroOrigen;
  /** Regalos del combo de la card o la ficha. Sin combo: vacío. */
  regalos?: RegaloDelCombo[];
}

/** Arrastrar la hoja hacia abajo más de esto (px) la cierra, en celular. */
const UMBRAL_ARRASTRE = 100;

/** Cuántos accesorios se ven antes de "Ver todos". Pendiente de confirmar con Brenda. */
const ACCESORIOS_VISIBLES = 8;

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
 * Imagen del accesorio con respaldo: sin URL o si la URL falla, un paquete
 * sobre fondo gris en vez del ícono roto del navegador.
 */
function ImagenAccesorio({ src, className = '' }: { src?: string | null; className?: string }) {
  // Se recuerda QUÉ url falló: si cambia la url, se vuelve a intentar.
  const [srcRoto, setSrcRoto] = useState<string | null>(null);
  const ok = !!src && srcRoto !== src;
  return (
    <div className={`flex items-center justify-center overflow-hidden shrink-0 ${ok ? 'bg-white' : 'bg-neutral-100'} ${className}`}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-contain" loading="lazy" onError={() => setSrcRoto(src)} />
      ) : (
        <Package className="w-1/3 h-1/3 max-w-8 max-h-8 text-neutral-400" strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}

/**
 * Monta el modal solo cuando está abierto: así el producto que la card o la
 * ficha acaban de guardar ya está en storage cuando arrancan los providers.
 *
 * El catálogo ya trae su `ProductProvider` y se usa ese, para que el cupón de
 * campaña y el producto elegido sean los mismos que ve la página. La ficha no
 * tiene uno: el modal monta el suyo, que lee lo que la ficha guardó.
 */
export function LoQuieroModal({ isOpen, onClose, origen, regalos }: LoQuieroModalProps) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const productoExterno = useProductOptional();

  if (!isOpen) return null;

  const contenido = (
    <WizardConfigProvider slug={landing}>
      <LoQuieroModalContent onClose={onClose} origen={origen} landing={landing} regalos={regalos ?? []} />
    </WizardConfigProvider>
  );

  return productoExterno ? contenido : <ProductProvider landingSlug={landing}>{contenido}</ProductProvider>;
}

type EstadoAccesorios = 'cargando' | 'listo' | 'error';

function LoQuieroModalContent({
  onClose,
  origen,
  landing,
  regalos,
}: {
  onClose: () => void;
  origen: LoQuieroOrigen;
  landing: string;
  regalos: RegaloDelCombo[];
}) {
  const router = useRouter();
  const analytics = useAnalytics();
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;
  const session = useSessionOptional();
  const { deferredPayment } = useLayout();
  const {
    selectedProduct,
    setSelectedProduct,
    selectedAccessories,
    toggleAccessory,
    clearAccessories,
    appliedCoupon,
    isOverQuotaLimit,
    maxMonthlyQuota,
  } = useProduct();
  const { steps, isLoading: isConfigLoading, error: configError } = useWizardConfig();
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
  const detalleRef = useRef<HTMLDivElement>(null);
  // Tarjeta que abrió el detalle: al cerrarlo, el foco vuelve ahí.
  const origenDetalleRef = useRef<HTMLElement | null>(null);
  const cerrarRef = useRef<(motivo: string) => void>(() => {});
  const cerrarDetalleRef = useRef<() => void>(() => {});
  const detalleAbiertoRef = useRef(false);
  detalleAbiertoRef.current = !!detalle;

  const cerrarDetalle = useCallback(() => {
    setDetalle(null);
    const origenFoco = origenDetalleRef.current;
    requestAnimationFrame(() => origenFoco?.focus());
  }, []);
  cerrarDetalleRef.current = cerrarDetalle;

  useEffect(() => {
    if (detalle) detalleRef.current?.focus();
  }, [detalle]);

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      // Con el detalle encima, Escape y Tab son de esa capa.
      const capa = detalleAbiertoRef.current ? detalleRef.current : panelRef.current;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (detalleAbiertoRef.current) cerrarDetalleRef.current();
        else cerrarRef.current('escape');
        return;
      }
      if (e.key !== 'Tab' || !capa) return;
      const nodos = Array.from(capa.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (nodos.length === 0) return;
      const primero = nodos[0];
      const ultimo = nodos[nodos.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && (activo === primero || activo === capa)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      } else if (!capa.contains(activo)) {
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

  // Lo que ya viene en el combo no se ofrece: se muestra como incluido.
  const idsRegalo = useMemo(() => new Set(regalos.map((r) => r.id)), [regalos]);
  const ofrecibles = useMemo(
    () => ordenarPorCategoria(accesorios.filter((a) => !idsRegalo.has(String(a.id)))),
    [accesorios, idsRegalo],
  );
  const regalosVisibles = useMemo(
    () =>
      regalos.map((r) => {
        const delListado = accesorios.find((a) => String(a.id) === r.id);
        return { ...r, image: r.image || delListado?.thumbnailUrl || delListado?.image };
      }),
    [regalos, accesorios],
  );
  const hayAccesorios = accesoriosHabilitados && (estadoAcc === 'cargando' || ofrecibles.length > 0);
  const accesoriosVisibles = verTodos ? ofrecibles : ofrecibles.slice(0, ACCESORIOS_VISIBLES);

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
  // Misma fuente que el panel "Tu solicitud" de Diseño 2.
  const esDiferida = !!deferredPayment?.enabled;
  const mesPrimeraCuota = useMesPrimeraCuota(landing, esDiferida);

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
    appliedCoupon ? 'con cupón' : null,
  ].filter(Boolean).join(' · ');
  const totalEntero = Math.floor(total);

  // ── Pulso del total al agregar/quitar o con el cupón ──────────────────────
  const totalRef = useRef<HTMLSpanElement>(null);
  const pulsoInicial = useRef(true);
  const codigoCupon = appliedCoupon?.code ?? null;
  useEffect(() => {
    if (pulsoInicial.current) {
      pulsoInicial.current = false;
      return;
    }
    const el = totalRef.current;
    if (!el || typeof el.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
      { duration: 400, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    );
  }, [totalEntero, codigoCupon]);

  // ── Celular: teclado abierto (el cupón no puede quedar tapado) ────────────
  // `dvh` no se encoge con el teclado en todos los navegadores: se mide el
  // viewport visible y se sube la hoja por encima del teclado.
  const [teclado, setTeclado] = useState<{ alto: number; visible: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const medir = () => {
      const tapado = window.innerHeight - vv.height - vv.offsetTop;
      setTeclado(tapado > 80 ? { alto: tapado, visible: vv.height } : null);
    };
    vv.addEventListener('resize', medir);
    vv.addEventListener('scroll', medir);
    return () => {
      vv.removeEventListener('resize', medir);
      vv.removeEventListener('scroll', medir);
    };
  }, []);

  // ── Celular: arrastrar la rayita hacia abajo cierra ───────────────────────
  // Solo la cabecera es arrastrable, así el scroll de la lista no se toca.
  const [arrastre, setArrastre] = useState(0);
  const inicioArrastre = useRef<number | null>(null);
  const esCelular = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const onArrastreInicio = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!esCelular() || (e.target as HTMLElement).closest('button, a')) return;
    inicioArrastre.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onArrastreMovimiento = (e: React.PointerEvent<HTMLDivElement>) => {
    if (inicioArrastre.current === null) return;
    setArrastre(Math.max(0, e.clientY - inicioArrastre.current));
  };
  const onArrastreFin = () => {
    if (inicioArrastre.current === null) return;
    inicioArrastre.current = null;
    if (arrastre > UMBRAL_ARRASTRE) {
      cerrarRef.current('arrastre');
      return;
    }
    setArrastre(0);
  };

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

    // Los regalos del combo los conoce solo quien abrió el modal (la card o la
    // ficha). Se guardan en el producto para que el panel "Tu solicitud" de
    // los pasos los muestre sin volver a resolver el combo.
    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        regalos: regalos.map((r) => ({ id: r.id, name: r.name, gratis: r.gratis })),
      });
    }

    // Paso 1 de Diseño 2: "Atrás" vuelve acá (catálogo o ficha), no a
    // `/solicitar` (BAL-4959, decisión del controlador). Se guarda ANTES de
    // navegar: "la URL actual" todavía es esta página.
    guardarOrigenDiseno2(landing);

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
  const plazoEquipo = `${plazoVisible} ${getTermUnit(plazoVisible, frecuencia)}`;
  const nombreEquipo = selectedProduct?.shortName || selectedProduct?.name || '';

  const alternarTerminos = () => {
    setAceptaTerminos((v) => !v);
    setErrorTerminos(false);
  };

  const abrirDetalle = (acc: Accessory, origenFoco: HTMLElement) => {
    analytics.trackAccessoryView({ accessory_id: String(acc.id), accessory_name: acc.name });
    origenDetalleRef.current = origenFoco;
    setDetalle(acc);
  };

  const detalleElegido = detalle ? selectedAccessories.some((a) => a.id === detalle.id) : false;
  const datosDetalle = detalle ? datosUtiles(detalle) : [];
  const marcaDetalle = detalle ? marcaVisible(detalle.brand) : null;

  const modal = (
    <div
      className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center font-['Asap',_sans-serif]"
      style={teclado ? { paddingBottom: teclado.alto } : undefined}
    >
      <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-150" aria-hidden="true" onClick={() => cerrar('fondo')} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lo-quiero-titulo"
        aria-describedby="lo-quiero-subtitulo"
        tabIndex={-1}
        style={{
          ...(teclado ? { maxHeight: teclado.visible - 8 } : null),
          ...(arrastre > 0 ? { transform: `translateY(${arrastre}px)`, transition: 'none' } : null),
        }}
        className="relative w-full md:mx-4 md:max-w-[880px] bg-white rounded-t-2xl md:rounded-2xl shadow-md flex flex-col max-h-[94dvh] md:max-h-[92vh] outline-none transition-transform duration-200 animate-in slide-in-from-bottom-6 md:slide-in-from-bottom-2 md:fade-in"
      >
        {/* Cabecera: en celular es también la zona de arrastre */}
        <div
          className="shrink-0 border-b border-neutral-100 px-4 md:px-6 pt-2 md:pt-5 pb-3 touch-none select-none md:touch-auto md:select-auto"
          onPointerDown={onArrastreInicio}
          onPointerMove={onArrastreMovimiento}
          onPointerUp={onArrastreFin}
          onPointerCancel={onArrastreFin}
        >
          <div className="md:hidden flex justify-center pb-2" aria-hidden>
            <span className="block w-10 h-1.5 rounded-full bg-neutral-300" />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="lo-quiero-titulo" className="font-['Baloo_2',_sans-serif] text-lg md:text-2xl font-bold text-neutral-800 leading-tight">
                {hayAccesorios ? '¿Quieres complementar tu equipo?' : 'Un paso más y empiezas tu solicitud'}
              </h2>
              {!hayAccesorios && (
                <p id="lo-quiero-subtitulo" className="text-sm text-neutral-500 mt-0.5">
                  Acepta los términos para continuar con tus datos.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => cerrar('x')}
              aria-label="Cerrar"
              className="w-11 h-11 -mt-1 shrink-0 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* El equipo elegido */}
          {selectedProduct && (
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-neutral-50 border border-neutral-100 pl-2 pr-1 py-1.5">
              <ImagenAccesorio src={selectedProduct.image} className="w-11 h-11 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-800 truncate" title={nombreEquipo}>{nombreEquipo}</p>
                <p className="text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-700">S/{formatMoneyNoDecimals(Math.floor(cuotaEquipo))}{sufijo}</span>
                  {' · '}
                  {plazoEquipo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => cerrar('cambiar')}
                className="shrink-0 min-h-[44px] px-3 rounded-lg text-sm font-semibold text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.06)] cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        {/* Cuerpo con scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 md:px-6 py-3 md:py-4">
          {estadoAcc === 'error' && accesoriosHabilitados && (
            <div role="status" className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>No pudimos cargar los accesorios. Puedes continuar sin ellos.</span>
            </div>
          )}

          {hayAccesorios && (
            <section aria-labelledby="lo-quiero-accesorios">
              <div className="flex items-baseline gap-2 mb-2.5">
                <h3 id="lo-quiero-accesorios" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Accesorios sugeridos
                </h3>
                <p id="lo-quiero-subtitulo" className="text-xs text-neutral-400">Opcional · se suma a tu cuota</p>
              </div>
              {estadoAcc === 'cargando' ? (
                <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3" aria-busy="true" aria-label="Cargando accesorios">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="h-[76px] md:h-[188px] rounded-xl border border-neutral-100 bg-neutral-50 animate-pulse" />
                  ))}
                </ul>
              ) : (
                <>
                  <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {/* Lo que ya trae el combo: incluido, sin precio, no se elige */}
                    {regalosVisibles.map((r) => (
                      <li
                        key={`regalo-${r.id}`}
                        className="flex md:flex-col items-center md:items-stretch gap-3 rounded-xl border border-[#BFE6DA] bg-[#F2FBF8] p-2.5 md:p-3"
                      >
                        <ImagenAccesorio src={r.image} className="w-14 h-14 md:w-full md:h-20 rounded-lg" />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="self-start inline-flex items-center gap-1 rounded-full bg-[#DDF3EC] px-2 py-0.5 text-[11px] font-semibold text-[#0B6B5C]">
                            <Check className="w-3 h-3" strokeWidth={3} aria-hidden />
                            {r.gratis ? 'Incluido gratis' : 'Incluido en tu equipo'}
                          </span>
                          <p className="mt-1 text-sm font-semibold text-neutral-800 line-clamp-2 md:min-h-[2.5rem]">{nombreParaMostrar(r.name)}</p>
                          <p className="hidden md:flex mt-auto items-center gap-1 text-xs text-[#0B6B5C]">
                            <Gift className="w-3.5 h-3.5" aria-hidden /> Ya viene con tu equipo
                          </p>
                        </div>
                      </li>
                    ))}
                    {accesoriosVisibles.map((acc) => {
                      const elegido = selectedAccessories.some((a) => a.id === acc.id);
                      const nombre = nombreParaMostrar(acc.name, acc.brand?.name);
                      const categoria = acc.category && acc.category.slug !== 'otro' ? acc.category.name : null;
                      return (
                        <li
                          key={acc.id}
                          className={`group relative flex md:flex-col items-center md:items-stretch gap-3 rounded-xl border p-2.5 md:p-3 transition-[border-color,box-shadow,background-color] duration-150 ${
                            elegido
                              ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                              : 'border-neutral-200 bg-white hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:shadow-sm'
                          }`}
                        >
                          {/* Toda la tarjeta abre el detalle (menos el botón Agregar) */}
                          <button
                            type="button"
                            onClick={(e) => abrirDetalle(acc, e.currentTarget)}
                            aria-label={`Ver detalle de ${nombre}`}
                            className="absolute inset-0 rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                          />
                          {elegido && (
                            <span className="hidden md:flex absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--color-primary)] items-center justify-center pointer-events-none" aria-hidden>
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </span>
                          )}
                          <ImagenAccesorio src={acc.thumbnailUrl || acc.image} className="w-14 h-14 md:w-full md:h-20 rounded-lg pointer-events-none" />
                          <div className="flex-1 min-w-0 flex flex-col pointer-events-none">
                            {categoria && (
                              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400 truncate">{categoria}</span>
                            )}
                            <p className="text-sm font-semibold text-neutral-800 line-clamp-2 md:min-h-[2.5rem] leading-snug">{nombre}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 min-w-0 md:hidden">
                              <span className="text-sm font-bold text-[var(--color-primary)] whitespace-nowrap">
                                +S/{formatMoneyNoDecimals(Math.floor(acc.monthlyQuota))}{sufijo}
                              </span>
                              <span className="text-xs text-neutral-400 inline-flex items-center min-w-0 whitespace-nowrap overflow-hidden">
                                Ver detalle <ChevronRight className="w-3 h-3" aria-hidden />
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 md:mt-auto">
                            <span className="hidden md:inline text-sm font-bold text-neutral-800 pointer-events-none">
                              +S/{formatMoneyNoDecimals(Math.floor(acc.monthlyQuota))}{sufijo}
                            </span>
                            <button
                              type="button"
                              onClick={() => alternarAccesorio(acc)}
                              aria-pressed={elegido}
                              aria-label={`${elegido ? 'Quitar' : 'Agregar'} ${nombre}`}
                              className={`relative z-[1] shrink-0 min-h-[44px] md:min-h-[36px] px-4 md:px-3 rounded-full border-2 text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
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
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {ofrecibles.length > ACCESORIOS_VISIBLES && (
                    <button
                      type="button"
                      onClick={() => setVerTodos((v) => !v)}
                      className="mt-2 w-full md:w-auto min-h-[44px] px-4 rounded-lg text-sm font-semibold text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.06)] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {verTodos ? 'Ver menos' : `Ver todos (${ofrecibles.length})`}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${verTodos ? 'rotate-180' : ''}`} aria-hidden />
                    </button>
                  )}
                </>
              )}
            </section>
          )}
        </div>

        {/* Pie fijo */}
        <div className="shrink-0 border-t border-neutral-100 px-4 md:px-6 pt-2 md:pt-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:pb-4 bg-white rounded-b-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:gap-3">
            {/* Casilla única de Términos + Privacidad: neutra hasta que falte */}
            <div
              ref={terminosRef}
              role="checkbox"
              aria-checked={aceptaTerminos}
              aria-invalid={errorTerminos && !aceptaTerminos}
              aria-describedby={errorTerminos && !aceptaTerminos ? 'lo-quiero-terminos-error' : undefined}
              tabIndex={0}
              onClick={alternarTerminos}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  alternarTerminos();
                }
              }}
              className={`flex items-center gap-2.5 min-h-[44px] rounded-lg border px-2.5 py-1.5 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] md:flex-1 ${
                aceptaTerminos
                  ? 'border-[#BFE6DA] bg-[#F2FBF8]'
                  : errorTerminos
                    ? 'border-red-500 bg-red-50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
                  aceptaTerminos
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                    : errorTerminos
                      ? 'bg-white border-red-500'
                      : 'bg-white border-neutral-400'
                }`}
                aria-hidden
              >
                {aceptaTerminos && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-neutral-800">
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
                  <span id="lo-quiero-terminos-error" role="alert" className="block text-xs font-semibold text-red-600">
                    Marca la casilla para continuar.
                  </span>
                )}
              </span>
              {aceptaTerminos && <span className="text-xs font-semibold text-[#0B6B5C] shrink-0">¡Listo!</span>}
            </div>

            {/* Promociones (opcional) + cupón plegable en la misma fila */}
            <div className="flex items-center gap-2 md:shrink-0">
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
                className="flex-1 md:flex-none flex items-center gap-2.5 min-h-[44px] px-2.5 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <span
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    aceptaPromos ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-white border-neutral-400'
                  }`}
                  aria-hidden
                >
                  {aceptaPromos && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </span>
                <span className="text-sm text-neutral-700">
                  Quiero promociones <span className="text-neutral-400">(opcional)</span>
                </span>
              </div>
              {cuponVisible && !appliedCoupon && !isCouponRequired && (
                <button
                  type="button"
                  onClick={() => setCuponAbierto((v) => !v)}
                  aria-expanded={cuponAbierto}
                  className="shrink-0 min-h-[44px] px-2.5 rounded-lg text-sm font-semibold text-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.06)] inline-flex items-center gap-1.5 cursor-pointer transition-colors duration-150"
                >
                  <Tag className="w-4 h-4" aria-hidden />
                  {cuponAbierto ? (
                    'Ocultar'
                  ) : (
                    <>
                      <span className="md:hidden">Cupón</span>
                      <span className="hidden md:inline">¿Tienes cupón?</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Cupón: una sola línea dentro del pie */}
          {panelCuponAbierto && (
            <div className="mt-1.5">
              <CouponInput compacto isRequired={isCouponRequired} />
              {errorCupon && !appliedCoupon && (
                <p role="alert" className="text-xs text-red-600 mt-1">{errorCupon}</p>
              )}
            </div>
          )}

          {isOverQuotaLimit && (
            <div role="alert" className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>La cuota supera el límite de S/{maxMonthlyQuota}/mes. Quita algún accesorio para continuar.</span>
            </div>
          )}

          {/* Total + botón principal en una fila */}
          <div className="mt-2 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="leading-none" aria-live="polite">
                <span
                  ref={totalRef}
                  className="inline-block origin-left font-['Baloo_2',_sans-serif] text-[28px] md:text-3xl font-bold text-[var(--color-primary)]"
                >
                  S/{formatMoneyNoDecimals(totalEntero)}
                </span>
                <span className="text-sm font-semibold text-[var(--color-primary)] ml-1">{sufijo}</span>
              </p>
              {n > 0 && (
                <p className="text-xs text-neutral-600 mt-0.5 truncate">
                  Equipo S/{formatMoneyNoDecimals(Math.floor(cuotaEquipo))} + accesorios S/{formatMoneyNoDecimals(Math.floor(cuotaAccesorios))}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-0.5">
                {leyenda}
                {esDiferida && mesPrimeraCuota && (
                  <span className="font-semibold text-[#0B6B5C]"> · 1.ª cuota en {mesPrimeraCuota}</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={continuar}
              disabled={botonDeshabilitado}
              className={`shrink-0 min-h-[48px] px-5 md:px-6 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                botonDeshabilitado
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                  : 'bg-[var(--color-primary)] hover:brightness-90 cursor-pointer'
              }`}
            >
              {preparando || navegando ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-label="Cargando" />
              ) : (
                <>
                  <span className="md:hidden">Continuar</span>
                  <span className="hidden md:inline">{textoBoton}</span>
                  <ArrowRight className="w-5 h-5" aria-hidden />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Detalle del accesorio: capa propia encima del modal */}
      {detalle && (
        <div className="absolute inset-0 z-10 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-150" aria-hidden="true" onClick={cerrarDetalle} />
          <div
            ref={detalleRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lo-quiero-detalle-titulo"
            tabIndex={-1}
            className="relative w-full md:mx-4 md:max-w-[440px] bg-white rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col max-h-[85dvh] outline-none animate-in fade-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200"
          >
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div className="relative">
                <ImagenAccesorio src={detalle.image || detalle.thumbnailUrl} className="w-full h-48 md:h-52 rounded-t-2xl p-4" />
                <button
                  type="button"
                  onClick={cerrarDetalle}
                  aria-label="Cerrar detalle"
                  className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/90 shadow-sm hover:bg-white flex items-center justify-center text-neutral-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 pt-4 pb-2">
                {marcaDetalle && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">{marcaDetalle}</p>
                )}
                <h3 id="lo-quiero-detalle-titulo" className="font-['Baloo_2',_sans-serif] text-xl font-bold text-neutral-800 leading-tight">
                  {nombreParaMostrar(detalle.name, detalle.brand?.name)}
                </h3>
                {datosDetalle.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {datosDetalle.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 rounded-xl bg-[rgba(var(--color-primary-rgb),0.06)] px-4 py-3">
                  <p className="leading-none">
                    <span className="font-['Baloo_2',_sans-serif] text-2xl font-bold text-[var(--color-primary)]">
                      +S/{formatMoneyNoDecimals(Math.floor(detalle.monthlyQuota))}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-primary)] ml-1">{sufijo}</span>
                  </p>
                  {detalle.price > 0 && (
                    <p className="text-xs text-neutral-600 mt-1">
                      S/{formatMoneyNoDecimals(Math.floor(detalle.price))} en {detalle.term ?? plazo} cuotas
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 px-5 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-5">
              <button
                type="button"
                onClick={() => {
                  alternarAccesorio(detalle);
                  cerrarDetalle();
                }}
                className={`w-full min-h-[48px] rounded-xl font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                  detalleElegido
                    ? 'border-2 border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                    : 'bg-[var(--color-primary)] text-white shadow-md hover:brightness-90'
                }`}
              >
                {detalleElegido ? 'Quitar de mi solicitud' : 'Agregar a mi solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modal, document.body);
}

export default LoQuieroModal;
