'use client';

/**
 * CopiaHomeDesktopDetail — variante DESKTOP del detalle de producto para la
 * landing `copia-home` (mockup seminuevos). Se monta SOLO en desktop y SOLO
 * para equipos reacondicionados; los equipos nuevos y el resto de landings
 * siguen usando el detalle estándar (ProductDetail).
 *
 * Reutiliza los datos reales del detalle (ProductDetailResult), la calculadora
 * estándar (PricingCalculator) sobre los planes reales, el cronograma, el flujo
 * canónico de "Lo quiero" (aviso reacondicionado → setSelectedProduct →
 * /solicitar) y el aviso RefurbishedWarningModal. Es el equivalente desktop de
 * CopiaHomeMobileDetail, con el layout de dos columnas + ancho completo del
 * mockup de escritorio.
 *
 * Reglas de negocio (idénticas a la variante mobile):
 *  - Grados A/B/C SOLO para reacondicionados (constructo FE-only, el backend no
 *    modela grados). Solo el Grado A es comprable; B y C se muestran pero
 *    renderizan "No disponible" (sin CTA "Lo quiero").
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ShieldCheck, BadgeCheck, Package, Check, Battery, Monitor,
  Star, RefreshCw, Heart, Cpu, Calendar, Store, CalendarDays, Rotate3d,
  FileText, Download, Truck, ArrowRight,
} from 'lucide-react';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { esFamilyFarms } from '@/app/prototipos/0.6/utils/familyFarms';
import type { SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { RefurbishedWarningModal, isRefurbishedCondition } from '@/app/prototipos/0.6/components/RefurbishedWarningModal';
import type { ProductDetailResult } from '../api/productDetailApi';
import { PricingCalculator, type PricingSelection } from '../components/detail/pricing/PricingCalculator';
import { Cronograma } from '../components/detail/cronograma/Cronograma';
import { formatMoneyNoDecimals } from '../utils/formatMoney';
import { formatCuotaDeLanding } from '@/app/prototipos/0.6/utils/formatCuota';
import { POLITICAS_PDF_URL, POLITICAS_PDF_FILENAME } from './politicasPdf';
import { factoryWarranty, hasDeferredShipping, DEFERRED_SHIPPING_NOTE } from './seminuevoHelpers';
import { IPHONE_GRADE_IMAGES, isIphoneName } from './iphoneGradeGallery';
import GradeThumbStrip from './GradeThumbStrip';
import { targetSlugForGrade, currentGrade } from './gradeSelector';
import { FamilyFarmGradeSelector, type GradeOption } from '../family-farm/FamilyFarmGradeSelector';
import type { WishlistItem, TermMonths, InitialPaymentPercent } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';
import styles from './copiaHomeDesktop.module.css';

const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;

type GradeKey = 'A' | 'B' | 'C';

interface GradeInfo {
  bateria: string; aspecto: string; condicion: string; reemplazo: string; disponible: boolean;
}

// Grados FE-only (el backend no modela grados). Solo A disponible; B y C no.
// Mismos valores que CopiaHomeMobileDetail para consistencia entre modos.
const GRADES: Record<GradeKey, GradeInfo> = {
  A: { bateria: 'Mayor a 80%', aspecto: '9.5/10', condicion: '9.5/10', reemplazo: 'Ninguno', disponible: true },
  B: { bateria: '70% a 80%', aspecto: '7/10', condicion: '8/10', reemplazo: 'Componentes menores', disponible: false },
  C: { bateria: '60% a 70%', aspecto: '6/10', condicion: '6/10', reemplazo: 'Batería / teclado', disponible: false },
};

interface Props {
  apiData: ProductDetailResult;
  landing: string;
  isAvailable?: boolean;
  defaultTerm?: number;
  defaultInitialPercent?: number;
  defaultFrequency?: string;
  onToggleWishlist?: (item: WishlistItem) => void;
  isInWishlist?: boolean;
  /** `familyfarm` cambia el selector de grados por el de la campaña (BAL-2812). */
  gradeVariant?: 'default' | 'familyfarm';
  /**
   * Día del que arranca el cronograma. Lo resuelve el cliente del detalle con
   * `inicioDelCronograma`: la fecha fija de la campaña si la landing la
   * configuró, hoy si no.
   */
  startDate?: Date;
}

