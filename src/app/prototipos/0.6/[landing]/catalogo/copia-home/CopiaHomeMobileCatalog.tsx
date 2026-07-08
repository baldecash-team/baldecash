'use client';

/**
 * CopiaHomeMobileCatalog — variante mobile del catálogo para la landing
 * `copia-home` (mockup seminuevos). Reutiliza los hooks de datos reales
 * (useCatalogProducts / useCatalogFilters), el estado compartido de
 * wishlist y el flujo canónico de "Lo quiero" (aviso de reacondicionado →
 * setSelectedProduct → /solicitar). Solo se monta en mobile; el dispatcher
 * vive en CatalogoClient.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Eye, Check,
  Cpu, HardDrive, Monitor, Heart, Laptop, Tablet, Smartphone,
} from 'lucide-react';
import { useIsMobile, CubeGridSpinner } from '@/app/prototipos/_shared';
import { useProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { RefurbishedWarningModal, isRefurbishedCondition } from '@/app/prototipos/0.6/components/RefurbishedWarningModal';
import type { CatalogProduct, TermMonths } from '../types/catalog';
import type { CatalogFilters as ApiCatalogFilters, SortBy as ApiSortBy } from '../../../services/catalogApi';
import { useCatalogProducts, useCatalogFilters } from '../hooks/useCatalogProducts';
import { useCatalogSharedState } from '../hooks/useCatalogSharedState';
import { useCampaignCoupon } from '../hooks/useCampaignCoupon';
import styles from './copiaHome.module.css';

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

const DEVICE_ICON: Record<string, React.ReactNode> = {
  laptop: <Laptop size={40} strokeWidth={1.6} />,
  tablet: <Tablet size={40} strokeWidth={1.6} />,
  celular: <Smartphone size={40} strokeWidth={1.6} />,
  smartphone: <Smartphone size={40} strokeWidth={1.6} />,
};

function deviceIcon(value: string): React.ReactNode {
  return DEVICE_ICON[value?.toLowerCase()] ?? <Laptop size={40} strokeWidth={1.6} />;
}

const DEVICE_LABEL: Record<string, string> = {
  laptop: 'Laptop',
  tablet: 'Tablet',
  celular: 'Celular',
  smartphone: 'Celular',
};

function deviceLabel(value: string): string {
  return DEVICE_LABEL[value?.toLowerCase()] ?? (value ? value[0].toUpperCase() + value.slice(1) : value);
}

/** Specs cortos para la card (procesador / ram / almacenamiento / pantalla). */
function cardSpecs(p: CatalogProduct): { icon: React.ReactNode; txt: string }[] {
  const out: { icon: React.ReactNode; txt: string }[] = [];
  const s = p.specs;
  if (s?.processor?.model) out.push({ icon: <Cpu size={16} />, txt: s.processor.model });
  if (s?.ram?.size) out.push({ icon: <HardDrive size={16} />, txt: `${s.ram.size}GB RAM` });
  if (s?.storage?.size) out.push({ icon: <HardDrive size={16} />, txt: `${s.storage.size}GB ${s.storage.type ?? ''}`.trim() });
  if (s?.display?.size) out.push({ icon: <Monitor size={16} />, txt: `${s.display.size}"${s.display.type ? ' ' + s.display.type : ''}` });
  return out.slice(0, 4);
}

