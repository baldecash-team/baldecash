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

import { useCandadoDeAvance } from '@/app/prototipos/0.6/hooks/useCandadoDeAvance';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, ArrowRight, Check, ChevronDown, Gift, Lock, Package, ShoppingBag, Tag } from 'lucide-react';

import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { getLandingAccessories, resolveEcosistema } from '@/app/prototipos/0.6/services/landingApi';
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
import { CouponInput, useCuponVisible, useQuitarCupon } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/coupon';
import { getTermUnit } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/etiquetaDePlazo';
import type { Accessory } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
// I6 (BAL-4969): la cuota se escribe como en el panel, el Shell y la confirmación
// (`formatCuotaDeLanding`: centavos en Family Farms, entera en el resto).
import { formatCuotaDeLanding } from '@/app/prototipos/0.6/utils/formatCuota';
import { readConsentStorage, saveConsentStorage } from '@/app/prototipos/0.6/[landing]/solicitar/utils/consentStorage';
import { leerVistaDePrueba } from '@/app/prototipos/0.6/utils/vistaDePrueba';
import { primerPasoRegular, slugDelPaso } from '@/app/prototipos/0.6/[landing]/solicitar/utils/primerPaso';
import { useMesPrimeraCuota } from './useMesPrimeraCuota';
import { guardarOrigenDiseno2 } from '@/app/prototipos/0.6/components/diseno-2/origenDiseno2';
import { prefiereMenosMovimiento } from '@/app/prototipos/0.6/components/diseno-2/movimiento';
import { BOTON_PRIMARIO_V2, BOTON_SECUNDARIO_V2, ModalV2 } from '@/app/prototipos/0.6/components/diseno-2/ModalV2';
import { datosUtiles, nombreParaMostrar, ordenarPorCategoria } from './presentacionAccesorios';
import { CajaAvisoDelEquipo, type AvisoDelEquipo } from './avisoDelEquipo';

export type LoQuieroOrigen = 'catalogo' | 'ficha' | 'entrada';

/**
 * El tipo real del producto para el título del modal (prototipo: «¿Quieres
 * complementar tu laptop?»). Un tipo desconocido queda en «equipo».
 */
export function nombreDelTipo(tipo: string | null | undefined): string {
  const t = String(tipo ?? '').trim().toLowerCase();
  if (t === 'laptop' || t === 'notebook') return 'laptop';
  if (t === 'tablet') return 'tablet';
  if (t === 'celular' || t === 'smartphone' || t === 'phone' || t === 'telefono' || t === 'teléfono') return 'celular';
  return 'equipo';
}

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
  /**
   * Reacondicionado / entrega programada del equipo (BAL-4958): en Diseño 2
   * el aviso va dentro del modal, sin el modal de confirmación de Diseño 1.
   */
  avisos?: AvisoDelEquipo[];
}

/** Espacios de la grilla antes de abrir el resto. Si sobran, el último es la tarjeta «+N más». */
const ACCESORIOS_VISIBLES = 8;

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
    <div className={`flex items-center justify-center overflow-hidden shrink-0 ${ok ? 'bg-[var(--d2-tarjeta)]' : 'bg-[var(--d2-gris)]'} ${className}`}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-contain" loading="lazy" onError={() => setSrcRoto(src)} />
      ) : (
        <Package className="w-1/3 h-1/3 max-w-8 max-h-8 text-[var(--d2-icono-tenue)]" strokeWidth={1.5} aria-hidden />
      )}
    </div>
  );
}

/**
 * El equipo elegido, cuando el modal no ofrece accesorios (landing con
 * accesorios apagados o sin accesorios para el equipo): foto, nombre, specs
 * cortas y los regalos del combo. Tarjeta con el borde estándar del kit.
 */
