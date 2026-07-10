'use client';

/**
 * AccesoriosOfertaClient — mini-checkout de accesorios y seguros (BAL-2064).
 *
 * El cliente ya eligió un equipo (variant); aquí suma accesorios y seguros que
 * caben en su cuota restante y confirma todo junto.
 *
 * Presentación rediseñada (BAL-2185, Task 9) siguiendo
 * docs/superpowers/design-refs/mock-accesorios.html: TuEquipoCard +
 * IncluidosGratisSection + AccesorioFilaCard + TusExtras +
 * CuotaStickyBar, con BuscadorBottomSheet para agregar más accesorios y los
 * modales del flujo regular (AccessoryDetailModal/InsuranceDetailModal) para
 * ver el detalle de un accesorio/seguro.
 * La LÓGICA de negocio (fetch, toggleAcc/toggleIns, totalMonthly, remaining,
 * accFits/insFits, selectEquipment, plazo/inicial BAL-2097) no cambió —
 * solo se reemplazó el render.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Package, ShieldCheck, Gift, CheckCircle2, Plus, TriangleAlert, Lock, Check } from 'lucide-react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
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
import { cuotaSuffix, plazoUnit } from '../components/equipoCardFormat';
import { readOfferSelection, clearOfferSelection } from '../offerStorage';
import { useAnalytics } from '../../../analytics/useAnalytics';
import { OfertaHeader } from '../components/redesign/OfertaHeader';
import { OFERTA_COLORS } from '../components/redesign/ofertaTheme';
import { TuEquipoCard } from './redesign/TuEquipoCard';
import { IncluidosGratisSection } from './redesign/IncluidosGratisSection';
import { AccesorioFilaCard } from './redesign/AccesorioFilaCard';
import { TusExtras, type TusExtrasItem } from './redesign/TusExtras';
import { CuotaStickyBar } from './redesign/CuotaStickyBar';
import { BuscadorBottomSheet } from './redesign/BuscadorBottomSheet';
import { AccessoryDetailModal, InsuranceDetailModal } from '../../../[landing]/solicitar/components/upsell';

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
  // Bloqueo SÍNCRONO anti-doble-clic: el estado `confirming` es asíncrono, así
  // que un doble tap muy rápido podría disparar confirmar() dos veces antes de
  // que el re-render deshabilite el botón. El ref bloquea en el mismo tick.
  const confirmLock = useRef(false);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);
  const [detailInsurance, setDetailInsurance] = useState<InsurancePlan | null>(null);
  // De dónde se abrió el detalle (accesorio/seguro), para saber a qué volver al
  // cerrarlo: al buscador, a la lista de recomendados (sin reabrir nada), o al
  // modal de confirmación (que se cierra al abrir el detalle y se reabre al cerrar).
  const [detailOrigin, setDetailOrigin] = useState<'buscador' | 'recomendado' | 'confirmacion'>('buscador');
  // Bottom sheet "Añadir al pedido" (rediseño BAL-2185) — solo UI, no reemplaza
  // el fetch/estado real de accesorios y seguros.
  const [showBuscador, setShowBuscador] = useState(false);
  // Modal de confirmación (siempre, con desglose de add-ons).
  const [modalOpen, setModalOpen] = useState(false);
  // Modal "¿Estás seguro?" (segunda confirmación antes de guardar): al tocar
  // "Confirmar" en el modal de elección, se muestra este check final.
  const [showSeguro, setShowSeguro] = useState(false);
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
          const baseTerms = offer.terms?.length ? offer.terms : [24];
          const baseInitials = offer.initials?.length ? offer.initials : [0];
          // Incluir el plazo/inicial REALES del pedido (selección) como opción
          // válida aunque no estén entre los de la oferta: en "mantener mi equipo"
          // (Caso 5) el equipo se cotiza a su plazo real (ej. 36m), que puede no
          // estar en offer.terms (ej. [24]). Así el selector lo muestra y no lo
          // descarta al default. Ordenados para el dropdown.
          const terms = selTerm != null && !baseTerms.includes(selTerm)
            ? [...baseTerms, selTerm].sort((a, b) => a - b)
            : baseTerms;
          const initials = selInitial != null && !baseInitials.includes(selInitial)
            ? [...baseInitials, selInitial].sort((a, b) => a - b)
            : baseInitials;
          setOfferTerms(terms);
          setOfferInitials(initials);
          // Valor inicial del selector: lo elegido/pedido si es válido, si no el
          // default (plazo más alto + inicial más bajo = celda de menor cuota).
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
        const accOk = new Set(res.accessories.map((a) => a.id));
        if (stored) {
          const insOk = new Set(res.insurances.map((p) => p.id));
          setSelectedAcc(stored.acc.filter((id) => accOk.has(id)));
          setSelectedIns(stored.ins.filter((id) => insOk.has(id)));
        } else if (selection.preselectedAccessoryIds?.length) {
          // Primera vez (sin add-ons guardados): preseleccionar el accesorio de
          // regalo del Perfil B que venía en la selección, si está disponible.
          const pre = selection.preselectedAccessoryIds
            .map(String)
            .filter((id) => accOk.has(id));
          if (pre.length) setSelectedAcc(pre);
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

  // Confirmación real (desde el modal). Tras el OK del backend, redirige DIRECTO
  // a la página de confirmación (/oferta/{token} → SeleccionConfirmada,
  // "¡Felicidades!"), sin la cara "¡Listo!" intermedia del modal (BAL-2212).
  // Se mantiene confirming=true hasta la navegación para no cortar el spinner.
  const confirmar = useCallback(async () => {
    if (variantId == null) return;
    // Anti-doble-clic: si ya hay una confirmación en curso, ignorar. El ref se
    // libera solo en el catch (reintentar); en éxito NO se libera porque la
    // página navega (window.location) y el botón queda inactivo hasta entonces.
    if (confirmLock.current) return;
    confirmLock.current = true;
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
      // Marca succeeded para el guard del auto-save (l.238) y el analytics
      // (l.284), pero NO se muestra la cara "¡Listo!" del modal: se redirige
      // directo a la página de confirmación (¡Felicidades!). Se mantiene
      // `confirming=true` (no se llama setConfirming(false)) para que el botón
      // siga en "Procesando tu cambio…" hasta que la navegación reemplace la
      // página — evita un flash de la cara "¡Listo!" o del botón "Confirmar".
      setSucceeded(true);
      window.location.href = `${process.env.NEXT_PUBLIC_APP_BASE_PATH || ''}/oferta/${token}`;
    } catch (err) {
      setError(err instanceof OfferApiError ? err.message : 'No pudimos registrar tu elección.');
      setConfirming(false);
      setModalOpen(false);
      setShowSeguro(false); // cierra la segunda confirmación en caso de error
      confirmLock.current = false; // libera para permitir reintentar
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
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: OFERTA_COLORS.tealBrand }}>
          Tu pedido incluye
        </p>
        {/* Plazo e inicial del equipo (read-only), bajo el header del desglose. */}
        {(() => {
          const t = equipoTerm ?? curTerm;
          const inicialTxt =
            equipoInitialAmount > 0
              ? `Inicial S/${Math.round(equipoInitialAmount)}`
              : curInitial > 0 ? `Inicial ${curInitial}%` : 'Sin inicial';
          return t ? (
            <p className="mb-2.5 text-[12px]" style={{ color: OFERTA_COLORS.textMid }}>
              {t} {plazoUnit(t, equipoFrequency)} · {inicialTxt}
            </p>
          ) : null;
        })()}
        <ul className="space-y-2.5">
          {/* Equipo (primera línea del desglose) */}
          <li className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textStrong }}>
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
              <span className="min-w-0 font-medium">{equipoInfo?.name ?? 'Tu equipo'}</span>
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
                <span className="min-w-0">{a.name}</span>
              </span>
              <span className="shrink-0 text-xs font-bold" style={{ color: OFERTA_COLORS.greenDark }}>Incluido gratis</span>
            </li>
          ))}
          {comboFree.insurances.map((s) => (
            <li key={`cf-i-${s.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                <Gift className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
                <span className="min-w-0">{s.name}</span>
              </span>
              <span className="shrink-0 text-xs font-bold" style={{ color: OFERTA_COLORS.greenDark }}>Incluido gratis</span>
            </li>
          ))}
          {/* Accesorios/seguros elegidos (con su costo) */}
          {accSel.map((a) => (
            <li key={`a-${a.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                <Package className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.textSoft }} />
                <span className="min-w-0">{a.name}</span>
              </span>
              <span className="shrink-0" style={{ color: OFERTA_COLORS.textMid }}>+S/{Math.round(a.monthlyQuota || 0)}{suf}</span>
            </li>
          ))}
          {insSel.map((p) => (
            <li key={`i-${p.id}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.textSoft }} />
                <span className="min-w-0">{p.name}</span>
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
      </div>
    );
  }, [accessories, insurances, selectedAcc, selectedIns, totalMonthly, comboFree, equipoFrequency, equipoInfo, equipoMonthly]);

  // Accesorio recomendado (destacado arriba, BAL-2185): el primero del listado.
  const recomendado = accessories.length > 0 ? accessories[0] : null;
  // Los 4 primeros accesorios como shortcut horizontal "Recomendado para ti".
  const recomendados = accessories.slice(0, 4);

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
  // Marco): TODOS los seguros disponibles como toggle (agregar/quitar), no solo
  // los no elegidos — al seleccionar uno NO desaparece, cambia a estado elegido.
  // Si un seguro NO cabe en la cuota y no está elegido, se atenúa con el badge
  // "Supera tu cuota" (mismo patrón que los accesorios, AccesorioFilaCard).
  const insuranceUpsellSlot = useMemo(() => {
    if (insurances.length === 0) return null;
    const suf = cuotaSuffix(equipoFrequency);
    // Ícono, label, descripción y beneficios: MISMOS criterios que el flujo
    // regular (InsuranceCards.tsx getInsuranceIcon/Label/Description/Benefits),
    // para que la info del seguro sea idéntica en ambos flujos.
    const iconFor = (type: string) => (type === 'seguro_robo' ? Lock : ShieldCheck);
    const labelFor = (type: string) => {
      switch (type) {
        case 'garantia_extendida': return 'Garantía extendida';
        case 'seguro_robo': return 'Protección contra robo';
        default: return type.replace(/_/g, ' ');
      }
    };
    const descFor = (type: string) => {
      switch (type) {
        case 'garantia_extendida': return 'Protección completa contra fallas técnicas o defectos de fábrica.';
        case 'seguro_robo': return 'Protección mundial contra robo. Reposición inmediata sin deducible.';
        default: return '';
      }
    };
    const benefitsFor = (type: string): string[] => {
      switch (type) {
        case 'garantia_extendida': return [
          '3 años de cobertura',
          'Sin deducibles ni papeleos',
          'Cobertura mundial 100% digital',
        ];
        case 'seguro_robo': return [
          'Cobertura por robo y hurto',
          'Reposición sin deducible',
          'Proceso de reclamo 100% digital',
        ];
        default: return [];
      }
    };
    return (
      <div
        className="mt-4 rounded-xl border p-3.5"
        style={{ backgroundColor: OFERTA_COLORS.greenSoft, borderColor: OFERTA_COLORS.greenDark + '33' }}
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
          <p className="font-['Baloo_2',_sans-serif] text-[13.5px] font-bold" style={{ color: OFERTA_COLORS.greenDark }}>
            Asegura tu inversión
          </p>
        </div>
        {/* 1 solo seguro → ocupa el 100% del ancho (1 col); 2+ → 2 columnas en
            desktop. En mobile siempre 1 columna. */}
        <div className={`mt-2.5 grid grid-cols-1 gap-2.5 ${insurances.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {insurances.map((p) => {
            const Icon = iconFor(p.insuranceType);
            const agregado = selectedIns.includes(p.id);
            // "No cabe" solo aplica si aún no está elegido: un seguro elegido
            // siempre se puede quitar aunque ya no quepa nada más.
            const bloqueado = !insFits(p) && !agregado;
            // Beneficios y descripción: mismos textos hardcodeados del flujo
            // regular (benefitsFor/descFor por insuranceType), no coverage[] del
            // backend, para que la info sea idéntica entre ambos flujos.
            const beneficios = benefitsFor(p.insuranceType);
            const descripcion = descFor(p.insuranceType);
            return (
              <div
                key={p.id}
                className={`flex h-full flex-col overflow-hidden rounded-xl border-[1.5px] bg-white transition-opacity ${bloqueado ? 'opacity-55' : ''}`}
                style={{ borderColor: agregado ? OFERTA_COLORS.greenDark : OFERTA_COLORS.border, boxShadow: '0 1px 2px rgba(16,24,40,.06)' }}
              >
                <div className="flex flex-1 flex-col p-3.5">
                  {/* Header: ícono + eyebrow/nombre (+ check si elegido) */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                      style={{ backgroundColor: OFERTA_COLORS.greenSoft }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.1} style={{ color: OFERTA_COLORS.greenDark }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[10.5px] font-bold uppercase leading-tight tracking-wide" style={{ color: OFERTA_COLORS.tealBrand }}>
                          {labelFor(p.insuranceType)}
                        </span>
                        {p.isRecommended ? (
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
                            style={{ backgroundColor: OFERTA_COLORS.greenDark }}
                          >
                            Recomendado
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-['Baloo_2',_sans-serif] text-[13.5px] font-bold leading-tight" style={{ color: OFERTA_COLORS.textStrong }}>
                        {p.name}
                      </h3>
                    </div>
                    {agregado ? (
                      <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ backgroundColor: OFERTA_COLORS.greenDark }}>
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.8} />
                      </div>
                    ) : null}
                  </div>

                  {/* Bloque de precio (destacado, con total en cuotas) */}
                  <div className="mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: OFERTA_COLORS.greenSoft }}>
                    <div className="flex items-baseline gap-1">
                      <span className="font-['Baloo_2',_sans-serif] text-[20px] font-extrabold leading-none" style={{ color: OFERTA_COLORS.greenDark }}>
                        +S/{Math.round(p.monthlyPrice || 0)}
                      </span>
                      <span className="text-[12px] font-bold" style={{ color: OFERTA_COLORS.greenDark }}>{suf}</span>
                    </div>
                    {p.totalPrice ? (
                      <p className="mt-0.5 text-[11px]" style={{ color: OFERTA_COLORS.textMid }}>
                        Total S/{Math.round(p.totalPrice).toLocaleString('es-PE')} en {p.paymentMonths} cuotas
                      </p>
                    ) : null}
                  </div>

                  {/* Descripción corta (mismo texto que el flujo regular). */}
                  {descripcion ? (
                    <p className="mt-2.5 text-[12px] leading-snug" style={{ color: OFERTA_COLORS.textMid }}>
                      {descripcion}
                    </p>
                  ) : null}

                  {/* Beneficios (3 con check) */}
                  {beneficios.length > 0 ? (
                    <ul className="mt-2.5 space-y-1.5">
                      {beneficios.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11.5px]" style={{ color: OFERTA_COLORS.textMid }}>
                          <Check className="mt-[2px] h-3.5 w-3.5 flex-none" strokeWidth={2.6} style={{ color: OFERTA_COLORS.greenDark }} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {/* Duración + proveedor (pb-3 para separar del botón que viene
                      anclado abajo con mt-auto). */}
                  {(p.durationMonths || p.provider?.name) ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pb-3 text-[11px]" style={{ color: OFERTA_COLORS.textSoft }}>
                      {p.durationMonths ? <span>{p.durationMonths} meses</span> : null}
                      {p.durationMonths && p.provider?.name ? <span>·</span> : null}
                      {p.provider?.name ? <span>{p.provider.name}</span> : null}
                    </div>
                  ) : null}

                  {/* Acciones: toggle full-width + "Ver detalle" / badge "Supera tu
                      cuota". mt-auto → pegado al fondo para alinear el botón entre
                      las 2 columnas aunque las cards tengan distinto alto. */}
                  <button
                    type="button"
                    onClick={() => toggleIns(p.id)}
                    disabled={bloqueado}
                    className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] py-2.5 text-[13px] font-bold transition-all duration-200 ease-out enabled:cursor-pointer enabled:hover:brightness-95 enabled:active:scale-[.98] disabled:cursor-not-allowed"
                    style={
                      agregado
                        ? { borderColor: OFERTA_COLORS.greenDark, backgroundColor: '#fff', color: OFERTA_COLORS.greenDark }
                        : { borderColor: OFERTA_COLORS.greenDark, backgroundColor: OFERTA_COLORS.greenDark, color: '#fff' }
                    }
                  >
                    {agregado ? (
                      <><Check className="h-4 w-4" strokeWidth={2.6} /> Agregado</>
                    ) : (
                      <><Plus className="h-4 w-4" strokeWidth={2.6} /> Añadir protección</>
                    )}
                  </button>
                  {bloqueado ? (
                    <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-bold" style={{ color: '#B45309' }}>
                      <TriangleAlert className="h-3 w-3 shrink-0" strokeWidth={2.4} />
                      Supera tu cuota
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailOrigin('confirmacion');
                        setModalOpen(false);
                        window.setTimeout(() => setDetailInsurance(p), 220);
                      }}
                      className="mt-1.5 w-full cursor-pointer text-center text-[11px] font-semibold"
                      style={{ color: OFERTA_COLORS.tealBrand }}
                    >
                      Ver detalle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
          {/* Pasos anteriores: mini-pills clicables (chip lila, hover claro). */}
          <li>
            <button
              onClick={goToIndex}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-all duration-200 ease-out hover:bg-[#E4E9FF] hover:shadow-sm active:scale-[.97]"
              style={{ backgroundColor: '#EEF1FF', borderColor: '#4F46E522', color: '#4F46E5' }}
            >
              Mi oferta
            </button>
          </li>
          <li aria-hidden="true" style={{ color: OFERTA_COLORS.textSoft }}>›</li>
          <li>
            <button
              onClick={goToCatalogo}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-all duration-200 ease-out hover:bg-[#E4E9FF] hover:shadow-sm active:scale-[.97]"
              style={{ backgroundColor: '#EEF1FF', borderColor: '#4F46E522', color: '#4F46E5' }}
            >
              Catálogo
            </button>
          </li>
          <li aria-hidden="true" style={{ color: OFERTA_COLORS.textSoft }}>›</li>
          {/* Paso actual: destacado, no clicable. */}
          <li
            aria-current="page"
            className="inline-flex items-center rounded-lg px-2.5 py-1 text-[12px] font-bold text-white"
            style={{ backgroundColor: OFERTA_COLORS.primary }}
          >
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
            plazoTexto={(() => {
              const t = equipoTerm ?? curTerm;
              return t ? `${t} ${plazoUnit(t, equipoFrequency)}` : null;
            })()}
            inicialTexto={
              equipoInitialAmount > 0
                ? `Inicial S/${Math.round(equipoInitialAmount)}`
                : curInitial > 0
                  ? `Inicial ${curInitial}%`
                  : 'Sin inicial'
            }
          />
        )}


        {/* Incluidos gratis (regalos del combo, BAL-2159) */}
        <IncluidosGratisSection accesorios={comboFree.accessories} seguros={comboFree.insurances} />

        {/* Recomendado para ti: 4 primeros en scroll horizontal, cada uno con
            "Ver detalle" (abre el drawer). Badge "Recomendado" en el primero. */}
        {recomendados.length > 0 ? (
          <div>
            <h2 className="mb-2.5 font-['Baloo_2',_sans-serif] text-[15px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
              Recomendado para ti
            </h2>
            <div className="space-y-2.5">
              {recomendados.map((a, i) => (
                <AccesorioFilaCard
                  key={a.id}
                  accesorio={a}
                  agregado={selectedAcc.includes(a.id)}
                  onToggle={() => toggleAcc(a)}
                  onVerDetalle={() => { setDetailOrigin('recomendado'); setDetailAccessory(a); }}
                  badge={i === 0 ? 'Recomendado' : undefined}
                  noCabe={!accFits(a)}
                />
              ))}
            </div>
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
          Ver más accesorios
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
          ctaText={overBudget ? 'Supera tu cuota' : 'Confirmar mi pedido'}
        />
      </div>

      {/* Bottom sheet buscador (BAL-2185). Se OCULTA mientras hay un detalle
          abierto (accesorio o seguro): los drawers son exclusivos, no se apilan.
          Al cerrar el detalle con "Volver a la lista" se reabre el buscador. */}
      <AnimatePresence>
        {showBuscador && !detailAccessory && !detailInsurance ? (
          <BuscadorBottomSheet
            accesorios={accessories}
            seleccionadosAcc={selectedAcc}
            onToggleAcc={toggleAcc}
            onVerDetalle={(a) => { setDetailOrigin('buscador'); setDetailAccessory(a); }}
            total={totalMonthly}
            onCerrar={() => setShowBuscador(false)}
            onListo={() => setShowBuscador(false)}
            accFits={accFits}
          />
        ) : null}
      </AnimatePresence>

      {/* Detalle de accesorio: MISMO componente del flujo regular
          (AccessoryDetailModal), responsive (modal desktop / bottom sheet mobile),
          probado en prod. Al cerrar vuelve según el origen: si se abrió desde el
          buscador, lo reabre; desde "Recomendado para ti", no reabre nada. */}
      <AccessoryDetailModal
        accessory={detailAccessory}
        isOpen={detailAccessory !== null}
        isSelected={detailAccessory ? selectedAcc.includes(detailAccessory.id) : false}
        onToggle={() => { if (detailAccessory) toggleAcc(detailAccessory); }}
        onClose={() => {
          setDetailAccessory(null);
          if (detailOrigin === 'buscador') setShowBuscador(true);
        }}
      />

      {/* Detalle de seguro: MISMO componente del flujo regular
          (InsuranceDetailModal), responsive. Al cerrar vuelve según el origen:
          buscador → reabre buscador; confirmacion → reabre el modal de
          confirmación; recomendado → no reabre nada. */}
      <InsuranceDetailModal
        plan={detailInsurance}
        isOpen={detailInsurance !== null}
        isSelected={detailInsurance ? selectedIns.includes(detailInsurance.id) : false}
        onToggle={() => { if (detailInsurance) toggleIns(detailInsurance.id); }}
        onClose={() => {
          setDetailInsurance(null);
          if (detailOrigin === 'buscador') setShowBuscador(true);
          // Reabrir el modal de confirmación tras la animación de salida del
          // detalle (~220ms), para que las transiciones no se solapen.
          else if (detailOrigin === 'confirmacion') window.setTimeout(() => setModalOpen(true), 220);
        }}
      />

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
        onConfirm={() => setShowSeguro(true)}
        onClose={() => (confirming ? undefined : setModalOpen(false))}
        addonsSlot={addonsResumen}
        insuranceUpsellSlot={insuranceUpsellSlot}
      />

      {/* Segunda confirmación "¿Estás seguro?" — modal centrado (desktop y mobile).
          "Sí, confirmar" guarda (confirmar); "Cancelar" vuelve al modal de
          elección. Se bloquea el cierre mientras confirma. */}
      <Modal
        isOpen={showSeguro}
        onClose={() => (confirming ? undefined : setShowSeguro(false))}
        placement="center"
        size="sm"
        hideCloseButton
        backdrop="opaque"
        isDismissable={!confirming}
        classNames={{
          wrapper: 'z-[201]',
          backdrop: 'z-[200] bg-black/50',
          base: 'bg-white rounded-2xl overflow-hidden mx-4',
          body: 'bg-white p-0',
        }}
      >
        <ModalContent>
          <ModalBody>
            <div className="px-5 py-6 text-center">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: '#FEF3E2' }}
              >
                <TriangleAlert className="h-6 w-6" strokeWidth={2.2} style={{ color: '#B45309' }} />
              </div>
              <h2 className="mt-3.5 font-['Baloo_2',_sans-serif] text-[19px] font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                ¿Estás seguro?
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-[1.5]" style={{ color: OFERTA_COLORS.textMid }}>
                Al confirmar, cambiaremos tu equipo y tu solicitud quedará aprobada.
                Esta acción no se puede deshacer.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={confirmar}
                  disabled={confirming}
                  className="flex w-full cursor-pointer items-center justify-center rounded-lg py-3.5 font-['Baloo_2',_sans-serif] text-[15px] font-bold text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: OFERTA_COLORS.primary }}
                >
                  {confirming ? 'Procesando…' : 'Sí, confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSeguro(false)}
                  disabled={confirming}
                  className="w-full cursor-pointer rounded-lg py-3 font-['Baloo_2',_sans-serif] text-[14px] font-bold transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ color: OFERTA_COLORS.textMid }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
