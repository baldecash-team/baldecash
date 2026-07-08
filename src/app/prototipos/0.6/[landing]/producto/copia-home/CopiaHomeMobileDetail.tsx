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
 *  - Método de entrega: bloque informativo (texto), sin agendado de recojo.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronDown, ShieldCheck, BadgeCheck, Package, Truck,
  Check, Battery, Monitor, Star, RefreshCw, Heart,
} from 'lucide-react';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import type { SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { RefurbishedWarningModal, isRefurbishedCondition } from '@/app/prototipos/0.6/components/RefurbishedWarningModal';
import type { ProductDetailResult } from '../api/productDetailApi';
import { PricingCalculator, type PricingSelection } from '../components/detail/pricing/PricingCalculator';
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
  A: { bateria: '80-90%', aspecto: '9/10', condicion: '10/10', reemplazo: 'Ninguno', disponible: true },
  B: { bateria: '85-90%', aspecto: '7/10', condicion: '9/10', reemplazo: 'Componentes menores', disponible: false },
  C: { bateria: '80-85%', aspecto: '6/10', condicion: '8/10', reemplazo: 'Batería / pantalla', disponible: false },
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
  defaultTerm?: number;
  defaultInitialPercent?: number;
  defaultFrequency?: string;
  onToggleWishlist?: (item: WishlistItem) => void;
  isInWishlist?: boolean;
}

