'use client';

/**
 * AccesoriosOfertaClient — mini-checkout de accesorios y seguros (BAL-2064).
 *
 * El cliente ya eligió un equipo (variant); aquí suma accesorios y seguros que
 * caben en su cuota restante y confirma todo junto.
 *
 * UX idéntica al flujo regular: la sección de accesorios replica EXACTAMENTE
 * `AccessoriesSection` (AccessoryIntro + card contenedora + chips con conteo
 * "Todos (N)" + buscador + contador + grid 3-col + paginación por flechas +
 * AccessoryCard + AccessoryDetailModal). Seguros usa `InsuranceCards` con su
 * propia intro (showIntro), igual que `InsuranceSection`. No se reutilizan
 * AccessoriesSection/InsuranceSection directamente porque dependen de
 * ProductContext, que el flujo de oferta no monta — así que se replica su JSX
 * con estado local.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, ArrowLeft, Package, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import { Navbar } from '../../../components/hero/Navbar';
import {
  getOffer,
  getOfferAddonsRich,
  selectEquipment,
  OfferApiError,
} from '../../../services/offerApi';
import type { Accessory, AccessoryCategory, InsurancePlan } from '../../../[landing]/solicitar/types/upsell';
import { AccessoryCard } from '../../../[landing]/solicitar/components/upsell/AccessoryCard';
import { AccessoryDetailModal } from '../../../[landing]/solicitar/components/upsell/AccessoryDetailModal';
import { AccessoryIntro } from '../../../[landing]/solicitar/components/upsell/AccessoryIntro';
import { InsuranceCards } from '../../../[landing]/solicitar/components/upsell/InsuranceCards';
import { ConfirmarEleccionModal } from '../components/ConfirmarEleccionModal';
import { readOfferSelection, clearOfferSelection } from '../offerStorage';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

/** localStorage: persiste la selección de add-ons por token + variante, para
 *  sobrevivir un refresh o ida/vuelta sin perder lo elegido. Se limpia al
 *  confirmar (ya queda en BD). Atarlo a la variante evita arrastrar add-ons de
 *  un equipo distinto (los que cabían en uno pueden no caber en otro). */
function addonsStorageKey(token: string, variantId: number): string {
  return `oferta:addons:${token}:${variantId}`;
}

function readStoredAddons(token: string, variantId: number): { acc: string[]; ins: string[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(addonsStorageKey(token, variantId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const acc = Array.isArray(parsed?.acc) ? parsed.acc.map(String) : [];
    const ins = Array.isArray(parsed?.ins) ? parsed.ins.map(String) : [];
    return { acc, ins };
  } catch {
    return null;
  }
}

function writeStoredAddons(token: string, variantId: number, acc: string[], ins: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(addonsStorageKey(token, variantId), JSON.stringify({ acc, ins }));
  } catch {
    /* cuota llena / modo privado: ignorar, no rompe el flujo */
  }
}

function clearStoredAddons(token: string, variantId: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(addonsStorageKey(token, variantId));
  } catch {
    /* ignorar */
  }
}

/** Page size responsive, igual que AccessoriesSection: 2 móvil, 4 tablet, 6 desktop. */
function usePageSize() {
  const [pageSize, setPageSize] = useState(6);
  useEffect(() => {
    const update = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setPageSize(6);
      else if (window.matchMedia('(min-width: 640px)').matches) setPageSize(4);
      else setPageSize(2);
    };
    update();
    const lg = window.matchMedia('(min-width: 1024px)');
    const sm = window.matchMedia('(min-width: 640px)');
    lg.addEventListener('change', update);
    sm.addEventListener('change', update);
    return () => {
      lg.removeEventListener('change', update);
      sm.removeEventListener('change', update);
    };
  }, []);
  return pageSize;
}

