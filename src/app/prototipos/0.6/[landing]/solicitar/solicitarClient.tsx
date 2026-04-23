'use client';

/**
 * Wizard Preview - Intro Page
 * Landing page before starting the wizard flow
 */

import React, { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Clock, Shield, ArrowRight, ArrowLeft, Check, ShoppingCart, AlertTriangle, X } from 'lucide-react';
import { TermSelect, getTermUnit } from './components/solicitar/product/TermSelect';
import { useProduct } from './context/ProductContext';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { routes } from '@/app/prototipos/0.6/utils/routes';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';

// Layout context for shared data
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Wizard config context for dynamic steps
import { useWizardConfig } from './context/WizardConfigContext';

// Solicitar flow configuration
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';

// Landing config (to check has_catalog)
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';

// Preview context
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';

// Dynamic section renderer
import { SectionRenderer } from './components/solicitar/sections';

// Coupon component
import { CouponInput } from './components/solicitar/coupon';

// Product bar for mobile
import { SelectedProductBar, SelectedProductSpacer } from './components/solicitar/product';

// Utils
import { formatMoneyNoDecimals } from './utils/formatMoney';

// Checkbox definido fuera del componente padre para evitar remount en cada
// render cuando cambia el estado del padre (antes se redefinía dentro del
// componente, causando que React lo tratara como un tipo nuevo).
interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  error?: string | null;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, description, error }) => (
  <div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 w-full text-left cursor-pointer"
    >
      <div
        className={`
          w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
          transition-all duration-200
          ${checked
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : error
              ? 'bg-white border-red-500 ring-2 ring-red-500/20'
              : 'bg-white border-neutral-300 hover:border-[rgba(var(--color-primary-rgb),0.5)]'
          }
        `}
      >
        {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${error ? 'text-red-600' : 'text-neutral-800'}`}>{label}</p>
        <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 break-words">{description}</p>
      </div>
    </button>
    {error && (
      <p className="text-xs text-red-500 mt-2 ml-9">{error}</p>
    )}
  </div>
);

function WizardPreviewContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  // Check if this landing has a catalog (for redirect fallback)
  const [hasCatalog, setHasCatalog] = useState(true);
  useEffect(() => {
    fetchLandingConfig(landing).then(cfg => setHasCatalog(cfg.layout.has_catalog));
  }, [landing]);

  const { selectedProduct, setSelectedProduct, cartProducts, setCartProducts, selectedAccessories, selectedInsurances, clearAccessories, isHydrated, isOverQuotaLimit, maxMonthlyQuota, getTotalMonthlyPayment, appliedCoupon, hasUnifiedTerms, getAvailableTerms, updateAllProductsToTerm, updateProductInitial, getInitialOptionsForProduct, unavailableProductIds, removeUnavailableProducts, isValidatingAvailability, setIsProductBarExpanded } = useProduct();

  // Fallback route: catalog if available, otherwise landing home
  const fallbackRoute = hasCatalog ? routes.catalogo(landing) : routes.landingHome(landing);

  // Remove product from cart (or clear selectedProduct if single)
  const handleRemoveProduct = useCallback((productId: string) => {
    if (cartProducts.length > 1) {
      // Remove from cart, keep others
      const updated = cartProducts.filter(p => p.id !== productId);
      setCartProducts(updated);
      // Also update selectedProduct to first remaining
      setSelectedProduct(updated[0]);
    } else if (cartProducts.length === 1) {
      // Last cart product - clear and go back
      setCartProducts([]);
      setSelectedProduct(null);
      router.replace(fallbackRoute);
    } else if (selectedProduct?.id === productId) {
      // Single product mode - clear and go back
      setSelectedProduct(null);
      router.replace(fallbackRoute);
    }
  }, [cartProducts, selectedProduct, setCartProducts, setSelectedProduct, router, fallbackRoute]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptPromos, setAcceptPromos] = useState(true);
  const [isTermsHydrated, setIsTermsHydrated] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, agreementData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Get wizard config for dynamic first step
  const { steps, isLoading: isConfigLoading, displayStepsCount, displayEstimatedMinutes } = useWizardConfig();

  // Preview mode support
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // Get solicitar flow configuration (accessories, wizard_steps, insurance order & enabled state)
  const { isEnabled: isSectionEnabled, sectionsBeforeWizard, isLoading: isFlowConfigLoading, isCouponRequired } = useSolicitarFlow({ slug: landing, previewKey });

  // Clear accessories if section is disabled (prevents orphaned selections from previous sessions)
  useEffect(() => {
    if (!isFlowConfigLoading && !isSectionEnabled('accessories') && selectedAccessories.length > 0) {
      clearAccessories();
    }
  }, [isFlowConfigLoading, isSectionEnabled, selectedAccessories.length, clearAccessories]);

  // Clear coupon error when coupon is applied
  useEffect(() => {
    if (appliedCoupon && couponError) {
      setCouponError(null);
    }
  }, [appliedCoupon, couponError]);

  // Get first regular step (not summary step) for dynamic navigation
  const firstStep = useMemo(() => {
    const regularSteps = steps.filter(s => !s.is_summary_step);
    return regularSteps.length > 0 ? regularSteps[0] : null;
  }, [steps]);

  // Cargar valores desde localStorage al montar
  useEffect(() => {
    try {
      const savedAcceptTerms = localStorage.getItem(`baldecash-${landing}-wizard-acceptTerms`);
      const savedAcceptPrivacy = localStorage.getItem(`baldecash-${landing}-wizard-acceptPrivacy`);
      const savedAcceptPromos = localStorage.getItem(`baldecash-${landing}-wizard-acceptPromos`);
      if (savedAcceptTerms !== null) setAcceptTerms(savedAcceptTerms === 'true');
      if (savedAcceptPrivacy !== null) setAcceptPrivacy(savedAcceptPrivacy === 'true');
      if (savedAcceptPromos !== null) setAcceptPromos(savedAcceptPromos === 'true');
    } catch {}
    setIsTermsHydrated(true);
  }, [landing]);

  // Guardar acceptTerms en localStorage
  useEffect(() => {
    if (!isTermsHydrated) return;
    try {
      localStorage.setItem(`baldecash-${landing}-wizard-acceptTerms`, String(acceptTerms));
    } catch {}
  }, [acceptTerms, isTermsHydrated, landing]);

  // Guardar acceptPrivacy en localStorage
  useEffect(() => {
    if (!isTermsHydrated) return;
    try {
      localStorage.setItem(`baldecash-${landing}-wizard-acceptPrivacy`, String(acceptPrivacy));
    } catch {}
  }, [acceptPrivacy, isTermsHydrated, landing]);

  // Guardar acceptPromos en localStorage
  useEffect(() => {
    if (!isTermsHydrated) return;
    try {
      localStorage.setItem(`baldecash-${landing}-wizard-acceptPromos`, String(acceptPromos));
    } catch {}
  }, [acceptPromos, isTermsHydrated, landing]);

  // Redirect if no product was selected
  useEffect(() => {
    // Wait for hydration from localStorage before deciding
    if (!isHydrated) return;

    // If no product was selected, redirect to catalog (or landing home if no catalog)
    if (!selectedProduct) {
      router.replace(fallbackRoute);
    }
  }, [isHydrated, selectedProduct, router, fallbackRoute]);


  // Check if terms need to be unified (multiple products with different terms)
  const needsTermUnification = cartProducts.length > 1 && !hasUnifiedTerms();
  const availableTerms = getAvailableTerms();

  // Helper: read the real fixed header height from CSS variable (fallback 104px)
  const getHeaderOffset = useCallback((): number => {
    if (typeof window === 'undefined') return 104;
    const v = getComputedStyle(document.documentElement).getPropertyValue('--header-total-height');
    const trimmed = v.trim();
    if (!trimmed) return 104;
    if (trimmed.endsWith('rem')) return parseFloat(trimmed) * 16;
    if (trimmed.endsWith('px')) return parseFloat(trimmed);
    return parseFloat(trimmed) || 104;
  }, []);

  // Helper function for smooth scroll with highlight effect.
  // Falls back to expanding the mobile product bar when the target section is
  // hidden on mobile (e.g. `term-selector-section` is `hidden lg:block`).
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // If the element is display: none (hidden by a lg: visibility class),
    // expand the mobile product bar so the user sees the term selector.
    const isHidden = element.offsetParent === null;
    if (isHidden && sectionId === 'term-selector-section') {
      // Desktop card is hidden on mobile — open the floating product bar
      // which contains an equivalent term selector.
      try {
        setIsProductBarExpanded(true);
      } catch {}
      return;
    }

    // Custom scroll with manual offset to compensate for the fixed navbar
    // (smooth scrollIntoView + block: center was causing momentum issues on iOS).
    const rect = element.getBoundingClientRect();
    const targetTop = window.pageYOffset + rect.top - getHeaderOffset() - 24;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

    // Add highlight effect after scroll reaches the element
    element.classList.add('ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2');
    setTimeout(() => {
      element.classList.remove('ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2');
    }, 2000);
  }, [getHeaderOffset, setIsProductBarExpanded]);

  // Only consider products that are both unavailable AND still in the cart/selection
  const currentProductIds = new Set(
    (cartProducts.length > 0 ? cartProducts : selectedProduct ? [selectedProduct] : []).map(p => p.id)
  );
  const activeUnavailableIds = unavailableProductIds.filter(id => currentProductIds.has(id));
  const hasUnavailableProducts = activeUnavailableIds.length > 0;

  const handleStart = () => {
    // Block if there are unavailable products
    if (hasUnavailableProducts) {
      scrollToSection('unavailable-products-banner');
      return;
    }

    // Validar que la cuota mensual no exceda el límite
    if (isOverQuotaLimit) {
      scrollToSection('product-section');
      return;
    }

    // Validar que los plazos estén estandarizados (para múltiples productos)
    if (needsTermUnification) {
      // Scroll al selector de plazos
      scrollToSection('term-selector-section');
      return;
    }

    // Validar términos antes de continuar (primera validación requerida)
    if (!acceptTerms) {
      setTermsError('Debes aceptar los términos y condiciones para continuar');
      // Scroll al checkbox de términos
      scrollToSection('terms-section');
      return;
    }

    // Validar política de privacidad
    if (!acceptPrivacy) {
      setPrivacyError('Debes aceptar la política de privacidad para continuar');
      scrollToSection('terms-section');
      return;
    }

    // Validar cupón si es requerido
    if (isCouponRequired && !appliedCoupon) {
      setCouponError('Debes ingresar un cupón válido para continuar');
      // Scroll al campo de cupón
      scrollToSection('coupon-section');
      return;
    }

    // Validar que exista un primer paso configurado en la BD
    if (!firstStep) {
      console.error('No hay pasos configurados para esta landing');
      return;
    }

    const firstStepSlug = firstStep.url_slug || firstStep.code;
    if (!firstStepSlug) {
      console.error('El primer paso no tiene url_slug ni code configurado');
      return;
    }

    setTermsError(null);
    setPrivacyError(null);
    setCouponError(null);
    router.push(routes.solicitarStep(landing, firstStepSlug));
  };

  // Content JSX (no es componente para evitar remount en cada render)
  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar del Hero */}
      <Navbar
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        portalButtonText={navbarProps?.portalButtonText}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={navbarProps?.activeSections || []}
        institutionLogo={navbarProps?.institutionLogo}
        institutionName={navbarProps?.institutionName}
      />

      {/* Spacer — dynamic, tracks --header-total-height exposed by Navbar
          (preview banner + promo banner + main navbar). */}
      <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14 pb-24 lg:pb-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-2 sm:mb-3 font-['Baloo_2',_sans-serif] leading-tight">
            Solicitud de Financiamiento
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-xl mx-auto px-2">
            Completa el formulario para solicitar tu equipo tecnológico
          </p>
        </div>

        {/* Products Card - Shows all cart products or single selected product */}
        {(() => {
          const productsToShow = cartProducts.length > 0 ? cartProducts : (selectedProduct ? [selectedProduct] : []);
          if (productsToShow.length === 0) return null;

          const totalMonthly = productsToShow.reduce((sum, p) => sum + p.monthlyPayment, 0);

          return (
            <div id="term-selector-section" className={`hidden lg:block bg-white rounded-xl border mb-6 sm:mb-8 overflow-hidden ${needsTermUnification ? 'border-amber-300' : 'border-neutral-200'}`}>
              {/* Header with term selector - Always visible */}
              <div className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between ${needsTermUnification ? 'bg-amber-50 border-amber-200' : 'bg-[rgba(var(--color-primary-rgb),0.05)] border-neutral-200'}`}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`w-4 h-4 ${needsTermUnification ? 'text-amber-600' : 'text-[var(--color-primary)]'}`} />
                  <span className="text-sm font-semibold text-neutral-800">
                    {productsToShow.length === 1 ? 'Producto seleccionado' : `${productsToShow.length} productos seleccionados`}
                  </span>
                </div>
                {/* Term selector dropdown - Always show selector */}
                <div className="flex items-center gap-2">
                  {needsTermUnification && (
                    <span className="text-xs text-amber-700">Unificar plazo:</span>
                  )}
                  {!needsTermUnification && (
                    <span className="text-xs text-neutral-500">Plazo:</span>
                  )}
                  <TermSelect
                    value={needsTermUnification ? 0 : ((productsToShow[0]?.term ?? productsToShow[0]?.months) || 0)}
                    options={availableTerms}
                    onChange={(term) => updateAllProductsToTerm(term)}
                    warning={needsTermUnification}
                    placeholder="Seleccionar"
                    frequency={needsTermUnification ? undefined : productsToShow[0]?.paymentFrequency}
                  />
                </div>
              </div>

              {/* Warning banner for unequal terms */}
              {needsTermUnification && (
                <div className="px-4 sm:px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Plazos diferentes detectados</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Para continuar, selecciona un plazo único para todos los productos.
                      Esto permite generar un cronograma de pagos unificado.
                    </p>
                  </div>
                </div>
              )}

              {/* Product List */}
              <div className="p-4 sm:p-5 space-y-4">
                {productsToShow.map((product, index) => {
                  const isUnavailable = activeUnavailableIds.includes(product.id);
                  return (
                  <div key={`${product.id}-${index}`} className={`flex items-start gap-4 ${index > 0 ? 'pt-4 border-t border-neutral-100' : ''} ${isUnavailable ? 'opacity-50' : ''}`}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wider">
                        {product.brand}
                      </p>
                      <h3 className="text-sm font-bold text-neutral-800 line-clamp-2 mt-0.5">
                        {product.name}
                      </h3>
                      {product.specs && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {product.specs.processor && (
                            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                              {product.specs.processor}
                            </span>
                          )}
                          {product.specs.ram && (
                            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                              {product.specs.ram}
                            </span>
                          )}
                          {product.specs.storage && (
                            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                              {product.specs.storage}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Initial Payment Selector */}
                      {(() => {
                        const initialOptions = getInitialOptionsForProduct(product.id);
                        if (initialOptions.length === 0) return null;
                        return (
                          <div className="mt-2">
                            <p className="text-[11px] text-neutral-500 mb-1">Inicial:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {initialOptions.map((option) => (
                                <button
                                  key={option.percent}
                                  onClick={() => updateProductInitial(product.id, option.percent)}
                                  className={`text-[11px] px-2.5 py-1.5 rounded-full transition-all cursor-pointer min-h-[28px] ${
                                    product.initialPercent === option.percent
                                      ? 'bg-[var(--color-primary)] text-white font-medium'
                                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {isUnavailable ? (
                        <span className="inline-block text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-1.5">
                          No disponible
                        </span>
                      ) : (
                        <>
                          <p className="text-base font-bold text-[var(--color-primary)] mt-1.5">
                            S/{formatMoneyNoDecimals(Math.floor(product.monthlyPayment))}{product.paymentFrequency === 'semanal' ? '/sem' : product.paymentFrequency === 'quincenal' ? '/qcn' : '/mes'}
                            {(() => {
                              const displayTerm = product.term ?? product.months;
                              return (
                                <span className="text-xs text-neutral-500 font-normal ml-1">
                                  x {displayTerm} {getTermUnit(displayTerm, product.paymentFrequency)}
                                </span>
                              );
                            })()}
                          </p>
                          {product.initialAmount > 0 && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              + S/{formatMoneyNoDecimals(Math.floor(product.initialAmount))} inicial
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                      title="Quitar producto"
                      aria-label="Quitar producto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  );
                })}
              </div>

              {/* Total + Accessories + Quota Warning */}
              {(productsToShow.length >= 1) && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                  {/* Insurance */}
                  {selectedInsurances.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        Seguros seleccionados
                      </p>
                      <div className="space-y-1.5">
                        {selectedInsurances.map((ins) => (
                          <div key={ins.id} className="flex items-center justify-between text-sm">
                            <span className="text-neutral-700">{ins.name}</span>
                            <span className="text-[var(--color-secondary)] font-medium">+S/{formatMoneyNoDecimals(Math.floor(ins.monthlyPrice))}/mes</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accessories */}
                  {selectedAccessories.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        Accesorios seleccionados
                      </p>
                      <div className="space-y-1.5">
                        {selectedAccessories.map((acc) => (
                          <div key={acc.id} className="flex items-center justify-between text-sm">
                            <span className="text-neutral-700">{acc.name}</span>
                            <span className="text-[var(--color-primary)] font-medium">+S/{formatMoneyNoDecimals(Math.floor(acc.monthlyQuota))}/mes</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-800">Cuota total</span>
                    <span className={`text-lg font-bold ${isOverQuotaLimit ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>
                      S/{formatMoneyNoDecimals(Math.floor(totalMonthly + selectedAccessories.reduce((s, a) => s + a.monthlyQuota, 0) + selectedInsurances.reduce((s, i) => s + i.monthlyPrice, 0)))}
                      {productsToShow[0]?.paymentFrequency === 'semanal' ? '/sem' : productsToShow[0]?.paymentFrequency === 'quincenal' ? '/qcn' : '/mes'}
                    </span>
                  </div>

                  {/* Quota limit warning */}
                  {isOverQuotaLimit && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Cuota mensual excedida</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          La cuota mensual supera el límite de S/{maxMonthlyQuota}/mes.
                          Quita algún producto o accesorio para continuar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 text-center">
            <Clock className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">
              {displayEstimatedMinutes < 1 ? '~1 minuto' : `~${displayEstimatedMinutes} minutos`}
            </p>
            <p className="text-xs text-neutral-500">Tiempo estimado</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 text-center">
            <FileText className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">
              {displayStepsCount} pasos
            </p>
            <p className="text-xs text-neutral-500">Proceso simple</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200 text-center">
            <Shield className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">100% Seguro</p>
            <p className="text-xs text-neutral-500">Datos protegidos</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4">
            Lo que necesitarás
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-primary)]">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Documento de identidad</p>
                <p className="text-xs text-neutral-500">DNI, CE o Pasaporte vigente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-primary)]">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Constancia de estudios</p>
                <p className="text-xs text-neutral-500">Documento que acredite tu matrícula vigente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-primary)]">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Información de contacto</p>
                <p className="text-xs text-neutral-500">Teléfono y correo electrónico activos</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Dynamic Sections Before Wizard - Rendered in configured order */}
        {sectionsBeforeWizard.map((section) => (
          <SectionRenderer key={section.type} type={section.type} className="mb-8" />
        ))}

        {/* Términos y Condiciones */}
        <div id="terms-section" className={`bg-white rounded-xl p-4 sm:p-6 border mb-6 sm:mb-8 transition-all duration-300 ${termsError || privacyError ? 'border-red-300 bg-red-50/30' : 'border-neutral-200'}`}>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4">Términos y Condiciones</h3>
          <div className="space-y-4">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(checked) => {
                setAcceptTerms(checked);
                if (checked) setTermsError(null);
              }}
              label="Acepto los términos y condiciones"
              description="He leído y acepto los términos de uso del servicio"
              error={termsError}
            />
            <Checkbox
              id="acceptPrivacy"
              checked={acceptPrivacy}
              onChange={(checked) => {
                setAcceptPrivacy(checked);
                if (checked) setPrivacyError(null);
              }}
              label="Acepto la política de privacidad"
              description="He leído y acepto cómo se usan y protegen mis datos personales"
              error={privacyError}
            />
            <Checkbox
              id="acceptPromos"
              checked={acceptPromos}
              onChange={setAcceptPromos}
              label="Quiero recibir promociones"
              description="Acepto recibir ofertas y novedades por correo electrónico"
            />
          </div>
        </div>

        {/* Cupón de Descuento */}
        <div id="coupon-section" className={`mb-8 transition-all duration-300 rounded-xl ${couponError ? 'ring-2 ring-red-500/30' : ''}`}>
          <CouponInput isRequired={isCouponRequired} />
          {couponError && !appliedCoupon && (
            <p className="text-xs text-red-500 mt-2 ml-1">{couponError}</p>
          )}
        </div>

        {/* Unavailable products banner */}
        {hasUnavailableProducts && (
          <div id="unavailable-products-banner" className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-amber-800 font-medium text-sm">
                  {activeUnavailableIds.length === 1
                    ? 'Un producto de tu selección ya no está disponible'
                    : `${activeUnavailableIds.length} productos de tu selección ya no están disponibles`
                  }
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  Debes quitar los productos no disponibles para continuar con tu solicitud.
                </p>
                <button
                  type="button"
                  onClick={removeUnavailableProducts}
                  className="mt-2 px-3 py-1.5 text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors cursor-pointer"
                >
                  Quitar productos no disponibles
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleStart}
          disabled={isOverQuotaLimit || hasUnavailableProducts}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-semibold text-lg transition-colors shadow-lg
                     ${isOverQuotaLimit || hasUnavailableProducts
                       ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                       : 'bg-[var(--color-primary)] text-white hover:brightness-90 cursor-pointer shadow-[rgba(var(--color-primary-rgb),0.25)]'
                     }`}
        >
          <span>Comenzar Solicitud</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Back to catalog link */}
        <button
          onClick={() => router.push(fallbackRoute)}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3 text-neutral-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{hasCatalog ? 'Volver al catálogo' : 'Volver al inicio'}</span>
        </button>
      </div>
    </div>
  );

  // Show loading while checking hydration, layout loading, config loading, availability check, or if no product selected (redirect will happen)
  if (!isHydrated || !selectedProduct || isLayoutLoading || isConfigLoading || isFlowConfigLoading || isValidatingAvailability) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <div className="relative">
      {pageContent}
      <SelectedProductBar mobileOnly />
      <SelectedProductSpacer />
      {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function WizardPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WizardPreviewContent />
    </Suspense>
  );
}