function TarjetaDelEquipo({ producto, regalos }: { producto: SelectedProduct; regalos: RegaloDelCombo[] }) {
  const specs = [producto.specs?.processor, producto.specs?.ram, producto.specs?.storage]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(' · ');
  return (
    <div data-tarjeta-equipo className="flex items-center gap-3 rounded-[10px] border-[1.5px] border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] p-3 md:gap-4 md:p-4">
      <ImagenAccesorio src={producto.image} className="h-[72px] w-[72px] rounded-[10px] md:h-24 md:w-24" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[15px] font-bold leading-snug text-[var(--d2-texto)] line-clamp-2">{producto.name}</p>
        {specs && <p className="text-[13px] text-[var(--d2-texto-suave)]">{specs}</p>}
        {regalos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {regalos.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-[var(--d2-ok-suave)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--d2-ok-texto)]">
                <Gift className="h-3 w-3" aria-hidden />
                {r.gratis ? 'Incluye' : 'Con'} {nombreParaMostrar(r.name)}
              </span>
            ))}
          </div>
        )}
      </div>
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
export function LoQuieroModal({ isOpen, onClose, origen, regalos, avisos }: LoQuieroModalProps) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';
  const productoExterno = useProductOptional();

  if (!isOpen) return null;

  const contenido = (
    <WizardConfigProvider slug={landing}>
      <LoQuieroModalContent onClose={onClose} origen={origen} landing={landing} regalos={regalos ?? []} avisos={avisos ?? []} />
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
  avisos,
}: {
  onClose: () => void;
  origen: LoQuieroOrigen;
  landing: string;
  regalos: RegaloDelCombo[];
  avisos: AvisoDelEquipo[];
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

  const terminosRef = useRef<HTMLButtonElement>(null);

  // ── Apertura: limpiar accesorios de un intento anterior + evento ──────────
  // La ficha guardaba el producto sin tocar los accesorios, así que un intento
  // abandonado los arrastraba al siguiente equipo.
  const productoId = selectedProduct?.id ?? null;
  // En desarrollo StrictMode monta → desmonta → monta y el efecto corre dos
  // veces: el evento salía duplicado (E2E BAL-4969, bug 3). El ref sobrevive
  // a ese doble montaje, así que registra la apertura una sola vez.
  const aperturaRegistradaRef = useRef(false);
  useEffect(() => {
    clearAccessories();
    if (aperturaRegistradaRef.current) return;
    aperturaRegistradaRef.current = true;
    analytics.track('lo_quiero_modal_open', {
      product_id: productoId,
      origen,
      has_coupon: !!appliedCoupon,
    });
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Capas: el modal, el detalle del accesorio y el cupón ────────────────
  // Cada capa es un `ModalV2` (BAL-5203, punto 10): foco adentro, Escape y Tab
  // solo de la de más arriba (el cupón cierra solo el cupón), foco de vuelta
  // a quien la abrió y salida animada antes de desmontarse.
  const [abierto, setAbierto] = useState(true);
  const [detalle, setDetalle] = useState<Accessory | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  // Modal del cupón (BAL-4958): la capa de más arriba.
  const [cuponAbierto, setCuponAbierto] = useState(false);
  const filaCuponRef = useRef<HTMLButtonElement>(null);
  const cuponAbiertoRef = useRef(false);
  cuponAbiertoRef.current = cuponAbierto;
  const cerrarCuponRef = useRef<() => void>(() => {});

  const cerrarDetalle = useCallback(() => setDetalleAbierto(false), []);

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
  // Si no caben todos, el último espacio es la tarjeta «+N más» (Emilio, 27-oct).
  const hayMas = ofrecibles.length > ACCESORIOS_VISIBLES;
  const enLaGrilla = hayMas ? ACCESORIOS_VISIBLES - 1 : ACCESORIOS_VISIBLES;
  const accesoriosVisibles = verTodos ? ofrecibles : ofrecibles.slice(0, enLaGrilla);
  const escondidos = ofrecibles.slice(enLaGrilla);
  const seccionAccesoriosRef = useRef<HTMLElement>(null);

  // BAL-5276 (punto 2): qué accesorios VIO la persona, no solo cuál agregó.
  // Mismo evento que Diseño 1 (`accessory_impression` de AccessoriesSection,
  // mismas propiedades) más `origen: 'lo_quiero'`, para que los reportes los
  // junten o los separen. `accessory_ids` va en el orden de la grilla (la
  // posición es el lugar en la lista). Una vez por apertura para la grilla y,
  // si toca «Ver todos», una vez más con la lista completa (`vista: 'todos'`).
  const impresionesRef = useRef<Set<'grilla' | 'todos'>>(new Set());
  useEffect(() => {
    if (estadoAcc !== 'listo' || !accesoriosHabilitados || accesoriosVisibles.length === 0) return;
    const vista = verTodos ? 'todos' : 'grilla';
    if (impresionesRef.current.has(vista)) return;
    impresionesRef.current.add(vista);
    analytics.track('accessory_impression', {
      accessory_ids: accesoriosVisibles.map((a) => String(a.id)).join(','),
      count: accesoriosVisibles.length,
      page: 1,
      origen: 'lo_quiero',
      vista,
      product_id: productoId,
      diseno: 2,
    });
  }, [estadoAcc, accesoriosHabilitados, accesoriosVisibles, verTodos, analytics, productoId]);
  // «+N más» / «Ver menos»: cuánta gente quiere ver más accesorios que los
  // de la grilla (BAL-5207).
  const abrirTodos = () => {
    setVerTodos(true);
    analytics.track('lo_quiero_modal_accessories_expand', { hidden_count: escondidos.length, product_id: productoId });
  };
  const verMenos = () => {
    setVerTodos(false);
    analytics.track('lo_quiero_modal_accessories_collapse', { product_id: productoId });
    // Sin esto la persona queda abajo, mirando un hueco: se la regresa al título.
    seccionAccesoriosRef.current?.scrollIntoView({ block: 'start', behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth' });
  };

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
  const [errorCupon, setErrorCupon] = useState<string | null>(null);
  const cuponVisible = useCuponVisible(landing, isCouponRequired);
  const quitarCupon = useQuitarCupon();

  // El cupón se escribe en un modal chico encima de este (BAL-4958). La
  // validación y la aplicación son las de `CouponInput`, que vive adentro.
  const abrirCupon = useCallback(() => setCuponAbierto(true), []);
  const cerrarCupon = useCallback(() => setCuponAbierto(false), []);
  cerrarCuponRef.current = cerrarCupon;
  // Al cerrar, el foco vuelve a la fila, que se vuelve a pintar (con o sin cupón).
  const focoDeLaFilaCupon = useCallback(() => filaCuponRef.current, []);

  // Cupón válido: el modal chico se cierra solo.
  const codigoAplicado = appliedCoupon?.code ?? null;
  useEffect(() => {
    if (codigoAplicado && cuponAbiertoRef.current) cerrarCuponRef.current();
  }, [codigoAplicado]);

  const quitarCuponDeLaFila = () => {
    quitarCupon();
    requestAnimationFrame(() => filaCuponRef.current?.focus());
  };

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
  // Arranca marcada si la persona ya había aceptado las dos en /solicitar, o
  // si es la vista de prueba (el link las siembra, BAL-5381). Leer la vista
  // antes borra una vencida con su casilla sembrada: así no queda marcada en
  // una visita normal.
  const [aceptaTerminos, setAceptaTerminos] = useState(() => {
    leerVistaDePrueba();
    const c = readConsentStorage(landing);
    return c.acceptTerms && c.acceptPrivacy;
  });
  const [aceptaPromos, setAceptaPromos] = useState(false);
  const [errorTerminos, setErrorTerminos] = useState(false);
  // Cada intento fallido vuelve a sacudir la caja (alterna dos animaciones).
  const [intentosTerminos, setIntentosTerminos] = useState(0);

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
      ? `inicial S/${formatCuotaDeLanding(selectedProduct.initialAmount, landing)}`
      : 'sin inicial',
    // Como el prototipo (`footPlan`): los accesorios elegidos van en la leyenda,
    // sin la línea aparte "Equipo S/x + accesorios S/y".
    selectedAccessories.length > 0
      ? `${selectedAccessories.length} ${selectedAccessories.length === 1 ? 'accesorio' : 'accesorios'}`
      : null,
    appliedCoupon ? 'con cupón' : null,
  ].filter(Boolean).join(' · ');
  const totalVisible = formatCuotaDeLanding(total, landing);

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
    if (prefiereMenosMovimiento()) return;
    // `bcPulseA/B` del prototipo: crece 10 % al 40 % y vuelve, 0,45 s ease-out.
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.4 }, { transform: 'scale(1)' }],
      { duration: 450, easing: 'ease-out' },
    );
  }, [totalVisible, codigoCupon]);

  // ── Primer paso del formulario ───────────────────────────────────────────
  const slugPrimerPaso = useMemo(() => slugDelPaso(primerPasoRegular(steps)), [steps]);
  const [navegando, setNavegando] = useState(false);
  const preparando = isConfigLoading || flujo.isLoading;

  // Ya se eligió «Continuar»: un cierre que llegue después no es un abandono.
  // Con doble clic en escritorio, el botón se angosta (ruedita) y el segundo
  // clic cae en «Volver», que registraba un `close` falso (E2E 3 capas).
  const continuandoRef = useRef(false);

  const cerrandoRef = useRef(false);
  const cerrar = useCallback(
    (motivo: string) => {
      if (continuandoRef.current) return;
      // Una sola salida: un segundo cierre mientras se va no cuenta dos veces.
      if (cerrandoRef.current) return;
      cerrandoRef.current = true;
      setAbierto(false);
      analytics.track('lo_quiero_modal_close', {
        motivo,
        product_id: productoId,
        accessories_count: selectedAccessories.length,
        terms_checked: aceptaTerminos,
      });
    },
    [analytics, productoId, selectedAccessories.length, aceptaTerminos],
  );

  // `navegando` es estado: el segundo clic de un doble clic puede no verlo
  // todavía. El candado es un ref y se cierra en el acto (E2E BAL-4969).
  const tomarCandado = useCandadoDeAvance();

  // «Continuar» que no avanza: el motivo, para saber dónde se traba la gente
  // (BAL-5207). Los valores de `reason` son los de ws2 (`user_event.py`).
  const registrarBloqueo = (reason: 'terms' | 'coupon_required' | 'over_quota') => {
    analytics.track('lo_quiero_modal_continue_blocked', { reason, product_id: productoId });
  };

  const continuar = () => {
    if (navegando) return;
    if (!aceptaTerminos) {
      registrarBloqueo('terms');
      setErrorTerminos(true);
      setIntentosTerminos((n) => n + 1);
      terminosRef.current?.focus();
      terminosRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (isCouponRequired && !appliedCoupon) {
      registrarBloqueo('coupon_required');
      setErrorCupon('Debes ingresar un cupón válido para continuar');
      setCuponAbierto(true);
      return;
    }
    if (isOverQuotaLimit) {
      registrarBloqueo('over_quota');
      return;
    }
    if (!tomarCandado()) return;
    continuandoRef.current = true;

    saveConsentStorage(landing, { acceptTerms: true, acceptPrivacy: true, acceptPromos: aceptaPromos });

    analytics.track('lo_quiero_modal_continue', {
      product_id: productoId,
      origen,
      accessories_count: n,
      accessory_ids: selectedAccessories.map((a) => String(a.id)).join(','),
      has_coupon: !!appliedCoupon,
      coupon_code: appliedCoupon?.code ?? null,
      accept_promos: aceptaPromos,
      monthly_total: Math.round(total * 100) / 100,
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
  // Mientras cargan los accesorios no se puede continuar: si la persona sigue
  // antes de verlos, se pierde la venta y el accesorio que iba a elegir
  // (Emilio, 27-oct). Un error de carga NO bloquea: ahí se avisa y se sigue.
  const cargandoAccesorios = accesoriosHabilitados && estadoAcc === 'cargando';
  // Con la cuota sobre el tope el botón se VE apagado pero no lleva `disabled`
  // (va `aria-disabled`): un botón `disabled` no recibe el clic, y ese clic es
  // el que registra `lo_quiero_modal_continue_blocked` con `over_quota`
  // (BAL-5207). `continuar` igual no avanza.
  const botonApagado = preparando || cargandoAccesorios || navegando;
  const botonDeshabilitado = botonApagado || isOverQuotaLimit;

  const alternarTerminos = () => {
    setAceptaTerminos((v) => !v);
    setErrorTerminos(false);
  };

  // El foco vuelve solo a "Ver detalle" al cerrar: es quien abrió la capa.
  const abrirDetalle = (acc: Accessory) => {
    analytics.trackAccessoryView({ accessory_id: String(acc.id), accessory_name: acc.name });
    setDetalle(acc);
    setDetalleAbierto(true);
  };

  const detalleElegido = detalle ? selectedAccessories.some((a) => a.id === detalle.id) : false;
  const datosDetalle = detalle ? datosUtiles(detalle) : [];

  const titulo = hayAccesorios ? `¿Quieres complementar tu ${nombreDelTipo(selectedProduct?.type)}?` : 'Un paso más y empiezas tu solicitud';
  const subtitulo = hayAccesorios
    ? 'Es opcional. Lo que agregues se suma a tu cuota mensual.'
    : 'Revisa tu equipo y acepta los términos para continuar.';

  // Cuerpo con scroll. Siempre trae algo: el aviso del equipo, los accesorios
  // o, sin accesorios, la tarjeta del equipo elegido (sin la franja vacía de antes).
  const cuerpo = (
    <>
          {avisos.map((a) => (
            <CajaAvisoDelEquipo key={a.tipo} aviso={a} />
          ))}
          {!hayAccesorios && !flujo.isLoading && selectedProduct && (
            <TarjetaDelEquipo producto={selectedProduct} regalos={regalosVisibles} />
          )}
          {estadoAcc === 'error' && accesoriosHabilitados && (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-[var(--d2-ambar-borde)] bg-[var(--d2-ambar-suave)] p-3 text-sm text-[var(--d2-ambar-texto)]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>No pudimos cargar los accesorios. Puedes continuar sin ellos.</span>
            </div>
          )}

          {hayAccesorios && (
            <section ref={seccionAccesoriosRef} aria-labelledby="lo-quiero-accesorios" className="scroll-mt-2">
              <div className="flex items-baseline gap-2 mb-2.5">
                <h3 id="lo-quiero-accesorios" className="text-xs font-semibold uppercase tracking-wider text-[var(--d2-texto-seccion)]">
                  Accesorios sugeridos
                </h3>
              </div>
              {estadoAcc === 'cargando' ? (
                <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3" aria-busy="true" aria-label="Cargando accesorios">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="h-[76px] md:h-[188px] rounded-xl border border-[var(--d2-borde-gris)] bg-[var(--d2-gris-suave)] animate-pulse motion-reduce:animate-none" />
                  ))}
                </ul>
              ) : (
                <>
                  <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {/* Lo que ya trae el combo: incluido, sin precio, no se elige */}
                    {regalosVisibles.map((r) => (
                      <li
                        key={`regalo-${r.id}`}
                        className="flex md:flex-col items-center md:items-stretch gap-3 rounded-xl border border-[var(--d2-ok-borde)] bg-[var(--d2-ok-suave-6)] p-2.5 md:p-3"
                      >
                        <ImagenAccesorio src={r.image} className="w-14 h-14 md:w-full md:h-20 rounded-lg" />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="self-start inline-flex items-center gap-1 rounded-full bg-[var(--d2-ok-suave-4)] px-2 py-0.5 text-[11px] font-semibold text-[var(--d2-ok-texto)]">
                            <Check className="w-3 h-3" strokeWidth={3} aria-hidden />
                            {r.gratis ? 'Incluido gratis' : 'Incluido en tu equipo'}
                          </span>
                          <p className="mt-1 text-sm font-semibold text-[var(--d2-texto-titulo)] line-clamp-2 md:min-h-[2.5rem]">{nombreParaMostrar(r.name)}</p>
                          <p className="hidden md:flex mt-auto items-center gap-1 text-xs text-[var(--d2-ok-texto)]">
                            <Gift className="w-3.5 h-3.5" aria-hidden /> Ya viene con tu equipo
                          </p>
                        </div>
                      </li>
                    ))}
                    {accesoriosVisibles.map((acc, i) => {
                      const recienAbierto = verTodos && i >= enLaGrilla;
                      const elegido = selectedAccessories.some((a) => a.id === acc.id);
                      const nombre = nombreParaMostrar(acc.name, acc.brand?.name);
                      return (
                        <li
                          key={acc.id}
                          style={recienAbierto ? { animationDelay: `${Math.min(i - enLaGrilla, 8) * 40}ms` } : undefined}
                          className={`${recienAbierto ? 'd2-acc-entra ' : ''}relative flex md:flex-col items-center md:items-stretch gap-3 md:gap-2 rounded-xl border-[1.5px] px-3 py-2.5 md:p-2.5 transition-[border-color,background-color] duration-150 ${
                            elegido
                              ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.04)]'
                              : 'border-[var(--d2-borde)] bg-[var(--d2-tarjeta)]'
                          }`}
                        >
                          {/* Foto con el check de "agregado" (prototipo: arriba a la derecha). */}
                          <div className="relative shrink-0 md:w-full">
                            <ImagenAccesorio src={acc.thumbnailUrl || acc.image} className="w-14 h-14 md:w-full md:h-16 rounded-[10px]" />
                            {elegido && (
                              <span className="absolute -top-1.5 -right-1.5 md:top-1.5 md:right-1.5 w-[22px] h-[22px] md:w-6 md:h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center d2-check-in" aria-hidden>
                                <Check className="w-3 h-3 md:w-[13px] md:h-[13px] text-[var(--color-on-primary)]" strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-px md:gap-2">
                            <p className="text-sm font-semibold text-[var(--d2-texto)] line-clamp-2 leading-[1.25] md:min-h-[35px]">{nombre}</p>
                            {/* Precio y "Ver detalle" (prototipo): en celular uno debajo del
                                otro; en escritorio en una fila, con el botón abajo. */}
                            <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between md:gap-1.5">
                              <span className="text-[13px] md:text-sm font-bold text-[var(--color-primary-text)] md:text-[var(--d2-texto)] whitespace-nowrap">
                                +S/{formatCuotaDeLanding(acc.monthlyQuota, landing)}{sufijo}
                              </span>
                              <button
                                type="button"
                                data-ver-detalle
                                onClick={() => abrirDetalle(acc)}
                                aria-label={`Ver detalle de ${nombre}`}
                                className="-my-2.5 md:my-0 inline-flex min-h-[44px] items-center whitespace-nowrap rounded-sm text-[12.5px] md:text-[13px] font-semibold text-[var(--color-primary-text)] underline underline-offset-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                              >
                                Ver detalle
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => alternarAccesorio(acc)}
                            aria-pressed={elegido}
                            aria-label={`${elegido ? 'Quitar' : 'Agregar'} ${nombre}`}
                            className={`shrink-0 min-h-[44px] md:min-h-[40px] px-4 md:w-full rounded-xl border-[1.5px] border-[var(--color-primary)] text-sm font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                              elegido
                                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-95'
                                : 'bg-[var(--d2-tarjeta)] text-[var(--color-primary-text)] hover:bg-[rgba(var(--color-primary-rgb),0.06)]'
                            }`}
                          >
                            {elegido ? (
                              <>
                                Agregado <Check className="w-4 h-4 d2-check-in" strokeWidth={3} aria-hidden />
                              </>
                            ) : (
                              'Agregar'
                            )}
                          </button>
                        </li>
                      );
                    })}
                    {hayMas && !verTodos && (
                      <li className="flex">
                        <button
                          type="button"
                          onClick={abrirTodos}
                          aria-expanded={false}
                          aria-label={`Ver ${escondidos.length} accesorios más`}
                          className="w-full flex md:flex-col items-center md:justify-center gap-3 md:gap-2 rounded-xl border-[1.5px] border-dashed border-[rgba(var(--color-primary-rgb),0.45)] bg-[rgba(var(--color-primary-rgb),0.04)] px-3 py-2.5 md:p-2.5 min-h-[76px] text-[var(--color-primary-text)] hover:bg-[rgba(var(--color-primary-rgb),0.08)] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                        >
                          {/* Adelanto de lo que hay: hasta 3 miniaturas encimadas. */}
                          <span className="flex -space-x-3 shrink-0" aria-hidden>
                            {escondidos.slice(0, 3).map((a) => (
                              <ImagenAccesorio key={a.id} src={a.thumbnailUrl || a.image} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[var(--d2-tarjeta)]" />
                            ))}
                          </span>
                          <span className="flex-1 md:flex-none text-left md:text-center">
                            <span className="block text-base md:text-lg font-bold leading-tight">+{escondidos.length} más</span>
                            <span className="block text-xs font-semibold opacity-80">Ver todos los accesorios</span>
                          </span>
                          <ChevronDown className="w-4 h-4 shrink-0 md:hidden" aria-hidden />
                        </button>
                      </li>
                    )}
                  </ul>
                  {hayMas && verTodos && (
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={verMenos}
                        aria-expanded
                        className={`${BOTON_SECUNDARIO_V2} gap-1`}
                      >
                        Ver menos
                        <ChevronDown className="w-4 h-4 rotate-180" aria-hidden />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
    </>
  );

  /* Pie fijo */
        {/* Celular (QA a 360 px, BAL-4969): pie compacto para que los
            accesorios tengan más alto —filas de 40 px pegadas (la fila entera
            es la zona táctil), la leyenda en una línea arriba y el precio al
            lado del botón—. Escritorio, igual que antes. */}
  const pie = (
        <div data-pie-lo-quiero className="w-full">
          {/* Lista simple (BAL-4958, aprobado por Emilio): tres filas iguales,
              sin cajas, alineadas a la izquierda, igual en celular y escritorio.
              - Términos: los enlaces van DENTRO de la frase. Tocar la frase o la
                casilla marca; tocar un enlace abre el documento y NO marca.
                La casilla es solo el cuadrito (`role="checkbox"`), así que los
                enlaces nunca quedan dentro del control (QA F10 · Falla 1).
              - El cupón se escribe en un modal chico encima de este. */}
          <div className="flex flex-col gap-1.5">
            {/* Caja de Términos (prototipo de Brenda, `bcConsent`): ámbar con un
                brillo al llegar, naranja y sacudida si intentan seguir sin
                marcarla, verde al marcarla. Borde de 2 px y radio de 14 px
                como en el prototipo (BAL-5383); el subtexto solo aparece con
                el error, igual que en el prototipo. Con reduced-motion cambian
                solo los colores (`globals.css`). */}
            <div
              data-terminos-v2={aceptaTerminos ? 'marcada' : errorTerminos ? 'error' : 'neutra'}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('a')) return;
                alternarTerminos();
              }}
              className={`flex items-center gap-3 rounded-[14px] border-2 px-3 py-[11px] md:px-4 md:py-3 cursor-pointer select-none transition-colors duration-150 ${
                aceptaTerminos
                  ? 'border-[var(--d2-ok)] bg-[var(--d2-ok-suave-3)]'
                  : errorTerminos
                    ? `border-[var(--d2-error)] bg-[var(--d2-error-suave)] ${intentosTerminos % 2 ? 'd2-sacudida-a' : 'd2-sacudida-b'}`
                    : 'border-[var(--d2-aviso-borde)] bg-[var(--d2-aviso-suave)] d2-brillo-consentimiento'
              }`}
            >
              <button
                ref={terminosRef}
                type="button"
                role="checkbox"
                aria-checked={aceptaTerminos}
                aria-invalid={errorTerminos && !aceptaTerminos}
                aria-labelledby="lo-quiero-terminos-texto"
                aria-describedby={errorTerminos && !aceptaTerminos ? 'lo-quiero-terminos-error' : undefined}
                className={`w-6 h-6 md:w-[22px] md:h-[22px] rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                  aceptaTerminos
                    ? 'bg-[var(--d2-ok-relleno)] border-[var(--d2-ok)]'
                    : errorTerminos
                      ? 'bg-[var(--d2-tarjeta)] border-[var(--d2-error)]'
                      : 'bg-[var(--d2-tarjeta)] border-[var(--d2-borde-casilla)]'
                }`}
              >
                {aceptaTerminos && <Check className="w-3.5 h-3.5 text-white d2-check-in" strokeWidth={3} aria-hidden />}
              </button>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span id="lo-quiero-terminos-texto" className="text-[13px] md:text-sm font-semibold leading-[1.3] text-[var(--d2-texto)]">
                  Acepto los{' '}
                  <a
                    href={routes.legal(landing, 'terminos-y-condiciones')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline underline-offset-2 text-[var(--color-primary-text)] hover:opacity-80 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    Términos
                  </a>{' '}
                  y la{' '}
                  <a
                    href={routes.legal(landing, 'politica-de-privacidad')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline underline-offset-2 text-[var(--color-primary-text)] hover:opacity-80 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    Política de privacidad
                  </a>
                </span>
                {errorTerminos && !aceptaTerminos && (
                  <span
                    id="lo-quiero-terminos-error"
                    role="alert"
                    className="d2-aparece block text-[12.5px] md:text-[13px] leading-[1.35] font-bold text-[var(--d2-error-texto)]"
                  >
                    Marca la casilla para continuar.
                  </span>
                )}
              </span>
            </div>

            <div
              onClick={() => setAceptaPromos((v) => !v)}
              className="flex items-center gap-3 min-h-[40px] md:min-h-[44px] px-3 md:px-4 cursor-pointer select-none"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={aceptaPromos}
                aria-labelledby="lo-quiero-promos-texto"
                className={`w-6 h-6 md:w-[22px] md:h-[22px] rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                  aceptaPromos ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-[var(--d2-tarjeta)] border-[var(--d2-borde-casilla)]'
                }`}
              >
                {aceptaPromos && <Check className="w-3.5 h-3.5 text-[var(--color-on-primary)] d2-check-in" strokeWidth={3} aria-hidden />}
              </button>
              <span id="lo-quiero-promos-texto" className="flex-1 min-w-0 text-[13px] md:text-sm font-semibold leading-[1.3] text-[var(--d2-texto)]">
                Quiero recibir promociones <span className="font-normal text-[var(--d2-texto-tenue)]">(opcional)</span>
              </span>
            </div>

          </div>

          {isOverQuotaLimit && (
            <div role="alert" className="d2-aparece mt-2 flex items-start gap-2 rounded-lg border border-[var(--d2-ambar-borde)] bg-[var(--d2-ambar-suave)] px-3 py-2 text-sm text-[var(--d2-ambar-texto)]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>La cuota supera el límite de S/{maxMonthlyQuota}/mes. Quita algún accesorio para continuar.</span>
            </div>
          )}

          {/* Total, cupón y botones (prototipo de Brenda): en escritorio una
              fila —total, "Agregar cupón", Volver y Continuar—; en celular el
              total con el cupón al lado y Continuar a todo lo ancho abajo. */}
          <div className="mt-2.5 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex min-w-0 items-center justify-between gap-3 md:justify-start md:gap-[18px]">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="leading-none whitespace-nowrap" aria-live="polite">
                  <span
                    ref={totalRef}
                    className="inline-block origin-left font-['Baloo_2',_sans-serif] text-[30px] md:text-[32px] font-bold text-[var(--color-primary-text)]"
                  >
                    S/{totalVisible}
                  </span>
                  <span className="ml-0.5 text-[15px] font-semibold text-[var(--color-primary-text)]">{sufijo}</span>
                </p>
                <p className="truncate text-xs text-[var(--d2-texto-suave)]">{leyenda}</p>
                {/* Cuota diferida (prototipo, `prod.diferida`): pastilla verde
                    con el mes real de la primera cuota (ws2). */}
                {esDiferida && mesPrimeraCuota && (
                  <span data-diferida-v2 className="self-start inline-flex items-center gap-[5px] whitespace-nowrap rounded-full bg-[var(--d2-ok-suave)] px-[9px] py-[3px] text-xs font-bold text-[var(--d2-ok-texto)]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M16 3v4M8 3v4M3 10h18" />
                    </svg>
                    1.ª cuota en {mesPrimeraCuota}
                  </span>
                )}
              </div>
              {cuponVisible && (
                <div className="flex shrink-0 flex-col items-end">
                  {appliedCoupon ? (
                    <div role="status" className="flex flex-col items-end gap-0.5">
                      <span className="inline-flex min-h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--d2-ok-suave)] px-3 text-[13.5px] font-bold text-[var(--d2-ok-texto)]">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                        Cupón {appliedCoupon.code}
                        {appliedCoupon.lockedFromUrl && (
                          <Lock className="h-3.5 w-3.5" aria-label="Cupón de campaña: no se puede quitar" />
                        )}
                      </span>
                      {!appliedCoupon.lockedFromUrl && (
                        <button
                          ref={filaCuponRef}
                          type="button"
                          onClick={quitarCuponDeLaFila}
                          aria-label={`Quitar cupón ${appliedCoupon.code}`}
                          className="-my-2 inline-flex min-h-[44px] items-center rounded-sm px-1 text-[12.5px] font-bold text-[var(--d2-ok-texto)] underline underline-offset-2 hover:opacity-80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      ref={filaCuponRef}
                      type="button"
                      onClick={abrirCupon}
                      aria-haspopup="dialog"
                      className="inline-flex min-h-[44px] md:min-h-[38px] items-center gap-1.5 whitespace-nowrap rounded-xl border-[1.5px] border-dashed border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.07)] px-3.5 text-sm font-bold text-[var(--color-primary-text)] cursor-pointer transition-colors duration-150 hover:bg-[rgba(var(--color-primary-rgb),0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                      <Tag className="h-4 w-4 shrink-0" aria-hidden />
                      Agregar cupón
                      {isCouponRequired && <span className="font-semibold opacity-80"> (obligatorio)</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={() => cerrar('volver')}
                className="hidden md:inline-flex min-h-[48px] items-center rounded-xl border-[1.5px] border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] px-[18px] text-[15px] font-semibold text-[var(--d2-texto)] cursor-pointer transition-colors duration-150 hover:bg-[var(--d2-gris-suave)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={continuar}
                disabled={botonApagado}
                aria-disabled={botonDeshabilitado || undefined}
                className={`w-full md:w-auto min-h-[48px] px-[22px] rounded-xl text-base font-bold inline-flex items-center justify-center gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] ${
                  botonDeshabilitado
                    ? 'bg-[var(--d2-boton-apagado)] text-[var(--d2-boton-apagado-texto)] cursor-not-allowed'
                    : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.25)] hover:brightness-90 cursor-pointer'
                }`}
              >
                {preparando || cargandoAccesorios || navegando ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin motion-reduce:animate-none" aria-label="Cargando" />
                ) : (
                  <>
                    {textoBoton}
                    <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.4} aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>
          {errorCupon && !appliedCoupon && !cuponAbierto && (
            <p role="alert" className="d2-aparece mt-1 text-xs font-semibold text-[var(--d2-error-rojo)]">{errorCupon}</p>
          )}
        </div>
  );

  return (
    <>
      <ModalV2
        abierto={abierto}
        onCerrar={cerrar}
        onSalidaTerminada={onClose}
        icono={ShoppingBag}
        titulo={titulo}
        subtitulo={subtitulo}
        idTitulo="lo-quiero-titulo"
        idSubtitulo="lo-quiero-subtitulo"
        ancho="grande"
        claseCuerpo="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-3 md:p-5 md:pt-6"
        clasePie="shrink-0 border-t border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] px-4 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:px-5 md:pt-3 md:pb-4"
        pie={pie}
      >
        {cuerpo}
      </ModalV2>

      {/* Detalle del accesorio: capa propia encima del modal. Al salir se
          suelta el accesorio; el foco vuelve solo a su "Ver detalle". */}
      {detalle && (
        <ModalV2
          abierto={detalleAbierto}
          onCerrar={cerrarDetalle}
          onSalidaTerminada={() => setDetalle(null)}
          icono={Package}
          titulo={nombreParaMostrar(detalle.name, detalle.brand?.name)}
          subtitulo="Accesorio sugerido"
          idTitulo="lo-quiero-detalle-titulo"
          etiquetaCerrar="Cerrar detalle"
          capa={1010}
          pie={
            <>
              <button type="button" onClick={cerrarDetalle} className={BOTON_SECUNDARIO_V2}>
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  alternarAccesorio(detalle);
                  cerrarDetalle();
                }}
                className={`${BOTON_PRIMARIO_V2} flex-1 md:flex-none`}
              >
                {detalleElegido ? 'Quitar de mi solicitud' : 'Agregar a mi solicitud'}
              </button>
            </>
          }
        >
          {/* Hoja "Ver detalle" (prototipo de Brenda): foto, la cuota en su
              caja, la descripción y las características que trae el accesorio. */}
          <div className="flex flex-col gap-3.5">
            <ImagenAccesorio src={detalle.image || detalle.thumbnailUrl} className="w-full h-40 rounded-xl p-3" />
            <div className="rounded-xl bg-[var(--d2-fondo)] px-3.5 py-3 flex flex-col gap-0.5">
              <p className="leading-none">
                <span className="text-[22px] font-bold text-[var(--color-primary-text)]">
                  +S/{formatCuotaDeLanding(detalle.monthlyQuota, landing)}
                </span>
                <span className="text-sm font-semibold text-[var(--color-primary-text)]">{sufijo}</span>
              </p>
              {detalle.price > 0 && (
                <p className="text-[13px] text-[var(--d2-texto-suave)]">
                  S/{formatCuotaDeLanding(detalle.price, landing)} en {detalle.term ?? plazo} cuotas
                </p>
              )}
            </div>
            {detalle.description?.trim() && (detalle.specs?.length ?? 0) > 0 && (
              <p className="text-[15px] leading-snug text-[var(--d2-texto-2)] whitespace-pre-line">{detalle.description.trim()}</p>
            )}
            {datosDetalle.length > 0 && (
              <ul className="space-y-1.5">
                {datosDetalle.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-[var(--d2-texto-2)]">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-primary-text)]" aria-hidden />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ModalV2>
      )}

      {/* Cupón: modal chico encima de este (BAL-4958). Escape lo cierra solo
          a él; la validación es la de `CouponInput`, que vive adentro. */}
      <ModalV2
        abierto={cuponAbierto}
        onCerrar={cerrarCupon}
        devolverFoco={focoDeLaFilaCupon}
        icono={Tag}
        titulo="Ingresa tu cupón"
        subtitulo={isCouponRequired ? 'Esta landing pide un cupón para continuar' : 'Si tienes un código de descuento, aplícalo aquí'}
        idTitulo="lo-quiero-cupon-titulo"
        etiquetaCerrar="Cerrar cupón"
        enfoqueInicial="input"
        ancho="chico"
        capa={1020}
      >
        <CouponInput compacto isRequired={isCouponRequired} />
        {errorCupon && !appliedCoupon && (
          <p role="alert" className="d2-aparece text-xs font-semibold text-[var(--d2-error-rojo)] mt-1.5">{errorCupon}</p>
        )}
      </ModalV2>
    </>
  );
}

export default LoQuieroModal;
