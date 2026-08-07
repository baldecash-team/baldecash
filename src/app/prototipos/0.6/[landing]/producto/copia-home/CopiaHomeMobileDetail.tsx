'use client';

/**
 * CopiaHomeMobileDetail — variante mobile del detalle de producto para la
 * landing `copia-home` (mockup seminuevos). Reutiliza los datos reales del
 * detalle (ProductDetailResult), la calculadora sobre los planes reales, el
 * flujo canónico de "Lo quiero" (aviso reacondicionado → setSelectedProduct →
 * /solicitar) y el aviso RefurbishedWarningModal.
 *
 * Reglas de negocio:
 *  - Grados A/B/C SOLO para reacondicionados. Solo el Grado A es comprable;
 *    B y C se muestran pero renderizan "No disponible" (sin CTA "Lo quiero").
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronDown, ChevronRight, ShieldCheck, BadgeCheck, Package,
  Check, Battery, Monitor, Star, RefreshCw, Heart, Cpu, Calendar,
  FileText, Download, Truck, ArrowRight, Store, CalendarDays,
} from 'lucide-react';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import type { SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { RefurbishedWarningModal, isRefurbishedCondition } from '@/app/prototipos/0.6/components/RefurbishedWarningModal';
import type { ProductDetailResult } from '../api/productDetailApi';
import { PricingCalculator, type PricingSelection } from '../components/detail/pricing/PricingCalculator';
import { Cronograma } from '../components/detail/cronograma/Cronograma';
import { formatMoneyNoDecimals } from '../utils/formatMoney';
import { POLITICAS_PDF_URL, POLITICAS_PDF_FILENAME } from './politicasPdf';
import { factoryWarranty, hasDeferredShipping, DEFERRED_SHIPPING_NOTE } from './seminuevoHelpers';
import { IPHONE_GRADE_IMAGES, isIphoneName } from './iphoneGradeGallery';
import { targetSlugForGrade, currentGrade } from './gradeSelector';
import { FamilyFarmGradeSelector, type GradeOption } from '../family-farm/FamilyFarmGradeSelector';
import { GRADE_HEADING } from '../family-farm/familyFarmGrades';
import type { WishlistItem, TermMonths, InitialPaymentPercent } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';
import styles from '@/app/prototipos/0.6/[landing]/catalogo/copia-home/copiaHome.module.css';

const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;

type GradeKey = 'A' | 'B' | 'C';

interface GradeInfo {
  bateria: string; aspecto: string; condicion: string; reemplazo: string; disponible: boolean;
}

// Grados FE-only (el backend no modela grados). Solo A disponible; B y C no.
const GRADES: Record<GradeKey, GradeInfo> = {
  A: { bateria: 'Mayor a 80%', aspecto: '9.5/10', condicion: '9.5/10', reemplazo: 'Ninguno', disponible: true },
  B: { bateria: '70% a 80%', aspecto: '7/10', condicion: '8/10', reemplazo: 'Componentes menores', disponible: false },
  C: { bateria: '60% a 70%', aspecto: '6/10', condicion: '6/10', reemplazo: 'Batería / teclado', disponible: false },
};

/** Acordeón (top-level para no remontar en cada render del detalle). */
function Acc({
  title, sub, icon, isOpen, onToggle, children,
}: {
  title: string; sub?: string; icon: React.ReactNode;
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={`${styles.card} ${styles.acc} ${isOpen ? styles.accOpen : ''}`}>
      <div className={styles.accHead} onClick={onToggle}>
        <div className={styles.accHl}>
          <span className={styles.accIco}>{icon}</span>
          <div>
            <div className={styles.secTitle} style={{ margin: 0 }}>{title}</div>
            {sub && <div className={styles.accSub}>{sub}</div>}
          </div>
        </div>
        <ChevronDown className={styles.accChev} size={20} />
      </div>
      <div className={styles.accBody}><div className={styles.accInner}>{children}</div></div>
    </div>
  );
}

