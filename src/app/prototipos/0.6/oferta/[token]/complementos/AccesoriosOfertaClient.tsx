'use client';

/**
 * AccesoriosOfertaClient — mini-checkout de accesorios y seguros (BAL-2064).
 *
 * El cliente ya eligió un equipo (variant); aquí suma accesorios y seguros que
 * caben en su cuota restante y confirma todo junto.
 *
 * Presentación rediseñada (BAL-2185, Task 9) siguiendo
 * docs/superpowers/design-refs/mock-accesorios.html: TuEquipoCard +
 * IncluidosGratisSection + AccesorioRecomendadoCard + TusExtras +
 * CuotaStickyBar, con BuscadorBottomSheet y AccesorioDetalleSheet como
 * bottom sheets para agregar más accesorios/seguros o ver el detalle de uno.
 * La LÓGICA de negocio (fetch, toggleAcc/toggleIns, totalMonthly, remaining,
 * accFits/insFits, selectEquipment, plazo/inicial BAL-2097) no cambió —
 * solo se reemplazó el render.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, ShieldCheck, Gift, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { CubeGridSpinner } from '@/app/prototipos/_shared';

import {
  getOffer,
  getOfferAddonsRich,
  selectEquipment,
  OfferApiError,
} from '../../../services/offerApi';
import type { Accessory, InsurancePlan } from '../../../[landing]/solicitar/types/upsell';
import { ConfirmarEleccionModal } from '../components/ConfirmarEleccionModal';
import { TermSelect } from '../../../[landing]/solicitar/components/solicitar/product/TermSelect';
import { cuotaSuffix } from '../components/equipoCardFormat';
import { readOfferSelection, clearOfferSelection } from '../offerStorage';
import { useAnalytics } from '../../../analytics/useAnalytics';
import { OfertaHeader } from '../components/redesign/OfertaHeader';
import { OFERTA_COLORS } from '../components/redesign/ofertaTheme';
import { TuEquipoCard } from './redesign/TuEquipoCard';
import { IncluidosGratisSection } from './redesign/IncluidosGratisSection';
import { AccesorioRecomendadoCard } from './redesign/AccesorioRecomendadoCard';
import { TusExtras, type TusExtrasItem } from './redesign/TusExtras';
import { CuotaStickyBar } from './redesign/CuotaStickyBar';
import { BuscadorBottomSheet } from './redesign/BuscadorBottomSheet';
import { AccesorioDetalleSheet } from './redesign/AccesorioDetalleSheet';
import { SeguroDetalleSheet } from './redesign/SeguroDetalleSheet';

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

export function AccesoriosOfertaClient({ token }: { token: string }) {
  const analytics = useAnalytics();
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
  // Monto (S/) de la inicial del equipo a la celda actual — se muestra el monto,
  // no el %. Se recalcula al cambiar plazo/inicial.
  const [equipoInitialAmount, setEquipoInitialAmount] = useState(0);
  // Frecuencia real del equipo (mensual|semanal|quincenal). Para celulares define
  // el sufijo de cuota (/sem, /qcn) y la unidad del plazo.
  const [equipoFrequency, setEquipoFrequency] = useState('mensual');
  // Plazo nativo del equipo (nº de cuotas: 48 semanas, 24 quincenas). Para el
  // display del plazo del celular, no el curTerm (que es el plazo mensual del snapshot).
  const [equipoTerm, setEquipoTerm] = useState<number | null>(null);
  // Cuota máxima aprobada (tope). equipo + accesorios + seguros no puede superarla.
  const [maxQuota, setMaxQuota] = useState<number | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<string[]>([]);
  const [selectedIns, setSelectedIns] = useState<string[]>([]);
  // Regalos del combo elegido (BAL-2159): accesorios/seguros incluidos gratis,
  // no cuentan en la cuota ni se pueden deseleccionar. Se pintan aparte, con
  // etiqueta "Incluido gratis".
  const [comboFree, setComboFree] = useState<{ accessories: { id: string; name: string; image?: string | null }[]; insurances: { id: string; name: string }[] }>({ accessories: [], insurances: [] });
  const [confirming, setConfirming] = useState(false);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);
  const [detailInsurance, setDetailInsurance] = useState<InsurancePlan | null>(null);
  // Bottom sheet "Añadir al pedido" (rediseño BAL-2185) — solo UI, no reemplaza
  // el fetch/estado real de accesorios y seguros.
  const [showBuscador, setShowBuscador] = useState(false);
  // Modal de confirmación (siempre, con desglose de add-ons).
  const [modalOpen, setModalOpen] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [equipoInfo, setEquipoInfo] = useState<{ name: string; brand?: string; imageUrl?: string } | null>(null);
  // Nombre del cliente (feedback Marco): para el saludo "¡Felicitaciones {nombre}!"
  // arriba de la pantalla de complementos.
  const [clientName, setClientName] = useState<string | null>(null);
  // Selector de plazo/inicial (BAL-2097): opciones de la oferta + valores actuales.
  // Al cambiar cualquiera, se recalculan equipo + accesorios + seguros por el límite.
  const [offerTerms, setOfferTerms] = useState<number[]>([24]);
  const [offerInitials, setOfferInitials] = useState<number[]>([0]);
  const [curTerm, setCurTerm] = useState<number>(24);
  const [curInitial, setCurInitial] = useState<number>(0);

  const backToDetail = useCallback(() => {
    const base = process.env.NEXT_PUBLIC_APP_BASE_PATH || '';
    if (slug) window.location.href = `${base}/oferta/${token}/producto/${slug}`;
    else window.location.href = `${base}/oferta/${token}`;
  }, [token, slug]);

  // Navegación del breadcrumb (feedback Marco): desde complementos el estudiante
  // puede volver al index de la oferta o al catálogo, no solo al detalle del
  // equipo. La selección vive en localStorage, así que navegar no la pierde.
  const goToIndex = useCallback(() => {
    const base = process.env.NEXT_PUBLIC_APP_BASE_PATH || '';
    window.location.href = `${base}/oferta/${token}`;
  }, [token]);
  const goToCatalogo = useCallback(() => {
    const base = process.env.NEXT_PUBLIC_APP_BASE_PATH || '';
    window.location.href = `${base}/oferta/${token}/catalogo`;
  }, [token]);

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
    // Plazo/inicial elegidos en el detalle (BAL-2096/2097) → las cuotas de equipo,
    // accesorios y seguros se calculan a esa combinación. El cliente puede
    // cambiarlos con el selector de esta página (efecto reactivo más abajo).
    const selTerm = selection.term;
    const selInitial = selection.initial;
    setVariantId(vId);
    setComboId(selection.comboId);
    setSlug(selection.slug);
    setEquipoInfo({ name: selection.name, brand: selection.brand, imageUrl: selection.imageUrl });
    (async () => {
      try {
        const offer = await getOffer(token); // valida token + cuota máxima aprobada
        if (active) {
          if (offer.maxMonthlyQuota) setMaxQuota(offer.maxMonthlyQuota);
          if (offer.clientName) setClientName(offer.clientName);
          const terms = offer.terms?.length ? offer.terms : [24];
          const initials = offer.initials?.length ? offer.initials : [0];
          setOfferTerms(terms);
          setOfferInitials(initials);
          // Valor inicial del selector: lo elegido en el detalle si es válido, si no
          // el default (plazo más alto + inicial más bajo = celda de menor cuota).
          setCurTerm(selTerm != null && terms.includes(selTerm) ? selTerm : Math.max(...terms));
          setCurInitial(selInitial != null && initials.includes(selInitial) ? selInitial : Math.min(...initials));
        }
        const res = await getOfferAddonsRich(token, vId, {
          accessoryIds: selectedAcc.map(Number),
          insuranceIds: selectedIns.map(Number),
          term: selTerm,
          initial: selInitial,
        }, selection.comboId);
        if (!active) return;
        setAccessories(res.accessories);
        setInsurances(res.insurances);
        setEquipoMonthly(res.equipoMonthly);
        setEquipoInitialAmount(res.equipoInitialAmount);
        setEquipoFrequency(res.equipoFrequency);
        setEquipoTerm(res.equipoTerm);
        setComboFree(res.comboFreeAddons ?? { accessories: [], insurances: [] });
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

  // Recalcula equipo + accesorios + seguros al nuevo plazo/inicial (BAL-2097) y
  // re-filtra las selecciones actuales contra lo que ahora cabe en el límite.
  const recalcAddons = useCallback(async (nextTerm: number, nextInitial: number) => {
    if (variantId == null) return;
    setLoading(true);
    try {
      const res = await getOfferAddonsRich(token, variantId, {
        accessoryIds: selectedAcc.map(Number),
        insuranceIds: selectedIns.map(Number),
        term: nextTerm,
        initial: nextInitial,
      }, comboId);
      setAccessories(res.accessories);
      setInsurances(res.insurances);
      setEquipoMonthly(res.equipoMonthly);
      setEquipoInitialAmount(res.equipoInitialAmount);
      setEquipoFrequency(res.equipoFrequency);
      setComboFree(res.comboFreeAddons ?? { accessories: [], insurances: [] });
      // Lo que ya no cabe con el nuevo plazo/inicial se deselecciona.
      const accOk = new Set(res.accessories.map((a) => a.id));
      const insOk = new Set(res.insurances.map((p) => p.id));
      setSelectedAcc((prev) => prev.filter((id) => accOk.has(id)));
      setSelectedIns((prev) => prev.filter((id) => insOk.has(id)));
    } catch (err) {
      setError(err instanceof OfferApiError ? err.message : 'No pudimos recalcular tu cuota.');
    } finally {
      setLoading(false);
    }
  }, [token, variantId, selectedAcc, selectedIns]);

  const handleTermChange = useCallback((t: number) => {
    setCurTerm(t);
    void recalcAddons(t, curInitial);
  }, [recalcAddons, curInitial]);

  const handleInitialChange = useCallback((i: number) => {
    setCurInitial(i);
    void recalcAddons(curTerm, i);
  }, [recalcAddons, curTerm]);

  // Funnel: pantalla de éxito (modal "¡Listo!") visible tras confirmar.
  useEffect(() => {
    if (succeeded) analytics.track('offer_success_view', { variant_id: variantId });
  }, [succeeded, variantId, analytics]);

  const toggleAcc = (a: Accessory) =>
    setSelectedAcc((prev) => {
      if (prev.includes(a.id)) {
        analytics.trackAccessoryRemove({ accessory_id: a.id }); // quitar siempre
        return prev.filter((x) => x !== a.id);
      }
      if (!accFits(a)) return prev; // agregar solo si cabe en la cuota
      analytics.trackAccessoryAdd({ accessory_id: a.id, accessory_name: a.name, price: a.monthlyQuota });
      return [...prev, a.id];
    });
  const toggleIns = (planId: string) =>
    setSelectedIns((prev) => {
      const plan = insurances.find((p) => p.id === planId);
      if (prev.includes(planId)) {
        analytics.trackInsuranceToggle({
          insurance_id: planId, insurance_name: plan?.name ?? '', active: false,
          monthly_price: plan?.monthlyPrice,
        });
        return prev.filter((x) => x !== planId); // quitar siempre
      }
      if (plan && !insFits(plan)) return prev; // agregar solo si cabe
      analytics.trackInsuranceToggle({
        insurance_id: planId, insurance_name: plan?.name ?? '', active: true,
        monthly_price: plan?.monthlyPrice,
      });
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
      }, { term: curTerm, initial: curInitial });
      // Funnel: elección confirmada (equipo + add-ons). Tras el OK del backend.
      analytics.trackSummarySubmit({
        product_count: 1,
        accessory_count: selectedAcc.length,
        insurance_selected: selectedIns.length > 0,
        total_monthly: totalMonthly,
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
  }, [token, variantId, comboId, selectedAcc, selectedIns, totalMonthly, analytics, curTerm, curInitial]);

  // Slot de desglose para el modal: "Tu pedido incluye" = equipo + regalos del
  // combo (gratis) + accesorios/seguros elegidos (+S/) + UNA cuota total.
  // Feedback Emilio: (1) sin doble "cuota mensual/total" — solo la total aquí;
  // (2) "regalo por tu combo" solo aplica a lo incluido gratis; lo elegido se
  // muestra con su costo (+S/). El equipo va como primera línea del desglose.
  const addonsResumen = useMemo(() => {
    const accSel = accessories.filter((a) => selectedAcc.includes(a.id));
    const insSel = insurances.filter((p) => selectedIns.includes(p.id));
    const hayRegalos = comboFree.accessories.length > 0 || comboFree.insurances.length > 0;
    const suf = cuotaSuffix(equipoFrequency);
    return (
      <div>
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: OFERTA_COLORS.tealBrand }}>
          Tu pedido incluye
        </p>
        <ul className="space-y-2.5">
          {/* Equipo (primera línea del desglose) */}
          <li className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textStrong }}>
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
              <span className="min-w-0 truncate font-medium">{equipoInfo?.name ?? 'Tu equipo'}</span>
            </span>
            <span className="shrink-0 font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
              S/{Math.round(equipoMonthly)}{suf}
            </span>
          </li>
          {/* Regalos del combo (incluido gratis) */}
          {comboFree.accessories.map((a) => (
            <li key={`cf-a-${a.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                <Gift className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
                <span className="truncate">{a.name}</span>
              </span>
              <span className="shrink-0 text-xs font-bold" style={{ color: OFERTA_COLORS.greenDark }}>Incluido gratis</span>
            </li>
          ))}
          {comboFree.insurances.map((s) => (
            <li key={`cf-i-${s.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                <Gift className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
                <span className="truncate">{s.name}</span>
              </span>
              <span className="shrink-0 text-xs font-bold" style={{ color: OFERTA_COLORS.greenDark }}>Incluido gratis</span>
            </li>
          ))}
          {/* Accesorios/seguros elegidos (con su costo) */}
          {accSel.map((a) => (
            <li key={`a-${a.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                <Package className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.textSoft }} />
                <span className="truncate">{a.name}</span>
              </span>
              <span className="shrink-0" style={{ color: OFERTA_COLORS.textMid }}>+S/{Math.round(a.monthlyQuota || 0)}{suf}</span>
            </li>
          ))}
          {insSel.map((p) => (
            <li key={`i-${p.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.textSoft }} />
                <span className="truncate">{p.name}</span>
              </span>
              <span className="shrink-0" style={{ color: OFERTA_COLORS.textMid }}>+S/{Math.round(p.monthlyPrice || 0)}{suf}</span>
            </li>
          ))}
        </ul>
        {/* Cuota total (única cuota del modal) */}
        <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: OFERTA_COLORS.border }}>
          <span className="font-['Baloo_2',_sans-serif] text-sm font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
            Cuota total
          </span>
          <span className="font-['Baloo_2',_sans-serif] text-lg font-extrabold" style={{ color: OFERTA_COLORS.greenDark }}>
            S/{Math.round(totalMonthly)}{suf}
          </span>
        </div>
        {!hayRegalos && accSel.length === 0 && insSel.length === 0 ? (
          <p className="mt-2 text-center text-xs" style={{ color: OFERTA_COLORS.textSoft }}>
            Puedes sumar accesorios o seguros antes de confirmar.
          </p>
        ) : null}
      </div>
    );
  }, [accessories, insurances, selectedAcc, selectedIns, totalMonthly, comboFree, equipoFrequency, equipoInfo, equipoMonthly]);

  // Accesorio recomendado (destacado arriba, BAL-2185): el primero del listado.
  const recomendado = accessories.length > 0 ? accessories[0] : null;

  // "Tus extras" (rediseño): accesorios y seguros ya seleccionados, sin repetir
  // el recomendado (que ya se muestra arriba en su propia card).
  const extrasItems: TusExtrasItem[] = useMemo(() => {
    const accItems: TusExtrasItem[] = accessories
      .filter((a) => selectedAcc.includes(a.id) && a.id !== recomendado?.id)
      .map((a) => ({ id: a.id, name: a.name, monthly: a.monthlyQuota || 0, kind: 'acc', imageUrl: a.image }));
    const insItems: TusExtrasItem[] = insurances
      .filter((p) => selectedIns.includes(p.id))
      .map((p) => ({ id: p.id, name: p.name, monthly: p.monthlyPrice || 0, kind: 'ins', subtitle: 'Insurama' }));
    return [...accItems, ...insItems];
  }, [accessories, insurances, selectedAcc, selectedIns, recomendado?.id]);

  // Desglose para TuEquipoCard (feedback Marco): equipo + accesorios + seguros
  // elegidos, con la cuota total. Solo se pasa cuando hay algo seleccionado
  // (TuEquipoCard cae a su vista simple si `extras` no viene).
  const equipoExtras = useMemo(() => {
    const accSel = accessories
      .filter((a) => selectedAcc.includes(a.id))
      .map((a) => ({ label: a.name, monthly: a.monthlyQuota || 0 }));
    const insSel = insurances
      .filter((p) => selectedIns.includes(p.id))
      .map((p) => ({ label: p.name, monthly: p.monthlyPrice || 0 }));
    return [...accSel, ...insSel];
  }, [accessories, insurances, selectedAcc, selectedIns]);

  const handleQuitarExtra = useCallback((id: string, kind: 'acc' | 'ins') => {
    if (kind === 'acc') {
      const acc = accessories.find((a) => a.id === id);
      if (acc) toggleAcc(acc);
    } else {
      toggleIns(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessories, insurances, selectedAcc, selectedIns]);

  // "Asegura tu inversión" dentro del modal de confirmación (A11, feedback
  // Marco): seguros disponibles que aún NO se eligieron, con botón "Añadir"
  // (reusa toggleIns — no hay endpoint nuevo). Condicional a que exista al
  // menos un seguro sin seleccionar que además quepa en la cuota.
  const insuranceUpsellSlot = useMemo(() => {
    const noSeleccionados = insurances.filter((p) => !selectedIns.includes(p.id) && insFits(p));
    if (noSeleccionados.length === 0) return null;
    const suf = cuotaSuffix(equipoFrequency);
    return (
      <div
        className="mt-4 rounded-xl border p-3.5"
        style={{ backgroundColor: OFERTA_COLORS.greenSoft, borderColor: OFERTA_COLORS.greenDark + '33' }}
      >
        <p className="font-['Baloo_2',_sans-serif] text-[13.5px] font-bold" style={{ color: OFERTA_COLORS.greenDark }}>
          Asegura tu inversión
        </p>
        <div className="mt-2 space-y-2">
          {noSeleccionados.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
              <span className="min-w-0 text-[12.5px]" style={{ color: OFERTA_COLORS.textStrong }}>
                <span className="block truncate font-medium">{p.name}</span>
                <span style={{ color: OFERTA_COLORS.textMid }}>
                  Añade garantía extendida por +S/{Math.round(p.monthlyPrice || 0)}{suf} antes de confirmar
                </span>
              </span>
              <button
                type="button"
                onClick={() => toggleIns(p.id)}
                className="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                style={{ backgroundColor: OFERTA_COLORS.greenDark }}
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insurances, selectedIns, remaining, equipoFrequency]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-bg,#fafafa)]">
        <CubeGridSpinner />
      </div>
    );
  }

  if (error && accessories.length === 0 && insurances.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <OfertaHeader />
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <p className="text-lg font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>{error}</p>
          <button onClick={backToDetail} className="mt-4 cursor-pointer text-sm font-medium hover:underline" style={{ color: OFERTA_COLORS.primary }}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <OfertaHeader />

      {/* Breadcrumb navegable (feedback Marco): reemplaza "Volver al equipo".
          Cada segmento navega — Mi oferta (index) › Catálogo › Complementos
          (actual). Da salida al index y al catálogo sin perder la selección
          (vive en localStorage). El detalle del equipo sigue accesible desde
          el catálogo / la card. */}
      <nav aria-label="Ruta" className="mx-auto w-full max-w-md px-4 pt-4">
        <ol className="flex flex-wrap items-center gap-1 text-[13px]">
          <li>
            <button
              onClick={goToIndex}
              className="cursor-pointer font-medium transition-colors hover:underline"
              style={{ color: OFERTA_COLORS.textMid }}
            >
              Mi oferta
            </button>
          </li>
          <li aria-hidden="true" style={{ color: OFERTA_COLORS.textSoft }}>›</li>
          <li>
            <button
              onClick={goToCatalogo}
              className="cursor-pointer font-medium transition-colors hover:underline"
              style={{ color: OFERTA_COLORS.textMid }}
            >
              Catálogo
            </button>
          </li>
          <li aria-hidden="true" style={{ color: OFERTA_COLORS.textSoft }}>›</li>
          <li aria-current="page" className="font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
            Complementos
          </li>
        </ol>
      </nav>

      <main className="mx-auto w-full max-w-md space-y-5 px-4 py-4">
        {/* Encabezado */}
        <div>
          <h1 className="font-['Baloo_2',_sans-serif] text-[20px] font-bold leading-[1.25]" style={{ color: OFERTA_COLORS.textStrong }}>
            {clientName ? `¡Felicitaciones, ${clientName}, tu solicitud ha sido` : '¡Felicitaciones! Tu solicitud ha sido'}{' '}
            <span style={{ color: OFERTA_COLORS.greenDark }}>aprobada</span>!
          </h1>
          <p className="mt-1.5 text-[13px]" style={{ color: OFERTA_COLORS.textMid }}>
            Solo mostramos lo que entra en tu cuota.
          </p>
        </div>

        {/* Tu equipo (con desglose de extras si hay accesorios/seguros elegidos) */}
        {equipoInfo && (
          <TuEquipoCard
            nombre={equipoInfo.name}
            cuota={equipoMonthly}
            imageUrl={equipoInfo.imageUrl}
            extras={equipoExtras}
            total={totalMonthly}
          />
        )}

        {/* ¡Asegura tu inversión! (feedback Marco): shortcut visual a los
            seguros disponibles sin entrar al buscador. Condicional a que haya
            seguros disponibles para este equipo. */}
        {insurances.length > 0 ? (
          <div
            className="rounded-xl border p-3.5"
            style={{ backgroundColor: OFERTA_COLORS.greenSoft, borderColor: OFERTA_COLORS.greenDark + '33' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
              <p className="font-['Baloo_2',_sans-serif] text-[14px] font-bold" style={{ color: OFERTA_COLORS.greenDark }}>
                ¡Asegura tu inversión!
              </p>
            </div>
            <p className="mt-1 text-[12.5px]" style={{ color: OFERTA_COLORS.textMid }}>
              Protege tu equipo con estas opciones:
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5">
              {insurances.map((p) => {
                const seleccionado = selectedIns.includes(p.id);
                const fits = insFits(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleIns(p.id)}
                    disabled={!fits}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: seleccionado ? OFERTA_COLORS.primary : OFERTA_COLORS.border }}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="min-w-0 truncate text-[12.5px] font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
                        {p.name}
                      </span>
                      {seleccionado ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: OFERTA_COLORS.primary }} /> : null}
                    </span>
                    <span className="shrink-0 text-[12px] font-bold" style={{ color: OFERTA_COLORS.primary }}>
                      +S/{Math.round(p.monthlyPrice || 0)}/mes
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Selectores: plazo (dropdown) + inicial (chips), solo si hay más de una
            opción (BAL-2097). No forma parte del mock visual, pero la
            funcionalidad de recalcular equipo + accesorios + seguros por
            plazo/inicial se mantiene. */}
        {(offerTerms.length > 1 || offerInitials.length > 1) && (
          <div className="rounded-xl border p-3.5" style={{ borderColor: OFERTA_COLORS.border }}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {offerTerms.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: OFERTA_COLORS.textMid }}>Plazo:</span>
                  <TermSelect value={curTerm} options={offerTerms} onChange={handleTermChange} size="sm" frequency={equipoFrequency} />
                </div>
              )}
              {offerInitials.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: OFERTA_COLORS.textMid }}>Inicial:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {offerInitials.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleInitialChange(i)}
                        className="cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                        style={
                          curInitial === i
                            ? { borderColor: OFERTA_COLORS.primary, backgroundColor: OFERTA_COLORS.primary, color: '#fff' }
                            : { borderColor: OFERTA_COLORS.border, backgroundColor: '#fff', color: OFERTA_COLORS.textMid }
                        }
                      >
                        {i === 0 ? 'Sin inicial' : `${i}%`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Incluidos gratis (regalos del combo, BAL-2159) */}
        <IncluidosGratisSection accesorios={comboFree.accessories} seguros={comboFree.insurances} />

        {/* Recomendado para ti */}
        {recomendado ? (
          <div>
            <h2 className="mb-2.5 font-['Baloo_2',_sans-serif] text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              Recomendado para ti
            </h2>
            <AccesorioRecomendadoCard
              accesorio={recomendado}
              seleccionado={selectedAcc.includes(recomendado.id)}
              onToggle={() => toggleAcc(recomendado)}
            />
          </div>
        ) : null}

        {/* Tus extras */}
        <TusExtras items={extrasItems} onQuitar={handleQuitarExtra} />

        {/* Añadir uno más */}
        <button
          type="button"
          onClick={() => setShowBuscador(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed py-3.5 font-['Baloo_2',_sans-serif] text-[14px] font-bold"
          style={{ borderColor: '#C7CBD6', color: OFERTA_COLORS.primary }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          Añadir uno más
        </button>

        {/* Alerta de sobrepaso, SIN revelar el monto del tope aprobado. */}
        {maxQuota != null && overBudget ? (
          <p className="text-xs font-medium text-red-600">
            Supera tu cuota aprobada. Quita algo para continuar.
          </p>
        ) : null}
      </main>

      {/* Barra fija inferior: cuota total + confirmar */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <CuotaStickyBar
          total={totalMonthly}
          onContinuar={() => {
            if (overBudget) return; // no navega: debe quitar algo primero (igual que isDisabled del botón original)
            setModalOpen(true);
          }}
          ctaText={overBudget ? 'Supera tu cuota' : 'Añadir accesorios y seguros'}
        />
      </div>

      {/* Bottom sheet buscador (BAL-2185). Se OCULTA mientras hay un detalle
          abierto (accesorio o seguro): los drawers son exclusivos, no se apilan.
          Al cerrar el detalle con "Volver a la lista" se reabre el buscador. */}
      <AnimatePresence>
        {showBuscador && !detailAccessory && !detailInsurance ? (
          <BuscadorBottomSheet
            accesorios={accessories}
            seguros={insurances}
            seleccionadosAcc={selectedAcc}
            seleccionadosIns={selectedIns}
            onToggleAcc={toggleAcc}
            onToggleIns={toggleIns}
            onVerDetalle={(a) => setDetailAccessory(a)}
            onVerDetalleSeguro={(s) => setDetailInsurance(s)}
            total={totalMonthly}
            onCerrar={() => setShowBuscador(false)}
            onListo={() => setShowBuscador(false)}
            accFits={accFits}
            insFits={insFits}
          />
        ) : null}
      </AnimatePresence>

      {/* Bottom sheet detalle de accesorio (BAL-2185). "Volver a la lista"
          (onVolver) reabre el buscador; la X (onCerrar) cierra todo. */}
      <AnimatePresence>
        {detailAccessory ? (
          <AccesorioDetalleSheet
            accesorio={detailAccessory}
            agregado={selectedAcc.includes(detailAccessory.id)}
            onAgregar={() => toggleAcc(detailAccessory)}
            onVolver={() => { setDetailAccessory(null); setShowBuscador(true); }}
            onCerrar={() => { setDetailAccessory(null); setShowBuscador(false); }}
          />
        ) : null}
      </AnimatePresence>

      {/* Bottom sheet detalle de SEGURO (feedback Emilio: los seguros también
          tienen más info). Mismo patrón de drawers exclusivos que el accesorio. */}
      <AnimatePresence>
        {detailInsurance ? (
          <SeguroDetalleSheet
            seguro={detailInsurance}
            agregado={selectedIns.includes(detailInsurance.id)}
            onAgregar={() => toggleIns(detailInsurance.id)}
            onVolver={() => { setDetailInsurance(null); setShowBuscador(true); }}
            onCerrar={() => { setDetailInsurance(null); setShowBuscador(false); }}
          />
        ) : null}
      </AnimatePresence>

      {/* Modal de confirmación (siempre) con desglose de equipo + add-ons.
          Fase 3 lo rediseña; se mantiene tal cual por ahora. */}
      <ConfirmarEleccionModal
        isOpen={modalOpen}
        equipo={
          equipoInfo
            ? { name: equipoInfo.name, brand: equipoInfo.brand, imageUrl: equipoInfo.imageUrl, monthly: equipoMonthly, term: (equipoFrequency !== 'mensual' && equipoTerm ? equipoTerm : curTerm), initial: curInitial, initialAmount: equipoInitialAmount, paymentFrequency: equipoFrequency }
            : { name: 'Tu equipo', monthly: equipoMonthly, term: (equipoFrequency !== 'mensual' && equipoTerm ? equipoTerm : curTerm), initial: curInitial, initialAmount: equipoInitialAmount, paymentFrequency: equipoFrequency }
        }
        loading={confirming}
        succeeded={succeeded}
        onConfirm={confirmar}
        onClose={() => (confirming ? undefined : setModalOpen(false))}
        onSuccessContinue={() => {
          window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
        }}
        addonsSlot={addonsResumen}
        insuranceUpsellSlot={succeeded ? null : insuranceUpsellSlot}
      />
    </div>
  );
}
