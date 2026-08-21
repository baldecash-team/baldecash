'use client';

/**
 * LayoutContext - Shared layout data for all pages under [landing]
 * Fetches navbar, footer, and company data ONCE and shares across all pages
 *
 * Preview Mode Support:
 * When PreviewContext has active preview credentials for this landing,
 * uses getLandingLayoutById with preview_key instead of slug-based API.
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getLandingLayout, type LandingLayoutResponse } from '@/app/prototipos/0.6/services/landingApi';
import { fetchLandingConfig } from '@/app/prototipos/0.6/services/landingConfigApi';
import { usePreview } from '@/app/prototipos/0.6/context/PreviewContext';
import type { PromoBannerData, FooterData, AgreementData } from '@/app/prototipos/0.6/types/hero';

import { OVERLAY_VARIANT_LOGOS, getDeferredPayment, getCalculadora, type DeferredPaymentConfig, type CalculadoraConfig } from '@/app/prototipos/0.6/types/landingConfig';
import { isDarkLanding, NVIDIA_GREEN, NVIDIA_TURQUOISE } from '@/app/prototipos/0.6/utils/theme';

interface NavbarProps {
  promoBannerData?: PromoBannerData | null;
  logoUrl?: string;
  logoClassName?: string;
  customerPortalUrl?: string;
  portalButtonText?: string;
  navbarItems?: { label: string; href: string; section: string | null; has_megamenu?: boolean }[];
  megamenuItems?: { label: string; href: string; icon: string; description: string }[];
  activeSections?: string[];
  institutionLogo?: string;
  institutionName?: string;
  /**
   * Visibilidad del logo institucional, resuelta desde
   * `layout.show_agreement_logo`. Las paginas secundarias la reenvian al
   * Navbar y al Footer tal cual (BAL-2970).
   */
  showInstitutionLogo?: boolean;
}

interface LayoutContextValue {
  layoutData: LandingLayoutResponse | null;
  navbarProps: NavbarProps | null;
  footerData: FooterData | null;
  agreementData: AgreementData | null;
  isLoading: boolean;
  hasError: boolean; // true when landing not found or API error (for 404 display)
  landing: string;
  /** Stable numeric landing ID for feature detection (null while loading) */
  landingId: number | null;
  primaryColor: string;
  secondaryColor: string;
  primaryColorRgb: string;
  secondaryColorRgb: string;
  /** Whether this landing is being previewed with preview_key */
  isPreviewMode: boolean;
  /** Landing ID when in preview mode */
  previewLandingId: number | null;
  /** Public system configuration flags from backend */
  settings: Record<string, string>;
  catalogBanner: Record<string, unknown> | null;
  /** Newsletter component config from layout */
  newsletterData: { title?: string; subtitle?: string; button_text?: string; placeholder?: string } | null;
  /** Overlay variant from landing config (e.g. 'cade') */
  overlayVariant: string | null;
  /** Pago diferido de la landing (null si no está habilitado). */
  deferredPayment: DeferredPaymentConfig | null;
  /**
   * Configuración de la calculadora de efectivo, o null si esta landing no la
   * tiene. Vive acá por el mismo motivo que el selector de plazo: la decisión
   * es de la landing, no de la pantalla que la dibuja.
   */
  calculadora: CalculadoraConfig | null;
  /**
   * Si el plazo se puede cambiar desde el resumen del producto.
   *
   * Vive acá y no en cada pantalla porque el selector se dibuja en tres —la
   * portada de solicitar, cada paso del formulario y complementos— y antes solo
   * la primera consultaba la configuración. El resultado era que el ingrediente
   * tapaba una de tres, y el selector reaparecía apenas la persona avanzaba.
   */
  puedeCambiarPlazo: boolean;
  /**
   * Si la imagen del producto se muestra durante el recorrido de solicitud.
   *
   * Vive acá y no en cada pantalla porque la imagen se dibuja en cuatro
   * lugares: la portada de solicitar y tres bloques de la barra de producto
   * seleccionado. Con la decisión repartida, apagarla en una y olvidarse de
   * otra es cuestión de tiempo, que es exactamente lo que pasó con el selector
   * de plazo.
   */
  mostrarImagenProducto: boolean;
}

