'use client';

/**
 * CopiaHomeDesktopCatalog — variante DESKTOP del catálogo para la landing
 * `copia-home` (mockup seminuevos). Sidebar de filtros + grilla de 3 columnas
 * con cards grandes. Reutiliza los hooks de datos reales (useCatalogProducts /
 * useCatalogFilters), el estado compartido de wishlist y el flujo canónico de
 * "Lo quiero" (aviso reacondicionado → setSelectedProduct → /solicitar).
 *
 * Solo se monta en desktop; el dispatcher vive en CatalogoClient (mobile usa
 * CopiaHomeMobileCatalog). Los equipos nuevos no muestran datos de seminuevo
 * (badge "Seminuevo" ni grado): son data-driven por condición.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Search, ArrowUpDown, ChevronDown, Eye, Check,
  Cpu, HardDrive, Monitor, Laptop, Tablet, Smartphone,
} from 'lucide-react';
import { useIsMobile, CubeGridSpinner } from '@/app/prototipos/_shared';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { RefurbishedWarningModal, isRefurbishedCondition } from '@/app/prototipos/0.6/components/RefurbishedWarningModal';
import { CopiaHomePromoBanner, PROMO_BANNER_HEIGHT } from '@/app/prototipos/0.6/components/CopiaHomePromoBanner';
import { POLITICAS_PDF_URL, POLITICAS_PDF_FILENAME } from '@/app/prototipos/0.6/[landing]/producto/copia-home/politicasPdf';
import { DEFERRED_SHIPPING_NOTE, hasDeferredShipping } from '@/app/prototipos/0.6/[landing]/producto/copia-home/seminuevoHelpers';
import type { CatalogProduct, TermMonths } from '../types/catalog';
import type { CatalogFilters as ApiCatalogFilters, SortBy as ApiSortBy } from '../../../services/catalogApi';
import { useCatalogProducts, useCatalogFilters } from '../hooks/useCatalogProducts';
import { useCampaignCoupon } from '../hooks/useCampaignCoupon';
import styles from './copiaHomeDesktopCatalog.module.css';

type SortKey = 'recommended' | 'price_asc' | 'price_desc';

const SORT_LABEL: Record<SortKey, string> = {
  recommended: 'Recomendados',
  price_asc: 'Menor precio',
  price_desc: 'Mayor precio',
};

const SORT_API: Record<SortKey, ApiSortBy> = {
  recommended: 'display_order',
  price_asc: 'price_asc',
  price_desc: 'price_desc',
};

// copia-home: el buscador vive en el navbar (junto al logo, desktop), como el
// mockup. Por ahora es un flag fijo; a futuro se leerá de la config de la landing
// (admin2 → ws2). Con `false` el buscador vuelve a la toolbar del cuerpo.
const NAVBAR_SEARCH_ENABLED = true;

const DEVICE_ICON: Record<string, React.ReactNode> = {
  laptop: <Laptop size={20} strokeWidth={1.7} />,
  tablet: <Tablet size={20} strokeWidth={1.7} />,
  celular: <Smartphone size={20} strokeWidth={1.7} />,
  smartphone: <Smartphone size={20} strokeWidth={1.7} />,
};

function deviceIcon(value: string): React.ReactNode {
  return DEVICE_ICON[value?.toLowerCase()] ?? <Laptop size={20} strokeWidth={1.7} />;
}

const DEVICE_LABEL: Record<string, string> = {
  laptop: 'Laptop', tablet: 'Tablet', celular: 'Celular', smartphone: 'Celular',
};

function deviceLabel(value: string): string {
  return DEVICE_LABEL[value?.toLowerCase()] ?? (value ? value[0].toUpperCase() + value.slice(1) : value);
}

/** Envío diferido para iPhone seminuevos e iPads (a partir del miércoles 15/07). */
function productHasDeferredShipping(p: CatalogProduct): boolean {
  return hasDeferredShipping({
    name: `${p.name ?? ''} ${p.displayName ?? ''}`,
    condition: p.conditionCode || p.condition,
    deviceType: p.deviceType,
    brand: p.brand,
  });
}