export function CopiaHomeMobileDetail({
  apiData,
  landing,
  isAvailable = true,
  defaultTerm,
  defaultInitialPercent,
  defaultFrequency,
  onToggleWishlist,
  isInWishlist = false,
}: Props) {
  const router = useRouter();
  const { setSelectedProduct } = useProduct();
  const product = apiData.product;
  const paymentPlans = apiData.paymentPlans ?? [];

  // El endpoint de detalle no siempre devuelve `condition`, pero el nombre de
  // los seminuevos sí trae "Semi Nuevo". Detectamos por condición o por nombre
  // para pintar las secciones de grados y condición.
  const isRefurbished =
    isRefurbishedCondition(product.condition) ||
    /semi\s*nuevo|seminuevo|reacondicion/i.test(`${product.name ?? ''} ${product.displayName ?? ''}`);

  // ---- Colores / galería ----
  const hasSiblings = !!(product.colorSiblings && product.colorSiblings.length > 1);
  const displayColors = hasSiblings
    ? product.colorSiblings.map((s) => ({ id: String(s.productId), name: s.color, hex: s.colorHex, slug: s.slug }))
    : (product.colors ?? []).map((c) => ({ id: c.id, name: c.name, hex: c.hex, slug: product.slug }));
  const initialColorId = hasSiblings
    ? String(product.colorSiblings.find((s) => s.slug === product.slug)?.productId ?? product.colorSiblings[0].productId)
    : (displayColors[0]?.id ?? '');
  const [colorId, setColorId] = useState(initialColorId);
  const selectedColor = displayColors.find((c) => c.id === colorId);

  const galleryImages = useMemo(() => {
    const imgs = product.images.filter((i) => i.type !== 'video' && !/\.(mp4|webm|ogg)(\?|$)/i.test(i.url));
    return imgs.length > 0 ? imgs : product.images;
  }, [product.images]);
  const [imgSel, setImgSel] = useState(0);

  // ---- Grado ----
  const [grade, setGrade] = useState<GradeKey>('A');
  const gradeInfo = isRefurbished ? GRADES[grade] : null;
  const gradeAvailable = isRefurbished ? GRADES[grade].disponible : true;
  const canBuy = isAvailable && gradeAvailable;

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

  // ---- Accesorios "qué incluye" ----
  const accesorios = useMemo(() => {
    if (apiData.combo?.accessories?.length) {
      return apiData.combo.accessories.map((a) => a.productName);
    }
    return ['Mica protectora', 'Case protector', 'Cable cargador'];
  }, [apiData.combo]);

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
          {isRefurbished && <span className={styles.detalleMarca} style={{ background: '#03DBD0', color: '#04413e' }}>Seminuevo</span>}
          <span className={styles.detalleMarca}>{product.brand}</span>
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

        {/* Descripción */}
        <Acc title="Descripción" sub="Detalles y beneficios de tu equipo" icon={<Package size={20} />} isOpen={!!open.desc} onToggle={() => toggle('desc')}>
          <p className={styles.descText} style={{ marginTop: 0 }}>{product.description || product.shortDescription}</p>
          <div className={styles.descFeatures}>
            <div className={styles.descFeature}>
              <span className={styles.dfIco}><ShieldCheck size={18} /></span>
              <div><div className={styles.dfLbl}>Garantía</div><div className={styles.dfVal}>{product.warranty || '1 año'}</div></div>
            </div>
            <div className={styles.descFeature}>
              <span className={styles.dfIco}>{isRefurbished ? <BadgeCheck size={18} /> : <Package size={18} />}</span>
              <div>
                <div className={styles.dfLbl}>{isRefurbished ? 'Revisión' : 'Producto'}</div>
                <div className={styles.dfVal}>{isRefurbished ? 'Certificado' : 'Nuevo sellado'}</div>
              </div>
            </div>
          </div>
        </Acc>

        {/* Elige el grado (solo reacondicionado) */}
        {isRefurbished && gradeInfo && (
          <Acc title="Elige el grado" sub="El grado refleja el nivel de uso y el estado estético del equipo" icon={<Star size={20} />} isOpen={!!open.grado} onToggle={() => toggle('grado')}>
            <div className={styles.grados}>
              {(['A', 'B', 'C'] as GradeKey[]).map((g) => (
                <button key={g} type="button" className={`${styles.grado} ${g === grade ? styles.gradoOn : ''}`} onClick={() => setGrade(g)}>
                  Grado {g}<span className={styles.gTick}><Check size={11} strokeWidth={3.5} /></span>
                </button>
              ))}
            </div>
            <div className={styles.gradoBody}>
              <div className={styles.grado360}>
                {galleryImages[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={galleryImages[0].url} alt={product.displayName} />
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
          </Acc>
        )}

        {canBuy ? (
          <>
            {/* Qué incluye */}
            <Acc title="¿Qué incluye tu equipo?" sub="Accesorios incluidos con tu compra" icon={<Package size={20} />} isOpen={!!open.incluye} onToggle={() => toggle('incluye')}>
              {accesorios.map((txt, i) => (
                <div key={i} className={styles.incluyeItem}>
                  <span className={styles.incIco}><Package size={18} /></span>
                  <span className={styles.incTxt}>{txt}</span>
                  <span className={styles.incChk}><Check size={14} strokeWidth={3} /></span>
                </div>
              ))}
            </Acc>

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

            {/* Método de entrega (informativo) */}
            <div className={styles.card}>
              <div className={styles.condHead}>
                <span className={styles.accIco}><Truck size={20} /></span>
                <div>
                  <div className={styles.secTitle} style={{ margin: 0 }}>Método de entrega</div>
                  <div className={styles.accSub}>Cómo recibes tu equipo</div>
                </div>
              </div>
              <p className={styles.descText} style={{ marginTop: 0 }}>
                Envío a domicilio a todo el Perú (Lima: 3 - 5 días hábiles; provincia: 5 - 9 días hábiles) o recojo en nuestra oficina de <b>Avenida Alfredo Benavides 1238, Miraflores</b>. Coordinamos la fecha y hora de entrega contigo luego de tu solicitud.
              </p>
            </div>

            {/* Condición (solo reacondicionado) */}
            {isRefurbished && (
              <div className={styles.card}>
                <div className={styles.condHead}>
                  <span className={styles.accIco}><BadgeCheck size={20} /></span>
                  <div>
                    <div className={styles.secTitle} style={{ margin: 0 }}>Condición</div>
                    <div className={styles.accSub}>Resultado de la revisión técnica del equipo</div>
                  </div>
                </div>
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
                ? `Este equipo no está disponible en Grado ${grade}. Elige el Grado A para continuar.`
                : 'Este equipo no está disponible por el momento.'}
            </div>
          </div>
        )}
      </div>

      <RefurbishedWarningModal
        isOpen={showRefurb}
        onClose={() => setShowRefurb(false)}
        onConfirm={() => { setShowRefurb(false); proceedToSolicitar(); }}
        productName={product.displayName}
      />
    </div>
  );
}

export default CopiaHomeMobileDetail;