/**
 * Convert hex color to RGB string for use with rgba()
 * Example: "#4654CD" -> "70, 84, 205"
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  // Fallback to default primary color RGB
  return '70, 84, 205';
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({
  children,
  landingOverride,
}: {
  children: React.ReactNode;
  /**
   * Fuerza el slug de landing en vez de leerlo de `useParams()`. Necesario
   * para rutas fuera de `[landing]/**` (ej. `/kyc/[token]`, Task 5) que no
   * tienen ese segmento en la URL pero sí conocen el landing por otra vía
   * (`landing_slug` del estado resuelto por el backend).
   */
  landingOverride?: string;
}) {
  const params = useParams();
  const landing = landingOverride || (params.landing as string) || 'home';

  const layoutSlug = landing;

  // Check if we're in preview mode for this landing
  // Wait for preview context to hydrate from sessionStorage before fetching
  const preview = usePreview();
  const isPreviewHydrated = preview.isHydrated;
  const isPreviewMode = preview.isPreviewingLanding(landing);
  const previewLandingId = isPreviewMode ? preview.landingId : null;
  const previewKey = isPreviewMode ? preview.previewKey : null;

  const [layoutData, setLayoutData] = useState<LandingLayoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [overlayVariant, setOverlayVariant] = useState<string | null>(null);
  const [deferredPayment, setDeferredPayment] = useState<DeferredPaymentConfig | null>(null);
  const [calculadora, setCalculadora] = useState<CalculadoraConfig | null>(null);
  const [showAgreementLogo, setShowAgreementLogo] = useState(true);
  const [puedeCambiarPlazo, setPuedeCambiarPlazo] = useState(true);
  const [mostrarImagenProducto, setMostrarImagenProducto] = useState(true);

  // Fetch landing config for overlay variant (logo override) + pago diferido
  // + visibilidad del logo de convenio
  useEffect(() => {
    fetchLandingConfig(landing).then(cfg => {
      // Encadenamiento opcional: una landing sin ingredientes de este grupo no
      // trae el espacio de nombres, y sin esto el contexto entero se cae.
      setOverlayVariant(cfg.features?.overlay_variant || '');
      setDeferredPayment(getDeferredPayment(cfg));
      setCalculadora(getCalculadora(cfg));
      // `!== false` y no `=== true`: si el backend no manda la clave el valor
      // es undefined, y ausencia significa encendido. Al reves, cualquier
      // landing de convenio sin el ingrediente perderia su logo.
      setShowAgreementLogo(cfg.layout?.show_agreement_logo !== false);
      // Mismo criterio que el logo: ausencia significa encendido. Con `=== true`
      // cualquier landing sin el ingrediente perdería su selector de plazo.
      setPuedeCambiarPlazo(cfg.features?.can_change_term !== false);
      // Mismo criterio que arriba: ausencia significa encendido. El preset es
      // nuevo, así que ninguna landing existente trae la clave; comparar contra
      // verdadero les borraría la imagen a todas de golpe.
      setMostrarImagenProducto(cfg.features?.show_product_image !== false);
    });
  }, [landing]);

  // Fetch layout data once on mount (wait for preview context to hydrate first)
  useEffect(() => {
    // Don't fetch until we know if we're in preview mode
    if (!isPreviewHydrated) return;

    let isMounted = true;

    const fetchLayoutData = async () => {
      try {
        // Use slug-based API, with preview_key if in preview mode
        const data = await getLandingLayout(layoutSlug, previewKey);

        if (isMounted) {
          setLayoutData(data);
          // If API returns null (404), mark as error
          if (!data) {
            setHasError(true);
          }
        }
      } catch (error) {
        console.error('Error fetching layout data:', error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLayoutData();

    return () => {
      isMounted = false;
    };
  }, [landing, isPreviewHydrated, isPreviewMode, previewKey]);

  // Transform layout data for Navbar props
  const navbarProps = useMemo((): NavbarProps | null => {
    if (!layoutData) return null;

    const navbarConfig = layoutData.navbar?.content_config as Record<string, unknown> | undefined;
    const promoConfig = layoutData.promo_banner?.content_config as Record<string, unknown> | undefined;

    const navbarItems = navbarConfig?.items as { label: string; href: string; section: string | null; has_megamenu?: boolean }[] | undefined;
    const megamenuItems = navbarConfig?.megamenu_items as { label: string; href: string; icon: string; description: string }[] | undefined;

    // Combinar cta_url + cta_url_params si existen
    const baseUrl = (promoConfig?.cta_url as string) || '';
    const urlParams = (promoConfig?.cta_url_params as string) || '';
    const fullCtaUrl = baseUrl && urlParams ? `${baseUrl}${urlParams}` : baseUrl || undefined;

    const promoBannerData: PromoBannerData | null = promoConfig ? {
      text: (promoConfig.text as string) || '',
      highlight: promoConfig.highlight as string | undefined,
      ctaText: promoConfig.cta_text as string | undefined,
      ctaUrl: fullCtaUrl,
      icon: promoConfig.icon as string | undefined,
      dismissible: (promoConfig.dismissible as boolean) ?? true,
    } : null;

    // Agreement data for co-branding (convenio landings).
    // El logo se omite si `layout.show_agreement_logo` esta apagado; el nombre
    // se conserva porque el Navbar lo usa como alt text cuando si hay logo.
    const agreement = layoutData.agreement;
    // El convenio manda; el branding suelto es el fallback de las landings que
    // NO son de convenio y aun asi tienen una institucion de referencia
    // (`lead-flujo-normal` -> SENATI). El backend nunca manda los dos: cuando
    // hay convenio propio, `institution_branding` viene en null.
    const branding = layoutData.institution_branding;
    const institutionLogo = showAgreementLogo
      ? (agreement?.institution_logo || branding?.institution_logo)
      : undefined;

    const variantLogo = overlayVariant !== null ? OVERLAY_VARIANT_LOGOS[overlayVariant] : undefined;
    const logoResolved = overlayVariant !== null;

    return {
      promoBannerData,
      logoUrl: logoResolved ? (variantLogo || layoutData.company?.logo_url) : undefined,
      logoClassName: variantLogo ? 'h-12 object-contain' : undefined,
      customerPortalUrl: layoutData.company?.customer_portal_url,
      portalButtonText: (navbarConfig?.portal_button_text as string) || undefined,
      navbarItems: navbarItems || [],
      megamenuItems: megamenuItems || [],
      // Derive active sections from navbar items (if an item has a section, it's active)
      activeSections: (navbarItems || [])
        .filter((item) => item.section)
        .map((item) => item.section as string),
      institutionLogo: institutionLogo || undefined,
      institutionName: agreement?.institution_name || branding?.institution_name || undefined,
      showInstitutionLogo: showAgreementLogo,
    };
  }, [layoutData, overlayVariant, showAgreementLogo]);

  // Transform layout data for Footer props
  const footerData = useMemo((): FooterData | null => {
    if (!layoutData) return null;

    const footerConfig = layoutData.footer?.content_config as Record<string, unknown> | undefined;
    if (!footerConfig) return null;

    // Transform columns: normalize url -> href for links, combining base + params
    const rawColumns = footerConfig.columns as Array<{
      title: string;
      links: Array<{ label: string; url?: string; href?: string; url_params?: string; href_params?: string }>;
    }> | undefined;

    const transformedColumns = rawColumns?.map(col => ({
      title: col.title,
      links: col.links.map(link => {
        const baseUrl = link.href || link.url || '';
        const params = link.href_params || link.url_params || '';
        return {
          label: link.label,
          href: (baseUrl + params) || '#',
        };
      }),
    }));

    return {
      tagline: footerConfig.tagline as string | undefined,
      columns: transformedColumns,
      newsletter: footerConfig.newsletter as { title: string; description: string; placeholder: string; button_text: string } | undefined,
      sbs_text: footerConfig.sbs_text as string | undefined,
      copyright_text: footerConfig.copyright_text as string | undefined,
      social_links: footerConfig.social_links as { platform: string; url: string }[] | undefined,
      company: layoutData.company ? {
        name: layoutData.company.name,
        legal_name: layoutData.company.legal_name,
        logo_url: layoutData.company.logo_url,
        main_phone: layoutData.company.main_phone,
        main_address: layoutData.company.main_address,
        main_email: layoutData.company.main_email,
        website_url: layoutData.company.website_url,
        customer_portal_url: layoutData.company.customer_portal_url,
        support_phone: layoutData.company.support_phone,
        support_email: layoutData.company.support_email,
        support_whatsapp: layoutData.company.support_whatsapp,
        support_hours: layoutData.company.support_hours,
        sbs_registration: layoutData.company.sbs_registration,
        social_links: layoutData.company.social_links as { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; tiktok?: string } | undefined,
      } : undefined,
    };
  }, [layoutData]);

  // Extract landing ID for feature detection
  const landingId = layoutData?.landing_id ?? null;

  // Extract colors from layout data.
  // Landings oscuras (nvidia) fuerzan verde/turquesa NVIDIA → todos los botones
  // que ya usan bg-[var(--color-primary)] quedan verdes sin tocarlos. Ver THEME_DARK.md §4.
  const dark = isDarkLanding(landing);
  const primaryColor = dark ? NVIDIA_GREEN : (layoutData?.primary_color || '#4654CD');
  const secondaryColor = dark ? NVIDIA_TURQUOISE : (layoutData?.secondary_color || '#03DBD0');
  const primaryColorRgb = hexToRgb(primaryColor);
  const secondaryColorRgb = hexToRgb(secondaryColor);

  // Set CSS variables on :root so they're available to portals (modals, drawers)
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-primary-rgb', primaryColorRgb);
    document.documentElement.style.setProperty('--color-secondary-rgb', secondaryColorRgb);

    // Tema oscuro: data-theme en <html> para que los tokens de globals.css apliquen
    // también a modales/drawers montados en portales (fuera del layout). THEME_DARK.md §5.5.
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'nvidia');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    return () => {
      // Clean up on unmount
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-primary-rgb');
      document.documentElement.style.removeProperty('--color-secondary-rgb');
      document.documentElement.removeAttribute('data-theme');
    };
  }, [dark, primaryColor, secondaryColor, primaryColorRgb, secondaryColorRgb]);

  // Extract public settings from layout data
  const settings = useMemo<Record<string, string>>(() => layoutData?.settings ?? {}, [layoutData]);

  // Extract catalog banner data
  const catalogBanner = useMemo(() => (layoutData?.catalog_banner?.content_config as Record<string, unknown>) ?? null, [layoutData]);

  // Newsletter lives inside footer.content_config.newsletter (set from admin Footer tab)
  const newsletterData = useMemo(() => {
    const nl = footerData?.newsletter;
    if (!nl || nl.enabled === false) return null;
    return {
      title: nl.title || undefined,
      subtitle: nl.description || undefined,
      button_text: nl.button_text || undefined,
      placeholder: nl.placeholder || undefined,
    };
  }, [footerData]);

  // Extract agreement data for convenio pages
  //
  // Cuando `layout.show_agreement_logo` esta apagado se vacia el logo ACA, en
  // el origen, en vez de pasar una prop a cada pagina. El Footer condiciona por
  // `agreementData?.institution_logo`, asi que esto apaga de una sus 21 call
  // sites (y los 11 del Navbar, que leen el mismo objeto) sin poder olvidarse
  // de ninguno.
  //
  // Se borra SOLO el logo: el nombre de la institucion se sigue usando como
  // texto en ConvenioHero, ConvenioFaq y ConvenioCta, y ahi debe seguir.
  const agreementData = useMemo((): AgreementData | null => {
    if (!layoutData) return null;
    const agreement = layoutData.agreement;
    if (!agreement) return null;
    if (showAgreementLogo) return agreement;
    // `hide_logo` va junto al logo vacio: el footer tiene un fallback de texto
    // que se enciende cuando NO hay logo, asi que vaciarlo a secas hacia que
    // imprimiera el nombre de la institucion. Con la marca en el objeto, los 21
    // call sites del Footer la reciben sin tener que pasarles una prop.
    return { ...agreement, institution_logo: undefined, hide_logo: true };
  }, [layoutData, showAgreementLogo]);

  const value = useMemo(() => ({
    layoutData,
    navbarProps,
    footerData,
    agreementData,
    isLoading,
    hasError,
    landing,
    landingId,
    primaryColor,
    secondaryColor,
    primaryColorRgb,
    secondaryColorRgb,
    isPreviewMode,
    previewLandingId,
    settings,
    catalogBanner,
    newsletterData,
    overlayVariant,
    deferredPayment,
    calculadora,
    puedeCambiarPlazo,
    mostrarImagenProducto,
  }), [layoutData, navbarProps, footerData, agreementData, isLoading, hasError, landing, landingId, primaryColor, secondaryColor, primaryColorRgb, secondaryColorRgb, isPreviewMode, previewLandingId, settings, catalogBanner, newsletterData, overlayVariant, deferredPayment, calculadora, puedeCambiarPlazo, mostrarImagenProducto]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

export default LayoutContext;