/** Specs cortos para la card (procesador / ram / almacenamiento / pantalla). */
function cardSpecs(p: CatalogProduct): { icon: React.ReactNode; txt: string }[] {
  const out: { icon: React.ReactNode; txt: string }[] = [];
  const s = p.specs;
  if (s?.processor?.model) out.push({ icon: <Cpu size={15} />, txt: s.processor.model });
  if (s?.ram?.size) out.push({ icon: <HardDrive size={15} />, txt: `${s.ram.size}GB RAM` });
  if (s?.storage?.size) out.push({ icon: <HardDrive size={15} />, txt: `${s.storage.size}GB ${s.storage.type ?? ''}`.trim() });
  if (s?.display?.size) out.push({ icon: <Monitor size={15} />, txt: `${s.display.size}"${s.display.type ? ' ' + s.display.type : ''}` });
  return out.slice(0, 4);
}

export function CopiaHomeDesktopCatalog() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'copia-home';
  const isMobile = useIsMobile();

  const { setSelectedProduct, clearCartProducts, clearAccessories } = useProduct();
  const { navbarProps, footerData, agreementData } = useLayout();
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;
  const previewBannerOffset = previewKey ? 24 : 0;
  const { couponCode } = useCampaignCoupon(landing);

  // ---- Estado de filtros ----
  const [deviceType, setDeviceType] = useState<string | null>(null);
  const [conditions, setConditions] = useState<Set<string>>(new Set());
  const [brandIds, setBrandIds] = useState<Set<number>>(new Set());
  const [grades, setGrades] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>('recommended');
  const [query, setQuery] = useState('');

  // ---- Aviso de reacondicionado antes de "Lo quiero" ----
  const [pendingRefurb, setPendingRefurb] = useState<CatalogProduct | null>(null);

  const apiFilters = useMemo<ApiCatalogFilters>(() => {
    const f: ApiCatalogFilters = {};
    if (deviceType) f.types = [deviceType];
    // Grado es un constructo FE-only y solo aplica a seminuevos: si hay grado
    // seleccionado, forzamos la condición a reacondicionada.
    const effectiveConditions = new Set(conditions);
    if (grades.size > 0) effectiveConditions.add('reacondicionada');
    if (effectiveConditions.size > 0) f.conditions = Array.from(effectiveConditions);
    if (brandIds.size > 0) f.brand_ids = Array.from(brandIds);
    if (query.trim()) f.q = query.trim();
    return f;
  }, [deviceType, conditions, brandIds, grades, query]);

  const { types: deviceTypeValues, brands: brandOptions, isLoading: filtersLoading } = useCatalogFilters(landing, {});

  const {
    products, total, isLoading, isLoadingMore, hasMore, loadMore,
  } = useCatalogProducts({
    landingSlug: landing,
    filters: apiFilters,
    sortBy: SORT_API[sort],
    enabled: true,
    previewKey,
    gridColumns: 3,
    couponCode,
  });

  const displayed = products;

  // Si algún equipo de la vitrina tiene promoción, reservamos el mismo alto de
  // banner en las cards SIN promo para que todas queden alineadas (mismo alto),
  // independientemente de la columna/fila donde caigan.
  const anyPromo = useMemo(() => displayed.some((p) => !!p.promotion?.template), [displayed]);

  const goDetalle = useCallback(
    (p: CatalogProduct) => router.push(routes.producto(landing, p.slug)),
    [router, landing],
  );

  const selectAndSolicitar = useCallback(
    (p: CatalogProduct) => {
      clearCartProducts();
      clearAccessories();
      setSelectedProduct({
        id: p.id,
        slug: p.slug,
        name: p.displayName,
        shortName: p.name,
        brand: p.brand,
        price: p.price,
        monthlyPayment: p.quotaMonthly,
        months: (p.maxTermMonths ?? 24) as TermMonths,
        initialPercent: p.hookInitialPercent ?? 0,
        initialAmount: 0,
        image: p.images[0] || p.thumbnail,
        type: p.deviceType,
        condition: p.conditionCode || p.condition,
        variantId: p.variantId,
        specs: {
          processor: p.specs?.processor?.model || '',
          ram: p.specs?.ram ? `${p.specs.ram.size}GB RAM` : '',
          storage: p.specs?.storage ? `${p.specs.storage.size}GB ${p.specs.storage.type ?? ''}`.trim() : '',
        },
      });
      router.push(routes.solicitar(landing));
    },
    [setSelectedProduct, clearCartProducts, clearAccessories, router, landing],
  );

  const onLoQuiero = useCallback(
    (p: CatalogProduct) => {
      if (isRefurbishedCondition(p.conditionCode || p.condition)) {
        setPendingRefurb(p);
        return;
      }
      selectAndSolicitar(p);
    },
    [selectAndSolicitar],
  );

  const toggleCondition = (v: string) =>
    setConditions((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  const toggleBrand = (id: number) =>
    setBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleGrade = (g: string) =>
    setGrades((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });

  const clearFilters = () => {
    setConditions(new Set());
    setBrandIds(new Set());
    setGrades(new Set());
  };

  if (isMobile) return null;

  const deviceTypes = deviceTypeValues.length > 0 ? deviceTypeValues : ['laptop', 'tablet', 'celular'];

  return (
    <div className="min-h-screen relative">
      <Navbar
        fullWidth
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
        previewBannerOffset={previewBannerOffset}
        searchSlot={NAVBAR_SEARCH_ENABLED ? (
          <label className={styles.navSearch}>
            <Search size={18} color="#8A8A99" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar equipo…"
            />
          </label>
        ) : undefined}
      />

      <div className={styles.root} style={{ paddingTop: 'var(--header-total-height, 6.5rem)' }}>
        <div className={styles.wrap}>
          {/* Buscador en el cuerpo solo si NO está en el navbar */}
          {!NAVBAR_SEARCH_ENABLED && (
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <Search size={20} color="#8A8A99" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar equipo…"
                />
              </label>
            </div>
          )}

          <div className={styles.catTitle}>Selecciona el tipo de equipo que buscas</div>
          <div className={styles.catDesc}>Financia laptops, tablets y celulares nuevos y seminuevos en cuotas, sin inicial.</div>

          <div className={styles.catLayout}>
            {/* ===== Sidebar de filtros ===== */}
            <aside className={styles.side}>
              <h3>Filtros</h3>

              <div className={styles.fgroup}>
                <div className={styles.fgT}>Tipo de equipo</div>
                {deviceTypes.map((value) => {
                  const on = deviceType === value;
                  return (
                    <div
                      key={value}
                      className={`${styles.tipoOpt} ${on ? styles.tipoOptOn : ''}`}
                      onClick={() => setDeviceType(on ? null : value)}
                    >
                      <span className={styles.ti}>{deviceIcon(value)}</span>
                      {deviceLabel(value)}
                    </div>
                  );
                })}
              </div>

              <div className={styles.fgroup}>
                <div className={styles.fgT}>Condición</div>
                {[{ v: 'nueva', l: 'Nuevo' }, { v: 'reacondicionada', l: 'Seminuevo' }].map((c) => (
                  <div
                    key={c.v}
                    className={`${styles.checkOpt} ${conditions.has(c.v) ? styles.checkOptOn : ''}`}
                    onClick={() => toggleCondition(c.v)}
                  >
                    <span className={styles.box}><Check size={12} strokeWidth={3.5} /></span>
                    {c.l}
                  </div>
                ))}
              </div>

              <div className={styles.fgroup}>
                <div className={styles.fgT}>Marca</div>
                {filtersLoading && brandOptions.length === 0 ? (
                  <span style={{ fontSize: 14, color: '#8A8A99' }}>Cargando marcas…</span>
                ) : (
                  brandOptions.map((b: { id?: number; value?: number; name?: string; label?: string }) => {
                    const id = (b.id ?? b.value) as number;
                    const label = b.name ?? b.label ?? String(id);
                    return (
                      <div
                        key={id}
                        className={`${styles.checkOpt} ${brandIds.has(id) ? styles.checkOptOn : ''}`}
                        onClick={() => toggleBrand(id)}
                      >
                        <span className={styles.box}><Check size={12} strokeWidth={3.5} /></span>
                        {label}
                      </div>
                    );
                  })
                )}
              </div>

              <div className={styles.fgroup}>
                <div className={styles.fgT}>Grado de reacondicionado</div>
                {['A', 'B', 'C'].map((g) => (
                  <div
                    key={g}
                    className={`${styles.checkOpt} ${grades.has(g) ? styles.checkOptOn : ''}`}
                    onClick={() => toggleGrade(g)}
                  >
                    <span className={styles.box}><Check size={12} strokeWidth={3.5} /></span>
                    Grado {g}
                  </div>
                ))}
              </div>

              <button type="button" className={styles.sideClear} onClick={clearFilters}>Limpiar filtros</button>
            </aside>

            {/* ===== Grilla ===== */}
            <div>
              <div className={styles.gridHead}>
                <div className={styles.gridCount}><b>{total ?? displayed.length}</b> equipos</div>
                <label className={styles.sort}>
                  <ArrowUpDown size={16} className={styles.sortIco} />
                  <span className={styles.sortLbl}>Ordenar:</span>
                  <span className={styles.sortVal}>{SORT_LABEL[sort]}</span>
                  <ChevronDown size={16} className={styles.sortChev} />
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Ordenar equipos">
                    <option value="recommended">Recomendados</option>
                    <option value="price_asc">Menor precio</option>
                    <option value="price_desc">Mayor precio</option>
                  </select>
                </label>
              </div>

              {isLoading ? (
                <div className={styles.loadingWrap}><CubeGridSpinner /></div>
              ) : displayed.length === 0 ? (
                <div className={styles.empty}>No hay equipos con esos filtros.</div>
              ) : (
                <div className={styles.grid}>
                  {displayed.map((p) => {
                    const refurbished = isRefurbishedCondition(p.conditionCode || p.condition);
                    const specs = cardSpecs(p);
                    const img = p.images?.[0] || p.thumbnail;
                    return (
                      <div key={p.id} className={styles.dcard}>
                        {p.promotion?.template ? (
                          <CopiaHomePromoBanner promotion={p.promotion} />
                        ) : anyPromo ? (
                          <div style={{ height: PROMO_BANNER_HEIGHT, flex: 'none' }} />
                        ) : null}
                        {refurbished && !p.promotion?.template && <span className={styles.prodBadge}>Seminuevo</span>}
                        <div className={styles.dcardImg} onClick={() => goDetalle(p)}>
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={p.displayName} />
                          ) : null}
                        </div>
                        <div className={styles.dcardBody}>
                          <div className={styles.prodMarca}>{p.brand}</div>
                          <div className={styles.dcardTitle} onClick={() => goDetalle(p)}>{p.displayName}</div>
                          {p.colors && p.colors.length > 0 && (
                            <div className={styles.swatches}>
                              {p.colors.slice(0, 5).map((c, i) => (
                                <span key={i} className={styles.swatch} style={{ background: c.hex }} />
                              ))}
                            </div>
                          )}
                          <div className={styles.dcardSpecs}>
                            {specs.map((s, i) => (
                              <div key={i} className={styles.spec}>{s.icon}<span>{s.txt}</span></div>
                            ))}
                          </div>
                          <div className={styles.dcardPrice}>
                            <div className={styles.num}>S/{Math.round(p.quotaMonthly)} <span>/mes</span></div>
                            <div className={styles.sub}>{p.maxTermMonths} meses · sin inicial</div>
                          </div>
                          <div className={styles.dcardBtns}>
                            <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={() => goDetalle(p)}>
                              <Eye size={17} /> Detalle
                            </button>
                            <button type="button" className={`${styles.btn} ${styles.btnSolid}`} onClick={() => onLoQuiero(p)}>
                              Lo quiero
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {hasMore && !isLoading && (
                <button
                  type="button"
                  className={styles.loadMore}
                  onClick={() => loadMore()}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Cargando…' : 'Ver más equipos'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aviso "Producto seminuevo" (reacondicionado) */}
      <RefurbishedWarningModal
        isOpen={!!pendingRefurb}
        onClose={() => setPendingRefurb(null)}
        onConfirm={() => {
          const p = pendingRefurb;
          setPendingRefurb(null);
          if (p) selectAndSolicitar(p);
        }}
        productName={pendingRefurb?.displayName}
        policyHref={POLITICAS_PDF_URL}
        policyFilename={POLITICAS_PDF_FILENAME}
        shippingNote={pendingRefurb && productHasDeferredShipping(pendingRefurb) ? DEFERRED_SHIPPING_NOTE : undefined}
      />

      <Footer data={footerData} landing={landing} agreementData={agreementData} />
    </div>
  );
}

export default CopiaHomeDesktopCatalog;
