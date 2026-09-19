'use client';

/**
 * Wizard Preview - Intro Page
 * Landing page before starting the wizard flow
 */

import React, { Suspense, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLeadGuard } from '@/app/prototipos/0.6/hooks/useLeadGuard';
import { FileText, Clock, Shield, ArrowRight, ArrowLeft, Check, ShoppingCart, AlertTriangle, X } from 'lucide-react';
import { TermSelect, getTermUnit } from './components/solicitar/product/TermSelect';
import { etiquetasDePlazo, ordenarTerms } from './components/solicitar/product/etiquetaDePlazo';
import { useProduct } from './context/ProductContext';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { routes } from '@/app/prototipos/0.6/utils/routes';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { NvidiaNavbar } from '@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar';
import { isNvidiaLanding, isGamerLanding, isSecondFinancingLanding } from '@/app/prototipos/0.6/utils/theme';
import { GamerSolicitarContent } from './GamerSolicitarClient';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';

// Layout context for shared data
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Wizard config context for dynamic steps
import { useWizardConfig } from './context/WizardConfigContext';

// Solicitar flow configuration
import { useSolicitarFlow } from '@/app/prototipos/0.6/hooks/useSolicitarFlow';

// Landing config (to check has_catalog)
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';
import { campanaAbierta } from '@/app/prototipos/0.6/types/landingConfig';

// Preview context
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';

// Dynamic section renderer
import { SectionRenderer } from './components/solicitar/sections';

// Coupon component
import { CouponInput } from './components/solicitar/coupon';

// Product bar for mobile
import { SelectedProductBar, SelectedProductSpacer } from './components/solicitar/product';

// El paso del formulario, para embeberlo en la intro de renueva-*
import { MobileStickyCta, MobileStickyCtaSpacer, PasoDelWizard, usePasoDelWizard } from './components/solicitar/wizard';

// Utils
import { formatMoneyNoDecimals } from './utils/formatMoney';

// Analytics
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

// Checkbox definido fuera del componente padre para evitar remount en cada
// render cuando cambia el estado del padre (antes se redefinía dentro del
// componente, causando que React lo tratara como un tipo nuevo).
interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description: React.ReactNode;
  error?: string | null;
}

// Nota: se usa <div role="checkbox"> en vez de <button> porque el label puede
// contener enlaces (<a>) a las páginas legales, y anidar <a> dentro de <button>
// es HTML inválido. Los enlaces usan stopPropagation para no togglear el check.
const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, description, error }) => (
  <div>
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
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
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-2 ml-9">{error}</p>
    )}
  </div>
);

function WizardPreviewContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  /**
   * Segundo financiamiento: un solo paso de formulario. La pantalla se arma
   * distinta — accesorios plegado y el formulario embebido debajo— así que el
   * gate se deriva una vez acá y lo consume todo el render.
   */
  const esRenueva = isSecondFinancingLanding(landing);

  // Lead guard — redirige al form si no tiene lead_id
  const hasLeadAccess = useLeadGuard(landing);

  // Scroll to top on page load
  useScrollToTop();

  // Analytics
  const analytics = useAnalytics();

  // Check if this landing has a catalog (for redirect fallback)
  const [hasCatalog, setHasCatalog] = useState(true);
  // Cupo de la campaña. Arranca en `true` y solo se cierra si el backend lo
  // dice: mientras la respuesta viaja, el formulario se ve normal. El envío
  // valida el cupo del lado del servidor, así que este aviso no es la defensa
  // —es para no hacer llenar un formulario que ya no se va a poder mandar.
  const [campanaRecibe, setCampanaRecibe] = useState(true);
  // Arranca en `true` para que una landing sin el ingrediente se vea igual que
  // antes de que el flag existiera.
  const [muestraCupon, setMuestraCupon] = useState(true);
  useEffect(() => {
    fetchLandingConfig(landing).then(cfg => {
      setHasCatalog(cfg.layout.has_catalog);
      setCampanaRecibe(campanaAbierta(cfg));
      setMuestraCupon(cfg.features.has_coupon);
    });
  }, [landing]);

  // El selector de plazo se decide en el contexto de la landing y no acá: se
  // dibuja en tres pantallas y antes solo esta consultaba la configuración, así
  // que el ingrediente tapaba una de tres.

  const { selectedProduct, setSelectedProduct, cartProducts, setCartProducts, selectedAccessories, selectedInsurances, clearAccessories, isHydrated, isOverQuotaLimit, maxMonthlyQuota, getTotalMonthlyPayment, appliedCoupon, hasUnifiedTerms, getAvailableTerms, updateAllProductsToTerm, updateProductInitial, getInitialOptionsForProduct, unavailableProductIds, removeUnavailableProducts, isValidatingAvailability, setIsProductBarExpanded, isLoadingAccessories } = useProduct();

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
  const [acceptPromos, setAcceptPromos] = useState(false);
  const [isTermsHydrated, setIsTermsHydrated] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, agreementData, isLoading: isLayoutLoading, hasError: hasLayoutError, puedeCambiarPlazo, mostrarImagenProducto } = useLayout();

  // Get wizard config for dynamic first step
  const { config, steps, isLoading: isConfigLoading, displayStepsCount, displayEstimatedMinutes } = useWizardConfig();

  // Preview mode support
  const preview = usePreview();
  const previewKey = preview.isPreviewingLanding(landing) ? preview.previewKey : null;

  // Get solicitar flow configuration (accessories, wizard_steps, insurance order & enabled state)
  // `flujo` entero además de los campos sueltos: `usePasoDelWizard` lo recibe
  // inyectado en vez de volver a llamar `useSolicitarFlow`, que guarda su estado
  // por instancia y saldría a buscar `solicitar-config` una segunda vez.
  const flujo = useSolicitarFlow({ slug: landing, previewKey });
  const { isEnabled: isSectionEnabled, sectionsBeforeWizard, isLoading: isFlowConfigLoading, isCouponRequired } = flujo;

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

  /**
   * El paso del formulario, embebido. Se monta siempre —el orden de hooks no
   * admite condicionales— pero solo se RENDERIZA en renueva-*.
   *
   * Fuera de renueva-* el slug va vacío a propósito: sin paso resuelto el hook
   * queda inerte (no registra el `form_abandon` del `beforeunload`, no resuelve
   * el motivacional), así que la intro del resto de las landings se comporta
   * exactamente igual que antes de embeber nada.
   */
  const pasoEmbebido = usePasoDelWizard({
    stepSlug: esRenueva ? (firstStep?.url_slug || firstStep?.code || '') : '',
    flujo,
  });

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

    // El envío del paso embebido limpia el carrito al crear la solicitud, así
    // que `selectedProduct` pasa a `null` en el mismo instante en que el envío
    // sale bien. Sin mirar el flag, esta pantalla se leería eso como "entró sin
    // elegir equipo" y se mandaría sola al catálogo EN MEDIO DEL ENVÍO, antes
    // de llegar al contrato. No se puede simplificar: la invariante vive acá,
    // fuera del hook, y el host que la olvide reintroduce el bug en silencio.
    // `StepClient` tiene el mismo guard por la misma razón.
    if (pasoEmbebido.submitSucceeded) return;

    // If no product was selected, redirect to catalog (or landing home if no catalog)
    if (!selectedProduct) {
      router.replace(fallbackRoute);
    }
  }, [isHydrated, selectedProduct, router, fallbackRoute, pasoEmbebido.submitSucceeded]);


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

  /**
   * En renueva-* la pantalla abre sobre el formulario, no sobre el encabezado
   * (`useScrollToTop`, arriba, deja la vista en el título de la intro).
   *
   * Va en un ref callback del bloque y no en un efecto con `getElementById`: el
   * bloque recién existe cuando la página sale del spinner, y ese gate espera
   * layout, config del wizard, config del flujo, hidratación y disponibilidad.
   * Un efecto que corre antes no encuentra el nodo y NO se vuelve a ejecutar
   * —ninguna de sus dependencias cambia después—, así que el scroll no pasaría
   * nunca. El ref corre exactamente cuando el nodo entra al DOM, con los campos
   * del paso ya montados debajo (los refs de los hijos corren primero), o sea
   * con el alto del bloque ya resuelto.
   */
  const yaScrolleoRef = useRef(false);
  const scrollearAlFormulario = useCallback((el: HTMLDivElement | null) => {
    if (!el || yaScrolleoRef.current) return;
    yaScrolleoRef.current = true;
    // El frame de espera no es cosmético: el ref corre en el commit, ANTES de
    // los efectos pasivos de ese mismo commit, y uno de ellos es el
    // `useScrollToTop` de arriba. Si el formulario llega a montarse en el
    // primer commit, sin esto el scroll al encabezado pisaría al del
    // formulario y la pantalla abriría arriba igual.
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      window.scrollTo({
        top: Math.max(0, window.pageYOffset + rect.top - getHeaderOffset() - 24),
        behavior: 'smooth',
      });
    });
  }, [getHeaderOffset]);

  // Only consider products that are both unavailable AND still in the cart/selection
  const currentProductIds = new Set(
    (cartProducts.length > 0 ? cartProducts : selectedProduct ? [selectedProduct] : []).map(p => p.id)
  );
  const activeUnavailableIds = unavailableProductIds.filter(id => currentProductIds.has(id));
  const hasUnavailableProducts = activeUnavailableIds.length > 0;

  /**
   * Las validaciones de la intro: carrito, plazos, consentimientos, cupón.
   * Devuelve `true` si se puede seguir; si no, ya dejó el error puesto y
   * scrolleó a la sección culpable.
   *
   * Corre ANTES que la validación de campos del formulario: si el formulario
   * validara primero, la persona vería errores en los campos cuando lo que le
   * falta es un checkbox más abajo.
   */
  const validacionesDeLaIntro = (): boolean => {
    // Block if there are unavailable products
    if (hasUnavailableProducts) {
      scrollToSection('unavailable-products-banner');
      return false;
    }

    // Validar que la cuota mensual no exceda el límite
    if (isOverQuotaLimit) {
      scrollToSection('product-section');
      return false;
    }

    // Validar que los plazos estén estandarizados (para múltiples productos)
    if (needsTermUnification) {
      // Scroll al selector de plazos
      scrollToSection('term-selector-section');
      return false;
    }

    // Validar términos y política de privacidad: marcar AMBOS si faltan
    // (no cortar en el primero, así si ambos están sin marcar se ponen rojos a la vez)
    let hasConsentError = false;
    if (!acceptTerms) {
      setTermsError('Debes aceptar los términos y condiciones para continuar');
      hasConsentError = true;
    }
    if (!acceptPrivacy) {
      setPrivacyError('Debes aceptar la política de privacidad para continuar');
      hasConsentError = true;
    }
    if (hasConsentError) {
      // Scroll una sola vez a la sección de términos
      scrollToSection('terms-section');
      return false;
    }

    // Validar cupón si es requerido
    if (isCouponRequired && !appliedCoupon) {
      setCouponError('Debes ingresar un cupón válido para continuar');
      // Scroll al campo de cupón
      scrollToSection('coupon-section');
      return false;
    }

    setTermsError(null);
    setPrivacyError(null);
    setCouponError(null);
    return true;
  };

  const handleStart = () => {
    if (!validacionesDeLaIntro()) return;

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

    router.push(routes.solicitarStep(landing, firstStepSlug));
  };

  /**
   * En renueva-* no se "comienza" nada: el formulario ya está en pantalla. La
   * acción valida la intro y, si pasa, entrega el control al paso, que valida
   * sus campos y crea la solicitud.
   */
  const handleContinuarEmbebido = () => {
    if (!validacionesDeLaIntro()) return;
    pasoEmbebido.handleNext();
  };

  /**
   * La acción principal no se puede disparar.
   *
   * Es una sola condición para los DOS botones de la pantalla: el de la página
   * y el CTA fijo de móvil (`MobileStickyCta`), que en `renueva-*` hacen lo
   * mismo. Si se calculara en cada lugar, uno quedaría vivo cuando el otro está
   * muerto y la persona encontraría justo el que no funciona.
   *
   * `!pasoEmbebido.step`: sin paso configurado en BD el bloque del formulario no
   * se pinta, y el botón quedaría vivo sobre la nada — `handleNext` no valida
   * nada y dispara una celebración que tampoco puede pintarse, así que la
   * persona apretaría un botón muerto sin ningún aviso. La rama no-renueva se
   * cubre sola con su `console.error`.
   */
  const accionBloqueada =
    isOverQuotaLimit || hasUnavailableProducts || isLoadingAccessories || (esRenueva && (!pasoEmbebido.canProceed || !pasoEmbebido.step));

  // Content JSX (no es componente para evitar remount en cada render)
  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar — nvidia usa su header propio en todas sus rutas */}
      {isNvidiaLanding(landing) ? (
        <NvidiaNavbar landing={landing} />
      ) : (
      <Navbar
        landing={landing}
        logoOnly={!!appliedCoupon?.lockedFromUrl}
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
      />
      )}

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

        {!campanaRecibe && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 sm:px-5 sm:py-5"
          >
            <p className="font-semibold text-amber-900">
              Por ahora no estamos recibiendo más solicitudes
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Se llenaron los cupos de esta campaña. Si ya enviaste la tuya, sigue su curso con
              normalidad y te vamos a contactar.
            </p>
          </div>
        )}

        {/* Products Card - Shows all cart products or single selected product */}
        {(() => {
          const productsToShow = cartProducts.length > 0 ? cartProducts : (selectedProduct ? [selectedProduct] : []);
          if (productsToShow.length === 0) return null;

          const totalMonthly = productsToShow.reduce((sum, p) => sum + p.monthlyPayment, 0);

          // Con la inicial fraccionada el `term` son las cuotas, no el plazo que
          // la persona vive: el rotulo lo traduce a «17 semanas · 4 armadas» y
          // ordena por plazo total. Sin armadas el mapa viene vacio y el selector
          // no cambia. Cuando hay que unificar plazos, el selector trabaja en
          // meses normalizados y un carrito mixto no tiene una modalidad que
          // mostrar, asi que ahi no se rotula.
          const planesDelPrincipal = needsTermUnification
            ? []
            : (productsToShow[0]?.paymentPlans ?? []);
          const termLabels = etiquetasDePlazo(
            planesDelPrincipal,
            productsToShow[0]?.paymentFrequency,
          );
          const termOptions = ordenarTerms(planesDelPrincipal, availableTerms);

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
                {/* Selector de plazo.
                    Se oculta cuando la landing declara que el plazo no se puede
                    cambiar acá: en el producto de matrícula la cuota ya se
                    calculó contra el simulador con el plazo elegido en la
                    calculadora, y volver a cambiarlo dejaría la cuota mostrada y
                    la seleccionada en desacuerdo. El plazo sigue visible en la
                    fila del producto, así que ocultarlo no esconde el dato. */}
                {puedeCambiarPlazo && (
                <div className="flex items-center gap-2">
                  {needsTermUnification && (
                    <span className="text-xs text-amber-700">Unificar plazo:</span>
                  )}
                  {!needsTermUnification && (
                    <span className="text-xs text-neutral-500">Plazo:</span>
                  )}
                  <TermSelect
                    value={needsTermUnification ? 0 : ((productsToShow[0]?.term ?? productsToShow[0]?.months) || 0)}
                    options={termOptions}
                    labels={termLabels}
                    onChange={(term) => {
                      const primary = productsToShow[0];
                      const from = primary?.term ?? primary?.months ?? 0;
                      if (primary && from !== term) {
                        analytics.trackPricingTermChange({
                          product_id: primary.id,
                          from,
                          to: term,
                          context: 'solicitar',
                          frequency: primary.paymentFrequency,
                        });
                      }
                      updateAllProductsToTerm(term);
                    }}
                    warning={needsTermUnification}
                    placeholder="Seleccionar"
                    frequency={needsTermUnification ? undefined : productsToShow[0]?.paymentFrequency}
                  />
                </div>
                )}
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
                    {mostrarImagenProducto && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    )}
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
                                  onClick={() => {
                                    if (product.initialPercent !== option.percent) {
                                      analytics.trackPricingInitialChange({
                                        product_id: product.id,
                                        from: product.initialPercent,
                                        to: option.percent,
                                        context: 'solicitar',
                                      });
                                    }
                                    updateProductInitial(product.id, option.percent);
                                  }}
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
                        {selectedAccessories.map((acc) => {
                          const freq = productsToShow[0]?.paymentFrequency;
                          const freqSfx = freq === 'semanal' ? '/sem' : freq === 'quincenal' ? '/qcn' : '/mes';
                          return (
                            <div key={acc.id} className="flex items-center justify-between text-sm">
                              <span className="text-neutral-700">{acc.name}</span>
                              <span className="text-[var(--color-primary)] font-medium">+S/{formatMoneyNoDecimals(Math.floor(acc.monthlyQuota))}{freqSfx}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-800">Cuota total</span>
                    <span className={`text-lg font-bold ${isOverQuotaLimit ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>
                      S/{formatMoneyNoDecimals(Math.floor(totalMonthly + selectedAccessories.reduce((s, a) => s + a.monthlyQuota, 0) + selectedInsurances.reduce((s, i) => s + i.monthlyPrice, 0)))}
                      {productsToShow[0]?.paymentFrequency === 'semanal' ? ' / semana' : productsToShow[0]?.paymentFrequency === 'quincenal' ? ' / quincena' : ' / mes'}
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

        {/* Info Cards.
            En renueva-* no van: la tarjeta del medio anuncia el número de
            pasos, y ese número es justo lo que este flujo dejó de tener. */}
        {!esRenueva && (
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
        )}

        {/* Requirements */}
        {!esRenueva && (() => {
          const reqData = config?.form_extra_data?.requirements;
          const reqTitle = reqData?.title ?? 'Lo que necesitarás';
          const reqItems = reqData?.items ?? [
            { title: 'Documento de identidad', description: 'DNI, CE o Pasaporte vigente' },
            { title: 'Constancia de estudios', description: 'Documento que acredite tu matrícula vigente' },
            { title: 'Información de contacto', description: 'Teléfono y correo electrónico activos' },
          ];
          return (
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4">
                {reqTitle}
              </h2>
              <ul className="space-y-3">
                {reqItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[var(--color-primary)]">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{item.title}</p>
                      <p className="text-xs text-neutral-500">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* Dynamic Sections Before Wizard - Rendered in configured order */}
        {sectionsBeforeWizard.map((section) => (
          <SectionRenderer
            key={section.type}
            type={section.type}
            className="mb-8"
            colapsable={esRenueva && section.type === 'accessories'}
          />
        ))}

        {/* El formulario, embebido. Va justo debajo de accesorios y encima de
            los términos: es el orden en que se completa la pantalla. */}
        {esRenueva && pasoEmbebido.step && (
          <div ref={scrollearAlFormulario} id="formulario-embebido" className="bg-white rounded-xl p-4 sm:p-6 border border-neutral-200 mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 leading-tight">
                {pasoEmbebido.step.title}
              </h2>
              {pasoEmbebido.step.description && (
                <p className="text-sm sm:text-base text-neutral-600 mt-1">
                  {pasoEmbebido.step.description}
                </p>
              )}
            </div>
            <PasoDelWizard paso={pasoEmbebido} />
          </div>
        )}

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
              label={
                <>
                  Acepto los{' '}
                  <a
                    href={routes.legal(landing, 'terminos-y-condiciones')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-[var(--color-primary)] hover:opacity-80"
                  >
                    términos y condiciones
                  </a>
                </>
              }
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
              label={
                <>
                  Acepto la{' '}
                  <a
                    href={routes.legal(landing, 'politica-de-privacidad')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline text-[var(--color-primary)] hover:opacity-80"
                  >
                    política de privacidad
                  </a>
                </>
              }
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

        {/* Cupón de Descuento.
            Se oculta en las landings que no se activan con promotor en campo:
            sin alguien que le dicte un código al solicitante, el campo solo
            agrega un paso vacío. La landing que exige cupón lo muestra igual,
            porque ahí sin código no se puede enviar la solicitud. */}
        {(muestraCupon || isCouponRequired) && (
        <div id="coupon-section" className={`mb-8 transition-all duration-300 rounded-xl ${couponError ? 'ring-2 ring-red-500/30' : ''}`}>
          <CouponInput isRequired={isCouponRequired} />
          {couponError && !appliedCoupon && (
            <p className="text-xs text-red-500 mt-2 ml-1">{couponError}</p>
          )}
        </div>
        )}

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
          onClick={esRenueva ? handleContinuarEmbebido : handleStart}
          disabled={accionBloqueada}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-semibold text-lg transition-colors shadow-lg
                     ${accionBloqueada
                       ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                       : 'bg-[var(--color-primary)] text-white hover:brightness-90 cursor-pointer shadow-[rgba(var(--color-primary-rgb),0.25)]'
                     }`}
        >
          <span>
            {!esRenueva
              ? 'Comenzar Solicitud'
              // El texto sale del mismo lugar que el del CTA fijo de móvil
              // (`MobileStickyCta`): `esElQueEnvia`. En `renueva-*` el envío
              // anticipado crea la solicitud al cerrar este paso, así que hoy
              // en producción ese botón ya dice "Enviar Solicitud". Si acá se
              // hardcodeara "Continuar", la misma pantalla tendría dos botones
              // con textos distintos para la misma acción.
              : pasoEmbebido.esElQueEnvia
                ? 'Enviar Solicitud'
                : 'Continuar'}
          </span>
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

      {/* Overlays del paso embebido: celebración, envío y "unidad tomada".
          Van FUERA del contenedor de arriba y no junto al formulario: ese
          contenedor es `relative z-10`, o sea un contexto de apilado, y adentro
          el `z-[200]` del overlay de envío quedaría igual por debajo de la
          navbar (`z-50`), que es hermana del contenedor. Es el mismo problema
          que ya se había arreglado para el modal de "unidad tomada". */}
      {esRenueva && pasoEmbebido.overlays}
    </div>
  );

  // Lead guard — show loading while verifying access
  if (!hasLeadAccess) return <LoadingFallback />;

  // Show loading while checking hydration, layout loading, config loading, availability check, or if no product selected (redirect will happen)
  // `!selectedProduct && !submitSucceeded`, por lo mismo que el guard de la
  // redirección de arriba: el envío del paso embebido puede limpiar el carrito
  // (siempre en landing demo, y en el flujo real cuando no queda paso
  // siguiente). Sin el flag, la pantalla cambiaría el overlay de "Creando
  // solicitud…" por el spinner genérico justo en el momento del envío.
  if (!isHydrated || (!selectedProduct && !pasoEmbebido.submitSucceeded) || isLayoutLoading || isConfigLoading || isFlowConfigLoading || isValidatingAvailability) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <div className="relative">
      {pageContent}
      <SelectedProductBar
        mobileOnly
        // El alto lo publica el propio CTA. Si se desmonta (teclado, drawer),
        // la variable desaparece y el fallback la baja al borde: nunca queda
        // levantada sobre un hueco.
        offsetInferior={esRenueva ? 'var(--sticky-cta-height, 0px)' : '0px'}
      />
      <SelectedProductSpacer />
      {/* En `renueva-*` la pantalla es una sola y la acción es una sola, así
          que va fija abajo. El orden se invierte respecto del resto del flujo:
          el CTA pegado al borde y la barra de producto ENCIMA. Sin `onBack`: en
          la intro no hay paso anterior, y sin la prop no se pinta ese botón. */}
      {esRenueva && (
        <>
          <MobileStickyCtaSpacer />
          <MobileStickyCta
            onPrimary={handleContinuarEmbebido}
            isLastStep={pasoEmbebido.esElQueEnvia}
            isSubmitting={pasoEmbebido.isSubmitting}
            submitMessage={pasoEmbebido.submitMessage}
            canProceed={!accionBloqueada}
            oculto={pasoEmbebido.celebrando}
            debajoDeLaBarra
          />
        </>
      )}
      <Footer data={footerData} landing={landing} agreementData={agreementData} />
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
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  if (isGamerLanding(landing)) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GamerSolicitarContent />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <WizardPreviewContent />
    </Suspense>
  );
}