export function CopiaHomeMobileCatalog() {
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
  const shared = useCatalogSharedState(landing, previewKey);

  // ---- Estado de filtros (mockup: finder por tipo + sheet condición/marca) ----
  const [deviceType, setDeviceType] = useState<string | null>(null);
  const [conditions, setConditions] = useState<Set<string>>(new Set());
  const [brandIds, setBrandIds] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<SortKey>('recommended');
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // ---- Aviso de reacondicionado antes de "Lo quiero" ----
  const [pendingRefurb, setPendingRefurb] = useState<CatalogProduct | null>(null);

  const apiFilters = useMemo<ApiCatalogFilters>(() => {
    const f: ApiCatalogFilters = {};
    if (deviceType) f.types = [deviceType];
    if (conditions.size > 0) f.conditions = Array.from(conditions);
    if (brandIds.size > 0) f.brand_ids = Array.from(brandIds);
    if (query.trim()) f.q = query.trim();
    return f;
  }, [deviceType, conditions, brandIds, query]);

  const { types: deviceTypeValues, brands: brandOptions, isLoading: filtersLoading } = useCatalogFilters(landing, {});

  const {
    products,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useCatalogProducts({
    landingSlug: landing,
    filters: apiFilters,
    sortBy: SORT_API[sort],
    enabled: true,
    previewKey,
    gridColumns: 1,
    couponCode,
  });

  const displayed = useMemo(() => {
    if (!favOnly) return products;
    return products.filter((p) => shared.isInWishlist(p.id));
  }, [products, favOnly, shared]);

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

  const toggleCondition = (value: string) =>
    setConditions((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  const toggleBrand = (id: number) =>
    setBrandIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearFilters = () => {
    setConditions(new Set());
    setBrandIds(new Set());
  };

  const activeFilterCount = conditions.size + brandIds.size;

  if (!isMobile) return null;

  return (
    <div className="min-h-screen relative">
      {/* Navbar del sitio (igual que el resto de páginas) */}
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
      />

      <div className={styles.root} style={{ paddingTop: 'var(--header-total-height, 6.5rem)' }}>
      {/* Toolbar: búsqueda + favoritos */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <label className={styles.search ?? ''} style={{ flex: 1, height: 44, background: '#EFEFF3', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
            <Search size={18} color="#8A8A99" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar equipo…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, width: '100%', color: '#2B2C3A' }}
            />
          </label>
          <button
            type="button"
            aria-label="Favoritos"
            onClick={() => setFavOnly((v) => !v)}
            style={{ width: 44, height: 44, background: favOnly ? '#fde8e8' : '#EFEFF3', border: 'none', borderRadius: 12, display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <Heart size={22} color={favOnly ? '#e5484d' : '#151744'} fill={favOnly ? '#e5484d' : 'none'} />
          </button>
        </div>
      </div>

      <div className={styles.scroll}>
        {/* Finder por tipo de equipo */}
        <div className={`${styles.card} ${styles.finder}`}>
          <h2>Selecciona el tipo de equipo que buscas</h2>
          <div className={styles.cats}>
            {(deviceTypeValues.length > 0 ? deviceTypeValues : ['laptop', 'tablet', 'celular']).map((value) => {
              const on = deviceType === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`${styles.cat} ${on ? styles.catOn : ''}`}
                  onClick={() => setDeviceType(on ? null : value)}
                >
                  <span className={styles.chk}><Check size={11} strokeWidth={3.5} /></span>
                  <span className={styles.catIco}>{deviceIcon(value)}</span>
                  <span className={styles.catLbl}>{deviceLabel(value)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sortbar */}
        <div className={`${styles.card} ${styles.sortbar}`}>
          <div className={styles.sortbarLeft}>
            <ArrowUpDown size={18} />
            <span>{SORT_LABEL[sort]}</span>
          </div>
          <div className={styles.sortbarRight}>
            <span><b>{total ?? displayed.length}</b> equipos</span>
            <ChevronDown size={16} />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="recommended">Recomendados</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>

        {/* Lista de productos */}
        {isLoading ? (
          <div className={styles.loadingWrap}><CubeGridSpinner /></div>
        ) : displayed.length === 0 ? (
          <div className={styles.card}><div className={styles.empty}>No hay equipos con esos filtros.</div></div>
        ) : (
          displayed.map((p) => {
            const refurbished = isRefurbishedCondition(p.conditionCode || p.condition);
            const specs = cardSpecs(p);
            return (
              <div key={p.id} className={`${styles.card} ${styles.prod}`}>
                {refurbished && <span className={styles.prodBadge}>Seminuevo</span>}
                <div className={styles.prodH}>
                  <div className={styles.prodLeft}>
                    <div className={styles.prodImg} onClick={() => goDetalle(p)}>
                      {(p.images?.[0] || p.thumbnail) ? (
                        // Preferir images[0] (galería, como desktop): los thumbnail_url
                        // (_thumb.webp) devuelven 403 en varios equipos.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images?.[0] || p.thumbnail} alt={p.displayName} />
                      ) : null}
                    </div>
                    <div className={styles.price}>
                      <div className={styles.priceLbl}>Cuota mensual</div>
                      <div className={styles.priceNum}>S/{Math.round(p.quotaMonthly)} <span>/mes</span></div>
                      <div className={styles.priceSub}>{p.maxTermMonths} meses · sin inicial</div>
                    </div>
                  </div>
                  <div className={styles.prodRight}>
                    <div className={styles.prodMarca}>{p.brand}</div>
                    <div className={styles.prodTitulo} onClick={() => goDetalle(p)}>{p.displayName}</div>
                    {p.colors && p.colors.length > 0 && (
                      <>
                        <div className={styles.coloresLbl}>Colores disponibles:</div>
                        <div className={styles.swatches}>
                          {p.colors.slice(0, 5).map((c, i) => (
                            <span key={i} className={styles.swatch} style={{ background: c.hex }} />
                          ))}
                        </div>
                      </>
                    )}
                    <div className={styles.specs}>
                      {specs.map((s, i) => (
                        <div key={i} className={styles.spec}>{s.icon}<span>{s.txt}</span></div>
                      ))}
                    </div>
                    <div className={styles.btns}>
                      <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={() => goDetalle(p)}>
                        <Eye size={17} /> Detalle
                      </button>
                      <button type="button" className={`${styles.btn} ${styles.btnSolid}`} onClick={() => onLoQuiero(p)}>
                        Lo quiero
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {hasMore && !isLoading && (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnOutline}`}
            style={{ width: '100%', marginTop: 4 }}
            onClick={() => loadMore()}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Cargando…' : 'Ver más equipos'}
          </button>
        )}
      </div>

      {/* FAB filtros */}
      <button type="button" className={styles.fab} onClick={() => setSheetOpen(true)}>
        <SlidersHorizontal size={18} />
        Filtros
        {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
      </button>

      {/* Bottom sheet de filtros */}
      <div className={`${styles.overlay} ${sheetOpen ? styles.overlayOn : ''}`} onClick={() => setSheetOpen(false)} />
      <div className={`${styles.sheet} ${sheetOpen ? styles.sheetOn : ''}`}>
        <div className={styles.grip} />
        <h3>Filtros</h3>

        <div className={styles.filterGroup}>
          <div className={styles.fgTitle}>Condición</div>
          <div className={styles.chips}>
            {[{ v: 'nueva', l: 'Nuevo' }, { v: 'reacondicionada', l: 'Seminuevo' }].map((c) => (
              <div
                key={c.v}
                className={`${styles.chip} ${conditions.has(c.v) ? styles.chipOn : ''}`}
                onClick={() => toggleCondition(c.v)}
              >
                {c.l}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.fgTitle}>Marca</div>
          <div className={styles.chips}>
            {filtersLoading && brandOptions.length === 0 ? (
              <span style={{ fontSize: 13, color: '#8A8A99' }}>Cargando marcas…</span>
            ) : (
              brandOptions.map((b: any) => {
                const id = b.id ?? b.value;
                const label = b.name ?? b.label ?? String(id);
                return (
                  <div
                    key={id}
                    className={`${styles.chip} ${brandIds.has(id) ? styles.chipOn : ''}`}
                    onClick={() => toggleBrand(id)}
                  >
                    {label}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.sheetActions}>
          <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={clearFilters}>Limpiar</button>
          <button type="button" className={`${styles.btn} ${styles.btnSolid}`} onClick={() => setSheetOpen(false)}>Ver resultados</button>
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
      />
      </div>

      {/* Footer del sitio (igual que el resto de páginas) */}
      <Footer data={footerData} landing={landing} agreementData={agreementData} />
    </div>
  );
}

export default CopiaHomeMobileCatalog;
