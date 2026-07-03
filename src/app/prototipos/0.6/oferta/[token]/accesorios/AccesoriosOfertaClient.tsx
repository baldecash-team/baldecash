'use client';

/**
 * AccesoriosOfertaClient — mini-checkout de accesorios y seguros (BAL-2064).
 *
 * El cliente ya eligió un equipo (variant); aquí suma accesorios y seguros que
 * caben en su cuota restante y confirma todo junto. Reutiliza la UX del flujo
 * regular (AccessoryCard con filtros de categoría/búsqueda, InsuranceCards).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, ArrowLeft, ShieldCheck, Package } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import { Navbar } from '../../../components/hero/Navbar';
import {
  getOffer,
  getOfferAddonsRich,
  selectEquipment,
  OfferApiError,
} from '../../../services/offerApi';
import type { Accessory, InsurancePlan } from '../../../[landing]/solicitar/types/upsell';
import { AccessoryCard } from '../../../[landing]/solicitar/components/upsell/AccessoryCard';
import { AccessoryDetailModal } from '../../../[landing]/solicitar/components/upsell/AccessoryDetailModal';
import { InsuranceCards } from '../../../[landing]/solicitar/components/upsell/InsuranceCards';

const BRAND_LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todos',
};

export function AccesoriosOfertaClient({
  token,
  variantId,
  comboId,
  slug,
}: {
  token: string;
  variantId: number | null;
  comboId: number | null;
  slug: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [insurances, setInsurances] = useState<InsurancePlan[]>([]);
  const [equipoMonthly, setEquipoMonthly] = useState(0);
  const [selectedAcc, setSelectedAcc] = useState<string[]>([]);
  const [selectedIns, setSelectedIns] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);

  // Filtros (misma UX que el flujo regular): categoría + búsqueda.
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const backToDetail = useCallback(() => {
    const base = process.env.NEXT_PUBLIC_APP_BASE_PATH || '';
    if (slug) {
      window.location.href = `${base}/oferta/${token}/producto/${slug}`;
    } else {
      window.location.href = `${base}/oferta/${token}`;
    }
  }, [token, slug]);

  // Carga inicial: valida token + trae addons del equipo elegido.
  useEffect(() => {
    let active = true;
    if (variantId == null) {
      setError('Primero elige un equipo.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await getOffer(token); // valida token
        const res = await getOfferAddonsRich(token, variantId, {
          accessoryIds: selectedAcc.map(Number),
          insuranceIds: selectedIns.map(Number),
        });
        if (!active) return;
        setAccessories(res.accessories);
        setInsurances(res.insurances);
        setEquipoMonthly(res.equipoMonthly);
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
    // Solo en el mount / cambio de variante — la re-carga por selección la maneja
    // el filtro cliente (no re-fetch por cada toggle, más fluido).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, variantId]);

  // Categorías disponibles a partir de los accesorios.
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of accessories) {
      if (a.category?.slug) set.add(a.category.slug);
    }
    return ['all', ...Array.from(set)];
  }, [accessories]);

  // Accesorios filtrados por categoría + búsqueda.
  const filteredAccessories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return accessories.filter((a) => {
      if (activeCategory !== 'all' && a.category?.slug !== activeCategory) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [accessories, activeCategory, searchQuery]);

  const toggleAcc = (a: Accessory) =>
    setSelectedAcc((prev) => (prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]));
  const toggleIns = (planId: string) =>
    setSelectedIns((prev) => (prev.includes(planId) ? prev.filter((x) => x !== planId) : [...prev, planId]));

  // Cuota total = equipo + accesorios + seguros seleccionados.
  const totalMonthly = useMemo(() => {
    const acc = accessories.filter((a) => selectedAcc.includes(a.id)).reduce((s, a) => s + (a.monthlyQuota || 0), 0);
    const ins = insurances.filter((p) => selectedIns.includes(p.id)).reduce((s, p) => s + (p.monthlyPrice || 0), 0);
    return equipoMonthly + acc + ins;
  }, [accessories, insurances, selectedAcc, selectedIns, equipoMonthly]);

  const confirmar = useCallback(async () => {
    if (variantId == null) return;
    setConfirming(true);
    try {
      await selectEquipment(token, variantId, comboId, {
        accessoryIds: selectedAcc.map(Number),
        insuranceIds: selectedIns.map(Number),
      });
      // Éxito → volver a la oferta (muestra la confirmación anterior→nuevo).
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
    } catch (err) {
      setError(err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.');
      setConfirming(false);
    }
  }, [token, variantId, comboId, selectedAcc, selectedIns]);

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

      {/* Barra: volver + título */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <button onClick={backToDetail} className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al equipo</span>
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="font-['Baloo_2',_sans-serif] text-2xl font-bold text-[var(--foreground)]">
            Suma más a tu equipo
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Agrega accesorios y protección. Solo mostramos lo que entra en tu cuota.
          </p>
        </div>

        {/* Seguros (arriba, son pocos e importantes) */}
        {insurances.length > 0 ? (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-['Baloo_2',_sans-serif] text-lg font-bold text-[var(--text-strong,#111827)]">
                Protege tu equipo
              </h2>
            </div>
            <InsuranceCards
              plans={insurances}
              selectedPlanIds={selectedIns}
              onToggle={toggleIns}
              showIntro={false}
            />
          </section>
        ) : null}

        {/* Accesorios con filtros de categoría + búsqueda */}
        {accessories.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-['Baloo_2',_sans-serif] text-lg font-bold text-[var(--text-strong,#111827)]">
                Accesorios
              </h2>
            </div>

            {/* Búsqueda */}
            <div className="mb-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar accesorio…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Chips de categoría */}
            {categories.length > 1 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeCategory === cat
                        ? 'text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={activeCategory === cat ? { backgroundColor: 'var(--color-primary)' } : undefined}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Grid de accesorios (AccessoryCard del flujo regular) */}
            {filteredAccessories.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No hay accesorios con estos filtros.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredAccessories.map((a) => (
                  <AccessoryCard
                    key={a.id}
                    accessory={a}
                    isSelected={selectedAcc.includes(a.id)}
                    onToggle={() => toggleAcc(a)}
                    onViewDetails={() => setDetailAccessory(a)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>

      {/* Barra fija inferior: cuota total + confirmar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs text-gray-400">Cuota mensual total</p>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
              S/{Math.round(totalMonthly)}
              <span className="text-base font-normal text-gray-400">/mes</span>
            </p>
          </div>
          <Button
            onPress={confirmar}
            isLoading={confirming}
            className="cursor-pointer rounded-xl px-8 py-6 text-base font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {confirming ? 'Procesando…' : 'Confirmar mi elección'}
          </Button>
        </div>
      </div>

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