interface Props {
  apiData: ProductDetailResult;
  landing: string;
  isAvailable?: boolean;
  /** Landing de 2° financiamiento (renueva-*): excluye el CTA "volver al Grado A" (item 6). */
  secondFinancing?: boolean;
  defaultTerm?: number;
  defaultInitialPercent?: number;
  defaultFrequency?: string;
  onToggleWishlist?: (item: WishlistItem) => void;
  isInWishlist?: boolean;
  /** `familyfarm` cambia el selector de grados por el de la campaña (BAL-2812). */
  gradeVariant?: 'default' | 'familyfarm';
}

export function CopiaHomeMobileDetail({
  apiData,
  landing,
  isAvailable = true,
  secondFinancing = false,
  defaultTerm,
  defaultInitialPercent,
  defaultFrequency,
  onToggleWishlist,
  isInWishlist = false,
  gradeVariant = 'default',
}: Props) {
  const router = useRouter();
  const { setSelectedProduct } = useProduct();
  const product = apiData.product;
  const paymentPlans = apiData.paymentPlans ?? [];

  // El endpoint de detalle no siempre devuelve `condition`, pero el nombre de
  // los seminuevos sí trae "Semi Nuevo". Detectamos por condición o por nombre
  // para pintar las secciones de grados y condición.
  const fullName = `${product.name ?? ''} ${product.displayName ?? ''}`;
  const isRefurbished =
    isRefurbishedCondition(product.condition) ||
    /semi\s*nuevo|seminuevo|reacondicion/i.test(fullName);

  // Garantía de fábrica por modelo (item 3) y envío diferido 15/07 (iPhone semi / iPad).
  const warranty = factoryWarranty(fullName, product.warranty);
  const isIphone = isIphoneName(fullName);
  const deferredShipping = hasDeferredShipping({
    name: fullName, condition: product.condition, deviceType: product.deviceType, brand: product.brand,
  });

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
  // Grados reales del backend (grade_siblings): cada grado es un Product con su
  // stock/slug. Si existen, el grado actual y su disponibilidad salen de ahí; si no
  // (iPhone copia-home sin backend de grados), se cae al mock GRADES FE-only.
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
  // Botones de grado: desde los siblings reales si existen, si no el mock A/B/C.
  // Mismo set que gradeButtons, con precio y disponibilidad por grado: los usa
  // el selector de Family Farms para poner el precio en cada tarjeta.
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

  // Galería principal (hero): SIEMPRE las imágenes reales del producto (incluido
  // iPhone seminuevo). Las referenciales por grado viven en "Elige el grado".
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
  const selectGrade = (g: GradeKey) => {
    // Grado real: navegar al producto de ese grado (patrón color siblings) para que
    // el product_id que llega al submit sea el del grado elegido.
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
  // En cuantas armadas se cobra la inicial de la opcion elegida. Viene con la
  // opcion, no es una eleccion aparte: cada modalidad es una celda propia del
  // pricing con su plazo. 1 = pago unico, el default de todo el catalogo.
  const initialInstallments = pricingSel?.initialInstallments ?? 1;

  // Specs reales del equipo y otros seminuevos (para las nuevas secciones colapsables).
  const specCategories = product.specs ?? [];
  const hasSpecs = specCategories.some((c) => c.specs && c.specs.length > 0);
  const similares = apiData.similarProducts ?? [];

  // ---- Acordeones ----
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  // ---- Aviso reacondicionado ----
  const [showRefurb, setShowRefurb] = useState(false);

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
  }, [canBuy, apiData, product, monthlyQuota, term, initialPercent, initialAmount, colorId, selectedColor, landing, router, galleryImages]);

  function getSpec(category: string, label: string): string | undefined {
    const cat = product.specs.find((s) => s.category.toLowerCase() === category.toLowerCase());
    if (!cat) return undefined;
    return cat.specs.find((s) => s.label.toLowerCase().includes(label.toLowerCase()))?.value;
  }

  const onLoQuiero = () => {
    // Grado B/C o no disponible: sin compra (el CTA no se renderiza, pero por si acaso).
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

  return (
    <div className={styles.root}>
      <div className={styles.scrollDetalle}>
        {/* Galería */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
            <span className={styles.detalleMarca} style={{ marginBottom: 0 }}>{product.brand}</span>
            {isRefurbished && <span className={styles.detalleMarca} style={{ marginBottom: 0, background: '#03DBD0', color: '#04413e' }}>Seminuevo</span>}
          </div>
          <div className={styles.detalleTitulo}>{product.displayName}</div>
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
                    <span className={styles.tick}><Check size={12} strokeWidth={3.5} /></span>
                  </div>
                ))}
              </div>
              <div className={styles.colorLabel}>Color: {selectedColor?.name ?? '—'}</div>
            </>
          )}
          <div className={styles.heroImg}>
            {galleryImages[imgSel]?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={galleryImages[imgSel].url} alt={product.displayName} />
            )}
            <span className={styles.heroTag}>IMAGEN REFERENCIAL</span>
            <span className={styles.heroCount}>{imgSel + 1} / {galleryImages.length}</span>
          </div>
          {galleryImages.length > 1 && (
            <div className={styles.thumbs}>
              {galleryImages.slice(0, 4).map((im, i) => (
                <div key={i} className={`${styles.thumb} ${i === imgSel ? styles.thumbOn : ''}`} onClick={() => setImgSel(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt={`${product.displayName} ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Envío diferido (iPhone seminuevo / iPad) */}
        {deferredShipping && (
          <div className={styles.shipNote}>
            <Truck size={18} />
            <span>El envío o recojo será <b>a partir del miércoles 15/07</b>.</span>
          </div>
        )}

        {/* Descripción */}
        <Acc title="Descripción" sub="Detalles y beneficios de tu equipo" icon={<Package size={20} />} isOpen={!!open.desc} onToggle={() => toggle('desc')}>
          <p className={styles.descText} style={{ marginTop: 0 }}>{product.description || product.shortDescription}</p>
          <div className={styles.descFeatures}>
            <div className={styles.descFeature}>
              <span className={styles.dfIco}><ShieldCheck size={18} /></span>
              <div><div className={styles.dfLbl}>Garantía de fábrica</div><div className={styles.dfVal}>{warranty}</div></div>
            </div>
            <div className={styles.descFeature}>
              <span className={styles.dfIco}>{isRefurbished ? <BadgeCheck size={18} /> : <Package size={18} />}</span>
              <div>
                <div className={styles.dfLbl}>Producto</div>
                <div className={styles.dfVal}>{isRefurbished ? 'Seminuevo' : 'Nuevo'}</div>
              </div>
            </div>
          </div>
          {isRefurbished && (
            <a className={styles.pdfLink} href={POLITICAS_PDF_URL} download={POLITICAS_PDF_FILENAME}>
              <span className={styles.pdfIco}><FileText size={20} /></span>
              <div style={{ flex: 1 }}>
                <div className={styles.pdfT}>Políticas y condiciones del producto</div>
                <div className={styles.pdfS}>PDF · descargar</div>
              </div>
              <span className={styles.pdfDl}><Download size={20} /></span>
            </a>
          )}
        </Acc>

        {/* Elige el grado (solo reacondicionado) */}
        {isRefurbished && gradeInfo && (
          <Acc title={gradeVariant === 'familyfarm' ? GRADE_HEADING : 'Elige el grado'} sub="El grado refleja el nivel de uso y el estado estético del equipo" icon={<Star size={20} />} isOpen={!!open.grado} onToggle={() => toggle('grado')}>
            {gradeVariant === 'familyfarm' ? (
              // Sin encabezado: el acordeón ya trae el título y el subtítulo.
              <FamilyFarmGradeSelector
                grades={gradeOptions}
                selected={grade}
                onSelect={selectGrade}
                showHeading={false}
                // La frecuencia del MISMO payload que trajo las cuotas, no la de
                // la calculadora: esa se refresca sola y dejaría la etiqueta
                // cambiando mientras el número queda fijo.
                paymentFrequency={paymentPlans[0]?.paymentFrequency}
              />
            ) : (
            <div className={styles.grados}>
              {gradeButtons.map((g) => (
                <button key={g} type="button" className={`${styles.grado} ${g === grade ? styles.gradoOn : ''}`} onClick={() => selectGrade(g)}>
                  Grado {g}<span className={styles.gTick}><Check size={11} strokeWidth={3.5} /></span>
                </button>
              ))}
            </div>
            )}
            {/* Condiciones + carrusel del grado seleccionado (A/B/C). En B/C se muestran
                sus condiciones e imágenes; el spec sheet completo sigue oculto (item 6). */}
            {gradeInfo && (
              <>
                {/* Carrusel de imágenes dentro de la condición (referenciales por grado) */}
                <div className={styles.heroImg} style={{ marginBottom: 10 }}>
                  {gradeImages[gradeImgSel] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={gradeImages[gradeImgSel]} alt={`${product.displayName} · Grado ${grade}`} />
                  )}
                  <span className={styles.heroTag}>IMAGEN REFERENCIAL</span>
                  <span className={styles.heroCount}>{gradeImgSel + 1} / {gradeImages.length}</span>
                </div>
                {gradeImages.length > 1 && (
                  <div className={styles.thumbs} style={{ marginBottom: 16 }}>
                    {gradeImages.slice(0, 4).map((url, i) => (
                      <div key={i} className={`${styles.thumb} ${i === gradeImgSel ? styles.thumbOn : ''}`} onClick={() => setGradeImgSel(i)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Grado ${grade} ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.carac}>
                  <h4>Características</h4>
                  <div className={styles.caracItem}><span className={styles.ciIco}><Battery size={24} /></span><div><div className={styles.ciLbl}>Nivel de batería</div><div className={styles.ciVal}>{gradeInfo.bateria}</div></div></div>
                  <div className={styles.caracItem}><span className={styles.ciIco}><Monitor size={24} /></span><div><div className={styles.ciLbl}>Aspecto visual</div><div className={styles.ciVal}>{gradeInfo.aspecto}</div></div></div>
                  <div className={styles.caracItem}><span className={styles.ciIco}><Star size={24} /></span><div><div className={styles.ciLbl}>Condición técnica</div><div className={styles.ciVal}>{gradeInfo.condicion}</div></div></div>
                  <div className={styles.caracItem}><span className={styles.ciIco}><RefreshCw size={24} /></span><div><div className={styles.ciLbl}>Reemplazo de piezas</div><div className={styles.ciVal}>{gradeInfo.reemplazo}</div></div></div>
                </div>
              </>
            )}
          </Acc>
        )}

        {/* Especificaciones (colapsable). Condición como primer grupo. */}
        {canBuy && (hasSpecs || isRefurbished) && (
          <Acc title="Especificaciones" sub="Ficha técnica completa del equipo" icon={<Cpu size={20} />} isOpen={!!open.specs} onToggle={() => toggle('specs')}>
            {isRefurbished && (
              <div className={styles.specGroup}>
                <div className={styles.rcSublbl}>Condición</div>
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
                <div className={styles.rcSublbl}>{cat.category}</div>
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
          </Acc>
        )}

        {canBuy ? (
          <>
            {/* Qué incluye — combos (sus productos) e iPhones seminuevos (mica + cable) */}
            {showIncluye && (
              <Acc title="¿Qué incluye tu equipo?" sub="Accesorios incluidos con tu compra" icon={<Package size={20} />} isOpen={!!open.incluye} onToggle={() => toggle('incluye')}>
                {accesorios.map((txt, i) => (
                  <div key={i} className={styles.incluyeItem}>
                    <span className={styles.incIco}><Package size={18} /></span>
                    <span className={styles.incTxt}>{txt}</span>
                    <span className={styles.incChk}><Check size={14} strokeWidth={3} /></span>
                  </div>
                ))}
              </Acc>
            )}

            {/* Calcula tu cuota — componente del flujo normal (PricingCalculator) */}
            <div style={{ marginBottom: 16 }}>
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

            {/* Cronograma de pagos (colapsable, minimizado por defecto) */}
            {paymentPlans.length > 0 && (
              <Acc title="Cronograma de pagos" sub="Detalle de tus cuotas según el plan elegido" icon={<Calendar size={20} />} isOpen={!!open.cronograma} onToggle={() => toggle('cronograma')}>
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
                    version={1}
                  />
                </div>
              </Acc>
            )}

            {/* item 10: Seguridad del equipo — recojo con cita tras aprobación.
                Solo en seminuevos; no aplica a equipos nuevos. */}
            {isRefurbished && (
            <div className={styles.card}>
              <div className={styles.secTitle} style={{ marginBottom: 12 }}>Seguridad del equipo</div>
              <div className={styles.segBanner}>
                <span className={styles.segIco}><Store size={26} strokeWidth={1.8} /></span>
                <p className={styles.segText}>
                  <b>¡Sabemos que ver el producto hace la diferencia!</b> Financia hoy y agenda una cita
                  en nuestras oficinas para el recojo de tu equipo, en caso lo prefieras.
                </p>
              </div>
              <div className={styles.rcNote}>
                <CalendarDays size={15} />
                <span>El agendamiento de citas se habilitará después de la aprobación del financiamiento y firma del contrato.</span>
              </div>
            </div>
            )}

            {/* CTA fijo mobile estándar de baldecash (¡Lo quiero! + wishlist) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 sm:gap-3 bg-[var(--surface,#fff)] border-t border-[var(--border-soft,#e5e7eb)] px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:static lg:z-auto lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none">
              <button
                type="button"
                onClick={onLoQuiero}
                className="flex-1 bg-[var(--color-primary)] text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:brightness-90 transition-all cursor-pointer shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]"
              >
                ¡Lo quiero!
              </button>
              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-colors cursor-pointer border flex-shrink-0 ${
                    isInWishlist
                      ? 'text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] border-[rgba(var(--color-primary-rgb),0.2)] hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                      : 'text-[var(--text-muted,#6b7280)] bg-[var(--surface-bg,#fafafa)] border-[var(--border-soft,#e5e7eb)] hover:text-[var(--color-primary)] hover:border-[rgba(var(--color-primary-rgb),0.2)] hover:bg-[rgba(var(--color-primary-rgb),0.05)]'
                  }`}
                  aria-label="Guardar en favoritos"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className={styles.noDisp}>
            <div className={styles.ndT}>No disponible</div>
            <div className={styles.ndS}>
              {isRefurbished
                ? `Este equipo no está disponible en Grado ${grade}.`
                : 'Este equipo no está disponible por el momento.'}
            </div>
            {/* item 6: CTA para volver al equipo disponible (Grado A).
                Excluido en landings de 2° financiamiento (item 12). */}
            {isRefurbished && !secondFinancing && (
              <button type="button" className={styles.ndCta} onClick={() => selectGrade('A')}>
                Ver equipo disponible (Grado A) <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* Recomendados (colapsable, minimizado por defecto) */}
        {canBuy && similares.length > 0 && (
          <Acc title="Recomendados" sub="Equipos que podrían interesarte" icon={<RefreshCw size={20} />} isOpen={!!open.similares} onToggle={() => toggle('similares')}>
            <div className={styles.simList}>
              {similares.map((sp) => (
                <div key={sp.id} className={styles.simCard} onClick={() => router.push(routes.producto(landing, sp.slug))}>
                  <div className={styles.simImg}>
                    {(sp.images?.[0]?.url || sp.thumbnail) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sp.images?.[0]?.url || sp.thumbnail} alt={sp.displayName} />
                    )}
                  </div>
                  <div className={styles.simBody}>
                    <div className={styles.simMarca}>
                      {sp.brand}
                      {isRefurbishedCondition(sp.condition) && <span className={styles.simBadge}>Seminuevo</span>}
                    </div>
                    <div className={styles.simName}>{sp.displayName}</div>
                    <div className={styles.simQuota}>Desde <b>S/{formatMoneyNoDecimals(Math.floor(sp.monthlyQuota))}</b> /mes</div>
                  </div>
                  <span className={styles.simChev}><ChevronRight size={18} /></span>
                </div>
              ))}
            </div>
          </Acc>
        )}
      </div>

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

export default CopiaHomeMobileDetail;