export function AccesoriosOfertaClient({ token }: { token: string }) {
  // La selección (variant/combo/slug + equipo) se lee de localStorage → la URL
  // queda limpia, sin query params. Se resuelve una vez al montar; si no existe
  // (link directo / storage limpio), se redirige a la portada de la oferta.
  const [variantId, setVariantId] = useState<number | null>(null);
  const [comboId, setComboId] = useState<number | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [insurances, setInsurances] = useState<InsurancePlan[]>([]);
  const [equipoMonthly, setEquipoMonthly] = useState(0);
  // Cuota máxima aprobada (tope). equipo + accesorios + seguros no puede superarla.
  const [maxQuota, setMaxQuota] = useState<number | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<string[]>([]);
  const [selectedIns, setSelectedIns] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);
  // Modal de confirmación (siempre, con desglose de add-ons).
  const [modalOpen, setModalOpen] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [equipoInfo, setEquipoInfo] = useState<{ name: string; brand?: string; imageUrl?: string } | null>(null);

  // Filtros + paginación (idéntico a AccessoriesSection).
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = usePageSize();
  const [currentPage, setCurrentPage] = useState(0);

  const backToDetail = useCallback(() => {
    const base = process.env.NEXT_PUBLIC_APP_BASE_PATH || '';
    if (slug) window.location.href = `${base}/oferta/${token}/producto/${slug}`;
    else window.location.href = `${base}/oferta/${token}`;
  }, [token, slug]);

  // Carga inicial: lee la selección de localStorage (variant/combo/slug + equipo),
  // valida el token y trae los add-ons del equipo elegido. Sin selección
  // guardada (link directo / storage limpio) → redirige a la portada.
  useEffect(() => {
    let active = true;
    const selection = readOfferSelection(token);
    if (!selection) {
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
      return;
    }
    const vId = selection.variantId;
    setVariantId(vId);
    setComboId(selection.comboId);
    setSlug(selection.slug);
    setEquipoInfo({ name: selection.name, brand: selection.brand, imageUrl: selection.imageUrl });
    (async () => {
      try {
        const offer = await getOffer(token); // valida token + cuota máxima aprobada
        if (active && offer.maxMonthlyQuota) setMaxQuota(offer.maxMonthlyQuota);
        const res = await getOfferAddonsRich(token, vId, {
          accessoryIds: selectedAcc.map(Number),
          insuranceIds: selectedIns.map(Number),
        });
        if (!active) return;
        setAccessories(res.accessories);
        setInsurances(res.insurances);
        setEquipoMonthly(res.equipoMonthly);
        // Rehidratar los add-ons guardados (refresh / ida-vuelta), filtrando
        // contra lo que hoy está disponible (algo guardado podría ya no caber).
        const stored = readStoredAddons(token, vId);
        if (stored) {
          const accOk = new Set(res.accessories.map((a) => a.id));
          const insOk = new Set(res.insurances.map((p) => p.id));
          setSelectedAcc(stored.acc.filter((id) => accOk.has(id)));
          setSelectedIns(stored.ins.filter((id) => insOk.has(id)));
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof OfferApiError ? err.message : 'No pudimos cargar los accesorios.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // Solo al montar: la selección se resuelve una vez desde localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Persistir la selección en localStorage en cada cambio (para sobrevivir un
  // refresh). No corre durante la carga inicial ni tras confirmar (succeeded).
  useEffect(() => {
    if (loading || succeeded || variantId == null) return;
    writeStoredAddons(token, variantId, selectedAcc, selectedIns);
  }, [token, variantId, selectedAcc, selectedIns, loading, succeeded]);

  // Subcategorías disponibles (deduplicadas por slug), igual que el flujo regular.
  const availableCategories = useMemo(() => {
    const map = new Map<string, AccessoryCategory>();
    accessories.forEach((a) => {
      if (a.category && !map.has(a.category.slug)) map.set(a.category.slug, a.category);
    });
    return Array.from(map.values());
  }, [accessories]);

  // Accesorios filtrados por categoría (slug) + búsqueda.
  const filteredAccessories = useMemo(() => {
    let filtered = accessories;
    if (activeCategory !== 'todos') filtered = filtered.filter((a) => a.category?.slug === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [accessories, activeCategory, searchQuery]);

  // Reset de página al cambiar filtros o tamaño (igual que el flujo regular).
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory, searchQuery, pageSize]);

  const totalPages = Math.ceil(filteredAccessories.length / pageSize);
  const visibleAccessories = filteredAccessories.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < totalPages - 1;

  const toggleAcc = (a: Accessory) =>
    setSelectedAcc((prev) => {
      if (prev.includes(a.id)) return prev.filter((x) => x !== a.id); // quitar siempre
      if (!accFits(a)) return prev; // agregar solo si cabe en la cuota
      return [...prev, a.id];
    });
  const toggleIns = (planId: string) =>
    setSelectedIns((prev) => {
      if (prev.includes(planId)) return prev.filter((x) => x !== planId); // quitar siempre
      const plan = insurances.find((p) => p.id === planId);
      if (plan && !insFits(plan)) return prev; // agregar solo si cabe
      return [...prev, planId];
    });

  // Cuota total = equipo + accesorios + seguros seleccionados.
  const totalMonthly = useMemo(() => {
    const acc = accessories.filter((a) => selectedAcc.includes(a.id)).reduce((s, a) => s + (a.monthlyQuota || 0), 0);
    const ins = insurances.filter((p) => selectedIns.includes(p.id)).reduce((s, p) => s + (p.monthlyPrice || 0), 0);
    return equipoMonthly + acc + ins;
  }, [accessories, insurances, selectedAcc, selectedIns, equipoMonthly]);

  // Cuota restante = tope aprobado − total actual. El equipo + add-ons no puede
  // superar la cuota máxima aprobada (premisa del Caso 4).
  const remaining = maxQuota != null ? maxQuota - totalMonthly : Infinity;
  const overBudget = maxQuota != null && totalMonthly > maxQuota + 0.5;
  // Un add-on NO seleccionado se puede agregar solo si su cuota cabe en el
  // restante. Los ya seleccionados siempre se pueden quitar.
  const accFits = (a: Accessory) => selectedAcc.includes(a.id) || (a.monthlyQuota || 0) <= remaining + 0.5;
  const insFits = (p: InsurancePlan) => selectedIns.includes(p.id) || (p.monthlyPrice || 0) <= remaining + 0.5;

  // Confirmación real (desde el modal). Al terminar, el modal pasa a "¡Listo!";
  // la navegación a la oferta ocurre al presionar "Continuar" (onSuccessContinue),
  // así el spinner no queda girando durante el window.location.
  const confirmar = useCallback(async () => {
    if (variantId == null) return;
    setConfirming(true);
    try {
      await selectEquipment(token, variantId, comboId, {
        accessoryIds: selectedAcc.map(Number),
        insuranceIds: selectedIns.map(Number),
      });
      // Ya quedó en BD → limpiar el borrador local para no restaurarlo luego.
      clearStoredAddons(token, variantId);
      clearOfferSelection(token);
      setConfirming(false);
      setSucceeded(true);
    } catch (err) {
      setError(err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.');
      setConfirming(false);
      setModalOpen(false);
    }
  }, [token, variantId, comboId, selectedAcc, selectedIns]);

  // Slot de desglose de add-ons para el modal (equipo + accesorios + seguros).
  const addonsResumen = useMemo(() => {
    const accSel = accessories.filter((a) => selectedAcc.includes(a.id));
    const insSel = insurances.filter((p) => selectedIns.includes(p.id));
    if (accSel.length === 0 && insSel.length === 0) {
      return (
        <p className="text-center text-sm text-neutral-400">Sin accesorios ni seguros adicionales.</p>
      );
    }
    return (
      <div className="rounded-xl border border-neutral-200 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Sumas a tu equipo</p>
        <ul className="space-y-2">
          {accSel.map((a) => (
            <li key={`a-${a.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-neutral-600">
                <Package className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate">{a.name}</span>
              </span>
              <span className="shrink-0 text-neutral-500">+S/{Math.round(a.monthlyQuota || 0)}/mes</span>
            </li>
          ))}
          {insSel.map((p) => (
            <li key={`i-${p.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-neutral-600">
                <ShieldCheck className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate">{p.name}</span>
              </span>
              <span className="shrink-0 text-neutral-500">+S/{Math.round(p.monthlyPrice || 0)}/mes</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-2">
          <span className="text-sm font-semibold text-neutral-800">Cuota mensual total</span>
          <span className="text-base font-extrabold" style={{ color: 'var(--color-primary)' }}>
            S/{Math.round(totalMonthly)}/mes
          </span>
        </div>
      </div>
    );
  }, [accessories, insurances, selectedAcc, selectedIns, totalMonthly]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-bg,#fafafa)]">
        <CubeGridSpinner />
      </div>
    );
  }

  if (error && accessories.length === 0 && insurances.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar logoOnly logoUrl={BRAND_LOGO_URL} logoContainerClassName="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8" />
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <p className="text-lg font-semibold text-neutral-800">{error}</p>
          <button onClick={backToDetail} className="mt-4 cursor-pointer text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-40">
      <Navbar logoOnly logoUrl={BRAND_LOGO_URL} logoContainerClassName="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8" />
      <div className="pt-16" />

      {/* Barra: volver */}
      <div className="sticky top-16 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <button onClick={backToDetail} className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al equipo</span>
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div>
          <h1 className="font-['Baloo_2',_sans-serif] text-2xl font-bold text-neutral-800">
            Suma más a tu equipo
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Agrega accesorios y protección. Solo mostramos lo que entra en tu cuota.
          </p>
        </div>

        {/* Accesorios — layout idéntico a AccessoriesSection. Van PRIMERO. */}
        {accessories.length > 0 ? (
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200">
            <AccessoryIntro />

            {/* Toolbar: chips de categoría + búsqueda + contadores + paginación */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <button
                    onClick={() => setActiveCategory('todos')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      activeCategory === 'todos'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Todos ({accessories.length})
                  </button>
                  {availableCategories.map((cat) => {
                    const count = accessories.filter((a) => a.category?.slug === cat.slug).length;
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => setActiveCategory(cat.slug)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          activeCategory === cat.slug
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar accesorio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
                  {selectedAcc.length > 0 && (
                    <span className="px-3 py-1.5 bg-[#22c55e]/10 text-[#22c55e] text-xs font-semibold rounded-full">
                      {selectedAcc.length} seleccionado{selectedAcc.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400 ml-auto sm:ml-0">
                    {filteredAccessories.length} accesorio{filteredAccessories.length !== 1 ? 's' : ''}
                  </span>
                  {totalPages > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentPage((p) => p - 1)}
                        disabled={!canGoBack}
                        aria-label="Página anterior"
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          canGoBack
                            ? 'bg-[var(--color-primary)] text-white hover:brightness-90'
                            : 'bg-neutral-100 text-neutral-300 cursor-default'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={!canGoForward}
                        aria-label="Página siguiente"
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          canGoForward
                            ? 'bg-[var(--color-primary)] text-white hover:brightness-90'
                            : 'bg-neutral-100 text-neutral-300 cursor-default'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Grid 3-col + AccessoryCard (idéntico al flujo regular) */}
            {filteredAccessories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <Package className="w-10 h-10 mb-2" />
                <p className="text-sm">No se encontraron accesorios</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleAccessories.map((a, index) => {
                  const fits = accFits(a);
                  return (
                    // Si no cabe en la cuota restante: atenuado + no clickeable
                    // (bloquea el toggle) + hint. Sí se puede quitar si ya está.
                    <div key={a.id} className="relative">
                      <div className={fits ? '' : 'pointer-events-none opacity-45 grayscale'}>
                        <AccessoryCard
                          accessory={a}
                          isSelected={selectedAcc.includes(a.id)}
                          onToggle={() => toggleAcc(a)}
                          onViewDetails={() => setDetailAccessory(a)}
                          isMoltiTop={a.isMoltiTop && index === 0}
                        />
                      </div>
                      {!fits ? (
                        <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-neutral-800/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                          No cabe en tu cuota
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* Seguros — InsuranceCards con su propia intro. Van DESPUÉS de accesorios. */}
        {insurances.length > 0 ? (
          <InsuranceCards
            plans={insurances}
            selectedPlanIds={selectedIns}
            onToggle={toggleIns}
            showIntro
          />
        ) : null}
      </main>

      {/* Barra fija inferior: cuota total + confirmar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs text-neutral-400">Cuota mensual total</p>
            <p className="text-2xl font-extrabold" style={{ color: overBudget ? '#dc2626' : 'var(--color-primary)' }}>
              S/{Math.round(totalMonthly)}
              <span className="text-base font-normal text-neutral-400">/mes</span>
            </p>
            {/* Margen restante o alerta de sobrepaso (respeta el tope aprobado). */}
            {maxQuota != null ? (
              overBudget ? (
                <p className="text-xs font-medium text-red-600">
                  Supera tu cuota por S/{Math.round(totalMonthly - maxQuota)}. Quita algo para continuar.
                </p>
              ) : (
                <p className="text-xs text-neutral-400">
                  Te quedan S/{Math.round(remaining)} de tu cuota aprobada
                </p>
              )
            ) : null}
          </div>
          <Button
            onPress={() => setModalOpen(true)}
            isDisabled={overBudget}
            className="cursor-pointer rounded-xl px-8 py-6 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Confirmar mi elección
          </Button>
        </div>
      </div>

      {/* Modal de confirmación (siempre) con desglose de equipo + add-ons. */}
      <ConfirmarEleccionModal
        isOpen={modalOpen}
        equipo={
          equipoInfo
            ? { name: equipoInfo.name, brand: equipoInfo.brand, imageUrl: equipoInfo.imageUrl, monthly: equipoMonthly }
            : { name: 'Tu equipo', monthly: equipoMonthly }
        }
        loading={confirming}
        succeeded={succeeded}
        onConfirm={confirmar}
        onClose={() => (confirming ? undefined : setModalOpen(false))}
        onSuccessContinue={() => {
          window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
        }}
        addonsSlot={addonsResumen}
      />

      {/* Modal de detalle del accesorio (reutilizado del flujo regular) */}
      <AccessoryDetailModal
        accessory={detailAccessory}
        isOpen={detailAccessory !== null}
        onClose={() => setDetailAccessory(null)}
        isSelected={detailAccessory ? selectedAcc.includes(detailAccessory.id) : false}
        onToggle={() => detailAccessory && toggleAcc(detailAccessory)}
      />
    </div>
  );
}
