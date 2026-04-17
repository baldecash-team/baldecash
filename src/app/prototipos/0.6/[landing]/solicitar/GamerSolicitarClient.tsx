'use client';

/**
 * GamerSolicitarClient — Página de solicitud con estética gamer (Zona Gamer)
 * Reutiliza ProductContext, WizardConfigContext y otros hooks del flujo estándar.
 */

import { useState, useCallback, useEffect, useMemo, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Clock, Shield, ArrowRight, ArrowLeft, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Info, Loader2, Package, Plus, Search, ShoppingCart, Tag, Users, X } from 'lucide-react';
import { useProduct } from './context/ProductContext';
import { useWizardConfig } from './context/WizardConfigContext';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';
import { getLandingAccessories } from '@/app/prototipos/0.6/services/landingApi';
import { useScrollToTop, CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNewsletter } from '@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter';
import type { Accessory } from './types/upsell';

// API base URL for coupon validation
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

interface CouponValidateResponse {
  valid: boolean;
  code: string | null;
  coupon_type: 'fixed' | 'percent_quotas' | null;
  value: string | null;
  quotas_affected: number | null;
  label: string | null;
  error_message: string | null;
}

// ── Theme ──
function gamerTheme(isDark: boolean) {
  return {
    bg: isDark ? '#0e0e0e' : '#f5f5f5',
    bgCard: isDark ? '#1a1a1a' : '#ffffff',
    bgSurface: isDark ? '#1e1e1e' : '#f0f0f0',
    neonCyan: isDark ? '#00ffd5' : '#00897a',
    neonPurple: isDark ? '#6366f1' : '#4f46e5',
    border: isDark ? '#2a2a2a' : '#e0e0e0',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#555',
    textMuted: isDark ? '#707070' : '#888',
  };
}

const F = {
  raj: "'Rajdhani', sans-serif",
  orb: "'Orbitron', sans-serif",
  mono: "'Share Tech Mono', monospace",
};

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap');`;

const ACC_PAGE_SIZE = 6;

// ── Main export ──
export function GamerSolicitarClient() {
  return (
    <Suspense fallback={<div className="gamer-loading-fallback"><CubeGridSpinner /></div>}>
      <SolicitarContent />
    </Suspense>
  );
}

function SolicitarContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';
  useScrollToTop();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [themeHydrated, setThemeHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('baldecash-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    setThemeHydrated(true);
  }, []);
  useEffect(() => { if (themeHydrated) localStorage.setItem('baldecash-theme', theme); }, [theme, themeHydrated]);
  const isDark = theme === 'dark';
  const T = gamerTheme(isDark);

  // ── Context data (BD) ──
  const {
    selectedProduct,
    selectedAccessories,
    toggleAccessory,
    appliedCoupon,
    setAppliedCoupon,
    clearCoupon,
    cartProducts,
    getAllProducts,
  } = useProduct();
  const product = selectedProduct;
  const { steps, displayStepsCount, displayEstimatedMinutes, config: wizardConfigData } = useWizardConfig();

  // ── Preview mode for API calls ──
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // ── Solicitar flow config (BD) ──
  const { isCouponRequired } = useSolicitarFlow({ slug: landing, previewKey });

  const firstStepSlug = (() => {
    const regularSteps = steps.filter((s: { is_summary_step?: boolean }) => !s.is_summary_step);
    const first = regularSteps[0];
    if (first) return (first as { url_slug?: string; code?: string }).url_slug || (first as { code?: string }).code || null;
    return null;
  })();

  // ── Local UI state ──
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptPromos, setAcceptPromos] = useState(false);
  const [accFilter, setAccFilter] = useState<string>('Todos');
  const [accSearch, setAccSearch] = useState('');
  const [accPage, setAccPage] = useState(0);
  const [accDetailId, setAccDetailId] = useState<string | null>(null);
  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const [mobileProductExpanded, setMobileProductExpanded] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(product?.months || 12);
  const [termsError, setTermsError] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);

  // ── Coupon state (validates via POST /public/coupons/validate) ──
  const [couponCode, setCouponCode] = useState('');
  const [couponState, setCouponState] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [couponError, setCouponError] = useState('');

  // ── Accessories from backend ──
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [accLoading, setAccLoading] = useState(true);

  // Derive device types and term from selected product/cart
  const deviceTypes = useMemo(() => {
    const products = cartProducts?.length > 0 ? cartProducts : (selectedProduct ? [selectedProduct] : []);
    const types = [...new Set(products.map(p => p.type?.toLowerCase()).filter(Boolean) as string[])];
    return types.length > 0 ? types : ['laptop'];
  }, [cartProducts, selectedProduct]);

  const currentTerm = useMemo(() => {
    const products = getAllProducts();
    if (products.length > 0 && products[0].months) return products[0].months;
    return selectedMonths || 24;
  }, [getAllProducts, selectedMonths]);

  // Fetch accessories from backend
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setAccLoading(true);
      try {
        const data = await getLandingAccessories(landing, deviceTypes, currentTerm, previewKey);
        if (cancelled) return;
        if (data && data.length > 0) {
          const mapped: Accessory[] = data.map((acc) => ({
            id: acc.id,
            name: acc.name,
            description: acc.description || '',
            price: acc.price,
            monthlyQuota: acc.monthlyQuota,
            term: acc.term,
            image: acc.image,
            thumbnailUrl: acc.thumbnail_url,
            category: acc.category || null,
            isRecommended: acc.isRecommended || false,
            compatibleWith: acc.compatibleWith || ['all'],
            specs: acc.specs || [],
            brand: acc.brand,
          }));
          setAccessories(mapped);
        } else {
          setAccessories([]);
        }
      } catch (err) {
        console.error('[GamerSolicitar] Error loading accessories:', err);
        if (!cancelled) setAccessories([]);
      } finally {
        if (!cancelled) setAccLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landing, currentTerm, deviceTypes.join(',')]);

  // Sync selectedMonths with product
  useEffect(() => {
    if (product?.months) setSelectedMonths(product.months);
  }, [product?.months]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (accDetailId) { document.body.style.overflow = 'hidden'; }
    return () => { document.body.style.overflow = ''; };
  }, [accDetailId]);

  // Toggle accessory via ProductContext (persists across wizard steps)
  const isAccSelected = useCallback((id: string) => selectedAccessories.some((a) => a.id === id), [selectedAccessories]);
  const toggleAcc = useCallback((accessory: Accessory) => {
    toggleAccessory(accessory);
  }, [toggleAccessory]);

  // Validate coupon against backend
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponState('error');
      setCouponError('Ingresa un código de cupón');
      setTimeout(() => setCouponState('idle'), 2000);
      return;
    }
    setCouponState('validating');
    try {
      const productId = selectedProduct?.id
        ? parseInt(selectedProduct.id, 10)
        : cartProducts[0]?.id
          ? parseInt(cartProducts[0].id, 10)
          : undefined;

      const response = await fetch(`${API_BASE_URL}/public/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          product_id: productId,
          landing_id: wizardConfigData?.landing_id,
        }),
      });
      const data: CouponValidateResponse = await response.json();
      if (data.valid && data.code && data.value && data.label) {
        setCouponState('success');
        setAppliedCoupon({
          code: data.code,
          discount: parseFloat(data.value),
          label: data.label,
          couponType: data.coupon_type || 'fixed',
          quotasAffected: data.quotas_affected || undefined,
        });
      } else {
        setCouponState('error');
        setCouponError(data.error_message || 'Cupón no válido o expirado');
        setTimeout(() => setCouponState('idle'), 2000);
      }
    } catch {
      setCouponState('error');
      setCouponError('Error al validar el cupón. Intenta nuevamente.');
      setTimeout(() => setCouponState('idle'), 2000);
    }
  }, [couponCode, selectedProduct, cartProducts, wizardConfigData, setAppliedCoupon]);

  const handleRemoveCoupon = useCallback(() => {
    clearCoupon();
    setCouponCode('');
    setCouponState('idle');
  }, [clearCoupon]);

  const handleStart = useCallback(() => {
    console.log('[GamerSolicitar] handleStart called', { acceptTerms, firstStepSlug, steps: steps?.length, landing });
    if (!acceptTerms) {
      setTermsError(true);
      termsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setTermsError(false);
    if (firstStepSlug) {
      const url = routes.solicitarStep(landing, firstStepSlug);
      console.log('[GamerSolicitar] Navigating to:', url);
      router.push(url);
    } else {
      console.error('[GamerSolicitar] No hay pasos configurados. steps:', steps);
    }
  }, [router, landing, acceptTerms, firstStepSlug, steps]);

  const cyanAlpha = (a: number) => isDark ? `rgba(0,255,213,${a})` : `rgba(0,179,150,${a})`;

  // Plazos disponibles vienen del producto (backend paymentPlans) no hardcoded
  const availableTerms = useMemo<number[]>(() => {
    const plans = product?.paymentPlans;
    if (plans && plans.length > 0) {
      return plans.map((p: { term: number }) => p.term);
    }
    return [];
  }, [product]);

  // Opciones de inicial para el plazo actual (backend)
  const currentPlanOptions = useMemo(() => {
    const plans = product?.paymentPlans;
    if (!plans) return [];
    const plan = plans.find((p: { term: number }) => p.term === selectedMonths) || plans[0];
    return plan?.options || [];
  }, [product, selectedMonths]);

  if (!themeHydrated) {
    return <div className="gamer-theme-bg" style={{ minHeight: '100vh' }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.textPrimary, '--gamer-cyan': T.neonCyan, '--gamer-purple': T.neonPurple, '--gamer-border': T.border, '--gamer-btn-text': isDark ? '#0a0a0a' : '#fff', '--gradient-cyber': isDark ? 'linear-gradient(135deg, #6366f1 0%, #00ffd5 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #00897a 100%)' } as React.CSSProperties}>
      <style>{FONTS_CSS}</style>
      <style>{`
        .btn-loquiero-detalle {
          background: var(--gamer-cyan, #00ffd5);
          color: var(--gamer-btn-text, #0a0a0a); border: none; border-radius: 12px;
          font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; font-weight: 700;
          cursor: pointer; transition: all 0.3s;
        }
        .btn-loquiero-detalle:hover { filter: brightness(0.9); }
      `}</style>

      {/* NAVBAR */}
      <GamerNavbar theme={theme} onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')} catalogUrl={routes.catalogo(landing)} hideSecondaryBar />

      {/* MAIN */}
      <main style={{ maxWidth: 896, margin: '0 auto', padding: '56px 16px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: cyanAlpha(0.1), borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={32} style={{ color: T.neonCyan }} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: F.raj, marginBottom: 12, color: T.textPrimary }}>Solicitud de Financiamiento</h1>
          <p style={{ fontSize: 18, color: T.textSecondary }}>Completa el formulario para solicitar tu equipo tecnológico</p>
        </div>

        {/* Info cards — mobile first (before product) */}
        <div className="flex flex-col sm:hidden gap-0 mb-0">
          <div className="grid grid-cols-1 gap-3 mb-6">
            {[
              { icon: <Clock size={24} />, title: `~${displayEstimatedMinutes || 5} minutos`, sub: 'Tiempo estimado' },
              { icon: <FileText size={24} />, title: `${displayStepsCount || steps.length || 4} pasos`, sub: 'Proceso simple' },
              { icon: <Shield size={24} />, title: '100% Seguro', sub: 'Datos protegidos' },
            ].map((card, i) => (
              <div key={i} style={{ background: T.bgCard, borderRadius: 12, padding: '16px 20px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
                <div style={{ color: T.neonCyan, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{card.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, margin: 0 }}>{card.title}</p>
                <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ background: T.bgCard, borderRadius: 12, padding: 16, border: `1px solid ${T.border}`, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, fontFamily: F.raj, marginBottom: 12 }}>Lo que necesitarás</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { num: '1', title: 'Documento de identidad', sub: 'DNI, CE o Pasaporte vigente' },
                { num: '2', title: 'Constancia de estudios', sub: 'Matrícula vigente' },
                { num: '3', title: 'Información de contacto', sub: 'Teléfono y correo activos' },
              ].map((item) => (
                <div key={item.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: cyanAlpha(0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.neonCyan }}>{item.num}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: T.textPrimary, margin: 0 }}>{item.title}</p>
                    <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product summary — desktop only (mobile uses fixed bottom bar) */}
        {product && (
          <div className="hidden sm:block" style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 32, overflow: 'hidden' }}>
            {/* Header bar */}
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, background: cyanAlpha(0.05), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={16} style={{ color: T.neonCyan }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>Producto seleccionado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>Plazo:</span>
                <div style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setTermDropdownOpen(!termDropdownOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32, padding: '0 12px', borderRadius: 8, border: `2px solid ${T.neonCyan}`, background: isDark ? T.bgCard : '#fff', cursor: 'pointer', fontSize: 14, color: T.textPrimary, gap: 6 }}>
                    <span>{selectedMonths} meses</span>
                    <ChevronDown size={14} style={{ color: T.textMuted, transition: 'transform 0.2s', transform: termDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                  {termDropdownOpen && availableTerms.length > 0 && (
                    <div style={{ position: 'absolute', zIndex: 50, top: '100%', right: 0, marginTop: 4, minWidth: 140, background: isDark ? T.bgCard : '#fff', border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', padding: 4 }}>
                      {availableTerms.map((m) => (
                        <button key={m} type="button" onClick={() => { setSelectedMonths(m); setTermDropdownOpen(false); }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', fontSize: 14, borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: m === selectedMonths ? T.neonCyan : 'transparent', color: m === selectedMonths ? (isDark ? '#0a0a0a' : '#fff') : T.textPrimary }}>
                          <span>{m} meses</span>
                          {m === selectedMonths && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Product content */}
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 96, height: 96, background: T.bgSurface, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image && <Image src={product.image} alt={product.name} width={88} height={88} style={{ objectFit: 'contain' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: T.neonCyan, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginTop: 2 }}>{product.name}</h3>
                  {/* Initial payment pills — desde el backend (paymentPlans[].options[].initialAmount) */}
                  {currentPlanOptions.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Inicial:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {currentPlanOptions.map((opt: { initialPercent: number; initialAmount: number }) => {
                          const isActive = opt.initialPercent === (product.initialPercent || 0);
                          const label = opt.initialPercent === 0 ? 'Sin inicial' : `S/${Math.round(opt.initialAmount)}`;
                          return (
                            <span key={opt.initialPercent} style={{
                              fontSize: 11, padding: '4px 8px', borderRadius: 999,
                              background: isActive ? T.neonCyan : T.bgSurface,
                              color: isActive ? (isDark ? '#0a0a0a' : '#fff') : T.textSecondary,
                              fontWeight: isActive ? 500 : 400,
                            }}>
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: 16, fontWeight: 700, color: T.neonCyan, marginTop: 8 }}>
                    S/{Math.round(product.monthlyPayment)}/mes
                    <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 400, marginLeft: 4 }}>x {product.months} meses</span>
                  </p>
                </div>
                {/* Remove button */}
                <button onClick={() => router.push(routes.catalogo(landing))} style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', color: T.textMuted, cursor: 'pointer', flexShrink: 0 }} title="Quitar producto">
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Footer: total */}
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>Cuota total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.neonCyan }}>S/{Math.round(product.monthlyPayment)}/mes</span>
            </div>
          </div>
        )}

        {/* Info cards — desktop only (mobile shown above product) */}
        <div className="hidden sm:grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { icon: <Clock size={24} />, title: `~${displayEstimatedMinutes || 5} minutos`, sub: 'Tiempo estimado' },
            { icon: <FileText size={24} />, title: `${displayStepsCount || steps.length || 4} pasos`, sub: 'Proceso simple' },
            { icon: <Shield size={24} />, title: '100% Seguro', sub: 'Datos protegidos' },
          ].map((card, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 12, padding: '16px 20px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ color: T.neonCyan, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{card.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{card.title}</p>
              <p style={{ fontSize: 12, color: T.textMuted }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Lo que necesitarás — desktop only */}
        <div className="hidden sm:block" style={{ background: T.bgCard, borderRadius: 12, padding: 24, border: `1px solid ${T.border}`, marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary, fontFamily: F.raj, marginBottom: 16 }}>Lo que necesitarás</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { num: '1', title: 'Documento de identidad', sub: 'DNI, CE o Pasaporte vigente' },
              { num: '2', title: 'Constancia de estudios', sub: 'Documento que acredite tu matrícula vigente' },
              { num: '3', title: 'Información de contacto', sub: 'Teléfono y correo electrónico activos' },
            ].map((item) => (
              <div key={item.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: cyanAlpha(0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.neonCyan }}>{item.num}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: T.textMuted }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accesorios */}
        <div style={{ background: T.bgCard, borderRadius: 12, padding: '16px 24px 24px', border: `1px solid ${T.border}`, marginBottom: 32 }}>
          {/* Header */}
          <div style={{ background: cyanAlpha(0.05), borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: cyanAlpha(0.1), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={24} style={{ color: T.neonCyan }} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary, fontFamily: F.raj, marginBottom: 4 }}>Los estudiantes también llevan...</h2>
                <p style={{ fontSize: 14, color: T.textSecondary }}>7 de cada 10 estudiantes agregan al menos un accesorio a su compra.</p>
              </div>
            </div>
          </div>

          {/* Loading / Empty state */}
          {accLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 size={32} style={{ color: T.neonCyan, animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : accessories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Package size={40} style={{ color: T.textMuted, margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, color: T.textMuted }}>No hay accesorios disponibles para este producto.</p>
            </div>
          ) : (
            <>
              {/* Filters + Search */}
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Category pills — derivadas de las categorías reales del backend */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {['Todos', ...Array.from(new Set(accessories.map((a) => a.category?.slug).filter(Boolean)))].map((catSlug) => {
                    const count = catSlug === 'Todos' ? accessories.length : accessories.filter((a) => a.category?.slug === catSlug).length;
                    const isActive = accFilter === catSlug;
                    const label = catSlug === 'Todos' ? 'Todos' : (accessories.find((a) => a.category?.slug === catSlug)?.category?.name || catSlug);
                    return (
                      <button key={catSlug} onClick={() => { setAccFilter(catSlug as string); setAccPage(0); }} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: isActive ? T.neonCyan : T.bgSurface, color: isActive ? (isDark ? '#0a0a0a' : '#fff') : T.textSecondary }}>
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
                {/* Search + count */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
                    <input type="text" placeholder="Buscar accesorio..." value={accSearch} onChange={(e) => { setAccSearch(e.target.value); setAccPage(0); }} style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 14, border: `1px solid ${T.border}`, borderRadius: 8, background: T.bgSurface, color: T.textPrimary, outline: 'none' }} />
                  </div>
                  {(() => {
                    const filtered = accessories.filter((a) => (accFilter === 'Todos' || a.category?.slug === accFilter) && (!accSearch || a.name.toLowerCase().includes(accSearch.toLowerCase())));
                    const totalPages = Math.ceil(filtered.length / ACC_PAGE_SIZE);
                    const canPrev = accPage > 0;
                    const canNext = accPage < totalPages - 1;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: T.textMuted }}>{filtered.length} accesorios</span>
                        <button disabled={!canPrev} onClick={() => setAccPage((p) => p - 1)} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: canPrev ? 'pointer' : 'default', transition: 'all 0.2s', background: canPrev ? T.neonCyan : T.bgSurface, color: canPrev ? '#fff' : T.textMuted, opacity: canPrev ? 1 : 0.5 }}>
                          <ChevronLeft size={16} />
                        </button>
                        <button disabled={!canNext} onClick={() => setAccPage((p) => p + 1)} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: canNext ? 'pointer' : 'default', transition: 'all 0.2s', background: canNext ? T.neonCyan : T.bgSurface, color: canNext ? '#fff' : T.textMuted, opacity: canNext ? 1 : 0.5 }}>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {accessories
                  .filter((a) => (accFilter === 'Todos' || a.category?.slug === accFilter) && (!accSearch || a.name.toLowerCase().includes(accSearch.toLowerCase())))
                  .slice(accPage * ACC_PAGE_SIZE, (accPage + 1) * ACC_PAGE_SIZE)
                  .map((acc) => {
                    const isSelected = isAccSelected(acc.id);
                    return (
                      <button key={acc.id} onClick={() => toggleAcc(acc)} type="button" style={{ display: 'flex', flexDirection: 'column', background: T.bgCard, borderRadius: 12, border: `2px solid ${isSelected ? T.neonCyan : 'transparent'}`, boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)', padding: 16, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}>
                        {/* Check icon */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00ffd5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: isSelected ? 1 : 0, transform: isSelected ? 'scale(1)' : 'scale(0)' }}>
                            <Check size={14} style={{ color: '#fff' }} />
                          </div>
                        </div>
                        {/* Image */}
                        <div style={{ width: '100%', height: 96, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                          {acc.image ? (
                            <Image src={acc.image} alt={acc.name} width={80} height={80} style={{ objectFit: 'contain', maxHeight: 80 }} />
                          ) : (
                            <Package size={48} style={{ color: T.textMuted }} />
                          )}
                        </div>
                        {/* Name + desc */}
                        <h4 style={{ fontWeight: 600, fontSize: 14, color: T.textPrimary, marginBottom: 4, minHeight: '2.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{acc.name}</h4>
                        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 8, minHeight: '2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{acc.description}</p>
                        {/* Ver detalles */}
                        <div onClick={(e) => { e.stopPropagation(); setAccDetailId(acc.id); }} role="button" tabIndex={0} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: T.neonCyan, background: cyanAlpha(0.1), fontWeight: 500, padding: '8px 12px', borderRadius: 8, marginBottom: 12, cursor: 'pointer', transition: 'background 0.2s' }}>
                          <Info size={14} />
                          Ver detalles
                        </div>
                        {/* Price + plus */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <div>
                            <span style={{ color: T.neonCyan, fontWeight: 700, fontSize: 14 }}>+S/{Math.round(acc.monthlyQuota)}/mes</span>
                            <p style={{ fontSize: 10, color: T.textMuted }}>en {acc.term || currentTerm} meses</p>
                          </div>
                          <Plus size={20} style={{ color: T.textMuted, transition: 'all 0.2s', opacity: isSelected ? 0 : 1, transform: isSelected ? 'scale(0)' : 'scale(1)' }} />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </>
          )}
        </div>

        {/* Términos */}
        <div ref={termsRef} style={{ background: T.bgCard, borderRadius: 12, padding: 24, border: `1px solid ${termsError && !acceptTerms ? T.neonCyan : T.border}`, marginBottom: 32, transition: 'all 0.3s', boxShadow: termsError && !acceptTerms ? `0 0 0 3px ${cyanAlpha(0.3)}` : 'none' }}>
          <h3 style={{ fontWeight: 600, color: T.textPrimary, marginBottom: 16 }}>Términos y Condiciones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Términos - obligatorio */}
            <div>
              <button type="button" onClick={() => { setAcceptTerms(!acceptTerms); if (!acceptTerms) setTermsError(false); }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${termsError && !acceptTerms ? T.neonCyan : (acceptTerms ? T.neonCyan : (isDark ? T.border : '#d1d5db'))}`, background: acceptTerms ? T.neonCyan : (isDark ? T.bgCard : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.2s', boxShadow: termsError && !acceptTerms ? `0 0 0 2px ${cyanAlpha(0.3)}` : 'none' }}>
                  {acceptTerms && <Check size={14} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: termsError && !acceptTerms ? T.neonCyan : T.textPrimary }}>{termsError && !acceptTerms ? 'Acepto los términos y condiciones' : 'Acepto los términos y condiciones'}</p>
                  <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>He leído y acepto los términos de uso del servicio</p>
                </div>
              </button>
              {termsError && !acceptTerms && (
                <p style={{ fontSize: 12, color: T.neonCyan, marginTop: 8, marginLeft: 36 }}>Debes aceptar los términos y condiciones para continuar</p>
              )}
            </div>
            {/* Privacidad */}
            <button type="button" onClick={() => setAcceptPrivacy(!acceptPrivacy)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${acceptPrivacy ? T.neonCyan : (isDark ? T.border : '#d1d5db')}`, background: acceptPrivacy ? T.neonCyan : (isDark ? T.bgCard : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.2s' }}>
                {acceptPrivacy && <Check size={14} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>Acepto la política de privacidad</p>
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>He leído y acepto cómo se usan y protegen mis datos personales</p>
              </div>
            </button>
            {/* Promos */}
            <button type="button" onClick={() => setAcceptPromos(!acceptPromos)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${acceptPromos ? T.neonCyan : (isDark ? T.border : '#d1d5db')}`, background: acceptPromos ? T.neonCyan : (isDark ? T.bgCard : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.2s' }}>
                {acceptPromos && <Check size={14} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>Quiero recibir promociones</p>
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Acepto recibir ofertas y novedades por correo electrónico</p>
              </div>
            </button>
          </div>
        </div>

        {/* Cupón — validación contra /public/coupons/validate */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ background: T.bgCard, borderRadius: 12, padding: 16, border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Tag size={20} style={{ color: T.neonCyan }} />
              <h3 style={{ fontWeight: 600, color: T.textPrimary, fontFamily: F.raj }}>
                Cupón de descuento
                {isCouponRequired && <span style={{ color: T.neonCyan, marginLeft: 6 }}>*</span>}
              </h3>
            </div>
            {appliedCoupon ? (
              /* Cupón ya aplicado */
              <div style={{ background: cyanAlpha(0.08), border: `1px solid ${T.neonCyan}`, borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.neonCyan, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.neonCyan, margin: 0 }}>{appliedCoupon.code}</p>
                    <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{appliedCoupon.label}</p>
                  </div>
                </div>
                <button onClick={handleRemoveCoupon} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', color: T.textMuted, cursor: 'pointer' }} title="Quitar cupón">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ingresa tu código"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter' && couponState === 'idle') handleApplyCoupon(); }}
                    disabled={couponState === 'validating'}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `2px solid ${couponState === 'error' ? '#ff0055' : T.border}`, background: T.bgSurface, color: T.textPrimary, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', outline: 'none' }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponState === 'validating' || !couponCode.trim()}
                    style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: T.neonCyan, color: isDark ? '#0a0a0a' : '#fff', fontWeight: 600, fontSize: 14, fontFamily: F.raj, cursor: couponState === 'validating' || !couponCode.trim() ? 'not-allowed' : 'pointer', opacity: couponState === 'validating' || !couponCode.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {couponState === 'validating' ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                    {couponState === 'validating' ? 'Validando...' : 'Aplicar'}
                  </button>
                </div>
                {couponState === 'error' && couponError && (
                  <p style={{ fontSize: 12, color: '#ff0055', marginTop: 8 }}>{couponError}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <button onClick={handleStart} className="btn-loquiero-detalle" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', fontSize: 18, boxShadow: '0 0 20px rgba(0,255,213,0.2), 0 0 40px rgba(99,102,241,0.15)' }}>
          <span>Comenzar Solicitud</span>
          <ArrowRight size={20} />
        </button>
        <button onClick={() => router.push(routes.catalogo(landing))} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: '8px 0', background: 'none', border: 'none', color: T.textMuted, fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </button>

      </main>

      {/* Accessory detail modal — data real del backend */}
      {accDetailId && (() => {
        const acc = accessories.find((a) => a.id === accDetailId);
        if (!acc) return null;
        const isSelected = isAccSelected(acc.id);
        const months = acc.term || currentTerm;
        const categoryLabel = acc.category?.name || 'Accesorio';
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setAccDetailId(null)}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 50, width: '100%', maxWidth: 448, maxHeight: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column', background: isDark ? T.bgCard : '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: `1px solid ${T.border}` }}>
              {/* Header */}
              <div style={{
                background: isDark ? '#1e1e1e' : '#f5f5f5',
                borderBottom: `1px solid ${T.border}`,
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? 'rgba(0,255,213,0.12)' : 'rgba(0,137,122,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={20} style={{ color: T.neonCyan }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</h2>
                  <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{categoryLabel}</p>
                </div>
                <button onClick={() => setAccDetailId(null)} style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={16} style={{ color: T.textSecondary }} />
                </button>
              </div>
              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Image */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  {acc.image ? (
                    <Image src={acc.image} alt={acc.name} width={112} height={112} style={{ objectFit: 'contain', maxHeight: 112 }} />
                  ) : (
                    <Package size={80} style={{ color: T.textMuted }} />
                  )}
                </div>
                {/* Description */}
                {acc.description && (
                  <p style={{ fontSize: 13, color: T.textSecondary, margin: 0 }}>{acc.description}</p>
                )}
                {/* Specs — solo si el backend los trae */}
                {acc.specs && acc.specs.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {acc.specs.map((spec, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Check size={14} style={{ color: T.neonCyan, flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: T.textSecondary }}>
                          <strong style={{ color: T.textPrimary }}>{spec.label}:</strong> {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Price card — monthlyQuota + price totales del backend */}
                <div style={{ background: cyanAlpha(0.06), borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: T.neonCyan }}>S/ {Math.round(acc.monthlyQuota)}</span>
                    <span style={{ fontSize: 14, color: T.textMuted, marginLeft: 4 }}>/mes</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.textMuted }}>S/ {Math.round(acc.price)} · {months} cuotas</span>
                </div>
                {/* Add button */}
                <button onClick={() => { toggleAcc(acc); setAccDetailId(null); }} style={{ width: '100%', height: 44, borderRadius: 10, border: 'none', background: isSelected ? '#00ffd5' : T.neonCyan, color: isSelected ? '#fff' : (isDark ? '#0a0a0a' : '#fff'), fontWeight: 500, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isSelected ? <Check size={16} /> : <Plus size={16} />}
                  {isSelected ? 'Quitar accesorio' : 'Agregar accesorio'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Mobile product bottom bar */}
      {product && mobileProductExpanded && (
        <div
          className="sm:hidden fixed inset-0 z-40"
          onClick={() => setMobileProductExpanded(false)}
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
        />
      )}
      {product && (
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: isDark ? T.bgCard : '#ffffff',
            borderTop: `2px solid ${T.neonCyan}`,
            boxShadow: isDark ? '0 -4px 20px rgba(0,0,0,0.4)' : '0 -8px 24px rgba(0,137,122,0.15), 0 -2px 6px rgba(0,0,0,0.08)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Collapsed bar */}
          <button
            onClick={() => setMobileProductExpanded(!mobileProductExpanded)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
              background: isDark ? T.bgSurface : '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {product.image && <Image src={product.image} alt={product.name} width={48} height={48} style={{ objectFit: 'contain' }} />}
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.name}
                {selectedAccessories.length > 0 && (
                  <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 4 }}>+{selectedAccessories.length} acc.</span>
                )}
              </p>
              <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{selectedMonths} meses</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.neonCyan, fontFamily: "'Orbitron', sans-serif" }}>S/{Math.round(product.monthlyPayment)}/mes</span>
              <ChevronUp size={20} style={{ color: T.textMuted, transition: 'transform 0.2s', transform: mobileProductExpanded ? 'rotate(180deg)' : 'none' }} />
            </div>
          </button>

          {/* Expanded content */}
          {mobileProductExpanded && (
            <div style={{ borderTop: `1px solid ${T.border}`, padding: 16, maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                  background: isDark ? T.bgSurface : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {product.image && <Image src={product.image} alt={product.name} width={80} height={80} style={{ objectFit: 'contain' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{product.brand}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: '2px 0 0' }}>{product.name}</p>
                  {product.shortName && (
                    <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>
                      {product.shortName !== product.name ? product.shortName : ''}
                    </p>
                  )}
                  {/* Initial payment pills */}
                  {currentPlanOptions.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 10, color: T.textMuted, marginBottom: 4 }}>Inicial:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {currentPlanOptions.map((opt: { initialPercent: number; initialAmount: number }) => {
                          const isActive = opt.initialPercent === (product.initialPercent || 0);
                          const label = opt.initialPercent === 0 ? 'Sin inicial' : `S/${Math.round(opt.initialAmount)}`;
                          return (
                            <span key={opt.initialPercent} style={{
                              fontSize: 10, padding: '3px 8px', borderRadius: 999,
                              background: isActive ? T.neonCyan : T.bgSurface,
                              color: isActive ? (isDark ? '#0a0a0a' : '#fff') : T.textSecondary,
                              fontWeight: isActive ? 600 : 400,
                            }}>
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.neonCyan, margin: '6px 0 0' }}>S/{Math.round(product.monthlyPayment)}/mes</p>
                </div>
              </div>

              {/* Accessories summary */}
              {selectedAccessories.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {selectedAccessories.map((acc: { id: string; name: string; monthlyQuota: number }) => (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textSecondary, padding: '4px 0' }}>
                      <Plus size={12} style={{ color: T.neonCyan }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</span>
                      <span style={{ color: T.neonCyan, fontWeight: 600 }}>+S/{Math.round(acc.monthlyQuota)}/mes</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total + term */}
              <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: cyanAlpha(0.05) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>Cuota mensual total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: T.neonCyan, fontFamily: "'Orbitron', sans-serif" }}>S/{Math.round(product.monthlyPayment)}/mes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: T.textMuted }}>Plazo:</span>
                  <div style={{ position: 'relative' }}>
                    <button type="button" onClick={() => setTermDropdownOpen(!termDropdownOpen)} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      height: 28, padding: '0 8px', borderRadius: 8,
                      border: `1.5px solid ${T.border}`, background: isDark ? T.bgCard : '#fff',
                      cursor: 'pointer', fontSize: 12, color: T.textPrimary,
                    }}>
                      <span>{selectedMonths} meses</span>
                      <ChevronDown size={14} style={{ color: T.textMuted }} />
                    </button>
                    {termDropdownOpen && availableTerms.length > 0 && (
                      <div style={{ position: 'absolute', zIndex: 50, bottom: '100%', right: 0, marginBottom: 4, minWidth: 120, background: isDark ? T.bgCard : '#fff', border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)', padding: 4 }}>
                        {availableTerms.map((m) => (
                          <button key={m} type="button" onClick={() => { setSelectedMonths(m); setTermDropdownOpen(false); }} style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer', background: m === selectedMonths ? T.neonCyan : 'transparent', color: m === selectedMonths ? (isDark ? '#0a0a0a' : '#fff') : T.textPrimary }}>
                            {m} meses
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <GamerNewsletter theme={theme} />
      <GamerFooter theme={theme} />
    </div>
  );
}