export function CopiaHomeDesktopDetail({
  apiData,
  landing,
  isAvailable = true,
  defaultTerm,
  defaultInitialPercent,
  defaultFrequency,
  onToggleWishlist,
  isInWishlist = false,
  gradeVariant = 'default',
  startDate,
}: Props) {
  const router = useRouter();
  const product = apiData.product;
  const paymentPlans = apiData.paymentPlans ?? [];

  // El endpoint de detalle no siempre devuelve `condition`, pero el nombre de
  // los seminuevos sí trae "Semi Nuevo". Detectamos por condición o por nombre.
  const fullName = `${product.name ?? ''} ${product.displayName ?? ''}`;
  const isRefurbished =
    isRefurbishedCondition(product.condition) ||
    /semi\s*nuevo|seminuevo|reacondicion/i.test(fullName);

  // Envío diferido (15/07): iPhone seminuevos e iPads.
  const deferredShipping = hasDeferredShipping({
    name: fullName, condition: product.condition, deviceType: product.deviceType, brand: product.brand,
  });

  // Garantía de fábrica según modelo (item 3).
  const warranty = factoryWarranty(fullName, product.warranty);
  const isIphone = isIphoneName(fullName);

  // ---- Colores / galería ----
  const hasSiblings = !!(product.colorSiblings && product.colorSiblings.length > 1);
  const displayColors = hasSiblings
    ? product.colorSiblings.map((s) => ({ id: String(s.productId), name: s.color, hex: s.colorHex, slug: s.slug }))
    : (product.colors ?? []).map((c) => ({ id: c.id, name: c.name, hex: c.hex, slug: product.slug }));
  const initialColorId = hasSiblings
    ? String(product.colorSiblings.find((s) => String(s.productId) === String(product.id))?.productId ?? product.colorSiblings[0].productId)
    : (displayColors[0]?.id ?? '');
  const [colorId, setColorId] = useState(initialColorId);
  const selectedColor = displayColors.find((c) => c.id === colorId);

  // ---- Grado ----
  const gradeSiblings = product.gradeSiblings ?? [];
  const hasRealGrades = gradeSiblings.length > 0;
  const [grade, setGrade] = useState<GradeKey>(
    (currentGrade(gradeSiblings, Number(product.id)) as GradeKey) || 'A',
  );
  const gradeInfo = isRefurbished ? GRADES[grade] : null;
  const realGradeSib = gradeSiblings.find((s) => s.grade === grade);
  const gradeAvailable = isRefurbished
    ? (hasRealGrades ? !!realGradeSib?.isAvailable : GRADES[grade].disponible)
    : true;
  const canBuy = isAvailable && gradeAvailable;
  // Mismo set que gradeButtons, con el precio y la disponibilidad de cada grado:
  // los necesita el selector de Family Farms para poner el precio en la tarjeta.
  const gradeOptions: GradeOption[] = hasRealGrades
    ? [...gradeSiblings]
        .sort((a, b) => a.grade.localeCompare(b.grade))
        .map((s) => ({
          grade: s.grade as GradeKey,
          // `price` NO se pinta en la tarjeta: alimenta el panel de ahorro.
          price: s.price ?? undefined,
          minTermQuota: s.minTermQuota,
          isAvailable: s.isAvailable,
        }))
    : (Object.keys(GRADES) as GradeKey[]).map((g) => ({ grade: g, isAvailable: GRADES[g].disponible }));
  const gradeButtons: GradeKey[] = hasRealGrades
    ? [...gradeSiblings].sort((a, b) => a.grade.localeCompare(b.grade)).map((s) => s.grade as GradeKey)
    : (['A', 'B', 'C'] as GradeKey[]);

  // Galería principal (hero): SIEMPRE imágenes reales del producto. Las
  // referenciales por grado viven en "Elige el grado".
  const iphoneGradeGallery = isIphone && isRefurbished;
  const galleryImages = useMemo<{ url: string }[]>(() => {
    const imgs = product.images.filter((i) => i.type !== 'video' && !/\.(mp4|webm|ogg)(\?|$)/i.test(i.url));
    const list = imgs.length > 0 ? imgs : product.images;
    return list.map((i) => ({ url: i.url }));
  }, [product.images]);
  const [imgSel, setImgSel] = useState(0);

  // Carrusel dentro de "Elige el grado": iPhone seminuevo → referenciales por grado
  // (S3, cambian con el grado); resto → las mismas imágenes reales del producto.
  const gradeImages = useMemo<string[]>(
    () => (iphoneGradeGallery ? IPHONE_GRADE_IMAGES[grade] : galleryImages.map((g) => g.url)),
    [iphoneGradeGallery, grade, galleryImages],
  );
  const [gradeImgSel, setGradeImgSel] = useState(0);

  // Al cambiar de grado reseteamos las miniaturas activas.
  const selectGrade = (g: GradeKey) => {
    if (hasRealGrades) {
      const slug = targetSlugForGrade(gradeSiblings, g);
      if (slug && slug !== product.slug) {
        router.push(routes.producto(landing, slug));
        return;
      }
    }
    setGrade(g); setImgSel(0); setGradeImgSel(0);
  };

  // ---- Calculadora: componente estándar (PricingCalculator) ----
  const initialTerm = useMemo(() => {
    const ts = paymentPlans.map((p) => p.term);
    if (defaultTerm && ts.includes(defaultTerm)) return defaultTerm;
    return ts.length ? Math.max(...ts) : 24;
  }, [paymentPlans, defaultTerm]);
  const [pricingSel, setPricingSel] = useState<PricingSelection | null>(null);
  const term = pricingSel?.term ?? initialTerm;
  const initialPercent = pricingSel?.initialPercent ?? (defaultInitialPercent ?? 0);
  const monthlyQuota = Math.floor(pricingSel?.monthlyQuota ?? product.lowestQuota ?? 0);
  const initialAmount = Math.floor(pricingSel?.initialAmount ?? 0);
  const paymentFrequency = pricingSel?.paymentFrequency ?? defaultFrequency ?? 'mensual';
  // La barra decia "/mes" siempre: en un plan semanal prometia la cuota
  // de la semana como si fuera del mes, doce veces mas barato de lo real.
  const freqShort = paymentFrequency === 'semanal' ? '/sem'
    : paymentFrequency === 'quincenal' ? '/qcn' : '/mes';
  // En cuantas armadas se cobra la inicial de la opcion elegida. Viene con la
  // opcion, no es una eleccion aparte: cada modalidad es una celda propia del
  // pricing con su plazo. 1 = pago unico, el default de todo el catalogo.
  const initialInstallments = pricingSel?.initialInstallments ?? 1;

  // Specs reales del equipo y otros seminuevos.
  const specCategories = product.specs ?? [];
  const hasSpecs = specCategories.some((c) => c.specs && c.specs.length > 0);
  const similares = apiData.similarProducts ?? [];

  // ---- Modales ----
  const [showRefurb, setShowRefurb] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  // ---- Navegación color (siblings) ----
  const onColor = (id: string) => {
    if (hasSiblings) {
      const sib = product.colorSiblings.find((s) => String(s.productId) === id);
      if (sib && sib.slug !== product.slug) {
        router.push(routes.producto(landing, sib.slug));
        return;
      }
    }
    setColorId(id);
    setImgSel(0);
  };

  function getSpec(category: string, label: string): string | undefined {
    const cat = product.specs.find((s) => s.category.toLowerCase() === category.toLowerCase());
    if (!cat) return undefined;
    return cat.specs.find((s) => s.label.toLowerCase().includes(label.toLowerCase()))?.value;
  }

  // ---- "Lo quiero" canónico ----
  const proceedToSolicitar = useCallback(() => {
    // Blindaje: Grado B/C (o equipo no disponible) NUNCA puede continuar.
    if (!canBuy) return;
    const thumbnail = apiData.combo?.thumbnailUrl || galleryImages[0]?.url || product.images[0]?.url || '';
    const selected: SelectedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: Math.floor(product.price),
      monthlyPayment: monthlyQuota,
      months: term,
      term,
      initialPercent,
      initialAmount,
      initialInstallments,
      // La frecuencia va con el producto: el formulario la relee de aca y sin
      // ella reconstruye 'mensual', mostrando «17 meses» y «S/46/mes» para un
      // plan que se cobra por semana.
      paymentFrequency,
      image: thumbnail,
      type: product.deviceType as SelectedProduct['type'],
      condition: product.condition,
      variantId: product.variantId != null ? String(product.variantId) : (colorId || undefined),
      colorName: selectedColor?.name,
      colorHex: selectedColor?.hex,
      specs: {
        processor: getSpec('procesador', 'modelo') || getSpec('processor', 'model') || '',
        ram: getSpec('memoria', 'capacidad') || getSpec('ram', 'size') || '',
        storage: getSpec('almacenamiento', 'capacidad') || getSpec('storage', 'size') || '',
      },
      paymentPlans: undefined,
      comboId: apiData.combo?.id,
    };
    try {
      localStorage.setItem(getStorageKey(landing), JSON.stringify(selected));
      localStorage.removeItem(getCartProductsKey(landing));
    } catch { /* localStorage no disponible */ }
    router.push(routes.solicitar(landing));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBuy, apiData, product, monthlyQuota, term, initialPercent, initialAmount, paymentFrequency, colorId, selectedColor, landing, router, galleryImages]);

  const onLoQuiero = () => {
    if (!canBuy) return;
    if (isRefurbished) { setShowRefurb(true); return; }
    proceedToSolicitar();
  };

  const handleToggleWishlist = () => {
    if (!onToggleWishlist) return;
    const thumbnail = apiData.combo?.thumbnailUrl || galleryImages[0]?.url || product.images[0]?.url || '';
    onToggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      image: thumbnail,
      lowestQuota: monthlyQuota,
      type: product.deviceType as WishlistItem['type'],
      months: term as TermMonths,
      initialPercent: initialPercent as InitialPaymentPercent,
      initialAmount,
      monthlyPayment: monthlyQuota,
      variantId: product.variantId != null ? String(product.variantId) : (colorId || undefined),
      colorName: selectedColor?.name,
      colorHex: selectedColor?.hex,
      addedAt: Date.now(),
    });
  };

  // ---- "¿Qué incluye?" ----
  // Accesorios vienen del combo real en DB (landing_product.combo_id → combo_item).
  const comboAccessories = apiData.combo?.accessories?.map((a) => a.productName) ?? [];
  const hasCombo = comboAccessories.length > 0;
  const accesorios = comboAccessories;
  const showIncluye = hasCombo;

  const condRows = [
    { l: 'Condición de batería', v: '80 - 99%', blue: true },
    { l: 'Pantalla táctil', v: 'Bueno' },
    { l: 'Cámara', v: 'Bueno' },
    { l: 'IMEI', v: 'Registrado' },
    { l: 'Puertos USB', v: 'Bueno' },
  ];

  const heroImg = galleryImages[imgSel]?.url;

  return (
    <div className={styles.root}>
      <div className={styles.wrap}>
        <button type="button" className={styles.volver} onClick={() => router.push(routes.catalogo(landing))}>
          <ChevronLeft size={18} /> Volver al catálogo
        </button>

        <div className={styles.detTop}>
          {/* ===== Columna izquierda: galería + seguridad ===== */}
          <div className={styles.detGal}>
            <div className={`${styles.panel} ${styles.gal}`}>
              {isRefurbished && <span className={styles.prodBadge}>Seminuevo</span>}
              <div className={styles.heroImg}>
                {heroImg && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroImg} alt={product.displayName} />
                )}
                <span className={styles.heroTag}>IMAGEN REFERENCIAL</span>
                <span className={styles.heroCount}>{imgSel + 1} / {galleryImages.length}</span>
              </div>
              {galleryImages.length > 1 && (
                <div className={styles.thumbs}>
                  {galleryImages.slice(0, 5).map((im, i) => (
                    <div key={i} className={`${styles.thumb} ${i === imgSel ? styles.thumbOn : ''}`} onClick={() => setImgSel(i)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={im.url} alt={`${product.displayName} ${i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* El retiro en oficinas no aplica en un convenio de campo: el equipo
                llega por el convenio y no hay oficina a la que ir. */}
            {canBuy && !esFamilyFarms(landing) && (
              <div className={styles.panel}>
                <div className={styles.secTitle} style={{ marginBottom: 14 }}>Seguridad del equipo</div>
                <div className={styles.recojoBanner}>
                  <div className={styles.rbRow}>
                    <div className={styles.rbIco}><Store size={30} strokeWidth={1.8} /></div>
                    <p className={styles.rbText}>
                      <b>¡Sabemos que ver el producto hace la diferencia!</b> Financia hoy y agenda una cita
                      en nuestras oficinas para el recojo de tu equipo, en caso lo prefieras.
                    </p>
                  </div>
                  <button type="button" className={styles.rbLink} onClick={() => setShowAgenda(true)}>
                    <CalendarDays size={15} /> ¿Cómo agendar?
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== Columna derecha: caja de compra ===== */}
          <div>
            <div className={styles.panel}>
              <div className={styles.buyMarca}>{product.brand}</div>
              <div className={styles.buyTitle}>{product.displayName}</div>

              {displayColors.length > 0 && (
                <>
                  <div className={styles.detalleSwatches}>
                    {displayColors.map((c) => (
                      <div
                        key={c.id}
                        className={`${styles.dSwatch} ${c.id === colorId ? styles.dSwatchOn : ''}`}
                        style={{ background: c.hex }}
                        onClick={() => onColor(c.id)}
                      >
                        <span className={styles.tick}><Check size={13} strokeWidth={3.5} /></span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.colorLabel}>Color: {selectedColor?.name ?? '—'}</div>
                </>
              )}

              {/* Elige el grado (solo reacondicionado) */}
              {isRefurbished && gradeInfo && (
                <div className={styles.block}>
                  {gradeVariant === 'familyfarm' ? (
                    <FamilyFarmGradeSelector
                      grades={gradeOptions}
                      selected={grade}
                      onSelect={selectGrade}
                      // La frecuencia del MISMO payload que trajo las cuotas, no
                      // la de la calculadora: esa se refresca sola y dejaría la
                      // etiqueta cambiando mientras el número queda fijo.
                      paymentFrequency={paymentPlans[0]?.paymentFrequency}
                    />
                  ) : (
                  <>
                  <div className={styles.blockT}>Elige el grado</div>
                  <div className={styles.grados}>
                    {gradeButtons.map((g) => (
                      <button key={g} type="button" className={`${styles.grado} ${g === grade ? styles.gradoOn : ''}`} onClick={() => selectGrade(g)}>
                        Grado {g}<span className={styles.gTick}><Check size={12} strokeWidth={3.5} /></span>
                      </button>
                    ))}
                  </div>
                  </>
                  )}
                  {/* Condiciones + carrusel del grado seleccionado (A/B/C). En B/C se muestran
                      sus condiciones e imágenes; el spec sheet completo sigue oculto (item 6). */}
                  {gradeInfo && (
                    <div className={styles.gradoBody}>
                      <div>
                        <div className={styles.grado360}>
                          {gradeImages[gradeImgSel] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={gradeImages[gradeImgSel]} alt={`${product.displayName} · Grado ${grade}`} />
                          ) : (
                            <Rotate3d size={40} color="#7a7a88" />
                          )}
                        </div>
                        {gradeImages.length > 1 && (
                          <GradeThumbStrip images={gradeImages} selected={gradeImgSel} onSelect={setGradeImgSel} grade={grade} />
                        )}
                      </div>
                      <div className={styles.carac}>
                        <h4>Características</h4>
                        <div className={styles.caracItem}><span className={styles.ciIco}><Battery size={24} /></span><div><div className={styles.ciLbl}>Nivel de batería</div><div className={styles.ciVal}>{gradeInfo.bateria}</div></div></div>
                        <div className={styles.caracItem}><span className={styles.ciIco}><Monitor size={24} /></span><div><div className={styles.ciLbl}>Aspecto visual</div><div className={styles.ciVal}>{gradeInfo.aspecto}</div></div></div>
                        <div className={styles.caracItem}><span className={styles.ciIco}><Star size={24} /></span><div><div className={styles.ciLbl}>Condición técnica</div><div className={styles.ciVal}>{gradeInfo.condicion}</div></div></div>
                        <div className={styles.caracItem}><span className={styles.ciIco}><RefreshCw size={24} /></span><div><div className={styles.ciLbl}>Reemplazo de piezas</div><div className={styles.ciVal}>{gradeInfo.reemplazo}</div></div></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {canBuy ? (
                <>
                  {/* PricingCalculator ya trae su propio título "Calcula tu cuota";
                      calcWrap neutraliza su card para que quede plano (sin card
                      dentro de card ni sombra), como el componente en modo normal. */}
                  <div className={`${styles.block} ${styles.calcWrap}`}>
                    <PricingCalculator
                      paymentPlans={paymentPlans}
                      defaultTerm={defaultTerm ?? initialTerm}
                      defaultInitialPercent={defaultInitialPercent ?? 0}
                      defaultFrequency={defaultFrequency}
                      productPrice={product.price}
                      paymentFrequencies={apiData.paymentFrequencies}
                      landing={landing}
                      productSlug={product.slug}
                      onSelectionChange={setPricingSel}
                    />
                  </div>

                  <div className={styles.cta}>
                    <div className={styles.ctaPrice}>
                      <div className={styles.ctaNum}>S/{formatCuotaDeLanding(monthlyQuota, landing)}<span>{freqShort}</span></div>
                      <div className={styles.ctaSub}>
                        en {term} {paymentFrequency === 'mensual' ? 'meses' : 'cuotas'}
                        {initialAmount > 0 ? ` · inicial S/${formatCuotaDeLanding(initialAmount, landing)}` : ' · sin inicial'}
                      </div>
                    </div>
                    {onToggleWishlist && (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnHeart} ${isInWishlist ? styles.btnHeartOn : ''}`}
                        onClick={handleToggleWishlist}
                        aria-label="Guardar en favoritos"
                      >
                        <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    <button type="button" className={`${styles.btn} ${styles.btnSolid}`} onClick={onLoQuiero}>
                      Lo quiero
                    </button>
                  </div>

                  {deferredShipping && (
                    <div className={styles.shipNote}>
                      <Truck size={18} />
                      <span>El envío o recojo será <b>a partir del miércoles 15/07</b>.</span>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.noDisp}>
                  <div className={styles.ndT}>No disponible</div>
                  <div className={styles.ndS}>
                    {isRefurbished
                      ? `Este equipo no está disponible en Grado ${grade}.`
                      : 'Este equipo no está disponible por el momento.'}
                  </div>
                  {isRefurbished && (
                    <button type="button" className={styles.ndCta} onClick={() => selectGrade('A')}>
                      Ver equipo disponible (Grado A) <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Secciones a todo el ancho ===== */}
        {canBuy && <div className={styles.detFull}>
          {/* Descripción */}
          <div className={styles.panel}>
            <div className={styles.secTitle}>Descripción</div>
            <div className={styles.secSub}>Detalles y beneficios de tu equipo</div>
            <p className={styles.descText}>{product.description || product.shortDescription}</p>
            <div className={styles.descFeatures}>
              <div className={styles.descFeature}>
                <span className={styles.dfIco}><ShieldCheck size={20} /></span>
                <div><div className={styles.dfLbl}>Garantía de fábrica</div><div className={styles.dfVal}>{warranty}</div></div>
              </div>
              <div className={styles.descFeature}>
                <span className={styles.dfIco}><BadgeCheck size={20} /></span>
                <div>
                  <div className={styles.dfLbl}>Producto</div>
                  <div className={styles.dfVal}>Seminuevo</div>
                </div>
              </div>
            </div>

            {/* Políticas y condiciones descargables (item 5) */}
            <a className={styles.pdfLink} href={POLITICAS_PDF_URL} download={POLITICAS_PDF_FILENAME}>
              <span className={styles.pdfIco}><FileText size={22} /></span>
              <div style={{ flex: 1 }}>
                <div className={styles.pdfT}>Políticas y condiciones del producto</div>
                <div className={styles.pdfS}>PDF · descargar</div>
              </div>
              <span className={styles.pdfDl}><Download size={22} /></span>
            </a>
          </div>

          {canBuy && (
            <>
              {/* Qué incluye — combos (sus productos) e iPhones seminuevos (mica + cable) */}
              {showIncluye && (
                <div className={styles.panel}>
                  <div className={styles.secTitle}>¿Qué incluye tu equipo?</div>
                  <div className={styles.secSub}>Accesorios incluidos con tu compra</div>
                  <div className={styles.incluyeGrid}>
                    {accesorios.map((txt, i) => (
                      <div key={i} className={styles.incTile}>
                        <span className={styles.incIco}><Package size={18} /></span>
                        <span className={styles.incTxt}>{txt}</span>
                        <span className={styles.incChk}><Check size={16} strokeWidth={3} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Especificaciones reales (con Condición como primer grupo) */}
              {(hasSpecs || isRefurbished) && (
                <div className={styles.panel}>
                  <div className={styles.secHeadIco}>
                    <span className={styles.secIco}><Cpu size={22} /></span>
                    <div>
                      <div className={styles.secTitle}>Especificaciones</div>
                      <div className={styles.secSub} style={{ marginBottom: 0 }}>Ficha técnica completa del equipo</div>
                    </div>
                  </div>
                  {/* Condición primero, dentro de especificaciones */}
                  {isRefurbished && (
                    <div className={styles.specGroup}>
                      <div className={styles.specGroupTitle}>Condición</div>
                      <div className={styles.specRows}>
                        {condRows.map((r, i) => (
                          <div key={i} className={styles.specRow}>
                            <span className={styles.srLbl}>{r.l}</span>
                            <span className={`${styles.srVal} ${r.blue ? styles.srValBlue : ''}`}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {specCategories.filter((c) => c.specs && c.specs.length > 0).map((cat) => (
                    <div key={cat.category} className={styles.specGroup}>
                      <div className={styles.specGroupTitle}>{cat.category}</div>
                      <div className={styles.specRows}>
                        {cat.specs.map((s, i) => (
                          <div key={i} className={styles.specRow}>
                            <span className={styles.srLbl}>{s.label}</span>
                            <span className={styles.srVal}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cronograma de pagos */}
              {paymentPlans.length > 0 && (
                <div className={styles.panel}>
                  <div className={styles.cronoWrap}>
                    <Cronograma
                      paymentPlans={paymentPlans}
                      selectedTerm={term}
                      selectedInitialPercent={initialPercent as 0 | 10 | 20 | 30}
                      paymentFrequency={paymentFrequency}
                      productId={product.id}
                      productName={product.displayName}
                      productBrand={product.brand}
                      productPrice={product.price}
                      startDate={startDate}
                      // Family Farms cobra contra planilla y la persona firma un
                      // cronograma: necesita ver amortizacion, interes y comision
                      // por cuota, no solo el monto. El resto del catalogo sigue
                      // con la tabla simple.
                      version={esFamilyFarms(landing) ? 2 : 1}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recomendados — cards con foto, 3 en fila */}
          {similares.length > 0 && (
            <div className={styles.panel}>
              <div className={styles.secTitle}>Recomendados</div>
              <div className={styles.secSub}>Equipos que podrían interesarte</div>
              <div className={styles.recGrid}>
                {similares.slice(0, 3).map((sp) => (
                  <div key={sp.id} className={styles.recCard} onClick={() => router.push(routes.producto(landing, sp.slug))}>
                    <div className={styles.recImg}>
                      {(sp.images?.[0]?.url || sp.thumbnail) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sp.images?.[0]?.url || sp.thumbnail} alt={sp.displayName} />
                      )}
                    </div>
                    <div className={styles.recMarca}>
                      {sp.brand}
                      {isRefurbishedCondition(sp.condition) && (
                        <span style={{ marginLeft: 7, background: '#03dbd0', color: '#04413e', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, letterSpacing: 0.3, textTransform: 'none' }}>Seminuevo</span>
                      )}
                    </div>
                    <div className={styles.recName}>{sp.displayName}</div>
                    <div className={styles.recQuota}>Desde <b>S/{formatMoneyNoDecimals(Math.floor(sp.monthlyQuota))}</b> /mes</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>}
      </div>

      {/* Modal "¿Cómo agendar?" */}
      <div className={`${styles.modalOverlay} ${showAgenda ? styles.modalOverlayOn : ''}`} onClick={() => setShowAgenda(false)} />
      <div className={`${styles.modal} ${showAgenda ? styles.modalOn : ''}`} role="dialog" aria-modal="true">
        <div className={styles.modalIco}><CalendarDays size={30} strokeWidth={1.9} /></div>
        <h3>¿Cómo agendar tu cita?</h3>
        <p>
          El agendamiento de citas se habilitará después de la aprobación del financiamiento y firma
          del contrato. Te pediremos crear tu usuario en <b>Zona Estudiantes</b> y aparecerá la opción
          del agendamiento.
        </p>
        <button type="button" className={styles.modalBtn} onClick={() => setShowAgenda(false)}>Entendido</button>
      </div>

      {/* Aviso "Producto seminuevo" (reacondicionado) */}
      <RefurbishedWarningModal
        isOpen={showRefurb}
        onClose={() => setShowRefurb(false)}
        onConfirm={() => { setShowRefurb(false); proceedToSolicitar(); }}
        productName={product.displayName}
        policyHref={POLITICAS_PDF_URL}
        policyFilename={POLITICAS_PDF_FILENAME}
        shippingNote={deferredShipping ? DEFERRED_SHIPPING_NOTE : undefined}
      />
    </div>
  );
}

export default CopiaHomeDesktopDetail;
